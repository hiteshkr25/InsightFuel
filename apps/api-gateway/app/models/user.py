from sqlalchemy import Column, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

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

  # Relationships
  organizations = relationship("UserOrganizationRole", back_populates="user", cascade="all, delete-orphan")

class UserOrganizationRole(BaseModel):
  __tablename__ = "user_organization_roles"

  user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
  role = Column(String(50), nullable=False, default="Viewer") # Owner, Admin, Developer, Viewer

  # Relationships
  user = relationship("User", back_populates="organizations")
  organization = relationship("Organization", back_populates="members")

  __table_args__ = (
    UniqueConstraint("user_id", "organization_id", name="uq_user_org_role"),
  )
