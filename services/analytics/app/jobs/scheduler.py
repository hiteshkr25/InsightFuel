import logging
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.metadata import JobRun
from app.core.telemetry import COMPLETED_JOBS, JOB_DURATION

# Job computation imports
from app.jobs.session import compute_session_metrics
from app.jobs.user import compute_user_analytics, compute_retention_analytics, compute_funnel_analytics
from app.jobs.journey import compute_journey_analytics
from app.jobs.feature_performance import compute_feature_analytics, compute_performance_analytics

logger = logging.getLogger("insightfuel.analytics")
scheduler = AsyncIOScheduler()

def record_job_run(job_name: str, status: str, records: int = 0, error: str = None, started_at: datetime = None):
  db = SessionLocal()
  try:
    run = JobRun(
      job_name=job_name,
      status=status,
      records_processed=records,
      error_message=error[:500] if error else None,
      started_at=started_at or datetime.now(timezone.utc),
      completed_at=datetime.now(timezone.utc)
    )
    db.add(run)
    db.commit()
  except Exception as e:
    logger.critical(f"Failed to write job run audit trail: {e}")
  finally:
    db.close()

async def run_hourly_rollup_jobs():
  job_name = "hourly_metrics_rollup"
  start_time = datetime.now(timezone.utc)
  logger.info(f"Starting scheduled job: {job_name}")

  # Configure 1 hour query window
  end_str = start_time.isoformat()
  start_str = (start_time - timedelta(hours=1)).isoformat()

  try:
    # 1. Sessions durations
    sessions = await compute_session_metrics(start_str, end_str)
    # 2. Features usages
    features = await compute_feature_analytics(start_str, end_str)
    # 3. Performance loads
    perf = await compute_performance_analytics(start_str, end_str)

    total_records = sessions + features + perf
    record_job_run(job_name, "success", records=total_records, started_at=start_time)
    COMPLETED_JOBS.labels(job_name=job_name, status="success").inc()
    
    duration = (datetime.now(timezone.utc) - start_time).total_seconds()
    JOB_DURATION.labels(job_name=job_name).observe(duration)
    logger.info(f"Scheduled job {job_name} finished successfully. Processed {total_records} records.")
  except Exception as e:
    err_str = str(e)
    record_job_run(job_name, "failure", error=err_str, started_at=start_time)
    COMPLETED_JOBS.labels(job_name=job_name, status="failure").inc()
    logger.error(f"Scheduled job {job_name} failed: {err_str}")

async def run_daily_rollup_jobs():
  job_name = "daily_metrics_rollup"
  start_time = datetime.now(timezone.utc)
  logger.info(f"Starting scheduled job: {job_name}")

  target_day_str = (start_time - timedelta(days=1)).isoformat()

  try:
    # 1. User analytics DAU/WAU/MAU
    users = await compute_user_analytics(target_day_str)
    # 2. Weekly/Monthly retention cohort rates
    retention = await compute_retention_analytics(target_day_str)
    # 3. Configurable funnel conversion steps
    funnels = await compute_funnel_analytics(target_day_str)
    # 4. User path flow transitions
    journeys = await compute_journey_analytics(target_day_str)

    total_records = users + retention + funnels + journeys
    record_job_run(job_name, "success", records=total_records, started_at=start_time)
    COMPLETED_JOBS.labels(job_name=job_name, status="success").inc()
    
    duration = (datetime.now(timezone.utc) - start_time).total_seconds()
    JOB_DURATION.labels(job_name=job_name).observe(duration)
    logger.info(f"Scheduled job {job_name} finished successfully. Processed {total_records} records.")
  except Exception as e:
    err_str = str(e)
    record_job_run(job_name, "failure", error=err_str, started_at=start_time)
    COMPLETED_JOBS.labels(job_name=job_name, status="failure").inc()
    logger.error(f"Scheduled job {job_name} failed: {err_str}")

def start_scheduler():
  # Run hourly rollup jobs at minute 0 of every hour
  scheduler.add_job(run_hourly_rollup_jobs, "cron", hour="*", minute=0, id="hourly_rollup")
  # Run daily rollup jobs at 00:05 everyday
  scheduler.add_job(run_daily_rollup_jobs, "cron", hour=0, minute=5, id="daily_rollup")
  
  scheduler.start()
  logger.info("APScheduler background engine started.")

def shutdown_scheduler():
  scheduler.shutdown()
  logger.info("APScheduler background engine stopped.")
