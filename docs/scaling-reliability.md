# Scaling & Reliability

> Dokumen ini menjelaskan strategi scaling dan reliability untuk target ±100.000 DAU (Daily Active Users).

---

## Estimasi Beban

| Metrik | Estimasi |
|--------|---------|
| DAU | 100.000 |
| Puncak concurrent users | ~5.000 (peak hour) |
| Request per detik (RPS) peak | ~500–1.000 RPS |
| Listing aktif | ~50.000 |
| Upload foto/hari | ~1.000 foto |
| Read/Write ratio | 90% read, 10% write |

---

## Strategi Scaling

### 1. Backend (Laravel)

- **Horizontal scaling**: Deploy multiple container backend di belakang load balancer.
- **Stateless**: Session disimpan di Redis (bukan file), storage di S3/R2 (bukan local disk) → instance dapat di-scale bebas.
- **Queue worker**: Proses background (resize foto, kirim email) via Laravel Queue + Redis driver. Worker terpisah dari web container.
- **Connection pooling**: Gunakan PgBouncer di depan PostgreSQL untuk manage connection pool dari banyak instance.
- **PHP-FPM tuning**: `pm.max_children` disesuaikan dengan RAM container.

### 2. Database (PostgreSQL)

- **Read replica**: Query SELECT (listing, profil, search) diarahkan ke read replica via `DB::connection('pgsql_read')`.
- **Indeks yang tepat**: GIN index `pg_trgm` untuk search, indeks composite untuk filter + sort.
- **Query optimization**: Eager loading relasi (N+1 prevention via `with()`), pagination cursor untuk listing besar.
- **Connection pooling**: PgBouncer mencegah PostgreSQL kehabisan connection di traffic tinggi.

### 3. Cache (Redis)

- **Cache listing populer**: Response daftar listing di-cache 1–5 menit, invalidasi saat ada listing baru/edit.
- **Cache profil user**: Data user yang jarang berubah di-cache.
- **Rate limiting**: Endpoint auth (login, register) dan pasang listing dibatasi via Redis rate limiter.
- **Session**: Semua session di Redis untuk mendukung multiple backend instance.

### 4. Frontend / Static Assets

- **CDN**: Build artifact React (HTML/JS/CSS) di-serve via Cloudflare CDN → tidak ada beban ke server untuk aset statis.
- **Code splitting**: React lazy loading per route untuk mengurangi initial bundle size.
- **Image optimization**: Foto listing di-resize saat upload (thumbnail + medium), di-serve via CDN.

### 5. Object Storage

- **S3/R2**: Foto listing disimpan di object storage, bukan disk server → tidak ada bottleneck disk I/O.
- **CDN delivery**: Foto di-serve via Cloudflare CDN untuk latency rendah secara global.
- **Presigned URL**: Di production, upload foto langsung dari browser ke S3 via presigned URL (bypass backend untuk binary transfer).

---

## Reliability

### High Availability

- **Backend**: Minimal 2 instance di belakang load balancer dengan health check.
- **Database**: Managed PostgreSQL dengan automated failover (primary → replica).
- **Redis**: Managed Redis dengan replication atau Redis Sentinel.
- **Zero-downtime deploy**: Rolling update container, health check `/up` sebelum traffic diarahkan.

### Monitoring

| Komponen | Alat |
|----------|------|
| Application metrics | Laravel Telescope (dev), Prometheus + Grafana (prod) |
| Error tracking | Sentry |
| Uptime monitoring | Betteruptime / UptimeRobot |
| Log aggregation | Loki / CloudWatch / GCP Logging |
| Database performance | pg_stat_statements, slow query log |

### Backup

- **Database**: Automated daily backup via managed PostgreSQL, retention 30 hari.
- **Object storage**: Versioning di S3/R2, cross-region replication untuk data kritis.

---

## Bottleneck Potensial & Mitigasi

| Bottleneck | Kondisi | Mitigasi |
|------------|---------|---------|
| Search lambat | > 100K listing | Migrasi ke Meilisearch/Typesense |
| Upload foto lambat | Banyak concurrent upload | Presigned URL (direct upload ke S3) |
| PostgreSQL connection exhausted | > 100 container instance | PgBouncer connection pooler |
| Redis single point of failure | Redis down | Redis Sentinel / Managed Redis cluster |
| CDN cache stale | Listing baru tidak muncul | TTL cache pendek (1–5 menit) atau cache invalidation webhook |
