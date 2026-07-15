from typing import Optional, Dict, Any, List
from datetime import date
from pydantic import BaseModel, Field

class HealthSnapshotResponse(BaseModel):
  id: str
  project_id: str
  snapshot_date: date
  
  # Scores & Labels
  health_score: float
  health_category: str
  maturity_stage: str
  maturity_reason: Optional[str]
  confidence_score: float
  
  # Dimensions breakdown
  score_acquisition: float
  score_activation: float
  score_engagement: float
  score_retention: float
  score_feature_adoption: float
  score_performance: float
  score_reliability: float
  score_user_experience: float
  
  kpis: Dict[str, Any]

  class Config:
    from_attributes = True

class HealthBreakdownResponse(BaseModel):
  strongest_dimensions: List[Dict[str, Any]]
  weakest_dimensions: List[Dict[str, Any]]
  biggest_improvements: List[Dict[str, Any]]
  biggest_regressions: List[Dict[str, Any]]

class HealthTrendResponse(BaseModel):
  project_id: str
  current_score: float
  previous_score: float
  change: float
  trend_status: str # Improving, Stable, Declining, Critical, Recovering
