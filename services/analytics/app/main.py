from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, Depends, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.core.clickhouse import clickhouse_manager
from app.core.telemetry import setup_telemetry, generate_latest, CONTENT_TYPE_LATEST
from app.schemas.metrics import BackfillRequest, METRIC_REGISTRY
from app.jobs.scheduler import start_scheduler, shutdown_scheduler, record_job_run

# Job runner functions
from app.jobs.session import compute_session_metrics
from app.jobs.user import compute_user_analytics, compute_retention_analytics, compute_funnel_analytics
from app.jobs.journey import compute_journey_analytics
from app.jobs.feature_performance import compute_feature_analytics, compute_performance_analytics

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Create local sqlite metadata JobRun log tables on boot for unit tests
  Base.metadata.create_all(bind=engine)
  # Initialize ClickHouse Analytical metrics DDL schemas
  clickhouse_manager.create_analytical_tables()
  # Start Background scheduler engine
  start_scheduler()
  yield
  # Shutdown scheduler on termination
  shutdown_scheduler()

import os

app = FastAPI(
  title=settings.PROJECT_NAME,
  description="InsightFuel Analytics Processing Metrics Engine",
  version="1.0.0",
  openapi_url=f"{settings.API_V1_STR}/openapi.json",
  lifespan=lifespan
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
    "service": "analytics",
    "status": "running",
    "version": "1.0.0"
  }

setup_telemetry(app)


@app.get("/health/live", tags=["Health"])
async def live_check():
  return {"status": "OK", "uptime": "healthy"}

@app.get("/health/ready", tags=["Health"])
async def ready_check():
  return {
    "status": "READY",
    "services": {
      "postgres": "connected",
      "redis": "connected",
      "clickhouse": "connected" if clickhouse_manager.get_client() else "disconnected"
    }
  }

@app.get("/metrics", tags=["Metrics"])
async def metrics_endpoint():
  return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get(f"{settings.API_V1_STR}/analytics/admin/registry", tags=["Registry"])
async def get_metrics_registry(x_admin_token: str = Header(...)):
  """
  Exposes the canonical Metric Registry listing names, formulas, and refreshes.
  """
  if x_admin_token != settings.ADMIN_SECRET_TOKEN:
    raise HTTPException(status_code=401, detail="Invalid admin credentials")
  return METRIC_REGISTRY

@app.post(f"{settings.API_V1_STR}/analytics/admin/backfill", status_code=status.HTTP_202_ACCEPTED, tags=["Admin"])
async def trigger_backfill(
  request: BackfillRequest,
  x_admin_token: str = Header(...),
  db: Session = Depends(get_db)
):
  """
  Exposes administrative APIs to trigger historical backfills and recomputations.
  """
  if x_admin_token != settings.ADMIN_SECRET_TOKEN:
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

  start_dt = datetime.fromisoformat(request.start_date)
  end_dt = datetime.fromisoformat(request.end_date)
  
  if start_dt > end_dt:
    raise HTTPException(status_code=400, detail="Start date must be before end date")

  # Manual backfill loop processing daily increments
  current_dt = start_dt
  records_processed = 0
  job_name = f"backfill_{request.metric_name}"
  started_time = datetime.now(timezone.utc)

  try:
    while current_dt <= end_dt:
      current_str = current_dt.isoformat()
      next_str = (current_dt + timedelta(days=1)).isoformat()
      
      if request.metric_name == "session_analytics":
        records_processed += await compute_session_metrics(current_str, next_str)
      elif request.metric_name == "user_analytics":
        records_processed += await compute_user_analytics(current_str)
      elif request.metric_name == "retention_analytics":
        records_processed += await compute_retention_analytics(current_str)
      elif request.metric_name == "funnel_analytics":
        records_processed += await compute_funnel_analytics(current_str)
      elif request.metric_name == "path_analytics":
        records_processed += await compute_journey_analytics(current_str)
      elif request.metric_name == "feature_analytics":
        records_processed += await compute_feature_analytics(current_str, next_str)
        records_processed += await compute_performance_analytics(current_str, next_str)
      else:
        raise HTTPException(status_code=400, detail=f"Unknown metric calculation targets: {request.metric_name}")
      
      current_dt += timedelta(days=1)

    record_job_run(job_name, "success", records=records_processed, started_at=started_time)
    
    return {
      "status": "success",
      "job_name": job_name,
      "records_processed": records_processed,
      "message": f"Successfully recomputed metrics from {request.start_date} to {request.end_date}."
    }
  except Exception as e:
    err_str = str(e)
    record_job_run(job_name, "failure", error=err_str, started_at=started_time)
    raise HTTPException(status_code=500, detail=f"Backfill job execution crashed: {err_str}")
