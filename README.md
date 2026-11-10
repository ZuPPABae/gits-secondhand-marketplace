# Marketplace Barang Bekas Komunitas

MVP platform jual-beli barang bekas untuk komunitas, dibangun sebagai fullstack assignment dengan arsitektur yang siap di-scale hingga ±100.000 DAU.

## Fitur

| # | Fitur | Status |
|---|-------|--------|
| 1 | Auth: register, login, logout | ✅ |
| 2 | Daftar barang (grid) + pagination + search + filter kategori & kondisi | ✅ |
| 3 | Detail barang + info penjual + tombol WhatsApp | ✅ |
| 4 | Pasang barang (nama, kategori, harga, kondisi, deskripsi, lokasi, foto) | ✅ |
| 5 | Kelola listing milik sendiri: lihat, edit, hapus | ✅ |
| 6 | Ubah status: tersedia / terjual | ✅ |
| 7 | Profil user: info dasar + daftar listing | ✅ |

> Fitur di luar scope (future work): chat in-app, pembayaran, admin panel, favorit/wishlist, review/rating, notifikasi, social login.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12 (PHP 8.3), REST API `/api/v1`, Laravel Sanctum |
| Frontend | React 18 + Vite + TypeScript, Tailwind CSS v4, React Router, TanStack Query |
| Database | PostgreSQL 16 |
| Cache / Rate Limit | Redis 7 |
| Dev Environment | Docker Compose |
| Production (rancangan) | Cloudflare CDN/WAF, container + load balancer, managed PostgreSQL + read replica, Redis managed, object storage S3/R2 |

## Struktur Proyek

```
gits-secondhand-marketplace/
├── backend/            # Laravel 12 API
├── frontend/           # React + Vite SPA
├── docs/               # Dokumentasi & diagram Mermaid
│   ├── decisions.md        # Architecture Decision Records (ADR)
│   ├── architecture-app.md # Diagram arsitektur aplikasi (dev)
│   ├── architecture-infra.md # Diagram arsitektur infrastruktur (prod)
│   ├── api.md              # Dokumentasi endpoint API
│   ├── database.md         # Skema database
│   ├── scaling-reliability.md
│   ├── security.md
│   └── operations.md
├── screenshots/        # Screenshot aplikasi
├── docker-compose.yml
├── .env.example        # Konfigurasi env untuk Docker Compose
└── README.md
```

## Prasyarat

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (sudah include Docker Compose)
- Port `5173`, `8000`, `5432`, `6379` tidak dipakai proses lain

## Cara Menjalankan

```bash
# 1. Clone repo
git clone <repo-url>
cd gits-secondhand-marketplace

# 2. Salin file env
cp .env.example .env

# 3. Build dan jalankan semua container
docker-compose up --build
```

Aplikasi bisa dibuka di **http://localhost:5173**

Backend API tersedia di **http://localhost:8000/api/v1**

Health check: **http://localhost:8000/up**

## Akun Demo

> ⚠️ Akun demo akan tersedia setelah seeder dijalankan (Fase 1). Jalankan `docker-compose exec backend php artisan db:seed` setelah container berjalan.

| Nama | Email | Password |
|------|-------|----------|
| Budi Santoso | budi@example.com | password123 |
| Siti Rahayu | siti@example.com | password123 |
| Ahmad Fauzi | ahmad@example.com | password123 |

## Dokumentasi

Semua dokumentasi teknis ada di folder [`/docs`](./docs/):

- [`decisions.md`](./docs/decisions.md) — Architecture Decision Records
- [`architecture-app.md`](./docs/architecture-app.md) — Diagram arsitektur aplikasi
- [`architecture-infra.md`](./docs/architecture-infra.md) — Diagram infrastruktur produksi
- [`api.md`](./docs/api.md) — Referensi endpoint API
- [`database.md`](./docs/database.md) — Skema database & ERD
- [`scaling-reliability.md`](./docs/scaling-reliability.md) — Strategi scaling & reliability
- [`security.md`](./docs/security.md) — Implementasi keamanan
- [`operations.md`](./docs/operations.md) — Panduan operasional

## Screenshots

Screenshot tersedia di folder [`/screenshots`](./screenshots/) setelah aplikasi dijalankan.

## Lisensi

Proyek ini dibuat untuk keperluan assignment. Tidak untuk penggunaan komersial.
