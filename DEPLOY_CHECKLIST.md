# Deploy Checklist - Production

## Pre-Deploy
- [ ] VPS Ubuntu 22.04+ (Hetzner / DigitalOcean)
- [ ] Docker + Docker Compose instalados
- [ ] Dominio con DNS A apuntando al VPS
- [ ] Puertos 80/443 abiertos en firewall
- [ ] `.env.production` creado desde `.env.production.example`
- [ ] Passwords y JWT en valores seguros
- [ ] `docker/nginx.conf` con dominio real (sin `DOMAIN`)

## Deploy
- [ ] `docker compose -f docker-compose.prod.yml up -d --build`
- [ ] `docker compose -f docker-compose.prod.yml ps` sin errores
- [ ] Emision SSL inicial ejecutada
- [ ] `https://dominio` funcionando
- [ ] `https://dominio/api/v1/health` devuelve 200

## Post-Deploy
- [ ] Backup manual exitoso (`scripts/prod/backup_postgres.sh`)
- [ ] Cron de backup diario configurado
- [ ] Politica de retencion revisada (14 dias o mas)
- [ ] Logs revisados en `nginx`, `backend`, `postgres`
- [ ] Prueba de restauracion de backup validada
