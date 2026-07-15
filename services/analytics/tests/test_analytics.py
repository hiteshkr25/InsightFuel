import pytest
from fastapi.testclient import TestClient
from app.jobs.session import compute_session_metrics
from app.jobs.user import compute_user_analytics, compute_retention_analytics, compute_funnel_analytics
from app.jobs.journey import compute_journey_analytics
from app.models.metadata import JobRun

def test_session_metrics_calculation(clickhouse_mock):
  # Compute session metrics over mock database time windows
  count = pytest.mark.anyio(compute_session_metrics)
  # Run directly using await for async jobs
  # Let's execute synchronously for test runners
  pass

@pytest.mark.anyio
async def test_async_session_metrics(clickhouse_mock):
  processed_count = await compute_session_metrics("2026-07-13T21:10:00Z", "2026-07-13T21:12:00Z")
  assert processed_count == 1
  
  # Check mock ClickHouse inserts
  assert len(clickhouse_mock.inserts) == 1
  insert = clickhouse_mock.inserts[0]
  assert insert["table"] == "session_metrics"
  
  # Row tuple values check
  row = insert["data"][0]
  assert row[0] == "session_123"      # session_id
  assert row[1] == "proj_1"           # project_id
  assert row[2] == 60.0               # duration (max - min = 21:11:00 - 21:10:00 = 60s)
  assert row[3] == 60.0               # active_time
  assert row[4] == 0.0                # idle_time
  assert row[5] == 2.1                # quality score (3 events * 0.5 + 60 * 0.01)

@pytest.mark.anyio
async def test_user_retention_and_funnel_metrics(clickhouse_mock):
  user_count = await compute_user_analytics("2026-07-13T21:10:00Z")
  assert user_count == 1
  
  retention_count = await compute_retention_analytics("2026-07-13T21:10:00Z")
  assert retention_count == 3  # Day 1, 7, 30
  
  funnel_count = await compute_funnel_analytics("2026-07-13T21:10:00Z")
  assert funnel_count == 3  # Step 1, 2, 3

@pytest.mark.anyio
async def test_journey_paths_analytics(clickhouse_mock):
  # Mock result rows representing page views
  clickhouse_mock.result_rows = [
    ("proj_1", "2026-07-13T21:10:00Z", "session_123", "/home"),
    ("proj_1", "2026-07-13T21:10:30Z", "session_123", "/pricing"),
    ("proj_1", "2026-07-13T21:11:00Z", "session_123", "/checkout")
  ]
  clickhouse_mock.column_names = ["project_id", "timestamp", "session_id", "path"]

  paths_count = await compute_journey_analytics("2026-07-13T21:10:00Z")
  assert paths_count == 2  # /home -> /pricing and /pricing -> /checkout

def test_admin_registry_api(client: TestClient):
  # Check authorization guard failure
  response = client.get(
    "/api/v1/analytics/admin/registry",
    headers={"X-Admin-Token": "bad_token"}
  )
  assert response.status_code == 401

  # Check success
  response = client.get(
    "/api/v1/analytics/admin/registry",
    headers={"X-Admin-Token": "admin_replay_secret_token_12345"}
  )
  assert response.status_code == 200
  data = response.json()
  assert len(data) > 0
  assert data[0]["name"] == "Session Duration"

def test_admin_backfill_api(client: TestClient, db, clickhouse_mock):
  # Check invalid date ranges
  payload = {
    "metric_name": "session_analytics",
    "start_date": "2026-07-10",
    "end_date": "2026-07-09"
  }
  response = client.post(
    "/api/v1/analytics/admin/backfill",
    json=payload,
    headers={"X-Admin-Token": "admin_replay_secret_token_12345"}
  )
  assert response.status_code == 400

  # Check valid trigger
  payload = {
    "metric_name": "session_analytics",
    "start_date": "2026-07-13",
    "end_date": "2026-07-13"
  }
  response = client.post(
    "/api/v1/analytics/admin/backfill",
    json=payload,
    headers={"X-Admin-Token": "admin_replay_secret_token_12345"}
  )
  assert response.status_code == 202
  data = response.json()
  assert data["status"] == "success"
  assert "backfill_session_analytics" in data["job_name"]

  # Check JobRun is logged in Postgres
  job_runs = db.query(JobRun).filter(JobRun.status == "success").all()
  assert len(job_runs) == 1
  assert job_runs[0].job_name == "backfill_session_analytics"
