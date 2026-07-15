import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  PROJECT_NAME: str = "InsightFuel Analytics Processing Engine"
  API_V1_STR: str = "/api/v1"
  ADMIN_SECRET_TOKEN: str = os.getenv("ADMIN_SECRET_TOKEN", "admin_replay_secret_token_12345")

  # PostgreSQL Configurations
  DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://insightfuel:insightfuel_secure_pass@localhost:5432/insightfuel_metadata"
  )

  # Redis Configurations
  REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

  # ClickHouse Configurations
  CLICKHOUSE_HOST: str = os.getenv("CLICKHOUSE_HOST", "localhost")
  CLICKHOUSE_PORT: int = int(os.getenv("CLICKHOUSE_PORT", "8123"))
  CLICKHOUSE_USER: str = os.getenv("CLICKHOUSE_USER", "default")
  CLICKHOUSE_PASSWORD: str = os.getenv("CLICKHOUSE_PASSWORD", "")
  CLICKHOUSE_DATABASE: str = os.getenv("CLICKHOUSE_DATABASE", "insightfuel_analytics")

  class Config:
    case_sensitive = True

settings = Settings()
