import logging
import clickhouse_connect
from app.core.config import settings

logger = logging.getLogger("insightfuel.analytics")

class ClickHouseClientManager:
  def __init__(self):
    self.client = None

  def get_client(self):
    if not self.client:
      try:
        self.client = clickhouse_connect.get_client(
          host=settings.CLICKHOUSE_HOST,
          port=settings.CLICKHOUSE_PORT,
          username=settings.CLICKHOUSE_USER,
          password=settings.CLICKHOUSE_PASSWORD,
          database=settings.CLICKHOUSE_DATABASE
        )
        logger.info("Connected to ClickHouse successfully")
      except Exception as e:
        logger.error(f"Failed to connect to ClickHouse: {e}")
        self.client = None
    return self.client

  def close(self):
    if self.client:
      self.client.close()
      self.client = None

  def create_analytical_tables(self) -> None:
    client = self.get_client()
    if not client:
      logger.error("ClickHouse client offline. Cannot create analytical tables.")
      return

    try:
      # 1. Create Session metrics rollup
      client.command("""
        CREATE TABLE IF NOT EXISTS session_metrics (
          session_id String,
          project_id String,
          duration Float32,
          active_time Float32,
          idle_time Float32,
          quality_score Float32,
          device String,
          browser String,
          os String,
          country String,
          timestamp DateTime
        ) ENGINE = ReplacingMergeTree()
        ORDER BY (project_id, timestamp, session_id);
      """)

      # 2. Create User Activity metrics rollup (DAU/WAU/MAU)
      client.command("""
        CREATE TABLE IF NOT EXISTS user_activity_metrics (
          project_id String,
          timestamp DateTime,
          dau UInt32,
          wau UInt32,
          mau UInt32,
          new_users UInt32,
          returning_users UInt32
        ) ENGINE = SummingMergeTree()
        ORDER BY (project_id, timestamp);
      """)

      # 3. Create Retention metrics rollup
      client.command("""
        CREATE TABLE IF NOT EXISTS retention_metrics (
          project_id String,
          cohort_date Date,
          day_number UInt16,
          cohort_size UInt32,
          retained_users UInt32,
          retention_rate Float32
        ) ENGINE = ReplacingMergeTree()
        ORDER BY (project_id, cohort_date, day_number);
      """)

      # 4. Create Funnel metrics rollup
      client.command("""
        CREATE TABLE IF NOT EXISTS funnel_metrics (
          project_id String,
          funnel_id String,
          step_number UInt8,
          step_name String,
          completed_users UInt32,
          dropoff_rate Float32,
          conversion_rate Float32,
          avg_completion_time Float32,
          timestamp DateTime
        ) ENGINE = ReplacingMergeTree()
        ORDER BY (project_id, funnel_id, step_number, timestamp);
      """)

      # 5. Create Path metrics rollup
      client.command("""
        CREATE TABLE IF NOT EXISTS path_metrics (
          project_id String,
          source_path String,
          target_path String,
          transition_count UInt32,
          timestamp DateTime
        ) ENGINE = SummingMergeTree()
        ORDER BY (project_id, source_path, target_path, timestamp);
      """)

      # 6. Create Feature metrics rollup
      client.command("""
        CREATE TABLE IF NOT EXISTS feature_metrics (
          project_id String,
          feature_id String,
          usage_count UInt32,
          unique_users UInt32,
          avg_time_spent Float32,
          timestamp DateTime
        ) ENGINE = ReplacingMergeTree()
        ORDER BY (project_id, feature_id, timestamp);
      """)

      # 7. Create Performance metrics rollup
      client.command("""
        CREATE TABLE IF NOT EXISTS performance_metrics (
          project_id String,
          timestamp DateTime,
          avg_load_time Float32,
          avg_api_latency Float32,
          error_count UInt32
        ) ENGINE = SummingMergeTree()
        ORDER BY (project_id, timestamp);
      """)

      logger.info("Initialized ClickHouse analytical DDL tables.")
    except Exception as e:
      logger.critical(f"Failed to create ClickHouse analytical tables DDL: {e}")

clickhouse_manager = ClickHouseClientManager()
