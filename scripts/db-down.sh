#!/usr/bin/env bash
set -euo pipefail

PGDATA_DIR="${POLYSCAPE_PGDATA_DIR:-.local/postgres-data}"

if command -v docker >/dev/null 2>&1; then
  docker compose down || true
fi

if command -v pg_ctl >/dev/null 2>&1 && [ -f "$PGDATA_DIR/PG_VERSION" ]; then
  pg_ctl -D "$PGDATA_DIR" stop >/dev/null || true
fi

echo "[db:down] Stopped available PolyScape database services."
