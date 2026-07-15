from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Workspace(BaseModel):
  __tablename__ = "workspaces"

  name = Column(String(255), nullable=False)
  organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)

  # Relationships
  organization = relationship("Organization", back_populates="workspaces")
  projects = relationship("Project", back_populates="workspace", cascade="all, delete-orphan")
