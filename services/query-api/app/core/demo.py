import os
from datetime import datetime, timedelta

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

def get_mock_sessions(project_id: str, limit: int = 100):
  now_str = datetime.now().isoformat()
  return [
    {
      "session_id": f"sess_demo_{project_id}_{i}",
      "duration": 300 + (i * 12) % 600,
      "active_time": 250 + (i * 12) % 500,
      "idle_time": 50 + (i * 12) % 100,
      "quality_score": 85 + (i % 15),
      "device": "mobile" if i % 3 == 0 else "pc",
      "browser": "Chrome" if i % 2 == 0 else "Safari",
      "os": "Windows" if i % 2 == 0 else "macOS",
      "country": "USA" if i % 4 == 0 else "Germany",
      "timestamp": now_str
    }
    for i in range(limit)
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

def get_mock_retention(project_id: str):
  cohorts = ["2026-06-01", "2026-06-08", "2026-06-15", "2026-06-22"]
  metrics = []
  for cohort_date in cohorts:
    for day in range(8):
      cohort_size = 1000
      rate = 1.0 if day == 0 else max(0.2, 0.8 - (day * 0.08))
      metrics.append({
        "cohort_date": cohort_date,
        "day_number": day,
        "cohort_size": cohort_size,
        "retained_users": int(cohort_size * rate),
        "retention_rate": rate
      })
  return metrics

def get_mock_funnels(project_id: str):
  steps = [
    {"step_number": 1, "step_name": "landing_page", "completed": 5000, "conversion": 1.0, "drop": 0.0},
    {"step_number": 2, "step_name": "feature_view", "completed": 3200, "conversion": 0.64, "drop": 0.36},
    {"step_number": 3, "step_name": "checkout_click", "completed": 1200, "conversion": 0.24, "drop": 0.40}
  ]
  return [
    {
      "funnel_id": "purchase_funnel",
      "step_number": s["step_number"],
      "step_name": s["step_name"],
      "completed_users": s["completed"],
      "dropoff_rate": s["drop"],
      "conversion_rate": s["conversion"],
      "avg_completion_time": 4.5,
      "timestamp": datetime.now().isoformat()
    }
    for s in steps
  ]

def get_mock_paths(project_id: str):
  return [
    {"source_path": "/home", "target_path": "/dashboard", "transition_count": 4500, "timestamp": datetime.now().isoformat()},
    {"source_path": "/dashboard", "target_path": "/features", "transition_count": 3200, "timestamp": datetime.now().isoformat()},
    {"source_path": "/features", "target_path": "/settings", "transition_count": 800, "timestamp": datetime.now().isoformat()}
  ]

def get_mock_features(project_id: str):
  return [
    {"feature_id": "feat_dashboard", "usage_count": 8500, "unique_users": 1200, "avg_time_spent": 120.5, "timestamp": datetime.now().isoformat()},
    {"feature_id": "feat_analytics", "usage_count": 4300, "unique_users": 950, "avg_time_spent": 240.2, "timestamp": datetime.now().isoformat()}
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

