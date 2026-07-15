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

def get_mock_performance(project_id: str):
  today = datetime.now()
  return [
    {
      "timestamp": (today - timedelta(days=i)).strftime("%Y-%m-%d"),
      "avg_load_time": 1.2 + (i % 5) * 0.1,
      "avg_api_latency": 150 + (i % 10) * 15,
      "error_count": i % 3
    }
    for i in range(30)
  ]

def get_mock_feature_rankings(project_id: str):
  return [
    {"feature_id": "feat_dashboard", "adoption_rate": 0.85, "usage_frequency": 4.2, "growth_rate_wow": 0.12, "stickiness_score": 0.85, "importance_score": 85.0, "health_status": "growing"},
    {"feature_id": "feat_analytics", "adoption_rate": 0.45, "usage_frequency": 2.1, "growth_rate_wow": -0.05, "stickiness_score": 0.45, "importance_score": 45.0, "health_status": "stable"}
  ]

