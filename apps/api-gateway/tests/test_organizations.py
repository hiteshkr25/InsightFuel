from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, UserOrganizationRole
from app.models.organization import Organization

def get_auth_headers(client: TestClient, email: str, password: str) -> dict:
  # Register & Login helper to generate authorization headers
  signup_payload = {
    "email": email,
    "password": password,
    "first_name": "Test",
    "last_name": "User"
  }
  client.post("/api/v1/auth/register", json=signup_payload)
  
  login_payload = {
    "username": email,
    "password": password
  }
  login_response = client.post("/api/v1/auth/login/access-token", data=login_payload)
  tokens = login_response.json()
  return {"Authorization": f"Bearer {tokens['access_token']}"}

def test_create_and_list_organizations(client: TestClient, db: Session):
  headers = get_auth_headers(client, "owner@insightfuel.io", "password123")
  
  # Create Organization
  org_payload = {"name": "Stripe Organization"}
  response = client.post("/api/v1/organizations/", json=org_payload, headers=headers)
  assert response.status_code == 200
  org_data = response.json()
  assert org_data["name"] == "Stripe Organization"
  
  # List organizations
  list_response = client.get("/api/v1/organizations/", headers=headers)
  assert list_response.status_code == 200
  orgs = list_response.json()
  assert len(orgs) == 1
  assert orgs[0]["name"] == "Stripe Organization"

def test_rbac_workspace_creation(client: TestClient, db: Session):
  # Setup owner account
  owner_headers = get_auth_headers(client, "owner_rbac@insightfuel.io", "password123")
  
  # Create Organization
  org_res = client.post("/api/v1/organizations/", json={"name": "Stripe Organization"}, headers=owner_headers)
  org_id = org_res.json()["id"]

  # Setup separate viewer account
  viewer_headers = get_auth_headers(client, "viewer_rbac@insightfuel.io", "password123")
  
  # Associate viewer account as Viewer in organization
  db_viewer = db.query(User).filter(User.email == "viewer_rbac@insightfuel.io").first()
  role_link = UserOrganizationRole(
    user_id=db_viewer.id,
    organization_id=org_id,
    role="Viewer"
  )
  db.add(role_link)
  db.commit()

  # 1. Attempt to create workspace as Viewer (Should Fail)
  ws_payload = {"name": "Production Workspace"}
  viewer_res = client.post(f"/api/v1/organizations/{org_id}/workspaces", json=ws_payload, headers=viewer_headers)
  assert viewer_res.status_code == 403 # Forbidden
  
  # 2. Create workspace as Owner (Should Succeed)
  owner_res = client.post(f"/api/v1/organizations/{org_id}/workspaces", json=ws_payload, headers=owner_headers)
  assert owner_res.status_code == 200
  assert owner_res.json()["name"] == "Production Workspace"

def test_invitation_flow(client: TestClient, db: Session):
  owner_headers = get_auth_headers(client, "owner_invite@insightfuel.io", "password123")
  org_res = client.post("/api/v1/organizations/", json={"name": "Stripe Organization"}, headers=owner_headers)
  org_id = org_res.json()["id"]

  # Dispatch invitation
  invite_payload = {
    "email": "invitee@insightfuel.io",
    "role": "Developer"
  }
  invite_res = client.post(f"/api/v1/organizations/{org_id}/invitations", json=invite_payload, headers=owner_headers)
  assert invite_res.status_code == 200
  token = invite_res.json()["token"]

  # Setup invitee account
  invitee_headers = get_auth_headers(client, "invitee@insightfuel.io", "password123")
  
  # Accept invitation
  accept_res = client.post(f"/api/v1/invitations/{token}/accept", headers=invitee_headers)
  assert accept_res.status_code == 200
  assert "Successfully joined" in accept_res.json()["message"]

  # Verify database state
  db_invitee = db.query(User).filter(User.email == "invitee@insightfuel.io").first()
  role_entry = db.query(UserOrganizationRole).filter(
    UserOrganizationRole.user_id == db_invitee.id,
    UserOrganizationRole.organization_id == org_id
  ).first()
  assert role_entry is not None
  assert role_entry.role == "Developer"
