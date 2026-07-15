import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Float, DateTime, Date, JSON, UniqueConstraint
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

class ProductHealthSnapshot(BaseModel):
  __tablename__ = "product_health_snapshots"
  __table_args__ = (
    UniqueConstraint("project_id", "snapshot_date", name="uq_health_proj_date"),
  )

  project_id = Column(String(36), index=True, nullable=False)
  snapshot_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
  
  # Overall Score & Health classification
  health_score = Column(Float, default=0.0, nullable=False)
  health_category = Column(String(50), default="Stable", nullable=False) # Excellent, Healthy, Stable, Needs Attention, Critical
  maturity_stage = Column(String(50), default="Early Stage", nullable=False) # Early Stage, Growing, Scaling, Mature, Declining
  maturity_reason = Column(String(500), nullable=True)
  confidence_score = Column(Float, default=1.0, nullable=False) # Data quality confidence index (0.0 to 1.0)
  
  # Health Dimensions Scores (0.0 to 100.0)
  score_acquisition = Column(Float, default=0.0, nullable=False)
  score_activation = Column(Float, default=0.0, nullable=False)
  score_engagement = Column(Float, default=0.0, nullable=False)
  score_retention = Column(Float, default=0.0, nullable=False)
  score_feature_adoption = Column(Float, default=0.0, nullable=False)
  score_performance = Column(Float, default=0.0, nullable=False)
  score_reliability = Column(Float, default=0.0, nullable=False)
  score_user_experience = Column(Float, default=0.0, nullable=False)
  
  # KPI breakdown details
  kpis = Column(JSON, default=dict)
