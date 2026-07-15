import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  PROJECT_NAME: str = "InsightFuel Feature Intelligence Engine"
  API_V1_STR: str = "/api/v1"
  ADMIN_SECRET_TOKEN: str = os.getenv("ADMIN_SECRET_TOKEN", "admin_replay_secret_token_12345")
  DEMO_MODE: bool = os.getenv("DEMO_MODE", "false").lower() == "true"

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

  # Query API integration settings
  QUERY_API_URL: str = os.getenv("QUERY_API_URL", "http://localhost:3004")

  class Config:
    case_sensitive = True

settings = Settings()
