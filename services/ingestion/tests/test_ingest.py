import uuid
from fastapi.testclient import TestClient

def test_successful_event_ingestion(client: TestClient):
  event_id = str(uuid.uuid4())
  
  # Standard payload envelope
  payload = {
    "apiKey": "if_write_testtoken",
    "sentAt": "2026-07-13T20:54:17Z",
    "events": [
      {
        "event_id": event_id,
        "event_name": "button_clicked",
        "category": "user",
        "distinct_id": "user_123",
        "timestamp": "2026-07-13T20:54:15Z",
        "properties": {
          "label": "Upgrade Plan",
          "email": "user@gmail.com",
          "cardNum": "4111-1111-1111-1111"
        },
        "context": {
          "url": "https://dashboard.insightfuel.io",
          "referrer": "",
          "sdk_version": "1.0.0"
        }
      }
    ]
  }

  headers = {
    "X-InsightFuel-ApiKey": "if_write_testtoken",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }

  response = client.post("/api/v1/ingest/", json=payload, headers=headers)
  assert response.status_code == 202
  data = response.json()
  assert data["status"] == "success"
  assert data["ingested"] == 1
  assert data["duplicates"] == 0

def test_missing_api_key_unauthorized(client: TestClient):
  payload = {
    "sentAt": "2026-07-13T20:54:17Z",
    "events": []
  }
  response = client.post("/api/v1/ingest/", json=payload)
  assert response.status_code == 401
  assert "API Key missing" in response.json()["detail"]

def test_invalid_api_key_unauthorized(client: TestClient):
  payload = {
    "apiKey": "if_write_invalidtoken",
    "sentAt": "2026-07-13T20:54:17Z",
    "events": []
  }
  headers = {"X-InsightFuel-ApiKey": "if_write_invalidtoken"}
  response = client.post("/api/v1/ingest/", json=payload, headers=headers)
  assert response.status_code == 401
  assert "Invalid API Key" in response.json()["detail"]

def test_duplicate_events_skipped(client: TestClient):
  event_id = str(uuid.uuid4())
  payload = {
    "apiKey": "if_write_testtoken",
    "sentAt": "2026-07-13T20:54:17Z",
    "events": [
      {
        "event_id": event_id,
        "event_name": "button_clicked",
        "category": "user",
        "distinct_id": "user_123",
        "timestamp": "2026-07-13T20:54:15Z",
        "properties": {"label": "upgrade"}
      },
      {
        "event_id": event_id, # Duplicate event ID in the same batch
        "event_name": "button_clicked",
        "category": "user",
        "distinct_id": "user_123",
        "timestamp": "2026-07-13T20:54:15Z",
        "properties": {"label": "upgrade"}
      }
    ]
  }
  
  headers = {"X-InsightFuel-ApiKey": "if_write_testtoken"}
  response = client.post("/api/v1/ingest/", json=payload, headers=headers)
  assert response.status_code == 202
  data = response.json()
  assert data["ingested"] == 1
  assert data["duplicates"] == 1

def test_rate_limiter_blocks_requests(client: TestClient):
  payload = {
    "apiKey": "if_write_testtoken",
    "sentAt": "2026-07-13T20:54:17Z",
    "events": []
  }
  headers = {"X-InsightFuel-ApiKey": "if_write_testtoken"}

  # Fire 100 requests (to reach the threshold limit)
  for _ in range(100):
    client.post("/api/v1/ingest/", json=payload, headers=headers)

  # Fire the 101st request, which should trigger the rate limiter
  response = client.post("/api/v1/ingest/", json=payload, headers=headers)
  assert response.status_code == 429
  assert "Rate limit exceeded" in response.json()["detail"]

def test_invalid_event_id_bad_request(client: TestClient):
  payload = {
    "apiKey": "if_write_testtoken",
    "sentAt": "2026-07-13T20:54:17Z",
    "events": [
      {
        "event_id": "invalid-uuid-123",  # Non-UUID syntax
        "event_name": "button_clicked",
        "category": "user",
        "distinct_id": "user_123",
        "timestamp": "2026-07-13T20:54:15Z"
      }
    ]
  }
  
  headers = {"X-InsightFuel-ApiKey": "if_write_testtoken"}
  response = client.post("/api/v1/ingest/", json=payload, headers=headers)
  assert response.status_code == 400
  assert "Must be a valid UUID v4" in response.json()["detail"]

def test_dlq_replay_endpoint(client: TestClient, db):
  from app.models.metadata import DeadLetterEvent

  # Seed a pending dead letter event in DB
  dlq_event = DeadLetterEvent(
    event_id="d1d927d7-db4a-4318-b2ef-1563f6a27e7d",
    project_id="proj_1",
    payload={
      "event_id": "d1d927d7-db4a-4318-b2ef-1563f6a27e7d",
      "event_name": "replayed_click",
      "category": "user",
      "distinct_id": "user_123",
      "timestamp": "2026-07-13T20:54:15Z"
    },
    error_message="Kafka timeout",
    status="pending"
  )
  db.add(dlq_event)
  db.commit()

  # Trigger DLQ replay with invalid admin token
  response = client.post(
    "/api/v1/ingest/admin/dlq/replay",
    headers={"X-Admin-Token": "wrong_token"}
  )
  assert response.status_code == 401

  # Trigger DLQ replay with correct token
  response = client.post(
    "/api/v1/ingest/admin/dlq/replay",
    headers={"X-Admin-Token": "admin_replay_secret_token_12345"}
  )
  assert response.status_code == 200
  data = response.json()
  assert data["status"] == "success"
  assert data["total_scanned"] == 1

