#!/bin/sh
set -e

echo "=== GTMTS Container Initialization ==="
echo "Node Environment: ${NODE_ENV:-production}"
echo "Port: ${PORT:-3010}"

# Function to extract host and port from DATABASE_URL
# Format: mysql://user:password@host:port/database
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's/.*@([^:/]+).*/\1/')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's/.*@.*:([0-9]+)\/.*/\1/')
if [ -z "$DB_PORT" ] || [ "$DB_PORT" = "$DATABASE_URL" ]; then
  DB_PORT="3306"
fi

if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "$DATABASE_URL" ]; then
  echo "Waiting for MySQL database at ${DB_HOST}:${DB_PORT} to accept connections..."
  MAX_RETRIES=30
  COUNT=0
  until nc -z -w 2 "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
      echo "Error: Timed out waiting for database at ${DB_HOST}:${DB_PORT} after ${MAX_RETRIES} attempts."
      exit 1
    fi
    echo "Database not ready yet... attempt ($COUNT/$MAX_RETRIES). Sleeping 2s."
    sleep 2
  done
  echo "Database connection established!"
fi

# Apply database migrations
if [ -d "prisma/migrations" ]; then
  echo "Applying pending Prisma migrations..."
  prisma migrate deploy || npx prisma migrate deploy || {
    echo "Warning: Migration failed or was already applied."
  }
fi

# Optional seed on initial startup
if [ "${SEED_ON_INIT}" = "1" ] && [ -f "prisma/seed.ts" ]; then
  echo "SEED_ON_INIT=1 detected: Checking whether seed is needed..."
  # If tsx is available, run seed
  if command -v tsx >/dev/null 2>&1 || [ -f "node_modules/.bin/tsx" ]; then
    echo "Running database seed..."
    SEED_ALLOW_PROD=1 npx tsx prisma/seed.ts || echo "Seed completed or skipped."
  fi
fi

echo "=== Starting Next.js Production Server ==="
exec "$@"
