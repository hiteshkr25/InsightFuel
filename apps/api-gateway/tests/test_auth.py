from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User

def test_user_registration(client: TestClient, db: Session):
  payload = {
    "email": "testuser@insightfuel.io",
    "password": "securepassword123",
    "first_name": "Test",
    "last_name": "User"
  }
  response = client.post("/api/v1/auth/register", json=payload)
  assert response.status_code == 200
  data = response.json()
  assert data["email"] == "testuser@insightfuel.io"
  assert data["is_active"] is True
  assert data["is_verified"] is False
  
  # Verify database state
  db_user = db.query(User).filter(User.email == "testuser@insightfuel.io").first()
  assert db_user is not None
  assert db_user.verification_token is not None

def test_user_login_flow(client: TestClient, db: Session):
  # Register user first
  signup_payload = {
    "email": "loginuser@insightfuel.io",
    "password": "loginpassword123",
    "first_name": "Login",
    "last_name": "User"
  }
  client.post("/api/v1/auth/register", json=signup_payload)
  
  # Attempt OAuth2 token request
  login_payload = {
    "username": "loginuser@insightfuel.io",
    "password": "loginpassword123"
  }
  response = client.post("/api/v1/auth/login/access-token", data=login_payload)
  assert response.status_code == 200
  tokens = response.json()
  assert "access_token" in tokens
  assert "refresh_token" in tokens
  assert tokens["token_type"] == "bearer"

def test_invalid_login_credentials(client: TestClient):
  login_payload = {
    "username": "wronguser@insightfuel.io",
    "password": "wrongpassword"
  }
  response = client.post("/api/v1/auth/login/access-token", data=login_payload)
  assert response.status_code == 400
  assert response.json()["detail"] == "Incorrect email or password"

def test_email_verification(client: TestClient, db: Session):
  # Register user
  signup_payload = {
    "email": "verifyuser@insightfuel.io",
    "password": "verifypassword123"
  }
  client.post("/api/v1/auth/register", json=signup_payload)
  
  db_user = db.query(User).filter(User.email == "verifyuser@insightfuel.io").first()
  token = db_user.verification_token
  
  # Verify email
  verify_response = client.post(f"/api/v1/auth/verify?token={token}")
  assert verify_response.status_code == 200
  assert verify_response.json()["message"] == "Email verified successfully."

  db.refresh(db_user)
  assert db_user.is_verified is True
  assert db_user.verification_token is None

def test_password_reset_flow(client: TestClient, db: Session):
  # Register user
  signup_payload = {
    "email": "resetuser@insightfuel.io",
    "password": "resetpassword123"
  }
  client.post("/api/v1/auth/register", json=signup_payload)
  
  # Trigger reset request
  req_response = client.post("/api/v1/auth/password-reset-request", json={"email": "resetuser@insightfuel.io"})
  assert req_response.status_code == 200
  
  db_user = db.query(User).filter(User.email == "resetuser@insightfuel.io").first()
  token = db_user.reset_token
  assert token is not None
  
  # Confirm password reset
  confirm_payload = {
    "token": token,
    "new_password": "newsecurepassword456"
  }
  confirm_response = client.post("/api/v1/auth/password-reset-confirm", json=confirm_payload)
  assert confirm_response.status_code == 200
  
  # Try logging in with new password
  login_payload = {
    "username": "resetuser@insightfuel.io",
    "password": "newsecurepassword456"
  }
  login_response = client.post("/api/v1/auth/login/access-token", data=login_payload)
  assert login_response.status_code == 200
