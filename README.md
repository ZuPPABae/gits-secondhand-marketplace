# PasarWarga — Marketplace Barang Bekas Komunitas

**PasarWarga** adalah Minimum Viable Product (MVP) platform jual-beli barang bekas untuk komunitas warga/bapak-bapak, dibangun sebagai Fullstack Assignment dengan rancangan arsitektur terukur untuk mendukung skala **±100.000 Daily Active Users (DAU)**.

> 📢 **Pernyataan Batasan MVP (Transparansi Teknis)**:  
> Komponen cloud berbayar seperti **Cloudflare CDN/WAF**, **Database Read Replica**, **PgBouncer**, dan **Object Storage S3/R2** dirancang secara komprehensif pada dokumen arsitektur dan dapat diaktifkan melalui *environment variable*, namun **tidak di-deploy pada pengujian lokal MVP**. Lingkungan MVP berjalan secara utuh dan mandiri di dalam **Docker Compose**.

---

## 1. Fitur Utama

| No | Fitur Utama | Status | Deskripsi |
|---|---|---|---|
| 1 | **Autentikasi Pengguna** | ✅ Selesai | Registrasi akun baru, login, dan logout via Laravel Sanctum SPA Cookie Auth (`httpOnly`). |
| 2 | **Katalog & Pencarian** | ✅ Selesai | Grid responsif (1 kolom di HP, 2–4 di desktop), pencarian trigram cepat, filter kategori & kondisi, pengurutan harga, serta paginasi URL stateful. |
| 3 | **Detail Barang & WhatsApp** | ✅ Selesai | Galeri multi-foto, rincian harga, info penjual, dan tombol langsung ke WhatsApp (`wa.me`) dengan template pesan otomatis. |
| 4 | **Pasang Barang Baru** | ✅ Selesai | Form terproteksi validasi Zod + Laravel Form Request, preview multi-foto (maks 5 foto), dan upload biner multipart. |
| 5 | **Kelola Listing Saya** | ✅ Selesai | Daftar inventaris pribadi pemilik: navigasi edit, ubah status, dan hapus barang dengan dialog konfirmasi aman. |
| 6 | **Manajemen Status Barang** | ✅ Selesai | Beralih antara status **Tersedia** dan **Terjual** secara instan; kontak WhatsApp otomatis dinonaktifkan saat barang terjual. |
| 7 | **Profil Pengguna** | ✅ Selesai | Halaman profil publik penjual beserta daftar barang yang dijual, dengan perlindungan privasi ketat (tanpa membocorkan nomor telepon atau email). |

*Fitur di luar cakupan (Out of Scope / Future Work)*: Chat in-app, payment gateway/rekening bersama, panel admin, favorit/wishlist, ulasan/rating bintang, push notification, dan social login.

---

## 2. Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query (React Query), Lucide React.
- **Backend**: Laravel 12 (PHP 8.3), REST API versi `/api/v1`, Laravel Sanctum SPA Cookie Auth.
- **Basis Data**: PostgreSQL 16 (dengan ekstensi `pg_trgm` dan GIN index untuk pencarian teks).
- **Cache & Rate Limit**: Redis 7 (In-memory cache detail listing TTL 5m, shared session, IP rate limiter).
- **Dev Environment**: Docker Compose (multi-container: `frontend`, `backend`, `postgres`, `redis`).
- **Production Architecture (Rancangan)**: Cloudflare Anycast DNS, CDN & WAF, Container Autoscaling (Kubernetes/Cloud Run), PgBouncer connection pooler, Managed PostgreSQL Primary + Read Replica, Cloudflare R2 / AWS S3 Object Storage.

---

## 3. Struktur Direktori Proyek

```
gits-secondhand-marketplace/
├── backend/                # Laravel 12 REST API
│   ├── app/                # Controllers, Models, Requests, Resources, Policies
│   ├── database/           # Migrations & Seeders
│   └── routes/api.php      # Definisi rute RESTful /api/v1
├── frontend/               # React 18 + Vite SPA
│   ├── src/                # Components, Pages, Features, API client, Lib
│   └── public/             # Favicon SVG & aset publik
├── docs/                   # Dokumentasi Teknis & Arsitektur
│   ├── decisions.md        # Architecture Decision Records (ADR)
│   ├── architecture-app.md # Arsitektur aplikasi & alur komponen
│   ├── architecture-infra.md # Arsitektur infrastruktur 100k DAU (VPC, Replica, CDN)
│   ├── scaling-reliability.md # Asumsi beban, perhitungan matematika, & mitigasi
│   ├── security.md         # Kebijakan auth, otorisasi IDOR, CSRF, & data privacy
│   ├── database.md         # Skema relasional, ERD Mermaid, & strategi indexing
│   ├── api.md              # Spesifikasi lengkap seluruh endpoint REST API
│   ├── operations.md       # Panduan deployment, backup, & troubleshooting
│   └── PROGRESS.md         # Catatan milestone pengerjaan proyek
├── screenshots/            # Tangkapan layar antarmuka aplikasi
├── docker-compose.yml      # Orkestrasi multi-container Docker
├── .env.example            # Konfigurasi environment template
└── README.md
```

