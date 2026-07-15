#!/bin/bash
set -eo pipefail

# Configuration
DB_HOST=${POSTGRES_HOST:-"localhost"}
DB_PORT=${POSTGRES_PORT:-5432}
DB_NAME=${POSTGRES_DB:-"insightfuel"}
DB_USER=${POSTGRES_USER:-"postgres"}
BACKUP_DIR=${BACKUP_DIR:-"/tmp/backups/postgres"}

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

echo "Starting PostgreSQL backup for database: ${DB_NAME}..."
mkdir -p "${BACKUP_DIR}"

# Execute pg_dump and compress on the fly
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "PostgreSQL backup successfully written to: ${BACKUP_FILE}"
ls -lh "${BACKUP_FILE}"
