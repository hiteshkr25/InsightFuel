import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
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
