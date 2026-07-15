import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.feature import FeatureRegistry
from app.services.intelligence_service import calculate_feature_intelligence

logger = logging.getLogger("insightfuel.feature-intelligence")
scheduler = AsyncIOScheduler()

async def run_daily_feature_intelligence_job():
  """
  Cron job triggered daily to pull metrics from the Query API, calculate health metrics,
  and log historical snapshot rows.
  """
  db = SessionLocal()
  try:
    # Find all unique project_ids active in the registry
    projects = db.query(FeatureRegistry.project_id).distinct().all()
    project_ids = [p[0] for p in projects]
    
    total_snapshots = 0
    for proj_id in project_ids:
      total_snapshots += await calculate_feature_intelligence(proj_id, db)
      
    logger.info(f"Daily feature intelligence job completed. Generated {total_snapshots} snapshots across {len(project_ids)} projects.")
  except Exception as e:
    logger.error(f"Error during daily feature intelligence execution: {e}")
  finally:
    db.close()

def start_scheduler():
  # Trigger daily rollup at 00:15 UTC
  scheduler.add_job(run_daily_feature_intelligence_job, "cron", hour=0, minute=15, id="daily_feature_intel")
  scheduler.start()
  logger.info("Feature Intelligence APScheduler background service started.")

def shutdown_scheduler():
  scheduler.shutdown()
  logger.info("Feature Intelligence APScheduler background service stopped.")
