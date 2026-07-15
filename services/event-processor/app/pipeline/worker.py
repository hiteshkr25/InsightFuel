import asyncio
import logging
import uuid
from app.core.config import settings
from app.core.redis import get_redis_client
from app.core.clickhouse import clickhouse_manager
from app.pipeline.consumer import kafka_consumer_manager
from app.pipeline.processor import process_event
from app.idempotency import check_and_set_duplicate
from app.core.telemetry import EVENTS_PROCESSED, PROCESSING_LATENCY, ACTIVE_WORKERS
from app.core.database import SessionLocal
from app.models.metadata import DeadLetterEvent

logger = logging.getLogger("insightfuel.event-processor")

class EventProcessorWorker:
  def __init__(self):
    self.running = False
    self.tasks = []
    self.worker_id = f"worker_{uuid.uuid4().hex[:8]}"

  async def start(self):
    self.running = True
    await kafka_consumer_manager.start()
    
    # Spawn worker tasks
    for idx in range(settings.WORKER_COUNT):
      task = asyncio.create_task(self.worker_loop(f"{self.worker_id}_{idx}"))
      self.tasks.append(task)
    
    ACTIVE_WORKERS.set(len(self.tasks))
    logger.info(f"Spawned {len(self.tasks)} event processing workers.")

  async def stop(self):
    self.running = False
    logger.info("Stopping event processing workers...")
    if self.tasks:
      await asyncio.gather(*self.tasks, return_exceptions=True)
      self.tasks = []
    ACTIVE_WORKERS.set(0)
    await kafka_consumer_manager.stop()
    logger.info("All event processing workers stopped.")

  async def worker_loop(self, worker_id: str):
    redis_client = get_redis_client()
    buffer = []
    last_flush = asyncio.get_event_loop().time()

    while self.running:
      # 1. Fetch batch from consumer group
      records = await kafka_consumer_manager.fetch_batch(
        max_records=settings.BATCH_SIZE,
        timeout_ms=500
      )

      if records:
        for record in records:
          try:
            event_id = record.get("event_id")
            if not event_id:
              continue

            # Idempotency and Duplicates Audits
            is_dup = await check_and_set_duplicate(redis_client, event_id)
            if is_dup:
              EVENTS_PROCESSED.labels(status="duplicate", category=record.get("category", "unknown")).inc()
              continue

            # Process & Enrich event payload
            processed = process_event(record, worker_id)
            buffer.append(processed)
            
            latency = processed.get("processing_latency", 0.0)
            PROCESSING_LATENCY.observe(latency)
          except Exception as e:
            logger.error(f"Event processing exception: {e}")
            self.write_to_dlq(record, f"Processing error: {str(e)}")
            EVENTS_PROCESSED.labels(status="failed", category=record.get("category", "unknown")).inc()

      # 2. Flush on batch size or interval timeout limits
      now = asyncio.get_event_loop().time()
      if len(buffer) >= settings.BATCH_SIZE or (len(buffer) > 0 and (now - last_flush) >= settings.BATCH_TIMEOUT_SEC):
        success = clickhouse_manager.write_events_batch(buffer)
        if success:
          await kafka_consumer_manager.commit_offsets()
          for ev in buffer:
            EVENTS_PROCESSED.labels(status="success", category=ev.get("category", "unknown")).inc()
        else:
          # Write buffer to DLQ table on ClickHouse write failures
          for ev in buffer:
            self.write_to_dlq(ev, "ClickHouse write failure")
            EVENTS_PROCESSED.labels(status="failed", category=ev.get("category", "unknown")).inc()
        
        buffer.clear()
        last_flush = now

      # Sleep briefly to protect CPU consumption
      if not records:
        await asyncio.sleep(0.1)

    # Flush any remaining items on shutdown
    if buffer:
      success = clickhouse_manager.write_events_batch(buffer)
      if success:
        await kafka_consumer_manager.commit_offsets()
      else:
        for ev in buffer:
          self.write_to_dlq(ev, "ClickHouse final shutdown write failure")
      buffer.clear()

    await redis_client.aclose()

  def write_to_dlq(self, event: dict, error_msg: str):
    db = SessionLocal()
    try:
      dlq_event = DeadLetterEvent(
        event_id=event.get("event_id", ""),
        project_id=event.get("project_id", ""),
        payload=event,
        error_message=error_msg[:255] if error_msg else "Processing failure",
        status="pending"
      )
      db.add(dlq_event)
      db.commit()
      logger.warning(f"Failed event {dlq_event.event_id} written to Postgres DLQ table")
    except Exception as e:
      logger.critical(f"FATAL: Postgres DLQ write failed: {e}")
    finally:
      db.close()

worker_manager = EventProcessorWorker()
