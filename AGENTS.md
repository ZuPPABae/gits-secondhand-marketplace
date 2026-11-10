# AGENTS.md — Marketplace Barang Bekas Komunitas (GITS Fullstack Assignment)

Mini project 1 hari: MVP marketplace secondhand untuk komunitas bapak-bapak + rancangan arsitektur untuk ±100.000 DAU + dokumentasi teknis. Yang dinilai: fitur inti yang jalan, keputusan teknis beserta alasannya, dan dokumentasi yang jelas.

Aturan detail ada di `.agent/rules/` (backend, frontend, design, storage-cdn, docs-git). Workflow di `.agent/workflows/` (`/build-mvp`, `/write-docs`, `/final-check`).

## Stack (jangan ganti tanpa alasan kuat)
- Backend: Laravel 12 (PHP 8.3), REST API versi `/api/v1`, Laravel Sanctum
- Frontend: React 18/19 + Vite + TypeScript, Tailwind CSS v4, React Router, TanStack Query
- Database: PostgreSQL 16 · Cache/rate limit: Redis 7
- Dev: Docker Compose (backend, frontend, postgres, redis)
- Production (hanya di dokumentasi/diagram, tidak perlu dibangun): Cloudflare (DNS/CDN/WAF), container + load balancer, managed PostgreSQL + read replica, Redis managed, object storage S3/R2

## Struktur repo
```
/backend        Laravel 12 API
/frontend       React + Vite SPA
/docs           dokumentasi + diagram Mermaid
/screenshots    screenshot aplikasi
docker-compose.yml
.env.example    (root, untuk compose) + backend/.env.example + frontend/.env.example
README.md
```

## Fitur wajib (urutan prioritas)
1. Auth: register, login, logout
2. Daftar barang (grid) + pagination + search + filter kategori & kondisi
3. Detail barang + info penjual + tombol WhatsApp (pesan awal otomatis)
4. Pasang barang (nama, kategori, harga, kondisi, deskripsi, lokasi, foto)
5. Kelola listing milik sendiri: lihat, edit, hapus
6. Ubah status: tersedia / terjual
7. Profil user: info dasar + daftar listing

## Di luar scope (JANGAN dibangun)
Chat in-app, pembayaran, admin panel, favorit/wishlist, review/rating, notifikasi, social login, multi-bahasa. Catat sebagai "future work" di docs jika relevan.

## Prinsip kerja
- Waktu terbatas: selesaikan fitur inti end-to-end dulu, polish belakangan. Jangan menambah fitur di luar daftar.
- Kode sederhana dan mudah dibaca; hindari abstraksi berlebihan dan dependency yang tidak perlu.
- Setiap keputusan teknis non-trivial dicatat di `docs/decisions.md` (alasan + trade-off).
- Bahasa: UI dan dokumentasi dalam Bahasa Indonesia; kode, nama variabel, nama tabel/kolom, dan commit message dalam Bahasa Inggris.
- Tidak ada secret/credential/data pribadi asli di repo. Hanya `.env.example`.
- Jalankan perintah test/lint setelah perubahan signifikan; perbaiki sampai hijau sebelum lanjut.

## Pelajaran dan aturan tambahan
- Test HARUS memakai database terpisah (`marketplace_test`) dengan `force="true"`; jangan pernah menjalankan test terhadap database dev (`marketplace_db`).
- Shell Windows adalah PowerShell: jalankan perintah satu per satu, tanpa `&&`.
- Setelah tiap fase atau sub-fase, perbarui `docs/PROGRESS.md` (apa yang selesai, apa berikutnya, keputusan penting, masalah yang diketahui) agar agent lain bisa melanjutkan hanya dengan membaca file itu.
- Hemat kuota: kerjakan satu bagian sempit per sesi, jangan uji end-to-end panjang, cukup test/lint/build.

## Definition of Done
- `docker compose up --build` lalu aplikasi bisa dibuka di `http://localhost:5173` dengan data seeder.
- Semua fitur wajib bisa dipakai dari UI.
- README + semua dokumen di `docs/` terisi, diagram Mermaid ter-render di GitHub.
- `.env.example` lengkap, tidak ada secret ter-commit, ada screenshot di `/screenshots`.
