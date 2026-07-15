import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.health import ProductHealthSnapshot
from app.services.health_service import calculate_product_health

logger = logging.getLogger("insightfuel.product-health")
scheduler = AsyncIOScheduler()

async def run_daily_product_health_job():
  """
  Cron job triggered daily to calculate overall platform health parameters and persist snapshot details.
  """
  db = SessionLocal()
  try:
    # Find all unique project_ids active in the snapshots
    projects = db.query(ProductHealthSnapshot.project_id).distinct().all()
    project_ids = [p[0] for p in projects]
    
    # Fallback to a default if database is fresh
    if not project_ids:
      project_ids = ["proj_123"]

    total_snapshots = 0
    for proj_id in project_ids:
      snap = await calculate_product_health(proj_id, db)
      if snap:
        total_snapshots += 1
      
    logger.info(f"Daily product health job completed. Generated {total_snapshots} snapshots across {len(project_ids)} projects.")
  except Exception as e:
    logger.error(f"Error during daily product health execution: {e}")
  finally:
    db.close()

def start_scheduler():
  # Trigger daily rollup at 00:30 UTC
  scheduler.add_job(run_daily_product_health_job, "cron", hour=0, minute=30, id="daily_product_health")
  scheduler.start()
  logger.info("Product Health APScheduler background service started.")

def shutdown_scheduler():
  scheduler.shutdown()
  logger.info("Product Health APScheduler background service stopped.")
