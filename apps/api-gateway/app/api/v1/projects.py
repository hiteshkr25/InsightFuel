import secrets
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.workspace import Workspace
from app.models.project import Project
from app.models.api_key import ApiKey
from app.models.user import User, UserOrganizationRole
from app.schemas.project import ProjectCreate, ProjectResponse, ApiKeyCreate, ApiKeyResponse
from app.core import security

router = APIRouter()

def verify_workspace_access(
  db: Session, 
  workspace_id: str, 
  user_id: str, 
  allowed_roles: List[str]
) -> Workspace:
  workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
  if not workspace:
    raise HTTPException(status_code=404, detail="Workspace not found")
    
  # Check organization role
  role_entry = db.query(UserOrganizationRole).filter(
    UserOrganizationRole.user_id == user_id,
    UserOrganizationRole.organization_id == workspace.organization_id
  ).first()
  
  if not role_entry or role_entry.role not in allowed_roles:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Permission denied: insufficient workspace organization privileges"
    )
    
  return workspace

@router.post("/workspace/{workspace_id}", response_model=ProjectResponse)
def create_project(
  workspace_id: str,
  proj_in: ProjectCreate,
  current_user: User = Depends(deps.get_current_user),
  db: Session = Depends(deps.get_db)
):
  # Require Owner, Admin, or Developer role to create projects
  verify_workspace_access(
    db=db, 
    workspace_id=workspace_id, 
    user_id=current_user.id, 
    allowed_roles=["Owner", "Admin", "Developer"]
  )

  new_proj = Project(name=proj_in.name, workspace_id=workspace_id)
  db.add(new_proj)
  db.commit()
  db.refresh(new_proj)
  return new_proj

@router.get("/workspace/{workspace_id}", response_model=List[ProjectResponse])
def list_projects(
  workspace_id: str,
  current_user: User = Depends(deps.get_current_user),
  db: Session = Depends(deps.get_db)
):
  # Require any role (Owner, Admin, Developer, Viewer) to view projects
  verify_workspace_access(
    db=db, 
    workspace_id=workspace_id, 
    user_id=current_user.id, 
    allowed_roles=["Owner", "Admin", "Developer", "Viewer"]
  )

  projects = db.query(Project).filter(Project.workspace_id == workspace_id).all()
  return projects

@router.post("/{project_id}/keys", response_model=ApiKeyResponse)
def generate_api_key(
  project_id: str,
  key_in: ApiKeyCreate,
  current_user: User = Depends(deps.get_current_user),
  db: Session = Depends(deps.get_db)
):
  # Retrieve project and verify workspace permissions
  project = db.query(Project).filter(Project.id == project_id).first()
  if not project:
    raise HTTPException(status_code=404, detail="Project not found")

  verify_workspace_access(
    db=db, 
    workspace_id=project.workspace_id, 
    user_id=current_user.id, 
    allowed_roles=["Owner", "Admin", "Developer"]
  )

  # Generate write key string: if_write_xxxx
  raw_token = f"if_write_{secrets.token_hex(24)}"
  hashed_token = security.get_password_hash(raw_token)

  expires_at = None
  if key_in.expires_days:
    expires_at = datetime.now(timezone.utc) + timedelta(days=key_in.expires_days)

  new_key = ApiKey(
    project_id=project_id,
    key_hash=hashed_token,
    display_name=key_in.display_name,
    is_active=True,
    expires_at=expires_at
  )
  db.add(new_key)
  db.commit()
  db.refresh(new_key)

  # Attach raw token to return schema once
  response_data = ApiKeyResponse.model_validate(new_key)
  response_data.raw_key = raw_token
  return response_data

@router.get("/{project_id}/keys", response_model=List[ApiKeyResponse])
def list_api_keys(
  project_id: str,
  current_user: User = Depends(deps.get_current_user),
  db: Session = Depends(deps.get_db)
):
  project = db.query(Project).filter(Project.id == project_id).first()
  if not project:
    raise HTTPException(status_code=404, detail="Project not found")

  verify_workspace_access(
    db=db, 
    workspace_id=project.workspace_id, 
    user_id=current_user.id, 
    allowed_roles=["Owner", "Admin", "Developer", "Viewer"]
  )

  keys = db.query(ApiKey).filter(ApiKey.project_id == project_id).all()
  return keys
