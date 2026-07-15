from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, validate_jwt_and_project_access
from app.models.feature import FeatureSnapshot, FeatureRegistry
from app.schemas.feature import FeatureSnapshotResponse
from app.services.intelligence_service import calculate_feature_intelligence

router = APIRouter()

@router.get("/intelligence/snapshots", response_model=List[FeatureSnapshotResponse])
async def list_snapshots(
  project_id: str = Query(...),
  snapshot_date: Optional[date] = Query(None),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  query = db.query(FeatureSnapshot).filter(FeatureSnapshot.project_id == project_id)
  if snapshot_date:
    query = query.filter(FeatureSnapshot.snapshot_date == snapshot_date)
    
  return query.all()

@router.get("/intelligence/rankings", response_model=List[FeatureSnapshotResponse])
async def get_rankings(
  project_id: str = Query(...),
  sort_by: str = Query("importance", description="Rank by: importance, adoption, growth, stickiness"),
  limit: int = Query(10, ge=1, le=100),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  # Query latest snapshots per feature
  latest_date_sub = db.query(FeatureSnapshot.snapshot_date).filter(
    FeatureSnapshot.project_id == project_id
  ).order_by(FeatureSnapshot.snapshot_date.desc()).limit(1).scalar_subquery()

  query = db.query(FeatureSnapshot).filter(
    FeatureSnapshot.project_id == project_id,
    FeatureSnapshot.snapshot_date == latest_date_sub
  )

  # Sorting fields mapping
  if sort_by == "adoption":
    query = query.order_by(FeatureSnapshot.adoption_rate.desc())
  elif sort_by == "growth":
    query = query.order_by(FeatureSnapshot.growth_rate_wow.desc())
  elif sort_by == "stickiness":
    query = query.order_by(FeatureSnapshot.stickiness_score.desc())
  else:
    query = query.order_by(FeatureSnapshot.importance_score.desc())

  return query.limit(limit).all()

@router.get("/intelligence/trends", response_model=List[FeatureSnapshotResponse])
async def get_trends(
  project_id: str = Query(...),
  trend: str = Query("growing", description="Trend type: growing, declining, at_risk, deprecated_candidate"),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  latest_date_sub = db.query(FeatureSnapshot.snapshot_date).filter(
    FeatureSnapshot.project_id == project_id
  ).order_by(FeatureSnapshot.snapshot_date.desc()).limit(1).scalar_subquery()

  query = db.query(FeatureSnapshot).filter(
    FeatureSnapshot.project_id == project_id,
    FeatureSnapshot.snapshot_date == latest_date_sub,
    FeatureSnapshot.health_status == trend
  ).order_by(FeatureSnapshot.importance_score.desc())

  return query.all()

@router.post("/intelligence/compute", status_code=status.HTTP_200_OK)
async def trigger_intelligence_computation(
  project_id: str = Query(...),
  x_admin_token: str = Query(...),
  db: Session = Depends(get_db)
):
  """
  Admin route to manually trigger recalculations of feature intelligence.
  """
  if x_admin_token != "admin_replay_secret_token_12345":
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

  snapshots_created = await calculate_feature_intelligence(project_id, db)
  return {
    "status": "success",
    "project_id": project_id,
    "snapshots_created": snapshots_created
  }
