import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  PROJECT_NAME: str = "InsightFuel Event Ingestion Service"
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

  class Config:
    case_sensitive = True

settings = Settings()
