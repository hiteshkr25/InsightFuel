from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Project(BaseModel):
  __tablename__ = "projects"

  name = Column(String(255), nullable=False)
  workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)

  # Relationships
  workspace = relationship("Workspace", back_populates="projects")
  api_keys = relationship("ApiKey", back_populates="project", cascade="all, delete-orphan")
