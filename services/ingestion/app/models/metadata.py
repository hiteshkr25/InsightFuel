import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
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

class User(BaseModel):
  __tablename__ = "users"

  email = Column(String(255), unique=True, index=True, nullable=False)
  password_hash = Column(String(255), nullable=False)
  first_name = Column(String(100), nullable=True)
  last_name = Column(String(100), nullable=True)
  is_active = Column(Boolean, default=True)
  is_verified = Column(Boolean, default=False)
  verification_token = Column(String(255), nullable=True)
  reset_token = Column(String(255), nullable=True)

class Organization(BaseModel):
  __tablename__ = "organizations"

  name = Column(String(255), nullable=False)

class Workspace(BaseModel):
  __tablename__ = "workspaces"

  name = Column(String(255), nullable=False)
  organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)

class Project(BaseModel):
  __tablename__ = "projects"

  name = Column(String(255), nullable=False)
  workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)

class ApiKey(BaseModel):
  __tablename__ = "api_keys"

  project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
  key_hash = Column(String(255), unique=True, index=True, nullable=False)
  display_name = Column(String(255), nullable=False)
  is_active = Column(Boolean, default=True)
  expires_at = Column(DateTime, nullable=True)

class UserOrganizationRole(BaseModel):
  __tablename__ = "user_organization_roles"

  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
  role = Column(String(50), nullable=False, default="Viewer")

class DeadLetterEvent(BaseModel):
  __tablename__ = "dead_letter_events"

  event_id = Column(String(36), index=True, nullable=False)
  project_id = Column(String(36), index=True, nullable=False)
  payload = Column(JSON, nullable=False)
  error_message = Column(String(255), nullable=True)
  status = Column(String(50), default="pending", index=True, nullable=False)
