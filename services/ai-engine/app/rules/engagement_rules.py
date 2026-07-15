from typing import List, Dict, Any
from app.registry.recommendation_registry import RECOMMENDATION_REGISTRY

def evaluate(data: Dict[str, Any]) -> List[Dict[str, Any]]:
  results = []
  anomalies = data.get("anomalies", {})
  if not anomalies:
    return results

  z_score = anomalies.get("z_score", 0.0)
  current_dau = anomalies.get("current_dau", 0.0)
  historical_mean = anomalies.get("historical_mean", 0.0)
  deviation_std = anomalies.get("deviation_std", 0.0)
  
  threshold = RECOMMENDATION_REGISTRY["LOW_ENGAGEMENT"]["thresholds"]["z_score"]
  
  if z_score < threshold:
    results.append({
      "template_id": "LOW_ENGAGEMENT",
      "metrics_used": ["dau"],
      "evidence": {
        "current_value": int(current_dau),
        "z_score": float(z_score),
        "historical_mean": float(historical_mean),
        "deviation_std": float(deviation_std)
      }
    })
  return results
