import json
import logging
from aiokafka import AIOKafkaProducer
from app.core.config import settings

logger = logging.getLogger("insightfuel.ingestion")

class KafkaProducerManager:
  def __init__(self):
    self.producer = None

  async def start(self):
    try:
      self.producer = AIOKafkaProducer(bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS)
      await self.producer.start()
      logger.info("Kafka Producer started successfully")
    except Exception as e:
      logger.error(f"Failed to start Kafka Producer: {e}. Ingestion will run in local DLQ fallback mode.")
      self.producer = None

  async def stop(self):
    if self.producer:
      await self.producer.stop()

  async def send_event(self, topic: str, value: dict) -> bool:
    if not self.producer:
      logger.error(f"Kafka producer is offline. Spooling event to Postgres DLQ table: {value.get('event_id')}")
      self.write_to_postgres_dlq(value, "Kafka producer offline")
      return False

    try:
      payload = json.dumps(value).encode('utf-8')
      await self.producer.send_and_wait(topic, payload)
      return True
    except Exception as e:
      err_msg = str(e)
      logger.error(f"Failed to publish event to Kafka topic {topic}: {err_msg}. Routing to Postgres DLQ.")
      self.write_to_postgres_dlq(value, err_msg)
      return False

  def write_to_postgres_dlq(self, value: dict, error_msg: str):
    from app.core.database import SessionLocal
    from app.models.metadata import DeadLetterEvent

    db = SessionLocal()
    try:
      dlq_event = DeadLetterEvent(
        event_id=value.get("event_id", ""),
        project_id=value.get("project_id", ""),
        payload=value,
        error_message=error_msg[:255] if error_msg else "Kafka connection failure",
        status="pending"
      )
      db.add(dlq_event)
      db.commit()
      logger.info(f"Persisted failed event {dlq_event.event_id} to Postgres DLQ table")
    except Exception as e:
      logger.critical(f"FATAL: Postgres DLQ write failed: {e}. Falling back to file system backup.")
      self.write_to_local_file_dlq(value)
    finally:
      db.close()

  def write_to_local_file_dlq(self, value: dict):
    try:
      # Local file fallback for local development or database failure
      with open("dead_letter_queue.log", "a") as f:
        f.write(json.dumps(value) + "\n")
    except Exception as e:
      logger.critical(f"FATAL: Local file system DLQ write failed: {e}")

kafka_manager = KafkaProducerManager()
