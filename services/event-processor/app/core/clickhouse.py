import json
import logging
import clickhouse_connect
from app.core.config import settings

logger = logging.getLogger("insightfuel.event-processor")

class ClickHouseClientManager:
  def __init__(self):
    self.client = None

  def get_client(self):
    if not self.client:
      try:
        self.client = clickhouse_connect.get_client(
          host=settings.CLICKHOUSE_HOST,
          port=settings.CLICKHOUSE_PORT,
          username=settings.CLICKHOUSE_USER,
          password=settings.CLICKHOUSE_PASSWORD,
          database=settings.CLICKHOUSE_DATABASE
        )
        logger.info("Connected to ClickHouse successfully")
      except Exception as e:
        logger.error(f"Failed to connect to ClickHouse: {e}. Ingestion runs in mock mode.")
        self.client = None
    return self.client

  def close(self):
    if self.client:
      self.client.close()
      self.client = None

  def write_events_batch(self, events: list) -> bool:
    client = self.get_client()
    if not client:
      logger.error("ClickHouse client is offline. Batch write aborted.")
      return False

    try:
      # Map schema list of tuples to ClickHouse events columns
      columns = [
        "event_id", "event_name", "category", "distinct_id", "project_id", "organization_id",
        "timestamp", "received_at", "properties", "context", "ip_address", "browser", "os", "device",
        "processed_at", "processing_latency", "worker_id", "processing_version"
      ]
      
      data = []
      for ev in events:
        data.append((
          ev.get("event_id"),
          ev.get("event_name"),
          ev.get("category"),
          ev.get("distinct_id"),
          ev.get("project_id"),
          ev.get("organization_id"),
          ev.get("timestamp"),
          ev.get("received_at"),
          json.dumps(ev.get("properties", {})),
          json.dumps(ev.get("context", {})),
          ev.get("ip_address"),
          ev.get("browser"),
          ev.get("os"),
          ev.get("device"),
          ev.get("processed_at"),
          ev.get("processing_latency", 0.0),
          ev.get("worker_id"),
          ev.get("processing_version")
        ))
      
      client.insert("events", data, column_names=columns)
      logger.info(f"Successfully inserted batch of {len(events)} events to ClickHouse.")
      return True
    except Exception as e:
      logger.error(f"Failed to insert events batch to ClickHouse: {e}")
      return False

clickhouse_manager = ClickHouseClientManager()
