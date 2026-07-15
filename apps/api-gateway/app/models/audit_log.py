from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class AuditLog(BaseModel):
  __tablename__ = "audit_logs"

  organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
  user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
  action = Column(String(255), nullable=False) # e.g. "user_registered", "api_key_created"
  ip_address = Column(String(50), nullable=True)
  user_agent = Column(String(255), nullable=True)
  details = Column(Text, nullable=True)

  # Relationships
  organization = relationship("Organization", back_populates="audit_logs")
