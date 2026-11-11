# Panduan Operasional & Pemeliharaan (Operations)

Dokumen ini memuat panduan lengkap cara menjalankan, mengonfigurasi, melakukan deployment, memonitor, membuat cadangan (backup), serta memecahkan masalah (*troubleshooting*) aplikasi **PasarWarga**.

---

## 1. Menjalankan Aplikasi di Lingkungan Pengembangan (Development)

Seluruh dependensi pengembang (PHP 8.3, Node.js 20, PostgreSQL 16, dan Redis 7) dikemas dalam **Docker Compose**.

### A. Prasyarat Sistem
- Docker Desktop (Windows / macOS) atau Docker Engine + Docker Compose v2 (Linux).
- Git.
- Port lokal yang harus bebas: `5173` (Frontend), `8000` (Backend API), `5432` (PostgreSQL), `6379` (Redis).

### B. Langkah Instalasi Cepat
Jalankan perintah berikut di terminal (PowerShell di Windows, satu per satu):

```powershell
# 1. Salin konfigurasi environment
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env

# 2. Build dan jalankan seluruh container
docker compose up --build -d

# 3. Tunggu inisialisasi database dan jalankan seeder awal
docker exec -i marketplace_backend php artisan migrate:fresh --seed
```

Aplikasi siap diakses di:
- **Frontend SPA**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api/v1`
- **Health Check**: `http://localhost:8000/api/v1/health`

---

## 2. Variabel Lingkungan (Environment Variables)

Berikut adalah daftar variabel lingkungan utama yang dikonfigurasi pada sistem:

### Root & Backend `.env`
| Variabel | Nilai Default Dev | Keterangan & Penggunaan |
|---|---|---|
| `APP_NAME` | `PasarWarga` | Nama aplikasi. |
| `APP_ENV` | `local` | Lingkungan aplikasi (`local`, `production`, `testing`). |
| `APP_KEY` | *(ter-generate)* | Kunci enkripsi sesi dan cookie Laravel 32-karakter. |
| `APP_DEBUG` | `true` (dev) / `false` (prod) | Tampilan detail jejak error stack trace. Wajib `false` di produksi. |
| `APP_URL` | `http://localhost:8000` | URL publik backend API. |
| `SANCTUM_STATEFUL_DOMAINS` | `localhost:5173,127.0.0.1:5173` | Domain SPA klien yang diizinkan menggunakan cookie sesi stateful. |
| `DB_CONNECTION` | `pgsql` | Driver database relasional. |
| `DB_HOST` | `postgres` (docker) / `localhost` | Host database PostgreSQL. |
| `DB_PORT` | `5432` | Port database. |
| `DB_DATABASE` | `marketplace_db` | Nama database operasional development. |
| `DB_USERNAME` | `marketplace_user` | Username database. |
| `DB_PASSWORD` | `marketplace_pass` | Password database. |
| `CACHE_STORE` | `redis` | Driver cache in-memory. |
| `SESSION_DRIVER` | `redis` | Driver penyimpanan sesi pengguna. |
| `REDIS_HOST` | `redis` (docker) / `localhost` | Host cache Redis. |
| `REDIS_PORT` | `6379` | Port cache Redis. |
| `FILESYSTEM_DISK` | `public` (dev) / `s3` (prod) | Disk penyimpanan berkas media foto. |

### Frontend `.env`
| Variabel | Nilai Default Dev | Keterangan & Penggunaan |
|---|---|---|
| `VITE_API_PROXY_TARGET` | `http://backend:8000` | Alamat backend untuk reverse proxy dev server Vite. |
| `VITE_API_URL` | *(kosong)* | Prefiks rute API. Menggunakan path relatif `/api/v1` di balik proxy. |

---

## 3. Prosedur Deployment Produksi (Rancangan 100k DAU)

Pada skala produksi target 100k DAU:

### A. Frontend (Edge Hosting)
1. Build aset statis:
   ```powershell
   npm --prefix frontend run build
   ```
2. Direktori `frontend/dist/` dideploy langsung ke **Cloudflare Pages** atau **AWS S3 + CloudFront**.
3. Seluruh berkas statis ter-hash dilayani melalui edge CDN global tanpa membebani server origin.

### B. Backend (Container Kubernetes / Cloud Run)
1. Build image container produksi:
   ```bash
   docker build -f backend/Dockerfile -t registry.contoh.com/marketplace-api:v1.0.0 ./backend
   docker push registry.contoh.com/marketplace-api:v1.0.0
   ```
2. Menjalankan migrasi database via pre-deployment job atau init-container:
   ```bash
   php artisan migrate --force
   ```
3. Mengaktifkan optimasi cache framework:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
4. Melakukan rolling deployment dengan health check probe `GET /api/v1/health` untuk memastikan zero-downtime deployment.

---

## 4. Logging & Monitoring (Observability)

