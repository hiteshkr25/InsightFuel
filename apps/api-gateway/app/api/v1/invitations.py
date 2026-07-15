from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.invitation import Invitation
from app.models.user import User, UserOrganizationRole

router = APIRouter()

@router.post("/{token}/accept")
def accept_invitation(
  token: str,
  current_user: User = Depends(deps.get_current_user),
  db: Session = Depends(deps.get_db)
):
  # Retrieve invitation
  invite = db.query(Invitation).filter(Invitation.token == token).first()
  if not invite:
    raise HTTPException(status_code=404, detail="Invitation not found")
    
  if invite.status != "pending":
    raise HTTPException(
      status_code=400,
      detail=f"Invitation has already been resolved with status: {invite.status}"
    )

  if invite.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
    invite.status = "expired"
    db.commit()
    raise HTTPException(status_code=400, detail="Invitation has expired")

  # Add member to organization with the designated role
  # Check if they are already in the organization
  existing_role = db.query(UserOrganizationRole).filter(
    UserOrganizationRole.user_id == current_user.id,
    UserOrganizationRole.organization_id == invite.organization_id
  ).first()
  
  if existing_role:
    invite.status = "accepted"
    db.commit()
    return {"message": "You are already a member of this organization."}

  new_membership = UserOrganizationRole(
    user_id=current_user.id,
    organization_id=invite.organization_id,
    role=invite.role
  )
  db.add(new_membership)
  
  # Resolve invitation status
  invite.status = "accepted"
  db.commit()
  
  return {"message": f"Successfully joined organization as {invite.role}."}

@router.post("/{token}/reject")
def reject_invitation(
  token: str,
  db: Session = Depends(deps.get_db)
):
  invite = db.query(Invitation).filter(Invitation.token == token).first()
  if not invite:
    raise HTTPException(status_code=404, detail="Invitation not found")
    
  if invite.status != "pending":
    raise HTTPException(status_code=400, detail="Invitation has already been resolved")

  invite.status = "rejected"
  db.commit()
  return {"message": "Invitation rejected successfully."}
