#!/usr/bin/env bash
# ==============================================================================
# GTMTS Automated Database Backup Script (Production Grade)
# Graduate Thesis Management and Tracking System (MCU)
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-storage/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/gtmts_backup_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="${MYSQL_CONTAINER:-gtmts-mysql}"
DB_NAME="${MYSQL_DATABASE:-ums_dev}"
DB_USER="${MYSQL_USER:-root}"
DB_PASS="${MYSQL_ROOT_PASSWORD:-RootPassw0rd_Secure!}"
RETENTION_DAYS=14

# Ensure common binary paths are available in PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.docker/bin:/Applications/Docker.app/Contents/Resources/bin:$PATH"

echo "================================================================="
echo " [GTMTS] Starting Automated Database Backup: ${TIMESTAMP}"
echo "================================================================="

# 1. Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# 2. Check if docker container is active
if command -v docker &> /dev/null && docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
  echo "=> Target MySQL Container: ${CONTAINER_NAME} (running)"
  echo "=> Dumping database '${DB_NAME}' with gzip compression..."

  docker exec "${CONTAINER_NAME}" /usr/bin/mysqldump \
    -u "${DB_USER}" \
    -p"${DB_PASS}" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"

elif command -v mysqldump &> /dev/null; then
  echo "=> Container not found. Falling back to host mysqldump on port 3307..."
  mysqldump \
    -h 127.0.0.1 \
    -P 3307 \
    -u "${DB_USER}" \
    -p"${DB_PASS}" \
    --single-transaction \
    --quick \
    "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"
else
  echo "[ERROR] Neither Docker container '${CONTAINER_NAME}' nor local 'mysqldump' is available!"
  exit 1
fi

# 3. Verify backup file creation & size
if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
  FILE_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
  echo "=> Backup successful! File created:"
  echo "   Path: ${BACKUP_FILE}"
  echo "   Size: ${FILE_SIZE}"
else
  echo "[ERROR] Backup file is empty or missing!"
  exit 1
fi

# 4. Cleanup old backups (keep last 14 days)
echo "=> Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "gtmts_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

COUNT=$(ls -1 "${BACKUP_DIR}"/gtmts_backup_*.sql.gz 2>/dev/null | wc -l || echo 0)
echo "=> Current total stored backups: ${COUNT} file(s)"
echo ""
echo "To restore this backup, run:"
echo "  gunzip -c ${BACKUP_FILE} | docker exec -i ${CONTAINER_NAME} mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME}"
echo "================================================================="
