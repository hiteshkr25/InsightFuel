from typing import Dict, Any, List

def build_evidence_payload(
  template_id: str,
  metrics_used: List[str],
  evidence_data: Dict[str, Any]
) -> Dict[str, Any]:
  """
  Compiles explainable evidence payloads and comparison statements.
  """
  explanation = ""
  
  if template_id == "LOW_ENGAGEMENT":
    explanation = (
      f"Alert triggered because WAU/DAU counts experienced a drop. "
      f"Z-score standard deviation drop of {evidence_data.get('z_score', 0.0):.2f} "
      f"falls below normal baseline thresholds."
    )
  elif template_id == "HIGH_ERROR_RATE":
    explanation = (
      f"Product reliability score of {evidence_data.get('current_stability', 0.0):.1f}% "
      f"dropped below the target threshold of {evidence_data.get('threshold', 0.0):.1f}%."
    )
  elif template_id == "PERFORMANCE_REGRESSION":
    explanation = (
      f"User load performance score of {evidence_data.get('current_performance', 0.0):.1f}% "
      f"regressed below the target threshold of {evidence_data.get('threshold', 0.0):.1f}%."
    )
  elif template_id == "LOW_ADOPTION":
    explanation = (
      f"Platform adoption score of {evidence_data.get('current_adoption', 0.0):.1f}% "
      f"is below the target threshold of {evidence_data.get('threshold', 0.0):.1f}%."
    )
  elif template_id == "LOW_RETENTION":
    explanation = (
      f"Cohort retention score of {evidence_data.get('current_retention', 0.0):.1f}% "
      f"dropped below the target threshold of {evidence_data.get('threshold', 0.0):.1f}%."
    )
  elif template_id == "FEATURE_GROWTH":
    explanation = (
      f"Feature selector '{evidence_data.get('feature_id')}' experienced WoW growth "
      f"rate increase of {evidence_data.get('growth_rate', 0.0)*100:.1f}%."
    )
  elif template_id == "DECLINING_FEATURE":
    explanation = (
      f"Feature selector '{evidence_data.get('feature_id')}' experienced WoW decline "
      f"rate of {evidence_data.get('decline_rate', 0.0)*100:.1f}%."
    )
  else:
    explanation = "Metrics parameters fall outside recommended target ranges."

  return {
    "metrics_used": metrics_used,
    "explanation": explanation,
    "data": evidence_data
  }