1. **Structured Application Logging**:
   - Log aplikasi dicatat dalam format JSON di `backend/storage/logs/laravel.log` dan dialirkan ke `stdout`/`stderr` container Docker.
   - Di produksi, log dikumpulkan oleh Vector/FluentBit menuju **Grafana Loki** atau **CloudWatch**.
2. **Monitoring Kesehatan Server**:
   - Endpoint liveness: `GET /api/v1/health`.
   - Metrik CPU/RAM dan HTTP Latency P95/P99 dipantau via **Prometheus** dan dashboard **Grafana**.
   - Notifikasi kegagalan HTTP 5xx terintegrasi ke Slack/Telegram tim teknis.

---

## 5. Prosedur Pencadangan & Pemulihan (Backup & Restore)

### A. Pencadangan Manual Database PostgreSQL (Dev / Staging)
```powershell
# Backup database marketplace_db ke file SQL
docker exec -i marketplace_postgres pg_dump -U marketplace_user -d marketplace_db > backup_marketplace.sql

# Restore file backup ke database
docker exec -i marketplace_postgres psql -U marketplace_user -d marketplace_db < backup_marketplace.sql
```

### B. Pencadangan Produksi (Target RPO < 5 Menit, RTO < 30 Menit)
- **Snapshot Harian**: Managed PostgreSQL membuat snapshot otomatis pada pukul 02.00 WIB setiap hari dengan masa simpan 30 hari.
- **WAL Continuous Archiving**: Berkas Write-Ahead Logging (WAL) dialirkan setiap 1 menit ke bucket S3 aman yang mengaktifkan enkripsi dan *object lock* (WORM).

---

## 6. Troubleshooting Masalah Umum

### 1. Database Pengujian Menghapus Data Development
- **Gejala**: Setelah menjalankan `php artisan test`, seluruh data seeder atau barang di beranda hilang dan kosong.
- **Penyebab**: Trait `RefreshDatabase` pada PHPUnit menggunakan database development `marketplace_db` karena Docker Compose meneruskan environment variable ke `$_SERVER`.
- **Solusi**:
  - Pengujian **wajib** menggunakan database terpisah `marketplace_test` yang diinisialisasi melalui `docker/postgres/init-test-db.sql`.
  - Pastikan `backend/phpunit.xml` menyertakan atribut `force="true"` pada tag:
    ```xml
    <server name="DB_DATABASE" value="marketplace_test" force="true"/>
    <env name="DB_DATABASE" value="marketplace_test" force="true"/>
    ```
  - Jika data dev terlanjur terhapus, isi kembali dengan perintah:
    ```powershell
    docker exec -i marketplace_backend php artisan migrate:fresh --seed
    ```

### 2. Line Ending CRLF vs LF pada Windows
- **Gejala**: Container backend atau postgres gagal start dengan pesan error `exec format error` atau skrip sh tidak dikenali.
- **Penyebab**: Git di Windows secara otomatis mengubah baris akhir berkas shell (`.sh`, Dockerfile) dari Line Feed (`LF`) menjadi Carriage Return + Line Feed (`CRLF`).
- **Solusi**:
  - Konfigurasi git agar mempertahankan LF:
    ```powershell
    git config --global core.autocrlf input
    ```
  - Pastikan berkas shell script (`entrypoint.sh` atau `init-test-db.sql`) disimpan dengan format line ending `LF` (UNIX).

### 3. Foto Barang Tidak Muncul (Broken Image / 404 pada `/storage/*`)
- **Gejala**: Foto barang yang diunggah berstatus 404 atau tidak dapat dimuat di frontend.
- **Penyebab**: Tautan simbolik (*symlink*) antara `storage/app/public` dan `public/storage` belum terbentuk, atau proxy Vite belum memetakan path `/storage`.
- **Solusi**:
  - Jalankan perintah pembuatan symlink di dalam container backend:
    ```powershell
    docker exec -i marketplace_backend php artisan storage:link
    ```
  - Pastikan konfigurasi `frontend/vite.config.ts` menyertakan proxy untuk rute `/storage`:
    ```typescript
    '/storage': {
      target: process.env.VITE_API_PROXY_TARGET || 'http://backend:8000',
      changeOrigin: true,
    }
    ```

### 4. Gagal Menyimpan Update Barang Berfoto (Method Spoofing)
- **Gejala**: Request mutasi form edit barang mengembalikan error 405 Method Not Allowed atau field berkas diabaikan.
- **Penyebab**: Standar PHP/Laravel native tidak mem-parsing payload `multipart/form-data` pada HTTP method `PUT` atau `PATCH`.
- **Solusi**:
  - Kirim request menggunakan method `POST` dengan menambahkan field form data `_method=PATCH`.
  - Rute API backend menggunakan `Route::match(['put', 'patch', 'post'], '/listings/{id}', ...)` untuk mendukung mutasi multipart secara transparan.
