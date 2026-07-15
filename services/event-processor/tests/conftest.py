import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import clickhouse_connect

from app.main import app, get_db
from app.core.database import Base
from app.models.metadata import DeadLetterEvent
from app.core.clickhouse import clickhouse_manager
from app.pipeline.consumer import kafka_consumer_manager

# Setup SQLite in-memory metadata store
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
  SQLALCHEMY_DATABASE_URL,
  connect_args={"check_same_thread": False},
  poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
    self.inserts = []

  def insert(self, table: str, data: list, column_names: list):
    self.inserts.append({"table": table, "data": data, "columns": column_names})

  def close(self):
    pass

@pytest.fixture(name="db", scope="function")
def db_fixture():
  Base.metadata.create_all(bind=engine)
  db = TestingSessionLocal()
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

  # Mock dependency overrides
  app.dependency_overrides[get_db] = override_get_db
  
  with TestClient(app) as test_client:
    yield test_client
    
  app.dependency_overrides.clear()
