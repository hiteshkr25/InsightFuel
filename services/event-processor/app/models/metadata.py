import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint, JSON
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

class DeadLetterEvent(BaseModel):
  __tablename__ = "dead_letter_events"

  event_id = Column(String(36), index=True, nullable=False)
  project_id = Column(String(36), index=True, nullable=False)
  payload = Column(JSON, nullable=False)
  error_message = Column(String(255), nullable=True)
  status = Column(String(50), default="pending", index=True, nullable=False)
