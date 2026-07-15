from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, validate_jwt_and_project_access
from app.models.feature import FeatureRegistry
from app.schemas.feature import FeatureRegisterRequest, FeatureStatusTransition, FeatureRegistryResponse

router = APIRouter()

# Lifecycle transition rules map
ALLOWED_TRANSITIONS = {
  "discovered": ["candidate"],
  "candidate": ["pending_approval", "discovered"],
  "pending_approval": ["tracked", "candidate"],
  "tracked": ["deprecated"],
  "deprecated": ["retired", "tracked"],
  "retired": ["archived"],
  "archived": []
}

@router.post("/registry", response_model=FeatureRegistryResponse, status_code=status.HTTP_201_CREATED)
async def register_feature(
  request: FeatureRegisterRequest,
  project_id: str = Query(...),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  # Check duplicate registration
  existing = db.query(FeatureRegistry).filter(
    FeatureRegistry.project_id == project_id,
    FeatureRegistry.feature_id == request.feature_id
  ).first()
  if existing:
    raise HTTPException(status_code=400, detail="Feature selector already exists in project registry")

  feature = FeatureRegistry(
    project_id=project_id,
    feature_id=request.feature_id,
    display_name=request.display_name,
    category=request.category,
    parent_feature_id=request.parent_feature_id,
    status="discovered",
    tags=request.tags or [],
    owner=request.owner,
    business_weight=request.business_weight or 1.0,
    first_seen=datetime.now(timezone.utc),
    last_seen=datetime.now(timezone.utc)
  )
  db.add(feature)
  db.commit()
  db.refresh(feature)
  return feature

@router.get("/registry", response_model=List[FeatureRegistryResponse])
async def list_registered_features(
  project_id: str = Query(...),
  limit: int = Query(100, ge=1, le=1000),
  offset: int = Query(0, ge=0),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  features = db.query(FeatureRegistry).filter(
    FeatureRegistry.project_id == project_id
  ).limit(limit).offset(offset).all()
  
  return features

@router.post("/registry/{feature_id}/transition", response_model=FeatureRegistryResponse)
async def transition_feature_status(
  feature_id: str,
  transition: FeatureStatusTransition,
  project_id: str = Query(...),
  db: Session = Depends(get_db),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  feature = db.query(FeatureRegistry).filter(
    FeatureRegistry.project_id == project_id,
    FeatureRegistry.feature_id == feature_id
  ).first()

  if not feature:
    raise HTTPException(status_code=404, detail="Feature registry entry not found")

  # Validate state transition rules
  current = feature.status
  target = transition.status
  
  valid_targets = ALLOWED_TRANSITIONS.get(current, [])
  if target not in valid_targets:
    raise HTTPException(
      status_code=400,
      detail=f"Invalid state transition: Cannot transition from '{current}' to '{target}'"
    )

  feature.status = target
  feature.updated_at = datetime.now(timezone.utc)
  db.commit()
  db.refresh(feature)
  return feature
