# Deploy Produccion - Paraguay (VPS Unico)

Este proyecto queda preparado para correr en un unico VPS Ubuntu (Hetzner o DigitalOcean) usando Docker Compose.

## 1) Requisitos VPS

- Ubuntu 22.04+
- Dominio apuntando al VPS (A record)
- Puertos abiertos: 22, 80, 443

Instalacion base:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 2) Variables de produccion

```bash
cp .env.production.example .env.production
```

Editar `.env.production` con credenciales reales.

## 3) Levantar stack base (HTTP)

`docker/nginx.conf` inicia en HTTP para permitir challenge ACME.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 4) SSL Let's Encrypt

Primera emision y cambio automatico a TLS:

```bash
chmod +x scripts/prod/setup_ssl.sh
./scripts/prod/setup_ssl.sh app.tudominio.com ops@tudominio.com docker-compose.prod.yml
```

Renovacion automatica:

- la hace el servicio `certbot` cada 12h.

## 5) Healthchecks y logs

Healthchecks:

- Backend: `/api/v1/health`
- Nginx: `/healthz`
- Frontend: `/`
- Postgres: `pg_isready`

Logs:

```bash
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f postgres
```

## 6) Backups PostgreSQL

Script:

```bash
chmod +x scripts/prod/backup_postgres.sh
export POSTGRES_USER=pos_user
export POSTGRES_DB=pos_prod
BACKUP_DIR=/var/backups/pos RETENTION_DAYS=14 ./scripts/prod/backup_postgres.sh
```

Programar cron diario (02:30):

```bash
crontab -e
```

```cron
30 2 * * * cd /ruta/proyecto && POSTGRES_USER=pos_user POSTGRES_DB=pos_prod BACKUP_DIR=/var/backups/pos RETENTION_DAYS=14 ./scripts/prod/backup_postgres.sh >> /var/log/pos_backup.log 2>&1
```

## 7) Checklist de deploy

- [ ] Dominio apunta al VPS
- [ ] `.env.production` completo y seguro
- [ ] `docker compose -f docker-compose.prod.yml up -d --build` exitoso
- [ ] SSL emitido con `setup_ssl.sh`
- [ ] `https://dominio` responde
- [ ] `https://dominio/api/v1/health` responde 200
- [ ] Backup manual probado
- [ ] Cron de backup activo
- [ ] Restauracion validada en entorno de prueba

## 8) Restauracion rapida de backup

```bash
gunzip -c /var/backups/pos/postgres_pos_prod_YYYYMMDD_HHMMSS.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U pos_user -d pos_prod
```

## 9) Comandos operativos utiles

```bash
# estado
docker compose -f docker-compose.prod.yml ps

# reinicio controlado
docker compose -f docker-compose.prod.yml up -d --build backend frontend nginx

# bajar stack
docker compose -f docker-compose.prod.yml down
```
