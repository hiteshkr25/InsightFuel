import logging
from typing import Dict, Any, List
from app.core.clickhouse import clickhouse_manager

logger = logging.getLogger("insightfuel.query-api")

class AnalyticsRepository:
  def __init__(self):
    pass

  def _build_where_clause(self, filters: Dict[str, Any]) -> (str, Dict[str, Any]):
    clauses = []
    params = {}
    for idx, (col, val) in enumerate(filters.items()):
      if val is not None:
        param_name = f"val_{idx}"
        clauses.append(f"{col} = {{{param_name}}}")
        params[param_name] = val
    return " AND ".join(clauses) if clauses else "1=1", params

  def get_session_metrics(
    self, project_id: str, start_date: str,
    end_date: str, filters: Dict[str, Any],
    limit: int = 100, offset: int = 0
  ) -> List[Dict[str, Any]]:
    from app.core.demo import DEMO_MODE, get_mock_sessions
    if DEMO_MODE:
      return get_mock_sessions(project_id, limit)
    client = clickhouse_manager.get_client()
    if not client:
      return []

    where_str, params = self._build_where_clause(filters)
    query = f"""
      SELECT session_id, duration, active_time, idle_time, quality_score, device, browser, os, country, timestamp
      FROM session_metrics
      WHERE project_id = {{project_id}} AND timestamp >= {{start}} AND timestamp < {{end}}
        AND {where_str}
      ORDER BY timestamp DESC
      LIMIT {{limit}} OFFSET {{offset}}
    """
    params.update({
      "project_id": project_id,
      "start": start_date,
      "end": end_date,
      "limit": limit,
      "offset": offset
    })
    try:
      res = client.query(query, parameters=params)
      return [dict(zip(res.column_names, row)) for row in res.result_rows]
    except Exception as e:
      logger.error(f"Error querying session metrics: {e}")
      return []

  def get_user_activity(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    from app.core.demo import DEMO_MODE, get_mock_user_activity
    if DEMO_MODE:
      return get_mock_user_activity(project_id)
    client = clickhouse_manager.get_client()
    if not client:
      return []
    query = """
      SELECT timestamp, dau, wau, mau, new_users, returning_users
      FROM user_activity_metrics
      WHERE project_id = {project_id} AND timestamp >= {start} AND timestamp < {end}
      ORDER BY timestamp ASC
    """
    try:
      res = client.query(query, parameters={"project_id": project_id, "start": start_date, "end": end_date})
      return [dict(zip(res.column_names, row)) for row in res.result_rows]
    except Exception as e:
      logger.error(f"Error querying user activity metrics: {e}")
      return []

  def get_retention_metrics(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    from app.core.demo import DEMO_MODE, get_mock_retention
    if DEMO_MODE:
      return get_mock_retention(project_id)
    client = clickhouse_manager.get_client()
    if not client:
      return []
    query = """
      SELECT cohort_date, day_number, cohort_size, retained_users, retention_rate
      FROM retention_metrics
      WHERE project_id = {project_id} AND cohort_date >= {start} AND cohort_date <= {end}
      ORDER BY cohort_date ASC, day_number ASC
    """
    try:
      res = client.query(query, parameters={"project_id": project_id, "start": start_date, "end": end_date})
      return [dict(zip(res.column_names, row)) for row in res.result_rows]
    except Exception as e:
      logger.error(f"Error querying retention metrics: {e}")
      return []

  def get_funnel_metrics(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    from app.core.demo import DEMO_MODE, get_mock_funnels
    if DEMO_MODE:
      return get_mock_funnels(project_id)
    client = clickhouse_manager.get_client()
    if not client:
      return []
    query = """
      SELECT funnel_id, step_number, step_name, completed_users, dropoff_rate, conversion_rate, avg_completion_time, timestamp
      FROM funnel_metrics
      WHERE project_id = {project_id} AND timestamp >= {start} AND timestamp < {end}
      ORDER BY funnel_id ASC, step_number ASC
    """
    try:
      res = client.query(query, parameters={"project_id": project_id, "start": start_date, "end": end_date})
      return [dict(zip(res.column_names, row)) for row in res.result_rows]
    except Exception as e:
      logger.error(f"Error querying funnel metrics: {e}")
      return []

  def get_path_metrics(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    from app.core.demo import DEMO_MODE, get_mock_paths
    if DEMO_MODE:
      return get_mock_paths(project_id)
    client = clickhouse_manager.get_client()
    if not client:
      return []
    query = """
      SELECT source_path, target_path, transition_count, timestamp
      FROM path_metrics
      WHERE project_id = {project_id} AND timestamp >= {start} AND timestamp < {end}
      ORDER BY transition_count DESC
    """
    try:
      res = client.query(query, parameters={"project_id": project_id, "start": start_date, "end": end_date})
      return [dict(zip(res.column_names, row)) for row in res.result_rows]
    except Exception as e:
      logger.error(f"Error querying path metrics: {e}")
      return []

  def get_feature_metrics(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    from app.core.demo import DEMO_MODE, get_mock_features
    if DEMO_MODE:
      return get_mock_features(project_id)
    client = clickhouse_manager.get_client()
    if not client:
      return []
    query = """
      SELECT feature_id, usage_count, unique_users, avg_time_spent, timestamp
      FROM feature_metrics
      WHERE project_id = {project_id} AND timestamp >= {start} AND timestamp < {end}
      ORDER BY usage_count DESC
    """
    try:
      res = client.query(query, parameters={"project_id": project_id, "start": start_date, "end": end_date})
      return [dict(zip(res.column_names, row)) for row in res.result_rows]
    except Exception as e:
      logger.error(f"Error querying feature metrics: {e}")
      return []

  def get_performance_metrics(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    from app.core.demo import DEMO_MODE, get_mock_performance
    if DEMO_MODE:
      return get_mock_performance(project_id)
    client = clickhouse_manager.get_client()
    if not client:
      return []
    query = """
      SELECT timestamp, avg_load_time, avg_api_latency, error_count
      FROM performance_metrics
      WHERE project_id = {project_id} AND timestamp >= {start} AND timestamp < {end}
      ORDER BY timestamp ASC
    """
    try:
      res = client.query(query, parameters={"project_id": project_id, "start": start_date, "end": end_date})
      return [dict(zip(res.column_names, row)) for row in res.result_rows]
    except Exception as e:
      logger.error(f"Error querying performance metrics: {e}")
      return []

analytics_repository = AnalyticsRepository()
