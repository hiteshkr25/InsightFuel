from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

class RecommendationLifecycleUpdate(BaseModel):
  status: str = Field(..., description="Target status, e.g. Reviewed, Accepted, Dismissed, Resolved, Expired, Archived")

class AIRecommendationResponse(BaseModel):
  id: str
  project_id: str
  title: str
  description: str
  category: str
  severity: str
  
  # Confidence Breakdown
  data_quality_confidence: float
  statistical_confidence: float
  overall_confidence: float
  
  priority_score: float
  
  metrics_used: List[str]
  evidence: Dict[str, Any]
  suggested_action: str
  expected_impact: str
  
  # Versioning
  rule_version: str
  engine_version: str
  recommendation_version: str
  created_by_engine: str
  
  # Relationships
  relationships: Dict[str, Any]
  
  status: str
  expires_at: Optional[datetime]
  created_at: datetime
  updated_at: datetime

  class Config:
    from_attributes = True
