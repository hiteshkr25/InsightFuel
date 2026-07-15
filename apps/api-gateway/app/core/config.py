import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  PROJECT_NAME: str = "InsightFuel API Gateway"
  API_V1_STR: str = "/api/v1"
  
  # JWT Configurations
  SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "insightfuel_super_secret_session_signing_key_929d0e")
  ALGORITHM: str = "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
  REFRESH_TOKEN_EXPIRE_DAYS: int = 7
  
  # PostgreSQL Configurations
  DATABASE_URL: str = os.getenv(
    "DATABASE_URL", 
    "postgresql://insightfuel:insightfuel_secure_pass@localhost:5432/insightfuel_metadata"
  )

  class Config:
    case_sensitive = True

settings = Settings()
