from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class ApiKey(BaseModel):
  __tablename__ = "api_keys"

  project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
  key_hash = Column(String(255), unique=True, index=True, nullable=False)
  display_name = Column(String(255), nullable=False)
  is_active = Column(Boolean, default=True)
  expires_at = Column(DateTime, nullable=True)

  # Relationships
  project = relationship("Project", back_populates="api_keys")
