import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  PROJECT_NAME: str = "InsightFuel Analytics Query API"
  API_V1_STR: str = "/api/v1"
  
  # JWT Configurations
  JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_signing_key_12345_secure")
  JWT_ALGORITHM: str = "HS256"

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

  # Cache parameters
  QUERY_CACHE_TTL: int = int(os.getenv("QUERY_CACHE_TTL", "300")) # 5 minutes default

  class Config:
    case_sensitive = True

settings = Settings()
