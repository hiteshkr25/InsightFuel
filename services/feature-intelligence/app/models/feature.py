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

class FeatureRegistry(BaseModel):
  __tablename__ = "feature_registries"
  __table_args__ = (
    UniqueConstraint("project_id", "feature_id", name="uq_project_feature"),
  )

  project_id = Column(String(36), index=True, nullable=False)
  feature_id = Column(String(100), index=True, nullable=False) # e.g. btn_checkout
  display_name = Column(String(100), nullable=False)
  category = Column(String(50), nullable=True)
  parent_feature_id = Column(String(100), nullable=True)
  status = Column(String(50), default="discovered", nullable=False) # discovered, candidate, pending_approval, tracked, deprecated, retired, archived
  first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  tags = Column(JSON, default=list)
  owner = Column(String(100), nullable=True)
  version = Column(String(50), default="1.0.0", nullable=False)
  business_weight = Column(Float, default=1.0, nullable=False)

class FeatureSnapshot(BaseModel):
  __tablename__ = "feature_snapshots"
  __table_args__ = (
    UniqueConstraint("project_id", "feature_id", "snapshot_date", name="uq_proj_feature_date"),
  )

  project_id = Column(String(36), index=True, nullable=False)
  feature_id = Column(String(100), index=True, nullable=False)
  snapshot_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
  
  # Computations
  adoption_rate = Column(Float, default=0.0, nullable=False)
  usage_frequency = Column(Float, default=0.0, nullable=False)
  growth_rate_wow = Column(Float, default=0.0, nullable=False)
  stickiness_score = Column(Float, default=0.0, nullable=False)
  importance_score = Column(Float, default=0.0, nullable=False)
  health_status = Column(String(50), default="stable", nullable=False) # healthy, growing, stable, declining, at_risk, deprecated_candidate
  explanation = Column(String(500), nullable=True)
