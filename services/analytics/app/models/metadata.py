import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
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

class JobRun(BaseModel):
  __tablename__ = "analytics_job_runs"

  job_name = Column(String(100), nullable=False)
  status = Column(String(50), nullable=False)  # success, failure
  records_processed = Column(Integer, default=0)
  error_message = Column(String(500), nullable=True)
  started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  completed_at = Column(DateTime, nullable=True)
