import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.recommendation import AIRecommendation
from app.templates.recommendation_templates import RECOMMENDATION_TEMPLATES
from app.registry.recommendation_registry import RECOMMENDATION_REGISTRY

from app.services.query_api_client import query_api_client
from app.services.feature_intel_client import feature_intel_client
from app.services.product_health_client import product_health_client

from app.services.anomaly_engine import calculate_zscore_anomalies
from app.services.evidence_engine import build_evidence_payload
from app.services.priority_engine import compute_priority_score
from app.services.rule_engine import run_rule_engine

logger = logging.getLogger("insightfuel.ai-engine")

async def generate_project_recommendations(project_id: str, db: Session) -> int:
  """
  Refactored recommendation pipeline orchestrator executing split engine modules.
  """
  today = datetime.now(timezone.utc)
  start_7 = (today - timedelta(days=7)).date().isoformat()
  end_str = today.date().isoformat()

  # 1. Gather raw data metrics
  activity = await query_api_client.get_user_activity(project_id, start_7, end_str)
  sessions = await query_api_client.get_sessions(project_id, start_7, end_str)
  health = await product_health_client.get_health_status(project_id)
  
  growing_features = await feature_intel_client.get_feature_trends(project_id, "growing")
  declining_features = await feature_intel_client.get_feature_trends(project_id, "declining")

  # 2. Run Anomaly Engine
  anomalies = calculate_zscore_anomalies(activity)

  # 3. Assemble Rule Engine inputs
  eval_data = {
    "health": health,
    "anomalies": anomalies,
    "growing_features": growing_features,
    "declining_features": declining_features
  }

  # 4. Execute Rule Engine
  triggers = run_rule_engine(eval_data)

  # Calculate Data Quality Confidence
  dq_confidence = 1.0
  if not activity or not sessions:
    dq_confidence -= 0.2
  if not health:
    dq_confidence -= 0.15

  stored_count = 0

  for trigger in triggers:
    template_id = trigger["template_id"]
    metrics_used = trigger["metrics_used"]
    evidence_data = trigger["evidence"]

    # Match Template
    template = RECOMMENDATION_TEMPLATES.get(template_id)
    if not template:
      continue

    # Match Registry configurations
    registry = RECOMMENDATION_REGISTRY.get(template_id)
    if not registry:
      continue

    # Confidence breakdown
    stat_confidence = 0.85 if template_id == "LOW_ENGAGEMENT" else 1.0
    overall_confidence = float(dq_confidence * stat_confidence)

    # Compile Evidence
    evidence_payload = build_evidence_payload(template_id, metrics_used, evidence_data)

    # Compute Priority Score
    priority_score = compute_priority_score(
      severity=template["default_severity"],
      overall_confidence=overall_confidence,
      business_impact=5.0
    )

    # Check duplicate registry limits (same title in last 24 hours)
    since = today - timedelta(days=1)
    dup = db.query(AIRecommendation).filter(
      AIRecommendation.project_id == project_id,
      AIRecommendation.title == template["title"],
      AIRecommendation.created_at >= since
    ).first()

    if not dup:
      # Expiration timestamp
      ttl_days = registry["lifecycle_rules"].get("ttl_days", 7)
      expires_at = today + timedelta(days=ttl_days)

      rec = AIRecommendation(
        project_id=project_id,
        title=template["title"],
        description=template["description"],
        category=registry["category"],
        severity=template["default_severity"],
        data_quality_confidence=dq_confidence,
        statistical_confidence=stat_confidence,
        overall_confidence=overall_confidence,
        priority_score=priority_score,
        metrics_used=metrics_used,
        evidence=evidence_payload,
        suggested_action=template["suggested_action"],
        expected_impact=template["expected_impact"],
        rule_version="1.0.0",
        engine_version="1.0.0",
        recommendation_version="1.0.0",
        created_by_engine="AI Recommendation Engine",
        relationships={"supersedes": None, "duplicates": []},
        status="Generated",
        expires_at=expires_at
      )
      db.add(rec)
      stored_count += 1

  db.commit()
  logger.info(f"Refactored engine generated {stored_count} AI Recommendations for project {project_id}.")
  return stored_count
