import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  PROJECT_NAME: str = "InsightFuel Event Processing Pipeline"
  API_V1_STR: str = "/api/v1"
  ADMIN_SECRET_TOKEN: str = os.getenv("ADMIN_SECRET_TOKEN", "admin_replay_secret_token_12345")

  # PostgreSQL Configurations
  DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://insightfuel:insightfuel_secure_pass@localhost:5432/insightfuel_metadata"
  )

  # Redis Configurations
  REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

  # Kafka Configurations
  KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
  KAFKA_TOPIC: str = "insightfuel-raw-events"
  KAFKA_DLQ_TOPIC: str = "insightfuel-dead-letter-events"
  KAFKA_CONSUMER_GROUP: str = "insightfuel-event-processor-group"

  # ClickHouse Configurations
  CLICKHOUSE_HOST: str = os.getenv("CLICKHOUSE_HOST", "localhost")
  CLICKHOUSE_PORT: int = int(os.getenv("CLICKHOUSE_PORT", "8123"))
  CLICKHOUSE_USER: str = os.getenv("CLICKHOUSE_USER", "default")
  CLICKHOUSE_PASSWORD: str = os.getenv("CLICKHOUSE_PASSWORD", "")
  CLICKHOUSE_DATABASE: str = os.getenv("CLICKHOUSE_DATABASE", "insightfuel_analytics")

  # Processing parameters
  BATCH_SIZE: int = int(os.getenv("BATCH_SIZE", "1000"))
  BATCH_TIMEOUT_SEC: float = float(os.getenv("BATCH_TIMEOUT_SEC", "2.0"))
  WORKER_COUNT: int = int(os.getenv("WORKER_COUNT", "4"))

  class Config:
    case_sensitive = True

settings = Settings()
