import uuid
import pytest
from fastapi.testclient import TestClient
from app.pipeline.processor import process_event
from app.idempotency import validate_event_id, check_and_set_duplicate
from app.models.metadata import DeadLetterEvent

# 1. Mock Redis context class for unit testing
class LocalMockRedis:
  def __init__(self):
    self.store = {}

  async def get(self, key: str):
    return self.store.get(key)

  async def setex(self, key: str, seconds: int, value: str):
    self.store[key] = value

def test_event_processing_pii_and_latency():
  event_id = str(uuid.uuid4())
  
  raw_payload = {
    "event_id": event_id,
    "event_name": "checkout_step",
    "category": "user",
    "distinct_id": "cust_123",
    "timestamp": "2026-07-13T21:10:00Z",
    "properties": {
      "email_address": "hitesh@company.com",
      "card_token": "4111 1111 1111 1111",
      "amount": 49.99
    },
    "context": {
      "url": "https://insightfuel.io/checkout"
    },
    "received_at": "2026-07-13T21:10:02Z",
    "ingestion_id": "ingest_999",
    "project_id": "proj_123",
    "organization_id": "org_456",
    "ip_address": "192.168.1.0"
  }

  processed = process_event(raw_payload, "worker_unit_test")
  
  assert processed["event_id"] == event_id
  assert processed["properties"]["email_address"] == "[EMAIL_MASKED]"
  assert processed["properties"]["card_token"] == "[CREDIT_CARD_MASKED]"
  assert processed["properties"]["amount"] == 49.99
  
  assert processed["processed_at"] is not None
  assert processed["processing_latency"] >= 0.0
  assert processed["worker_id"] == "worker_unit_test"
  assert processed["processing_version"] == "1.0.0"

def test_idempotency_uuid_and_duplicates():
  # Syntax checking
  assert validate_event_id(str(uuid.uuid4())) is True
  assert validate_event_id("not-a-uuid") is False
  assert validate_event_id("d1d927d7-db4a-3xxx-b2ef-1563f6a27e7d") is False # Invalid version

@pytest.mark.anyio
async def test_duplicate_checks():
  redis = LocalMockRedis()
  event_id = str(uuid.uuid4())
  
  is_dup_first = await check_and_set_duplicate(redis, event_id)
  assert is_dup_first is False
  
  is_dup_second = await check_and_set_duplicate(redis, event_id)
  assert is_dup_second is True

def test_admin_dlq_replay_endpoint(client: TestClient, db):
  # Seed a pending dead letter event
  dlq_event = DeadLetterEvent(
    event_id="e3bc9f77-db4a-4318-b2ef-1563f6a27e7e",
    project_id="proj_123",
    payload={
      "event_id": "e3bc9f77-db4a-4318-b2ef-1563f6a27e7e",
      "event_name": "failed_log",
      "category": "user",
      "distinct_id": "user_123",
      "timestamp": "2026-07-13T20:54:15Z"
    },
    error_message="ClickHouse timeout",
    status="pending"
  )
  db.add(dlq_event)
  db.commit()

  # Trigger DLQ replay with wrong credentials
  response = client.post(
    "/api/v1/event-processor/admin/dlq/replay",
    headers={"X-Admin-Token": "bad_token"}
  )
  assert response.status_code == 401

  # Trigger DLQ replay with correct credentials
  response = client.post(
    "/api/v1/event-processor/admin/dlq/replay",
    headers={"X-Admin-Token": "admin_replay_secret_token_12345"}
  )
  assert response.status_code == 200
  data = response.json()
  assert data["status"] == "success"
  assert data["total_scanned"] == 1
