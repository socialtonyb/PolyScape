#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${POLYSCAPE_DB_NAME:-polyscape}"
DB_USER="${POLYSCAPE_DB_USER:-postgres}"
DB_PASSWORD="${POLYSCAPE_DB_PASSWORD:-postgres}"
DB_PORT="${POLYSCAPE_DB_PORT:-5432}"
PGDATA_DIR="${POLYSCAPE_PGDATA_DIR:-.local/postgres-data}"
SOCKET_DIR="${POLYSCAPE_PGSOCKET_DIR:-.local/postgres-socket}"

mkdir -p "$(dirname "$PGDATA_DIR")" "$SOCKET_DIR"

if command -v docker >/dev/null 2>&1; then
  echo "[db:up] Docker detected. Starting docker-compose postgres..."
  docker compose up -d postgres
  echo "[db:up] Waiting for postgres readiness..."
  for _ in {1..30}; do
    if docker exec polyscape-postgres pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
      echo "[db:up] Docker postgres is ready."
      exit 0
    fi
    sleep 1
  done
  echo "[db:up] Docker postgres did not become ready in time." >&2
  exit 1
fi

if command -v initdb >/dev/null 2>&1 && command -v pg_ctl >/dev/null 2>&1; then
  export PATH="$(dirname "$(command -v initdb)"):$PATH"
  if [ ! -f "$PGDATA_DIR/PG_VERSION" ]; then
    echo "[db:up] Initializing local postgres cluster in $PGDATA_DIR"
    initdb -D "$PGDATA_DIR" --username="$DB_USER" --auth=trust >/dev/null
    {
      echo "listen_addresses = '127.0.0.1'"
      echo "port = $DB_PORT"
      echo "unix_socket_directories = '$SOCKET_DIR'"
    } >> "$PGDATA_DIR/postgresql.conf"
  fi

  echo "[db:up] Starting local postgres..."
  pg_ctl -D "$PGDATA_DIR" -l "$PGDATA_DIR/server.log" start >/dev/null || true

  for _ in {1..30}; do
    if pg_isready -h 127.0.0.1 -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! pg_isready -h 127.0.0.1 -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
    echo "[db:up] Local postgres failed to start. Check $PGDATA_DIR/server.log" >&2
    exit 1
  fi

  if ! psql "postgresql://$DB_USER@127.0.0.1:$DB_PORT/postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "[db:up] Creating database '$DB_NAME'"
    createdb -h 127.0.0.1 -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
  fi

  echo "[db:up] Local postgres is ready at 127.0.0.1:$DB_PORT/$DB_NAME"
  echo "[db:up] If needed, set DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
  exit 0
fi

echo "[db:up] Could not find Docker or local postgres binaries (initdb/pg_ctl)." >&2
echo "[db:up] Install one of the following:" >&2
echo "  1) Docker Desktop/Engine, then run: npm run db:up" >&2
echo "  2) PostgreSQL server binaries (initdb, pg_ctl, psql), then run: npm run db:up" >&2
exit 1
