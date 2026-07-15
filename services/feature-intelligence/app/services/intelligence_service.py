import logging
from datetime import datetime, date, timezone, timedelta
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models.feature import FeatureRegistry, FeatureSnapshot
from app.services.query_api_client import query_api_client

logger = logging.getLogger("insightfuel.feature-intelligence")

async def calculate_feature_intelligence(project_id: str, db: Session) -> int:
  """
  Fetches metrics from the Query API, computes analytics snapshots,
  and updates PostgreSQL tables.
  """
  features = db.query(FeatureRegistry).filter(FeatureRegistry.status == "tracked").all()
  if not features:
    logger.info(f"No tracked features in registry for project {project_id}")
    return 0

  # Define date windows
  today = datetime.now(timezone.utc).date()
  start_7 = (today - timedelta(days=7)).isoformat()
  start_14 = (today - timedelta(days=14)).isoformat()
  end_str = today.isoformat()

  # 1. Fetch metrics from read-only Query API
  metrics_this_week = await query_api_client.get_feature_metrics(project_id, start_7, end_str)
  metrics_prev_week = await query_api_client.get_feature_metrics(project_id, start_14, start_7)
  activity = await query_api_client.get_user_activity(project_id, start_7, end_str)

  # Check total active users of project (WAU)
  total_wau = 1
  if activity:
    activity_df = pd.DataFrame(activity)
    if "wau" in activity_df:
      total_wau = int(activity_df["wau"].max())
  if total_wau <= 0:
    total_wau = 1

  # Create DataFrames for features
  df_this = pd.DataFrame(metrics_this_week) if metrics_this_week else pd.DataFrame()
  df_prev = pd.DataFrame(metrics_prev_week) if metrics_prev_week else pd.DataFrame()

  snapshots_created = 0

  for f in features:
    usage_count = 0
    unique_users = 0
    
    # Extract current week stats
    if not df_this.empty and "feature_id" in df_this:
      f_this = df_this[df_this["feature_id"] == f.feature_id]
      if not f_this.empty:
        usage_count = int(f_this["usage_count"].sum())
        unique_users = int(f_this["unique_users"].sum())

    # Extract previous week stats
    prev_usage = 0
    if not df_prev.empty and "feature_id" in df_prev:
      f_prev = df_prev[df_prev["feature_id"] == f.feature_id]
      if not f_prev.empty:
        prev_usage = int(f_prev["usage_count"].sum())

    # Adoption Rate
    adoption_rate = float(unique_users / total_wau)
    
    # Usage Frequency
    usage_frequency = float(usage_count / unique_users) if unique_users > 0 else 0.0

    # WoW Growth
    growth_wow = 0.0
    if prev_usage > 0:
      growth_wow = float((usage_count - prev_usage) / prev_usage)
    elif usage_count > 0:
      growth_wow = 1.0  # 100% growth on first week interaction

    # Stickiness score: unique users of feature / WAU
    stickiness_score = adoption_rate

    # Feature Importance Score: Reach * Engagement * Retention * Business Weight
    # Reach = unique_users / total_wau
    # Engagement = usage_frequency
    # Retention = stickiness_score (ratio of returning users)
    # Business Weight = f.business_weight
    reach = unique_users / total_wau
    engagement = usage_frequency
    retention = stickiness_score
    importance_score = float(reach * engagement * retention * f.business_weight)

    # Health classification
    health = "stable"
    explanation = "Feature usage patterns remain stable within normal thresholds."
    
    if growth_wow > 0.15:
      health = "growing"
      explanation = f"Active usage grown by WoW velocity rate of {growth_wow*100:.1f}%"
    elif growth_wow < -0.15 and unique_users > 5:
      health = "declining"
      explanation = f"Active usage declined by WoW velocity rate of {growth_wow*100:.1f}%"
    elif unique_users < 5:
      health = "at_risk"
      explanation = "Extremely low unique user counts over rolling 7 days period."
    elif stickiness_score < 0.01:
      health = "deprecated_candidate"
      explanation = "Feature session penetration below critical 1% threshold limit."

    # Save to snapshots database table
    snapshot = FeatureSnapshot(
      project_id=project_id,
      feature_id=f.feature_id,
      snapshot_date=today,
      adoption_rate=adoption_rate,
      usage_frequency=usage_frequency,
      growth_rate_wow=growth_wow,
      stickiness_score=stickiness_score,
      importance_score=importance_score,
      health_status=health,
      explanation=explanation
    )
    db.add(snapshot)
    
    # Update registry seen timestamps
    if unique_users > 0:
      f.last_seen = datetime.now(timezone.utc)
      
    snapshots_created += 1

  db.commit()
  logger.info(f"Generated {snapshots_created} feature intelligence snapshots for project {project_id}.")
  return snapshots_created
