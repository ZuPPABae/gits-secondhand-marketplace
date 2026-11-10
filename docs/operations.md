# Panduan Operasional

> Panduan ini mencakup cara menjalankan, debug, dan maintain aplikasi dalam lingkungan development dan production.

---

## Development

### Setup Awal

```bash
# Clone repo
git clone <repo-url>
cd gits-secondhand-marketplace

# Salin environment file
cp .env.example .env
# Edit .env jika diperlukan (biasanya tidak perlu untuk dev)

# Build dan jalankan semua container
docker-compose up --build
```

Aplikasi tersedia di:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1
- **Health check**: http://localhost:8000/up

### Perintah Harian

```bash
# Jalankan (foreground)
docker-compose up

# Jalankan (background)
docker-compose up -d

# Stop
docker-compose down

# Stop + hapus semua volume (reset database)
docker-compose down -v

# Lihat log semua service
docker-compose logs -f

# Lihat log service tertentu
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Artisan Commands (Backend)

```bash
# Jalankan migration
docker-compose exec backend php artisan migrate

# Jalankan seeder
docker-compose exec backend php artisan db:seed

# Reset database + seed ulang
docker-compose exec backend php artisan migrate:fresh --seed

# Clear semua cache
docker-compose exec backend php artisan optimize:clear

# Lihat semua route
docker-compose exec backend php artisan route:list

# Masuk ke shell container backend
docker-compose exec backend bash

# Masuk ke psql
docker-compose exec postgres psql -U marketplace_user -d marketplace_db
```

### Frontend Development

```bash
# Install dependency (jika perlu, misalnya setelah pull)
docker-compose exec frontend npm install

# Lint
docker-compose exec frontend npm run lint

# Build production
docker-compose exec frontend npm run build
```

---

## Troubleshooting

### Container tidak bisa start

```bash
# Cek status container
docker-compose ps

# Lihat log error
docker-compose logs backend
docker-compose logs postgres

# Rebuild dari awal
docker-compose down -v
docker-compose up --build
```

### Backend error 500

```bash
# Lihat Laravel log
docker-compose exec backend tail -n 100 storage/logs/laravel.log

# Atau via docker logs
docker-compose logs backend
```

### Database connection error

```bash
# Pastikan PostgreSQL ready (tunggu ~10 detik setelah start)
docker-compose exec postgres pg_isready -U marketplace_user

# Cek env database di backend
docker-compose exec backend php artisan config:show database
```

### CORS / Cookie error di browser

- Pastikan mengakses frontend via `http://localhost:5173` (bukan IP lain).
- Pastikan `SANCTUM_STATEFUL_DOMAINS` di `.env` include `localhost:5173`.
- Pastikan panggil `GET /sanctum/csrf-cookie` sebelum POST ke auth endpoint.

---

## Production Deployment (Rancangan)

> Detail implementasi production ada di [`architecture-infra.md`](./architecture-infra.md).

### Build & Deploy

```bash
# Build frontend
npm run build
# Upload dist/ ke Cloudflare Pages / S3

# Build backend Docker image
docker build -t marketplace-backend:latest ./backend

# Push ke container registry
docker push registry.example.com/marketplace-backend:latest

# Deploy ke Kubernetes / Cloud Run
kubectl set image deployment/backend backend=registry.example.com/marketplace-backend:latest
```

### Environment Variables Production

| Variable | Keterangan |
|----------|-----------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | URL produksi backend |
| `DB_HOST` | Host managed PostgreSQL |
| `DB_PASSWORD` | Password dari secret manager |
| `REDIS_HOST` | Host managed Redis |
| `SESSION_DRIVER` | `redis` |
| `CACHE_STORE` | `redis` |
| `FILESYSTEM_DISK` | `s3` |
| `AWS_BUCKET` | Nama bucket S3/R2 |
| `SANCTUM_STATEFUL_DOMAINS` | Domain frontend production |

### Zero-Downtime Deploy

1. Build image baru.
2. Push ke registry.
3. Rolling update: Kubernetes mengganti pod satu per satu.
4. Health check `/up` harus return 200 sebelum pod menerima traffic.
5. Jalankan migration sebelum deploy (atau via init container).

---

## Monitoring & Alerting

| Aspek | Alat | Alert Kondisi |
|-------|------|--------------|
| Uptime | UptimeRobot | Down > 1 menit |
| Error rate | Sentry | Error baru / spike |
| Response time | Grafana | P95 > 500ms |
| Database | pg_stat_statements | Slow query > 1 detik |
| Disk usage | Cloud monitoring | > 80% |
| Memory usage | Cloud monitoring | > 85% |
