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
    if "metrics" in path:
      return [
        {"feature_id": "btn_checkout", "usage_count": 100, "unique_users": 80, "avg_time_spent": 1.2}
      ]
    elif "activity" in path:
      return [
        {"timestamp": "2026-07-13", "dau": 500, "wau": 1000, "mau": 3000}
      ]
    return []

  original_get = query_api_client._get
  query_api_client._get = mock_get
  yield query_api_client
  query_api_client._get = original_get

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
