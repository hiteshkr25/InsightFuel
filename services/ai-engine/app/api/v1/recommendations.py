from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, validate_jwt_and_project_access
from app.models.recommendation import AIRecommendation
from app.schemas.recommendation import AIRecommendationResponse, RecommendationLifecycleUpdate
from app.services.recommendation_service import generate_project_recommendations

router = APIRouter()

# Refined Lifecycle transitions validation map
ALLOWED_TRANSITIONS = {
  "Generated": ["Reviewed", "Dismissed", "Expired"],
  "Reviewed": ["Accepted", "Dismissed", "Expired"],
  "Accepted": ["Resolved", "Expired"],
  "Dismissed": ["Archived"],
  "Resolved": ["Archived"],
  "Expired": ["Archived"],
  "Archived": []
}

def check_and_expire_stale_recommendations(project_id: str, db: Session):
  """
  Checks active recommendations and automatically marks expired ones.
  """
  today = datetime.now(timezone.utc)
  stale = db.query(AIRecommendation).filter(
    AIRecommendation.project_id == project_id,
    AIRecommendation.status.in_(["Generated", "Reviewed", "Accepted"]),
    AIRecommendation.expires_at < today
  ).all()
  for r in stale:
    r.status = "Expired"
    r.updated_at = today
  if stale:
    db.commit()

@router.get("/recommendations/active", response_model=List[AIRecommendationResponse])
async def list_active_recommendations(
  project_id: str = Query(...),
  limit: int = Query(10, ge=1, le=100),
  offset: int = Query(0, ge=0),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  # Enforce auto-expiration check
  check_and_expire_stale_recommendations(project_id, db)

  active_statuses = ["Generated", "Reviewed", "Accepted"]
  query = db.query(AIRecommendation).filter(
    AIRecommendation.project_id == project_id,
    AIRecommendation.status.in_(active_statuses)
  ).order_by(AIRecommendation.priority_score.desc()).limit(limit).offset(offset)
  
  return query.all()

@router.get("/recommendations/history", response_model=List[AIRecommendationResponse])
async def list_recommendations_history(
  project_id: str = Query(...),
  limit: int = Query(100, ge=1, le=1000),
  offset: int = Query(0, ge=0),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  # Enforce auto-expiration check
  check_and_expire_stale_recommendations(project_id, db)

  query = db.query(AIRecommendation).filter(
    AIRecommendation.project_id == project_id
  ).order_by(AIRecommendation.created_at.desc()).limit(limit).offset(offset)
  
  return query.all()

@router.post("/recommendations/{recommendation_id}/lifecycle", response_model=AIRecommendationResponse)
async def transition_recommendation_lifecycle(
  recommendation_id: str,
  lifecycle: RecommendationLifecycleUpdate,
  project_id: str = Query(...),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  rec = db.query(AIRecommendation).filter(
    AIRecommendation.id == recommendation_id,
    AIRecommendation.project_id == project_id
  ).first()

  if not rec:
    raise HTTPException(status_code=404, detail="Recommendation not found")

  current = rec.status
  target = lifecycle.status

  valid_targets = ALLOWED_TRANSITIONS.get(current, [])
  if target not in valid_targets:
    raise HTTPException(
      status_code=400,
      detail=f"Invalid lifecycle transition: Cannot transition from '{current}' to '{target}'"
    )

  rec.status = target
  rec.updated_at = datetime.now(timezone.utc)
  db.commit()
  db.refresh(rec)
  return rec

@router.post("/recommendations/compute", status_code=status.HTTP_200_OK)
async def trigger_recommendations_generation(
  project_id: str = Query(...),
  x_admin_token: str = Query(...),
  db: Session = Depends(get_db)
):
  if x_admin_token != "admin_replay_secret_token_12345":
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

  stored_count = await generate_project_recommendations(project_id, db)
  return {
    "status": "success",
    "project_id": project_id,
    "recommendations_created": stored_count
  }
