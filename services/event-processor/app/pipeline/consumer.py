import json
import logging
from aiokafka import AIOKafkaConsumer
from app.core.config import settings

logger = logging.getLogger("insightfuel.event-processor")

class KafkaConsumerGroupManager:
  def __init__(self):
    self.consumer = None

  async def start(self):
    try:
      self.consumer = AIOKafkaConsumer(
        settings.KAFKA_TOPIC,
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        group_id=settings.KAFKA_CONSUMER_GROUP,
        enable_auto_commit=False,
        auto_offset_reset="earliest"
      )
      await self.consumer.start()
      logger.info("Kafka Consumer started successfully")
    except Exception as e:
      logger.error(f"Failed to start Kafka Consumer: {e}. Worker will run in mock loop mode.")
      self.consumer = None

  async def stop(self):
    if self.consumer:
      await self.consumer.stop()
      self.consumer = None

  async def fetch_batch(self, max_records: int, timeout_ms: int) -> list:
    if not self.consumer:
      return []

    try:
      # Fetch a dictionary mapping TopicPartition to List[ConsumerRecord]
      res = await self.consumer.getmany(timeout_ms=timeout_ms, max_records=max_records)
      messages = []
      for tp, records in res.items():
        for record in records:
          try:
            val = json.loads(record.value.decode('utf-8'))
            messages.append(val)
          except Exception as parse_err:
            logger.error(f"Failed to parse Kafka record: {parse_err}")
      return messages
    except Exception as e:
      logger.error(f"Error fetching batch from Kafka: {e}")
      return []

  async def commit_offsets(self):
    if self.consumer:
      try:
        await self.consumer.commit()
        logger.info("Successfully committed Kafka consumer offsets manually.")
      except Exception as e:
        logger.error(f"Failed to commit Kafka offsets: {e}")

kafka_consumer_manager = KafkaConsumerGroupManager()
