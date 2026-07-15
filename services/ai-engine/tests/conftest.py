import os
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["DEMO_MODE"] = "false"

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import get_db, get_redis
from app.core.database import Base, engine, SessionLocal
from app.services.query_api_client import query_api_client
from app.services.feature_intel_client import feature_intel_client
from app.services.product_health_client import product_health_client

class MockRedis:
  def __init__(self):
    self.store = {}

  async def get(self, key: str):
    return self.store.get(key)

  async def setex(self, key: str, seconds: int, value: str):
    self.store[key] = value

  async def incr(self, key: str):
    val = int(self.store.get(key, 0)) + 1
    self.store[key] = str(val)
    return val

  async def expire(self, key: str, seconds: int):
    pass

  async def aclose(self):
    pass

@pytest.fixture(name="db", scope="function")
def db_fixture():
  Base.metadata.create_all(bind=engine)
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(name="query_client_mock", scope="function")
def query_client_mock_fixture():
  async def mock_get(path: str, params: dict):
    if "activity" in path:
      return [
        {"timestamp": "2026-07-10", "dau": 100, "wau": 500, "mau": 1500},
        {"timestamp": "2026-07-11", "dau": 110, "wau": 500, "mau": 1500},
        {"timestamp": "2026-07-12", "dau": 10, "wau": 500, "mau": 1500} # drop anomaly!
      ]
    elif "sessions" in path:
      return [
        {"session_id": "session_1", "duration": 120.0, "quality_score": 8.0}
      ]
    return []

  original_get = query_api_client._get
  query_api_client._get = mock_get
  yield query_api_client
  query_api_client._get = original_get

@pytest.fixture(name="feature_intel_mock", scope="function")
def feature_intel_mock_fixture():
  async def mock_get(path: str, params: dict):
    if "trends" in path:
      if params.get("trend") == "growing":
        return [{"feature_id": "btn_checkout", "growth_rate_wow": 0.35}]
      elif params.get("trend") == "declining":
        return [{"feature_id": "btn_help", "growth_rate_wow": -0.40}]
    return []

  original_get = feature_intel_client._get
  feature_intel_client._get = mock_get
  yield feature_intel_client
  feature_intel_client._get = original_get

@pytest.fixture(name="product_health_mock", scope="function")
def product_health_mock_fixture():
  async def mock_get(path: str, params: dict):
    if "status" in path:
      return {
        "project_id": "proj_123",
        "health_score": 58.5,
        "score_reliability": 62.0, # reliability under 70 triggers error warning!
        "score_performance": 95.0,
        "score_feature_adoption": 42.0 # adoption under 50 triggers low adoption alert!
      }
    return {}

  original_get = product_health_client._get
  product_health_client._get = mock_get
  yield product_health_client
  product_health_client._get = original_get

@pytest.fixture(name="client", scope="function")
def client_fixture(db):
  mock_redis = MockRedis()

  def override_get_db():
    try:
      yield db
    finally:
      pass

  def override_get_redis():
    try:
      yield mock_redis
    finally:
      pass

  app.dependency_overrides[get_db] = override_get_db
  app.dependency_overrides[get_redis] = override_get_redis
  
  with TestClient(app) as test_client:
    yield test_client
    
  app.dependency_overrides.clear()
