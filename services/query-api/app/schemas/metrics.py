from typing import List
from pydantic import BaseModel

class MetricDefinition(BaseModel):
  name: str
  formula: str
  description: str
  refresh_frequency: str
  source_events: List[str]
  storage_table: str
  consumers: List[str]

# Canonical Metric Registry definition
METRIC_REGISTRY = [
  MetricDefinition(
    name="Session Duration",
    formula="max(timestamp) - min(timestamp) group by session_id",
    description="The difference in seconds between the last and first event in a session.",
    refresh_frequency="Hourly",
    source_events=["* (all captured session events)"],
    storage_table="session_metrics",
    consumers=["Dashboard UI", "Query API", "Product Health Service"]
  ),
  MetricDefinition(
    name="Session Quality Score",
    formula="Sum(action_weights) based on engagement depth and active time",
    description="Score between 0.0 and 10.0 indicating session quality and length.",
    refresh_frequency="Hourly",
    source_events=["click", "form_submit", "scroll_depth"],
    storage_table="session_metrics",
    consumers=["Dashboard UI", "AI Engine"]
  ),
  MetricDefinition(
    name="Daily Active Users (DAU)",
    formula="count(distinct distinct_id) where timestamp within last 1 day",
    description="Total distinct identified users active on a given day.",
    refresh_frequency="Daily",
    source_events=["* (any user action)"],
    storage_table="user_activity_metrics",
    consumers=["Dashboard UI", "Query API", "Product Health Service"]
  ),
  MetricDefinition(
    name="Weekly Active Users (WAU)",
    formula="count(distinct distinct_id) where timestamp within last 7 days",
    description="Total distinct identified users active in a 7-day rolling window.",
    refresh_frequency="Daily",
    source_events=["* (any user action)"],
    storage_table="user_activity_metrics",
    consumers=["Dashboard UI", "Query API"]
  ),
  MetricDefinition(
    name="Monthly Active Users (MAU)",
    formula="count(distinct distinct_id) where timestamp within last 30 days",
    description="Total distinct identified users active in a 30-day rolling window.",
    refresh_frequency="Daily",
    source_events=["* (any user action)"],
    storage_table="user_activity_metrics",
    consumers=["Dashboard UI", "Query API"]
  ),
  MetricDefinition(
    name="Cohort Retention Rate",
    formula="count(returning_users_on_day_N) / cohort_size",
    description="Percentage of cohort starting users returning to the app on specific Day intervals (1, 7, 30).",
    refresh_frequency="Daily",
    source_events=["page_view", "click"],
    storage_table="retention_metrics",
    consumers=["Dashboard UI", "Query API"]
  ),
  MetricDefinition(
    name="Funnel Step Conversion",
    formula="count(users_in_step_N) / count(users_in_step_1)",
    description="Step completion counts, drop-off ratios, and average transition times.",
    refresh_frequency="Daily",
    source_events=["click", "form_submit", "page_view"],
    storage_table="funnel_metrics",
    consumers=["Dashboard UI", "Query API"]
  ),
  MetricDefinition(
    name="User Session Flow Paths",
    formula="transition_counts(source_path -> target_path)",
    description="Summing of transition paths from source pages to target pages.",
    refresh_frequency="Daily",
    source_events=["page_view"],
    storage_table="path_metrics",
    consumers=["Dashboard UI", "Query API"]
  ),
  MetricDefinition(
    name="Feature Engagement Metrics",
    formula="usage_count, unique_users, avg_time_spent",
    description="Total clicks and time spent interacting with registered selector features.",
    refresh_frequency="Hourly",
    source_events=["click", "scroll_depth"],
    storage_table="feature_metrics",
    consumers=["Dashboard UI", "Feature Intelligence Service"]
  )
]
