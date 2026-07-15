import jwt
import time
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings
from app.models.feature import FeatureRegistry, FeatureSnapshot
from app.services.intelligence_service import calculate_feature_intelligence

def generate_test_token(org_id="org_123", sub="user_123") -> str:
  payload = {
    "org_id": org_id,
    "sub": sub,
    "exp": int(time.time()) + 3600
  }
  return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def test_feature_registration_and_transitions(client: TestClient, db):
  token = generate_test_token()
  headers = {"Authorization": f"Bearer {token}"}

  # 1. Post new feature registration
  payload = {
    "feature_id": "btn_checkout",
    "display_name": "Checkout Button",
    "category": "conversion",
    "tags": ["critical", "checkout"],
    "owner": "team_growth",
    "business_weight": 2.0
  }
  response = client.post(
    "/api/v1/registry?project_id=proj_123",
    json=payload,
    headers=headers
  )
  assert response.status_code == 201
  assert response.json()["status"] == "discovered"

  # 2. Transition discovered -> candidate (Valid)
  response = client.post(
    "/api/v1/registry/btn_checkout/transition?project_id=proj_123",
    json={"status": "candidate"},
    headers=headers
  )
  assert response.status_code == 200
  assert response.json()["status"] == "candidate"

  # 3. Transition candidate -> tracked (Invalid, must go to pending_approval first!)
  response = client.post(
    "/api/v1/registry/btn_checkout/transition?project_id=proj_123",
    json={"status": "tracked"},
    headers=headers
  )
  assert response.status_code == 400
  assert "Invalid state transition" in response.json()["detail"]

@pytest.mark.anyio
async def test_feature_intelligence_calculations(db, query_client_mock):
  # Seed a tracked feature registry
  feature = FeatureRegistry(
    project_id="proj_123",
    feature_id="btn_checkout",
    display_name="Checkout Button",
    status="tracked",
    business_weight=2.0
  )
  db.add(feature)
  db.commit()

  # Run calculations
  snapshots_count = await calculate_feature_intelligence("proj_123", db)
  assert snapshots_count == 1

  # Query snapshot row
  snap = db.query(FeatureSnapshot).first()
  assert snap is not None
  assert snap.feature_id == "btn_checkout"
  assert snap.adoption_rate == 0.08      # 80 unique users / 1000 WAU
  assert snap.usage_frequency == 1.25    # 100 usage_count / 80 unique users
  assert snap.stickiness_score == 0.08   # equal to adoption
  assert snap.growth_rate_wow == 0.0     # 0% since mock returns usage for both weeks
  assert snap.health_status == "stable"   # stable since growth is 0.0

def test_admin_intelligence_endpoints(client: TestClient, db, query_client_mock):
  token = generate_test_token()
  headers = {"Authorization": f"Bearer {token}"}

  # Seed a tracked feature
  feature = FeatureRegistry(
    project_id="proj_123",
    feature_id="btn_checkout",
    display_name="Checkout Button",
    status="tracked",
    business_weight=2.0
  )
  db.add(feature)
  db.commit()

  # 1. Trigger calculation via admin API
  response = client.post(
    "/api/v1/intelligence/compute?project_id=proj_123&x_admin_token=admin_replay_secret_token_12345"
  )
  assert response.status_code == 200
  assert response.json()["snapshots_created"] == 1

  # 2. Get rankings
  response = client.get(
    "/api/v1/intelligence/rankings?project_id=proj_123&sort_by=importance",
    headers=headers
  )
  assert response.status_code == 200
  rankings = response.json()
  assert len(rankings) == 1
  assert rankings[0]["feature_id"] == "btn_checkout"
