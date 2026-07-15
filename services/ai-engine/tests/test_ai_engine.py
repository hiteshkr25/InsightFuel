import jwt
import time
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings
from app.models.recommendation import AIRecommendation
from app.services.recommendation_service import generate_project_recommendations

def generate_test_token(org_id="org_123", sub="user_123") -> str:
  payload = {
    "org_id": org_id,
    "sub": sub,
    "exp": int(time.time()) + 3600
  }
  return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

@pytest.mark.anyio
async def test_ai_recommendations_generation(db, query_client_mock, feature_intel_mock, product_health_mock):
  stored_count = await generate_project_recommendations("proj_123", db)
  assert stored_count > 0

  # Fetch all persisted recommendations
  recs = db.query(AIRecommendation).all()
  titles = [r.title for r in recs]
  
  assert "Sudden Traffic Engagement Drop Detected" in titles
  assert "App Reliability Degrading Below Alert Threshold" in titles
  assert "Core Feature Adoption Deficit" in titles
  assert "Promote Visibility for Rapidly Growing Feature" in titles
  assert "Review UX Layout for Declining Feature" in titles

def test_active_recommendations_and_lifecycle(client: TestClient, db):
  token = generate_test_token()
  headers = {"Authorization": f"Bearer {token}"}

  # Seed a recommendation
  rec = AIRecommendation(
    project_id="proj_123",
    title="Core Feature Adoption Deficit",
    description="Weighted feature adoption score is low.",
    category="Adoption",
    severity="warning",
    data_quality_confidence=0.9,
    statistical_confidence=1.0,
    overall_confidence=0.9,
    priority_score=11.7,
    suggested_action="Review onboarding tooltips.",
    expected_impact="Improve elements interaction.",
    status="Generated"
  )
  db.add(rec)
  db.commit()
  db.refresh(rec)

  # 1. List active recommendations (Generated is active)
  response = client.get("/api/v1/recommendations/active?project_id=proj_123", headers=headers)
  assert response.status_code == 200
  assert len(response.json()) == 1
  assert response.json()[0]["title"] == "Core Feature Adoption Deficit"

  # 2. Transition Generated -> Reviewed (Valid)
  response = client.post(
    f"/api/v1/recommendations/{rec.id}/lifecycle?project_id=proj_123",
    json={"status": "Reviewed"},
    headers=headers
  )
  assert response.status_code == 200
  assert response.json()["status"] == "Reviewed"

  # 3. Transition Reviewed -> Archived (Invalid, must go Accepted or Dismissed first!)
  response = client.post(
    f"/api/v1/recommendations/{rec.id}/lifecycle?project_id=proj_123",
    json={"status": "Archived"},
    headers=headers
  )
  assert response.status_code == 400
  assert "Invalid lifecycle transition" in response.json()["detail"]
