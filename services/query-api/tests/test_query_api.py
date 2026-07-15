import jwt
import time
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings

def generate_test_token(org_id="org_123", sub="user_123") -> str:
  payload = {
    "org_id": org_id,
    "sub": sub,
    "exp": int(time.time()) + 3600
  }
  return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def test_auth_and_tenant_isolation(client: TestClient):
  # 1. Invalid prefix
  response = client.get(
    "/api/v1/sessions?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13",
    headers={"Authorization": "InvalidPrefix xyz"}
  )
  assert response.status_code == 401

  # 2. Token mismatch project scope
  token = generate_test_token(org_id="org_456")
  response = client.get(
    "/api/v1/sessions?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13",
    headers={"Authorization": f"Bearer {token}"}
  )
  # validate_jwt_and_project_access decodes token fine, but router raises 403 on project_id mismatch
  assert response.status_code == 403

def test_query_caching_and_csv_export(client: TestClient, clickhouse_mock):
  token = generate_test_token()
  headers = {"Authorization": f"Bearer {token}"}

  # First call - cache miss, queries ClickHouse
  response = client.get(
    "/api/v1/sessions?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13",
    headers=headers
  )
  assert response.status_code == 200
  data = response.json()
  assert len(data) == 1
  assert data[0]["session_id"] == "session_123"

  # CSV Export formatting check
  response_csv = client.get(
    "/api/v1/sessions?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13&format=csv",
    headers=headers
  )
  assert response_csv.status_code == 200
  assert "text/csv" in response_csv.headers["content-type"]
  assert "session_id,duration,active_time" in response_csv.text

def test_metrics_analytical_endpoints(client: TestClient, clickhouse_mock):
  token = generate_test_token()
  headers = {"Authorization": f"Bearer {token}"}

  # 1. User activity rollups (DAU/WAU/MAU)
  resp = client.get("/api/v1/users/activity?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13", headers=headers)
  assert resp.status_code == 200
  assert resp.json()[0]["dau"] == 1500

  # 2. Retention Matrices
  resp = client.get("/api/v1/users/retention?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13", headers=headers)
  assert resp.status_code == 200
  assert resp.json()[0]["retention_rate"] == 0.8

  # 3. Step conversions funnels
  resp = client.get("/api/v1/users/funnels?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13", headers=headers)
  assert resp.status_code == 200
  assert resp.json()[0]["completed_users"] == 100

  # 4. User path flow transitions
  resp = client.get("/api/v1/journeys/paths?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13", headers=headers)
  assert resp.status_code == 200
  assert resp.json()[0]["transition_count"] == 150

  # 5. Feature engagement
  resp = client.get("/api/v1/features/metrics?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13", headers=headers)
  assert resp.status_code == 200
  assert resp.json()[0]["usage_count"] == 250

  # 6. Device/system performance
  resp = client.get("/api/v1/features/performance?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13", headers=headers)
  assert resp.status_code == 200
  assert resp.json()[0]["error_count"] == 4

def test_metrics_registry(client: TestClient):
  token = generate_test_token()
  headers = {"Authorization": f"Bearer {token}"}
  
  resp = client.get("/api/v1/registry", headers=headers)
  assert resp.status_code == 200
  data = resp.json()
  assert len(data) > 0
  assert data[0]["name"] == "Session Duration"

def test_rate_limiting_trigger(client: TestClient):
  token = generate_test_token()
  headers = {"Authorization": f"Bearer {token}"}
  
  # Trigger 101 requests rapidly to exceed the rate limits (limit 100 / 10s)
  for _ in range(100):
    client.get("/api/v1/registry", headers=headers)
    
  # The 101st request must trigger rate limits block
  response = client.get("/api/v1/registry", headers=headers)
  assert response.status_code == 429
  assert "Rate limit exceeded" in response.json()["detail"]
