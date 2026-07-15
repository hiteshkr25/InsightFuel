from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Invitation(BaseModel):
  __tablename__ = "invitations"

  organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
  email = Column(String(255), index=True, nullable=False)
  role = Column(String(50), nullable=False, default="Viewer")
  token = Column(String(255), unique=True, index=True, nullable=False)
  status = Column(String(50), nullable=False, default="pending") # pending, accepted, rejected
  expires_at = Column(DateTime, nullable=False)

  # Relationships
  organization = relationship("Organization", back_populates="invitations")
