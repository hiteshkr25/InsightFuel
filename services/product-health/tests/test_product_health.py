import jwt
import time
import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.core.config import settings
from app.models.health import ProductHealthSnapshot
from app.services.health_service import calculate_product_health

def generate_test_token(org_id="org_123", sub="user_123") -> str:
  payload = {
    "org_id": org_id,
    "sub": sub,
    "exp": int(time.time()) + 3600
  }
  return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

@pytest.mark.anyio
async def test_product_health_calculations(db, query_client_mock, feature_intel_mock):
  # Run calculations
  snap = await calculate_product_health("proj_123", db)
  assert snap is not None
  assert snap.project_id == "proj_123"
  assert snap.health_score > 0.0
  assert snap.confidence_score == 1.0  # all mock queries returned valid data
  assert snap.maturity_stage == "Growing" # WAU is 500 (between 200 and 2000)

def test_breakdowns_and_trends(client: TestClient, db):
  token = generate_test_token()
  headers = {"Authorization": f"Bearer {token}"}

  # Seed two snapshots (current and yesterday)
  today = date.today()
  yesterday = today - timedelta(days=1)

  current_snap = ProductHealthSnapshot(
    project_id="proj_123",
    snapshot_date=today,
    health_score=78.5,
    health_category="Healthy",
    maturity_stage="Growing",
    score_acquisition=80.0,
    score_activation=70.0,
    score_engagement=75.0,
    score_retention=85.0,
    score_feature_adoption=60.0,
    score_performance=90.0,
    score_reliability=95.0,
    score_user_experience=70.0,
    kpis={"user_growth_rate": 0.08}
  )

  prev_snap = ProductHealthSnapshot(
    project_id="proj_123",
    snapshot_date=yesterday,
    health_score=72.0,
    health_category="Healthy",
    maturity_stage="Growing",
    score_acquisition=70.0, # Improved +10
    score_activation=70.0,
    score_engagement=75.0,
    score_retention=85.0,
    score_feature_adoption=60.0,
    score_performance=90.0,
    score_reliability=95.0,
    score_user_experience=75.0, # Regressed -5
    kpis={"user_growth_rate": 0.05}
  )

  db.add(current_snap)
  db.add(prev_snap)
  db.commit()

  # 1. Query breakdowns
  response = client.get("/api/v1/health/breakdown?project_id=proj_123", headers=headers)
  assert response.status_code == 200
  data = response.json()
  assert len(data["strongest_dimensions"]) == 3
  assert data["strongest_dimensions"][0]["name"] == "Reliability" # 95 score
  assert data["weakest_dimensions"][0]["name"] == "Feature Adoption" # 60 score

  # Improvements / Regressions check
  assert len(data["biggest_improvements"]) > 0
  assert data["biggest_improvements"][0]["name"] == "Acquisition" # +10 change
  assert len(data["biggest_regressions"]) > 0
  assert data["biggest_regressions"][0]["name"] == "User Experience" # -5 change

  # 2. Query trends
  response = client.get("/api/v1/health/trends?project_id=proj_123", headers=headers)
  assert response.status_code == 200
  trend_data = response.json()
  assert trend_data["change"] == 6.5
  assert trend_data["trend_status"] == "Improving"

def test_admin_health_endpoint(client: TestClient, db, query_client_mock, feature_intel_mock):
  # Trigger calculation run
  response = client.post(
    "/api/v1/health/compute?project_id=proj_123&x_admin_token=admin_replay_secret_token_12345"
  )
  assert response.status_code == 200
  assert response.json()["health_score"] > 0.0
  assert response.json()["maturity_stage"] == "Growing"
