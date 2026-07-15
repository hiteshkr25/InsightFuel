import logging
from datetime import datetime, date, timezone, timedelta
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models.health import ProductHealthSnapshot
from app.services.query_api_client import query_api_client
from app.services.feature_intel_client import feature_intel_client

logger = logging.getLogger("insightfuel.product-health")

async def calculate_product_health(project_id: str, db: Session) -> Optional[ProductHealthSnapshot]:
  """
  Fetches metrics from Query API and Feature Intelligence Engine,
  computes overall and dimension scores, and persists a daily health snapshot.
  """
  today = datetime.now(timezone.utc).date()
  start_7 = (today - timedelta(days=7)).isoformat()
  start_14 = (today - timedelta(days=14)).isoformat()
  end_str = today.isoformat()

  # 1. Fetch Query API metrics
  activity_this = await query_api_client.get_user_activity(project_id, start_7, end_str)
  activity_prev = await query_api_client.get_user_activity(project_id, start_14, start_7)
  sessions = await query_api_client.get_sessions(project_id, start_7, end_str)
  perf = await query_api_client.get_performance_metrics(project_id, start_7, end_str)

  # 2. Fetch Feature Intelligence rankings
  rankings = await feature_intel_client.get_feature_rankings(project_id, "importance")

  confidence = 1.0
  kpis = {}

  # --- Acquisition score ---
  score_acquisition = 50.0
  new_users_this = 0
  new_users_prev = 0
  
  if activity_this:
    new_users_this = sum(int(x.get("new_users", 0)) for x in activity_this)
  if activity_prev:
    new_users_prev = sum(int(x.get("new_users", 0)) for x in activity_prev)

  if new_users_prev > 0:
    growth = (new_users_this - new_users_prev) / new_users_prev
    score_acquisition = min(100.0, max(0.0, 50.0 + growth * 100.0))
    kpis["user_growth_rate"] = float(growth)
  else:
    kpis["user_growth_rate"] = 0.0
    if not activity_this:
      confidence -= 0.15

  # --- Activation score ---
  score_activation = 50.0
  total_wau = 0
  if activity_this:
    total_wau = max(int(x.get("wau", 0)) for x in activity_this)
  
  kpis["active_user_ratio"] = 0.0
  if total_wau > 0 and new_users_this > 0:
    activation_ratio = float(new_users_this / total_wau)
    score_activation = min(100.0, activation_ratio * 100.0)
    kpis["active_user_ratio"] = activation_ratio
  else:
    confidence -= 0.15

  # --- Engagement score ---
  score_engagement = 50.0
  total_duration = 0.0
  session_count = 0
  if sessions:
    session_count = len(sessions)
    total_duration = sum(float(x.get("duration", 0.0)) for x in sessions)
    avg_duration = total_duration / session_count if session_count > 0 else 0.0
    score_engagement = min(100.0, (avg_duration / 300.0) * 100.0) # 5 mins is 100 score
  else:
    confidence -= 0.15

  # --- Retention score ---
  score_retention = 50.0
  if activity_this:
    # Estimate retention based on returning users ratio
    returning = sum(int(x.get("returning_users", 0)) for x in activity_this)
    total_active = sum(int(x.get("dau", 0)) for x in activity_this)
    if total_active > 0:
      retention_ratio = float(returning / total_active)
      score_retention = retention_ratio * 100.0
      kpis["retention_health"] = retention_ratio
    else:
      kpis["retention_health"] = 0.0
  else:
    kpis["retention_health"] = 0.0
    confidence -= 0.15

  # --- Feature Adoption score ---
  score_feature_adoption = 50.0
  if rankings:
    avg_adoption = sum(float(x.get("adoption_rate", 0.0)) for x in rankings) / len(rankings)
    score_feature_adoption = min(100.0, avg_adoption * 200.0) # 50% adoption average gives 100 score
    kpis["feature_coverage"] = float(avg_adoption)
  else:
    kpis["feature_coverage"] = 0.0
    confidence -= 0.15

  # --- Performance score ---
  score_performance = 50.0
  if perf:
    avg_load = sum(float(x.get("avg_load_time", 0.0)) for x in perf) / len(perf)
    # < 1.5s = 100, > 5s = 0
    score_performance = min(100.0, max(0.0, 100.0 - (avg_load - 1.5) * 28.5))
  else:
    confidence -= 0.15

  # --- Reliability score ---
  score_reliability = 50.0
  if perf:
    error_count = sum(int(x.get("error_count", 0)) for x in perf)
    score_reliability = min(100.0, max(0.0, 100.0 - error_count * 5.0))
    kpis["product_stability"] = float(score_reliability / 100.0)
  else:
    kpis["product_stability"] = 0.5
    confidence -= 0.15

  # --- User Experience score ---
  score_user_experience = 50.0
  if sessions:
    # Based on average session quality score
    avg_quality = sum(float(x.get("quality_score", 0.0)) for x in sessions) / len(sessions)
    score_user_experience = min(100.0, avg_quality * 10.0) # Quality is 0 to 10
    kpis["user_satisfaction_proxy"] = float(avg_quality / 10.0)
  else:
    kpis["user_satisfaction_proxy"] = 0.5
    confidence -= 0.15

  confidence_score = max(0.1, confidence)

  # Configurable Weighted Overall Health Score
  # 1/8 each by default
  weights = [0.125] * 8
  scores = [
    score_acquisition, score_activation, score_engagement, score_retention,
    score_feature_adoption, score_performance, score_reliability, score_user_experience
  ]
  health_score = float(sum(s * w for s, w in zip(scores, weights)))

  # Overall Health label
  if health_score >= 85.0:
    health_category = "Excellent"
  elif health_score >= 70.0:
    health_category = "Healthy"
  elif health_score >= 50.0:
    health_category = "Stable"
  elif health_score >= 35.0:
    health_category = "Needs Attention"
  else:
    health_category = "Critical"

  # Maturity stage classification
  user_growth = kpis.get("user_growth_rate", 0.0)
  if total_wau < 200:
    maturity = "Early Stage"
    reason = f"Product active user base is small (WAU: {total_wau}), indicating early stage development."
  elif total_wau < 2000:
    if user_growth >= -0.05:
      maturity = "Growing"
      reason = f"Steady user base (WAU: {total_wau}) with stable week-over-week user growth rate of {user_growth*100:.1f}%."
    else:
      maturity = "Declining"
      reason = f"Sustained negative user growth rate of {user_growth*100:.1f}% for user base size (WAU: {total_wau})."
  elif total_wau >= 2000:
    if user_growth > 0.10:
      maturity = "Scaling"
      reason = f"Large user base (WAU: {total_wau}) with high growth acceleration rate of {user_growth*100:.1f}%."
    elif -0.05 <= user_growth <= 0.10:
      maturity = "Mature"
      reason = f"Stable high-volume user base (WAU: {total_wau}) showing low growth velocity fluctuation."
    else:
      maturity = "Declining"
      reason = f"Sustained negative user growth rate of {user_growth*100:.1f}% for user base size (WAU: {total_wau})."
  else:
    maturity = "Declining"
    reason = f"Negative metrics for user base size (WAU: {total_wau})."

  # Check duplicate snapshot date
  existing = db.query(ProductHealthSnapshot).filter(
    ProductHealthSnapshot.project_id == project_id,
    ProductHealthSnapshot.snapshot_date == today
  ).first()

  if existing:
    # Overwrite today's snapshot to avoid database constraint failures, but log
    snapshot = existing
  else:
    snapshot = ProductHealthSnapshot(
      project_id=project_id,
      snapshot_date=today
    )
    db.add(snapshot)

  # Update fields
  snapshot.health_score = health_score
  snapshot.health_category = health_category
  snapshot.maturity_stage = maturity
  snapshot.maturity_reason = reason
  snapshot.confidence_score = confidence_score
  snapshot.score_acquisition = score_acquisition
  snapshot.score_activation = score_activation
  snapshot.score_engagement = score_engagement
  snapshot.score_retention = score_retention
  snapshot.score_feature_adoption = score_feature_adoption
  snapshot.score_performance = score_performance
  snapshot.score_reliability = score_reliability
  snapshot.score_user_experience = score_user_experience
  snapshot.kpis = kpis

  db.commit()
  db.refresh(snapshot)
  logger.info(f"Generated Product Health Snapshot for project {project_id} with score {health_score:.2f} ({health_category}).")
  return snapshot
