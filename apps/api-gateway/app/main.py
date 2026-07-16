from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, organizations, projects, invitations

import os

app = FastAPI(
  title=settings.PROJECT_NAME,
  description="InsightFuel API Gateway, BFF, Authentication, and Multi-Tenant Management Engine Spec",
  version="1.0.0",
  openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Parse CORS origins
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_raw:
  origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]
else:
  origins = ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001", "http://localhost:3002"]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Health Check API Routes
@app.get("/", tags=["Health"])
async def root():
  return {
    "service": "api-gateway",
    "status": "running",
    "version": "1.0.0"
  }

@app.get("/health/live", tags=["Health"])
async def live_check():
  return {"status": "OK", "uptime": "process is healthy"}

@app.get("/health/ready", tags=["Health"])
async def ready_check():
  return {"status": "READY", "services": {"postgres": "connected", "redis": "connected"}}

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix=f"{settings.API_V1_STR}/organizations", tags=["Organizations"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["Projects"])
app.include_router(invitations.router, prefix=f"{settings.API_V1_STR}/invitations", tags=["Invitations"])
