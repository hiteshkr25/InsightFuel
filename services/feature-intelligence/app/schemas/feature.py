from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field

class FeatureRegisterRequest(BaseModel):
  feature_id: str = Field(..., description="Unique code identifier, e.g. btn_checkout")
  display_name: str = Field(..., description="Human readable display name")
  category: Optional[str] = None
  parent_feature_id: Optional[str] = None
  tags: Optional[List[str]] = None
  owner: Optional[str] = None
  business_weight: Optional[float] = 1.0

class FeatureStatusTransition(BaseModel):
  status: str = Field(..., description="Target status, e.g. candidate, pending_approval, tracked, deprecated, retired, archived")

class FeatureRegistryResponse(BaseModel):
  id: str
  project_id: str
  feature_id: str
  display_name: str
  category: Optional[str]
  parent_feature_id: Optional[str]
  status: str
  first_seen: datetime
  last_seen: datetime
  tags: List[str]
  owner: Optional[str]
  version: str
  business_weight: float

  class Config:
    from_attributes = True

class FeatureSnapshotResponse(BaseModel):
  project_id: str
  feature_id: str
  snapshot_date: date
  adoption_rate: float
  usage_frequency: float
  growth_rate_wow: float
  stickiness_score: float
  importance_score: float
  health_status: str
  explanation: Optional[str]

  class Config:
    from_attributes = True
