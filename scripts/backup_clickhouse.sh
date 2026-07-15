#!/bin/bash
set -eo pipefail

# Configuration
CH_HOST=${CLICKHOUSE_HOST:-"localhost"}
CH_PORT=${CLICKHOUSE_PORT:-9000}
CH_DB=${CLICKHOUSE_DB:-"insightfuel"}
CH_USER=${CLICKHOUSE_USER:-"default"}
BACKUP_DIR=${BACKUP_DIR:-"/tmp/backups/clickhouse"}

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${CH_DB}_backup_${TIMESTAMP}.sql.gz"

echo "Starting ClickHouse database schema & data backup..."
mkdir -p "${BACKUP_DIR}"

# Execute schemas and queries dumps
clickhouse-client -h "${CH_HOST}" --port "${CH_PORT}" -u "${CH_USER}" --password "${CLICKHOUSE_PASSWORD}" -d "${CH_DB}" --query="SHOW TABLES" | while read -r table; do
  echo "Backing up table structure and data for: ${table}"
  clickhouse-client -h "${CH_HOST}" --port "${CH_PORT}" -u "${CH_USER}" --password "${CLICKHOUSE_PASSWORD}" -d "${CH_DB}" --query="SHOW CREATE TABLE ${table}"
  clickhouse-client -h "${CH_HOST}" --port "${CH_PORT}" -u "${CH_USER}" --password "${CLICKHOUSE_PASSWORD}" -d "${CH_DB}" --query="SELECT * FROM ${table} FORMAT TabSeparated"
done | gzip > "${BACKUP_FILE}"

echo "ClickHouse backup successfully written to: ${BACKUP_FILE}"
ls -lh "${BACKUP_FILE}"
