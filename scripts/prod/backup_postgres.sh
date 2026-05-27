#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/pos}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

echo "Generando backup PostgreSQL..."
docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$BACKUP_DIR/postgres_${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

echo "Eliminando backups con mas de $RETENTION_DAYS dias..."
find "$BACKUP_DIR" -type f -name "postgres_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Backup completado: $BACKUP_DIR/postgres_${POSTGRES_DB}_${TIMESTAMP}.sql.gz"
