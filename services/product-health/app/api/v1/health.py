from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, validate_jwt_and_project_access
from app.models.health import ProductHealthSnapshot
from app.schemas.health import HealthSnapshotResponse, HealthBreakdownResponse, HealthTrendResponse
from app.services.health_service import calculate_product_health

router = APIRouter()

@router.get("/health/status", response_model=HealthSnapshotResponse)
async def get_health_status(
  project_id: str = Query(...),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  snap = db.query(ProductHealthSnapshot).filter(
    ProductHealthSnapshot.project_id == project_id
  ).order_by(ProductHealthSnapshot.snapshot_date.desc()).first()

  if not snap:
    raise HTTPException(status_code=404, detail="No health snapshots calculated yet for project")
  return snap

@router.get("/health/breakdown", response_model=HealthBreakdownResponse)
async def get_health_breakdown(
  project_id: str = Query(...),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  snap = db.query(ProductHealthSnapshot).filter(
    ProductHealthSnapshot.project_id == project_id
  ).order_by(ProductHealthSnapshot.snapshot_date.desc()).first()

  if not snap:
    raise HTTPException(status_code=404, detail="No health snapshots found")

  # Map dimensions to score keys
  dims = [
    {"name": "Acquisition", "score": snap.score_acquisition},
    {"name": "Activation", "score": snap.score_activation},
    {"name": "Engagement", "score": snap.score_engagement},
    {"name": "Retention", "score": snap.score_retention},
    {"name": "Feature Adoption", "score": snap.score_feature_adoption},
    {"name": "Performance", "score": snap.score_performance},
    {"name": "Reliability", "score": snap.score_reliability},
    {"name": "User Experience", "score": snap.score_user_experience}
  ]

  # Sort by score values
  sorted_dims = sorted(dims, key=lambda x: x["score"])

  # Query previous snapshot for improvements and regressions comparison
  prev_snap = db.query(ProductHealthSnapshot).filter(
    ProductHealthSnapshot.project_id == project_id
  ).order_by(ProductHealthSnapshot.snapshot_date.desc()).offset(1).first()

  improvements = []
  regressions = []

  if prev_snap:
    # Map previous scores
    prev_dims = {
      "Acquisition": prev_snap.score_acquisition,
      "Activation": prev_snap.score_activation,
      "Engagement": prev_snap.score_engagement,
      "Retention": prev_snap.score_retention,
      "Feature Adoption": prev_snap.score_feature_adoption,
      "Performance": prev_snap.score_performance,
      "Reliability": prev_snap.score_reliability,
      "User Experience": prev_snap.score_user_experience
    }
    
    diffs = []
    for d in dims:
      prev_val = prev_dims.get(d["name"], d["score"])
      diff = d["score"] - prev_val
      diffs.append({"name": d["name"], "change": diff})

    sorted_diffs = sorted(diffs, key=lambda x: x["change"])
    regressions = [x for x in sorted_diffs if x["change"] < 0]
    improvements = [x for x in reversed(sorted_diffs) if x["change"] > 0]

  return {
    "strongest_dimensions": list(reversed(sorted_dims[-3:])),
    "weakest_dimensions": sorted_dims[:3],
    "biggest_improvements": improvements[:2],
    "biggest_regressions": regressions[:2]
  }

@router.get("/health/trends", response_model=HealthTrendResponse)
async def get_health_trends(
  project_id: str = Query(...),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  snapshots = db.query(ProductHealthSnapshot).filter(
    ProductHealthSnapshot.project_id == project_id
  ).order_by(ProductHealthSnapshot.snapshot_date.desc()).limit(2).all()

  if not snapshots:
    raise HTTPException(status_code=404, detail="No health snapshots calculated")

  current_score = snapshots[0].health_score
  previous_score = snapshots[1].health_score if len(snapshots) > 1 else current_score
  change = current_score - previous_score

  if change > 3.0:
    trend = "Improving"
  elif change < -3.0:
    if current_score < 40.0:
      trend = "Critical"
    else:
      trend = "Declining"
  else:
    trend = "Stable"

  return {
    "project_id": project_id,
    "current_score": current_score,
    "previous_score": previous_score,
    "change": change,
    "trend_status": trend
  }

@router.post("/health/compute", response_model=HealthSnapshotResponse)
async def trigger_health_computation(
  project_id: str = Query(...),
  x_admin_token: str = Query(...),
  db: Session = Depends(get_db)
):
  if x_admin_token != "admin_replay_secret_token_12345":
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

  snap = await calculate_product_health(project_id, db)
  if not snap:
    raise HTTPException(status_code=500, detail="Health computation run failed")
  return snap
