import logging
import clickhouse_connect
from app.core.config import settings

logger = logging.getLogger("insightfuel.query-api")

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
        logger.error(f"Failed to connect to ClickHouse: {e}")
        self.client = None
    return self.client

  def close(self):
    if self.client:
      self.client.close()
      self.client = None

clickhouse_manager = ClickHouseClientManager()
