# Rule: Backend (Laravel 12 API)

## Setup
- Folder `/backend`. API-only: `php artisan install:api`, aktifkan `statefulApi()` di `bootstrap/app.php`.
- Auth: Sanctum **SPA cookie authentication** (bukan token di localStorage). Alur: `GET /sanctum/csrf-cookie` lalu `POST /api/v1/auth/login` (`Auth::attempt` + regenerate session). Dev server frontend memproxy `/api` dan `/sanctum` ke backend sehingga same-origin (tidak perlu CORS rumit).
- Fallback: jika alur cookie memakan >30 menit untuk debug, pindah ke Sanctum personal access token dan catat trade-off-nya di `docs/decisions.md`.
- `CACHE_STORE=redis`, `SESSION_DRIVER=redis` (atau database), `QUEUE_CONNECTION=sync` untuk MVP.

## Database (PostgreSQL, migration + seeder wajib)
- `users`: id, name, email (unique), password, phone (format 62xxxxxxxxxx), location, timestamps
- `categories`: id, name, slug (unique)
- `listings`: id, user_id (FK, index), category_id (FK), title, description, price (bigInteger, Rupiah, tanpa desimal), condition (enum string: `new|like_new|good|fair`), location, status (enum: `available|sold`, default `available`), timestamps
- `listing_images`: id, listing_id (FK, cascade delete), path, position
- Index: composite `(status, category_id, created_at)`, index `user_id`, GIN trigram pada `title` (`CREATE EXTENSION IF NOT EXISTS pg_trgm`) untuk pencarian ILIKE cepat.
- Gunakan PHP backed Enum untuk condition & status.
- Seeder: 8 kategori (Sepeda, Perkakas, Hobi, Elektronik, Rumah Tangga, Otomotif, Olahraga, Lainnya), 3 user demo (password dummy, tulis di README), ±30 listing realistis berbahasa Indonesia dengan foto dummy (`https://picsum.photos/seed/<id>/800/600` boleh; resource harus menangani path lokal maupun URL penuh).

## Endpoint (semua di `/api/v1`)
| Method | Path | Auth |
|---|---|---|
| POST | /auth/register, /auth/login | publik |
| POST | /auth/logout | ya |
| GET | /me | ya |
| GET | /categories | publik |
| GET | /listings (q, category, condition, status default `available`, sort, page, per_page) | publik |
| GET | /listings/{id} | publik |
| POST | /listings (multipart, `images[]`) | ya |
| PUT/PATCH | /listings/{id} | ya + pemilik |
| DELETE | /listings/{id} | ya + pemilik |
| PATCH | /listings/{id}/status | ya + pemilik |
| GET | /me/listings | ya |
| GET | /users/{id} (profil publik + listing) | publik |

## Konvensi
- Validasi lewat Form Request; otorisasi lewat `ListingPolicy` (cek kepemilikan → cegah IDOR). Jangan percaya `user_id` dari request.
- Response lewat API Resource; **jangan pernah** mengembalikan email/password/phone mentah ke publik kecuali kebutuhan tombol WhatsApp (kirim `whatsapp_url` atau phone penjual di detail saja).
- Pagination (default 12/halaman, maks 50). Hindari N+1: `with(['images','category','user:id,name,location'])`.
- Error format konsisten JSON: `{ "message": "...", "errors": { field: [..] } }` dengan status code yang benar (401, 403, 404, 422, 429).
- Upload foto: maks 5 file, 2 MB/file, `jpg,jpeg,png,webp`, nama file acak, simpan lewat disk dari `FILESYSTEM_DISK` (lihat rule storage-cdn). Hapus file saat listing dihapus.
- Rate limiting: `login`/`register` 5/menit per IP+email, upload 20/jam per user, API umum 120/menit. Gunakan limiter bawaan Laravel (Redis).
- Cache (Redis): daftar kategori (TTL panjang), detail listing (TTL pendek, invalidate saat update/hapus/ubah status). Jelaskan strategi di docs.
- Security: password hash bawaan Laravel (bcrypt/argon2), `APP_DEBUG=false` di production, security headers dasar, tidak ada raw query dengan input user.
- Test: minimal feature test untuk auth, CRUD listing, otorisasi pemilik, dan filter/search (Pest atau PHPUnit). Jalankan `php artisan test`.
- Format kode: Laravel Pint.
