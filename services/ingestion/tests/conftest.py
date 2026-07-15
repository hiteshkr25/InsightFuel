import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from passlib.hash import bcrypt

from app.main import app
from app.core.database import Base
from app.api.deps import get_db, get_redis
from app.models.metadata import Organization, Workspace, Project, ApiKey

# Setup in-memory SQLite database
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

  def pipeline(self, transaction=True):
    return self

  async def __aenter__(self):
    return self

  async def __aexit__(self, exc_type, exc_val, exc_tb):
    pass

  async def execute(self):
    pass

@pytest.fixture(name="db", scope="function")
def db_fixture():
  Base.metadata.create_all(bind=engine)
  db = TestingSessionLocal()
  
  # Seed mock organization, workspace, project, and API Key
  org = Organization(id="org_1", name="Test Org")
  ws = Workspace(id="ws_1", name="Test Workspace", organization_id="org_1")
  proj = Project(id="proj_1", name="Test Project", workspace_id="ws_1")
  
  # Generate Bcrypt hash for raw test token: if_write_testtoken
  key_hash = bcrypt.hash("if_write_testtoken")
  apikey = ApiKey(
    id="key_1",
    project_id="proj_1",
    key_hash=key_hash,
    display_name="Test Key",
    is_active=True
  )
  
  db.add_all([org, ws, proj, apikey])
  db.commit()
  
  try:
    yield db
  finally:
    db.close()
    Base.metadata.drop_all(bind=engine)

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
