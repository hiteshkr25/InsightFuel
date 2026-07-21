from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class InvitationRole(str, enum.Enum):
    ADMIN = "admin"
    DEVELOPER = "developer"
    VIEWER = "viewer"

class InvitationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REVOKED = "revoked"
    EXPIRED = "expired"

class WorkspaceInvitation(Base):
    __tablename__ = "workspace_invitations"

    id = Column(String, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    email = Column(String, index=True, nullable=False)
    role = Column(Enum(InvitationRole), nullable=False, default=InvitationRole.ADMIN)
    token = Column(String, unique=True, index=True, nullable=False)
    status = Column(Enum(InvitationStatus), nullable=False, default=InvitationStatus.PENDING)
    invited_by_email = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
