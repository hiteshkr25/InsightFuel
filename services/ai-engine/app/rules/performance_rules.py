from typing import List, Dict, Any
from app.registry.recommendation_registry import RECOMMENDATION_REGISTRY

def evaluate(data: Dict[str, Any]) -> List[Dict[str, Any]]:
  results = []
  health = data.get("health", {})
  if not health:
    return results

  rel_score = health.get("score_reliability", 100.0)
  perf_score = health.get("score_performance", 100.0)

  # Check Reliability
  rel_threshold = RECOMMENDATION_REGISTRY["HIGH_ERROR_RATE"]["thresholds"]["score_reliability"]
  if rel_score < rel_threshold:
    results.append({
      "template_id": "HIGH_ERROR_RATE",
      "metrics_used": ["score_reliability"],
      "evidence": {
        "current_stability": float(rel_score),
        "threshold": float(rel_threshold)
      }
    })

  # Check Performance
  perf_threshold = RECOMMENDATION_REGISTRY["PERFORMANCE_REGRESSION"]["thresholds"]["score_performance"]
  if perf_score < perf_threshold:
    results.append({
      "template_id": "PERFORMANCE_REGRESSION",
      "metrics_used": ["score_performance"],
      "evidence": {
        "current_performance": float(perf_score),
        "threshold": float(perf_threshold)
      }
    })

  return results
