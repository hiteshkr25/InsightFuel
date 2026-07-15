from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Organization(BaseModel):
  __tablename__ = "organizations"

  name = Column(String(255), nullable=False)

  # Relationships
  members = relationship("UserOrganizationRole", back_populates="organization", cascade="all, delete-orphan")
  workspaces = relationship("Workspace", back_populates="organization", cascade="all, delete-orphan")
  invitations = relationship("Invitation", back_populates="organization", cascade="all, delete-orphan")
  audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")
