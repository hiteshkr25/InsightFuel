RECOMMENDATION_REGISTRY = {
  "LOW_ADOPTION": {
    "recommendation_id": "LOW_ADOPTION",
    "category": "Adoption",
    "required_metrics": ["score_feature_adoption"],
    "thresholds": {"score_feature_adoption": 50.0},
    "required_evidence": ["current_adoption", "threshold"],
    "lifecycle_rules": {"ttl_days": 7}
  },
  "DECLINING_FEATURE": {
    "recommendation_id": "DECLINING_FEATURE",
    "category": "Feature Usage",
    "required_metrics": ["growth_rate_wow"],
    "thresholds": {"growth_rate_wow": -0.15},
    "required_evidence": ["feature_id", "decline_rate"],
    "lifecycle_rules": {"ttl_days": 5}
  },
  "HIGH_ERROR_RATE": {
    "recommendation_id": "HIGH_ERROR_RATE",
    "category": "Reliability",
    "required_metrics": ["score_reliability"],
    "thresholds": {"score_reliability": 70.0},
    "required_evidence": ["current_stability", "threshold"],
    "lifecycle_rules": {"ttl_days": 3}
  },
  "PERFORMANCE_REGRESSION": {
    "recommendation_id": "PERFORMANCE_REGRESSION",
    "category": "Performance",
    "required_metrics": ["score_performance"],
    "thresholds": {"score_performance": 70.0},
    "required_evidence": ["current_performance", "threshold"],
    "lifecycle_rules": {"ttl_days": 5}
  },
  "LOW_RETENTION": {
    "recommendation_id": "LOW_RETENTION",
    "category": "Retention",
    "required_metrics": ["score_retention"],
    "thresholds": {"score_retention": 60.0},
    "required_evidence": ["current_retention", "threshold"],
    "lifecycle_rules": {"ttl_days": 7}
  },
  "LOW_ENGAGEMENT": {
    "recommendation_id": "LOW_ENGAGEMENT",
    "category": "Engagement",
    "required_metrics": ["dau"],
    "thresholds": {"z_score": -1.0},
    "required_evidence": ["current_value", "z_score", "historical_mean"],
    "lifecycle_rules": {"ttl_days": 2}
  },
  "FEATURE_GROWTH": {
    "recommendation_id": "FEATURE_GROWTH",
    "category": "Feature Usage",
    "required_metrics": ["growth_rate_wow"],
    "thresholds": {"growth_rate_wow": 0.15},
    "required_evidence": ["feature_id", "growth_rate"],
    "lifecycle_rules": {"ttl_days": 7}
  },
  "FEATURE_DEPRECATION": {
    "recommendation_id": "FEATURE_DEPRECATION",
    "category": "Feature Usage",
    "required_metrics": ["stickiness_score"],
    "thresholds": {"stickiness_score": 0.01},
    "required_evidence": ["feature_id", "stickiness"],
    "lifecycle_rules": {"ttl_days": 14}
  }
}