---

## 4. Prasyarat Sistem

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (versi 24+) yang sudah menyertakan Docker Compose v2.
- Git.
- Port lokal yang tidak sedang terpakai: `5173` (Frontend), `8000` (Backend), `5432` (PostgreSQL), dan `6379` (Redis).

---

## 5. Cara Menjalankan Aplikasi

Jalankan perintah berikut di terminal (PowerShell di Windows, baris per baris):

### 1. Salin Berkas Environment
```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

### 2. Build dan Jalankan Container
```powershell
docker compose up --build -d
```

### 3. Jalankan Database Seeder
Container backend akan secara otomatis menjalankan migrasi dan symlink storage (`php artisan storage:link`). Untuk memastikan database terisi dengan data demo awal:
```powershell
docker exec -i marketplace_backend php artisan migrate:fresh --seed
```

Aplikasi siap digunakan di:
- **Aplikasi Web**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **Liveness Probe**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 6. Kredensial Akun Demo (Seeder)

Database telah dilengkapi 3 akun demo dengan data profil dan barang riil:

| Nama Pengguna | Alamat Email | Kata Sandi | Nomor WhatsApp | Wilayah Domisili |
|---|---|---|---|---|
| **Budi Santoso** | `budi@example.com` | `password123` | `6281234567890` | Tebet, Jakarta Selatan |
| **Siti Rahma** | `siti@example.com` | `password123` | `6281298765432` | Serpong, Tangerang Selatan |
| **Ahmad Hidayat** | `ahmad@example.com` | `password123` | `6281311223344` | Sukajadi, Bandung |

---

## 7. Pengujian & Audit Kualitas Kode

Pengujian unit dan integrasi otomatis berjalan pada basis data terisolasi (`marketplace_test`), sehingga **tidak akan menghapus atau mencemari** data pengujian pada `marketplace_db`.

```powershell
# 1. Jalankan PHPUnit Test Suite (51 tests)
docker exec -i marketplace_backend php artisan test

# 2. Audit Format Kode Standar PSR-12 (Laravel Pint)
docker exec -i marketplace_backend ./vendor/bin/pint --test

# 3. Linter Frontend TypeScript & React (ESLint)
npm --prefix frontend run lint

# 4. Typecheck & Kompilasi Build Frontend (Vite)
npm --prefix frontend run build
```

---

## 8. Indeks Dokumentasi Teknis

Dokumentasi arsitektur dan teknis mendalam tersedia lengkap di folder [`/docs`](./docs/):

1. [docs/architecture-app.md](./docs/architecture-app.md) — Diagram alur komponen aplikasi, REST API, Sanctum, dan integrasi WhatsApp.
2. [docs/architecture-infra.md](./docs/architecture-infra.md) — Desain infrastruktur 100k DAU, VPC subnet, Cloudflare CDN/WAF, autoscaling, dan database replica.
3. [docs/scaling-reliability.md](./docs/scaling-reliability.md) — Analisis matematis beban 100k DAU, multi-tier caching, indexing, dan estimasi bandwidth.
4. [docs/security.md](./docs/security.md) — Kontrol keamanan autentikasi cookie, pencegahan IDOR, proteksi CSRF, dan data privacy.
5. [docs/database.md](./docs/database.md) — Skema database, Entity Relationship Diagram (ERD), dan optimasi PostgreSQL GIN trigram.
6. [docs/api.md](./docs/api.md) — Spesifikasi lengkap seluruh endpoint REST API, parameter, response, dan kode error.
7. [docs/decisions.md](./docs/decisions.md) — Architecture Decision Records (ADR 001 - 011) serta rencana Future Work.
8. [docs/operations.md](./docs/operations.md) — Panduan operasional deployment, logging, backup, dan solusi troubleshooting.

---

## 9. Tangkapan Layar (Screenshots)

Tangkapan layar tampilan antarmuka aplikasi disimpan pada direktori [`/screenshots`](./screenshots/) mencakup:
- Beranda Katalog Barang & Filter Pencarian
- Detail Barang & Tautan WhatsApp
- Formulir Pasang & Edit Barang
- Manajemen Listing Saya & Ubah Status
- Tampilan Responsif Mobile
