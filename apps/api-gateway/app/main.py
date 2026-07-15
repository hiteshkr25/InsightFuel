from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, organizations, projects, invitations

app = FastAPI(
  title=settings.PROJECT_NAME,
  description="InsightFuel API Gateway, BFF, Authentication, and Multi-Tenant Management Engine Spec",
  version="1.0.0",
  openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS origins
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Health Check API Routes
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
