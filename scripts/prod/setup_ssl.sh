#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${1:-}" || -z "${2:-}" ]]; then
  echo "Uso: $0 <domain> <email> <compose-file-opcional>"
  echo "Ejemplo: $0 app.tudominio.com ops@tudominio.com docker-compose.prod.yml"
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"
COMPOSE_FILE="${3:-docker-compose.prod.yml}"

echo "[1/5] Levantando stack base (HTTP)"
docker compose -f "$COMPOSE_FILE" up -d postgres backend frontend nginx

echo "[2/5] Solicitando certificado Let's Encrypt para $DOMAIN"
docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

echo "[3/5] Activando configuracion TLS en Nginx"
sed "s/DOMAIN/$DOMAIN/g" docker/nginx.ssl.conf > docker/nginx.conf

echo "[4/5] Reiniciando Nginx con SSL"
docker compose -f "$COMPOSE_FILE" restart nginx

echo "[5/5] Validando certificado"
docker compose -f "$COMPOSE_FILE" exec nginx nginx -t

echo "SSL listo. Verifica https://$DOMAIN"
