import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON, Index
from app.core.database import Base

class BaseModel(Base):
  __abstract__ = True
  
  id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  updated_at = Column(
    DateTime, 
    default=lambda: datetime.now(timezone.utc), 
    onupdate=lambda: datetime.now(timezone.utc)
  )

class AIRecommendation(BaseModel):
  __tablename__ = "ai_recommendations"

  project_id = Column(String(36), index=True, nullable=False)
  title = Column(String(150), nullable=False)
  description = Column(String(500), nullable=False)
  category = Column(String(50), nullable=False) # Adoption, Retention, Engagement, Performance, Reliability, Feature Usage, Growth, User Experience, Product Health, Infrastructure, Security, Business KPI
  severity = Column(String(20), default="info", nullable=False) # critical, warning, info
  
  # Confidence Breakdown
  data_quality_confidence = Column(Float, default=1.0, nullable=False)
  statistical_confidence = Column(Float, default=1.0, nullable=False)
  overall_confidence = Column(Float, default=1.0, nullable=False)
  
  priority_score = Column(Float, default=1.0, nullable=False)
  
  metrics_used = Column(JSON, default=list)
  evidence = Column(JSON, default=dict)
  suggested_action = Column(String(300), nullable=False)
  expected_impact = Column(String(200), nullable=False)
  
  # Versioning Metadata
  rule_version = Column(String(20), default="1.0.0", nullable=False)
  engine_version = Column(String(20), default="1.0.0", nullable=False)
  recommendation_version = Column(String(20), default="1.0.0", nullable=False)
  created_by_engine = Column(String(50), default="AI Recommendation Engine", nullable=False)
  
  # Relationships
  relationships = Column(JSON, default=dict) # e.g. {"supersedes": "recommendation_uuid_123"}
  
  status = Column(String(20), default="Generated", nullable=False) # Generated, Reviewed, Accepted, Dismissed, Resolved, Expired, Archived
  expires_at = Column(DateTime, nullable=True)

Index("idx_proj_status", AIRecommendation.project_id, AIRecommendation.status)
