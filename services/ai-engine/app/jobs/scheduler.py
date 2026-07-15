import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.recommendation import AIRecommendation
from app.services.recommendation_service import generate_project_recommendations

logger = logging.getLogger("insightfuel.ai-engine")
scheduler = AsyncIOScheduler()

async def run_daily_recommendations_job():
  """
  APScheduler task executing rule checks, z-score anomaly scans, and saving recommendation rows.
  """
  db = SessionLocal()
  try:
    # Find all unique project_ids active in recommendations
    projects = db.query(AIRecommendation.project_id).distinct().all()
    project_ids = [p[0] for p in projects]
    
    # Fallback default project
    if not project_ids:
      project_ids = ["proj_123"]

    total = 0
    for proj_id in project_ids:
      total += await generate_project_recommendations(proj_id, db)
      
    logger.info(f"Daily recommendation job completed. Generated {total} items across {len(project_ids)} projects.")
  except Exception as e:
    logger.error(f"Error during daily recommendations execution: {e}")
  finally:
    db.close()

def start_scheduler():
  # Trigger daily rollup at 00:45 UTC
  scheduler.add_job(run_daily_recommendations_job, "cron", hour=0, minute=45, id="daily_recommendations")
  scheduler.start()
  logger.info("AI Engine APScheduler background service started.")

def shutdown_scheduler():
  scheduler.shutdown()
  logger.info("AI Engine APScheduler background service stopped.")
