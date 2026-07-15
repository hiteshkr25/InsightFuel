import os
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["CLICKHOUSE_HOST"] = "mock_host"

import pytest
from fastapi.testclient import TestClient

from app.main import app, get_db
from app.core.database import Base, engine, SessionLocal
from app.core.clickhouse import clickhouse_manager

class MockClickHouseClient:
  def __init__(self):
    self.inserts = []
    # Seed mock event list: representing a session flow
    self.result_rows = [
      (
        "e_1", "page_view", "navigation", "cust_123", "proj_1",
        "2026-07-13T21:10:00Z", "2026-07-13T21:10:02Z",
        "Chrome", "Windows", "pc", "127.0.0.1", "session_123"
      ),
      (
        "e_2", "click", "user", "cust_123", "proj_1",
        "2026-07-13T21:10:30Z", "2026-07-13T21:10:32Z",
        "Chrome", "Windows", "pc", "127.0.0.1", "session_123"
      ),
      (
        "e_3", "form_submit", "user", "cust_123", "proj_1",
        "2026-07-13T21:11:00Z", "2026-07-13T21:11:02Z",
        "Chrome", "Windows", "pc", "127.0.0.1", "session_123"
      )
    ]
    self.column_names = [
      "event_id", "event_name", "category", "distinct_id", "project_id",
      "timestamp", "received_at", "browser", "os", "device", "ip_address", "session_id"
    ]

  def query(self, query_str: str, parameters=None):
    return self

  def command(self, cmd: str):
    pass

  def insert(self, table: str, data: list, column_names: list):
    self.inserts.append({"table": table, "data": data, "columns": column_names})

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
  def override_get_db():
    try:
      yield db
    finally:
      pass

  app.dependency_overrides[get_db] = override_get_db
  
  with TestClient(app) as test_client:
    yield test_client
    
  app.dependency_overrides.clear()
