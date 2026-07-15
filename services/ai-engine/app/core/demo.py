import os
from datetime import datetime, timedelta

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

def get_mock_sessions(project_id: str):
  now_str = datetime.now().isoformat()
  return [
    {
      "session_id": f"sess_demo_{project_id}_{i}",
      "duration": 300 + (i * 12) % 600,
      "active_time": 250 + (i * 12) % 500,
      "idle_time": 50 + (i * 12) % 100,
      "quality_score": 8.5 + (i % 15) * 0.1,
      "device": "mobile" if i % 3 == 0 else "pc",
      "browser": "Chrome" if i % 2 == 0 else "Safari",
      "os": "Windows" if i % 2 == 0 else "macOS",
      "country": "USA" if i % 4 == 0 else "Germany",
      "timestamp": now_str
    }
    for i in range(10)
  ]

def get_mock_user_activity(project_id: str):
  today = datetime.now()
  return [
    {
      "timestamp": (today - timedelta(days=i)).strftime("%Y-%m-%d"),
      "dau": 1200 + (i * 73) % 400,
      "wau": 5400 + (i * 145) % 1200,
      "mau": 18000 + (i * 324) % 3000,
      "new_users": 150 + (i * 27) % 100,
      "returning_users": 1050 + (i * 54) % 300
    }
    for i in range(30)
  ]

def get_mock_features(project_id: str):
  return [
    {"feature_id": "feat_dashboard", "adoption_rate": 0.85, "usage_frequency": 4.2, "growth_rate_wow": 0.12, "stickiness_score": 0.85, "importance_score": 85.0, "health_status": "growing"},
    {"feature_id": "feat_analytics", "adoption_rate": 0.45, "usage_frequency": 2.1, "growth_rate_wow": -0.05, "stickiness_score": 0.45, "importance_score": 45.0, "health_status": "stable"}
  ]

def get_mock_health(project_id: str):
  return {
    "project_id": project_id,
    "health_score": 78.5,
    "health_category": "Healthy",
    "maturity_stage": "Mature",
    "maturity_reason": "Stable user base with low growth velocity fluctuation.",
    "confidence_score": 0.95,
    "score_acquisition": 80.0,
    "score_activation": 75.0,
    "score_engagement": 85.0,
    "score_retention": 72.0,
    "score_feature_adoption": 78.0,
    "score_performance": 82.0,
    "score_reliability": 90.0,
    "score_user_experience": 88.0,
    "kpis": {"user_growth_rate": 0.02, "active_user_ratio": 0.15, "retention_health": 0.72}
  }
