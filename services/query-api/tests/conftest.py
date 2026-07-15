import os
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["CLICKHOUSE_HOST"] = "mock_host"
os.environ["DEMO_MODE"] = "false"

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import get_db
from app.core.database import Base, engine, SessionLocal
from app.core.clickhouse import clickhouse_manager

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

class MockClickHouseClient:
  def __init__(self):
    self.result_rows = []
    self.column_names = []

  def query(self, query_str: str, parameters=None):
    if "session_metrics" in query_str:
      self.result_rows = [
        ("session_123", 120.0, 90.0, 30.0, 8.5, "pc", "Chrome", "Windows", "US", "2026-07-13T21:10:00Z")
      ]
      self.column_names = [
        "session_id", "duration", "active_time", "idle_time", "quality_score",
        "device", "browser", "os", "country", "timestamp"
      ]
    elif "user_activity_metrics" in query_str:
      self.result_rows = [
        ("2026-07-13T00:00:00Z", 1500, 8500, 25000, 150, 1350)
      ]
      self.column_names = ["timestamp", "dau", "wau", "mau", "new_users", "returning_users"]
    elif "retention_metrics" in query_str:
      self.result_rows = [
        ("2026-07-13", 1, 100, 80, 0.8),
        ("2026-07-13", 7, 100, 50, 0.5)
      ]
      self.column_names = ["cohort_date", "day_number", "cohort_size", "retained_users", "retention_rate"]
    elif "funnel_metrics" in query_str:
      self.result_rows = [
        ("checkout_funnel", 1, "page_view", 100, 0.0, 1.0, 0.0, "2026-07-13T21:10:00Z"),
        ("checkout_funnel", 2, "click", 80, 0.2, 0.8, 2.5, "2026-07-13T21:10:00Z")
      ]
      self.column_names = [
        "funnel_id", "step_number", "step_name", "completed_users",
        "dropoff_rate", "conversion_rate", "avg_completion_time", "timestamp"
      ]
    elif "path_metrics" in query_str:
      self.result_rows = [
        ("/home", "/pricing", 150, "2026-07-13T21:10:00Z")
      ]
      self.column_names = ["source_path", "target_path", "transition_count", "timestamp"]
    elif "feature_metrics" in query_str:
      self.result_rows = [
        ("btn_submit", 250, 180, 1.2, "2026-07-13T21:10:00Z")
      ]
      self.column_names = ["feature_id", "usage_count", "unique_users", "avg_time_spent", "timestamp"]
    elif "performance_metrics" in query_str:
      self.result_rows = [
        ("2026-07-13T21:00:00Z", 1.8, 0.25, 4)
      ]
      self.column_names = ["timestamp", "avg_load_time", "avg_api_latency", "error_count"]
    else:
      self.result_rows = []
      self.column_names = []
    return self

  def close(self):
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

@pytest.fixture(name="clickhouse_mock", scope="function")
def clickhouse_mock_fixture():
  mock_client = MockClickHouseClient()
  original_get_client = clickhouse_manager.get_client
  clickhouse_manager.client = mock_client
  clickhouse_manager.get_client = lambda: mock_client
  
  yield mock_client
  
  clickhouse_manager.client = None
  clickhouse_manager.get_client = original_get_client

@pytest.fixture(name="client", scope="function")
def client_fixture(db):
  from app.api.deps import get_redis
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
