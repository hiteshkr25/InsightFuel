from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.core.telemetry import setup_telemetry, generate_latest, CONTENT_TYPE_LATEST
from app.jobs.scheduler import start_scheduler, shutdown_scheduler

# Import v1 routers
from app.api.v1.recommendations import router as recommendations_router

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Initialize SQLite local metadata tables on boot for unit tests
  Base.metadata.create_all(bind=engine)
  # Start Background scheduler engine
  start_scheduler()
  yield
  # Shutdown scheduler on termination
  shutdown_scheduler()

app = FastAPI(
  title=settings.PROJECT_NAME,
  description="InsightFuel AI Recommendation Processing Engine",
  version="1.0.0",
  openapi_url=f"{settings.API_V1_STR}/openapi.json",
  lifespan=lifespan
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

setup_telemetry(app)

# Include v1 routers
app.include_router(recommendations_router, prefix=settings.API_V1_STR, tags=["Recommendations"])

@app.get("/health/live", tags=["Health"])
async def live_check():
  return {"status": "OK", "uptime": "healthy"}

@app.get("/health/ready", tags=["Health"])
async def ready_check():
  return {
    "status": "READY",
    "services": {
      "postgres": "connected",
      "redis": "connected"
    }
  }

@app.get("/metrics", tags=["Metrics"])
async def metrics_endpoint():
  return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
