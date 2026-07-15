import uuid
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.organization import Organization
from app.models.workspace import Workspace
from app.models.user import User, UserOrganizationRole
from app.models.invitation import Invitation
from app.schemas.organization import (
  OrganizationCreate,
  OrganizationResponse,
  WorkspaceCreate,
  WorkspaceResponse
)
from app.schemas.invitation import InvitationCreate, InvitationResponse

router = APIRouter()

@router.post("/", response_model=OrganizationResponse)
def create_organization(
  org_in: OrganizationCreate,
  current_user: User = Depends(deps.get_current_user),
  db: Session = Depends(deps.get_db)
):
  # Create Organization
  new_org = Organization(name=org_in.name)
  db.add(new_org)
  db.commit()
  db.refresh(new_org)

  # Associate creator as Owner
  role_link = UserOrganizationRole(
    user_id=current_user.id,
    organization_id=new_org.id,
    role="Owner"
  )
  db.add(role_link)
  db.commit()
  return new_org

@router.get("/", response_model=List[OrganizationResponse])
def list_organizations(
  current_user: User = Depends(deps.get_current_user),
  db: Session = Depends(deps.get_db)
):
  # Query organizations where user is a member
  memberships = db.query(UserOrganizationRole).filter(
    UserOrganizationRole.user_id == current_user.id
  ).all()
  org_ids = [m.organization_id for m in memberships]
  
  orgs = db.query(Organization).filter(Organization.id.in_(org_ids)).all()
  return orgs

@router.post(
  "/{org_id}/workspaces", 
  response_model=WorkspaceResponse,
  dependencies=[Depends(deps.RoleGuard(allowed_roles=["Owner", "Admin"]))]
)
def create_workspace(
  org_id: str,
  ws_in: WorkspaceCreate,
  db: Session = Depends(deps.get_db)
):
  # Check if organization exists
  org = db.query(Organization).filter(Organization.id == org_id).first()
  if not org:
    raise HTTPException(status_code=404, detail="Organization not found")

  new_ws = Workspace(name=ws_in.name, organization_id=org_id)
  db.add(new_ws)
  db.commit()
  db.refresh(new_ws)
  return new_ws

@router.get("/{org_id}/workspaces", response_model=List[WorkspaceResponse])
def list_workspaces(
  org_id: str,
  current_user: User = Depends(deps.get_current_user),
  db: Session = Depends(deps.get_db)
):
  # Verify membership
  role = db.query(UserOrganizationRole).filter(
    UserOrganizationRole.user_id == current_user.id,
    UserOrganizationRole.organization_id == org_id
  ).first()
  if not role:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Permission denied: user is not a member of this organization"
    )

  workspaces = db.query(Workspace).filter(Workspace.organization_id == org_id).all()
  return workspaces

@router.post(
  "/{org_id}/invitations",
  response_model=InvitationResponse,
  dependencies=[Depends(deps.RoleGuard(allowed_roles=["Owner", "Admin"]))]
)
def invite_user(
  org_id: str,
  invite_in: InvitationCreate,
  db: Session = Depends(deps.get_db)
):
  # Create unique invite token
  invite_token = str(uuid.uuid4())
  expires_at = datetime.now(timezone.utc) + timedelta(days=7)

  # Check if invitation already exists and is pending
  existing = db.query(Invitation).filter(
    Invitation.organization_id == org_id,
    Invitation.email == invite_in.email,
    Invitation.status == "pending"
  ).first()
  
  if existing:
    raise HTTPException(
      status_code=400,
      detail="An invitation is already pending for this email address."
    )

  new_invite = Invitation(
    organization_id=org_id,
    email=invite_in.email,
    role=invite_in.role,
    token=invite_token,
    status="pending",
    expires_at=expires_at
  )
  db.add(new_invite)
  db.commit()
  db.refresh(new_invite)
  return new_invite

@router.get(
  "/{org_id}/invitations",
  response_model=List[InvitationResponse],
  dependencies=[Depends(deps.RoleGuard(allowed_roles=["Owner", "Admin"]))]
)
def list_invitations(org_id: str, db: Session = Depends(deps.get_db)):
  invites = db.query(Invitation).filter(Invitation.organization_id == org_id).all()
  return invites
