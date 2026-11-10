# Status Progres Proyek: Marketplace Barang Bekas Komunitas

Dokumen ini mencatat status pengerjaan, ringkasan keputusan, akun demo, instruksi pengujian, dan pedoman untuk agen/developer yang melanjutkan pekerjaan.

---

## 1. Status Fase & Milestone

| Fase | Deskripsi | Status | Catatan |
|---|---|---|---|
| **Fase 0** | Fondasi & Docker Compose (Backend, Frontend, Postgres, Redis) | **Selesai** | Kontainer Docker aktif, konfigurasi jaringan & volume siap. |
| **Fase 1** | Skema Database, Migration, Enums, Trigram Index, Seeder | **Selesai** | 8 kategori, 3 user demo, 30 listing terisi. |
| **Fase 2** | Auth Sanctum SPA Cookie (Register, Login, Logout, /me) | **Selesai** | CSRF-cookie, rate limiting, ProtectedRoute & GuestRoute. |
| **Fase 3** | Frontend Katalog & Detail Listing | **Selesai** | Grid barang, filter kategori & kondisi, pagination, debounced search, WhatsApp link generator. |
| **Fase 4a** | Backend Listing CRUD, Upload Foto, Authorization & Policy | **Selesai** | Store/Update/Destroy/Status listing, validasi kepemilikan relasi foto, cache TTL 5m & invalidasi. |
| **Fase 4b** | Frontend Form Pasang & Edit Barang | **Selesai** | Halaman `/pasang` & `/listings/:id/edit`, validasi Zod client-server parity, preview foto, delete image, sinkronisasi select kategori/kondisi. |
| **Fase 4c** | Frontend Listing Saya (`/my-listings`) & Profil (`/profile`) | **Berikutnya** | Halaman daftar listing milik sendiri, toggle status terjual/tersedia, tombol hapus dengan dialog konfirmasi, dan profil publik/privat. |
| **Fase 5** | Polish, Error Boundaries, Toast Feedback, Edge Cases | Akan Datang | Feedback aksi, handling offline/timeout, UX polish. |
| **Docs** | Finalisasi `/write-docs` & `/final-check` | Akan Datang | Melengkapi dokumen teknis dan verifikasi akhir. |

---

## 2. Kredensial Akun Demo (Seeder)

Semua akun demo dibuat secara otomatis oleh `Database\Seeders\UserSeeder`:

| Nama | Email | Password | No. HP (WhatsApp) | Lokasi |
|---|---|---|---|---|
| **Budi Santoso** | `budi@example.com` | `password123` | `6281234567890` | Tebet, Jakarta Selatan |
| **Siti Rahma** | `siti@example.com` | `password123` | `6281298765432` | Serpong, Tangerang Selatan |
| **Ahmad Hidayat** | `ahmad@example.com` | `password123` | `6281311223344` | Sukajadi, Bandung |

---

## 3. Cara Menjalankan Pengujian & Audit

Semua perintah dijalankan di PowerShell secara terpisah (satu per satu, **tanpa** `&&`):

### A. Backend Test & Code Style
```powershell
# Jalankan test suite PHPUnit (51 tests)
docker exec -i marketplace_backend php artisan test

# Audit format kode PSR-12 / Laravel Pint
docker exec -i marketplace_backend ./vendor/bin/pint --test

# Jalankan seeder ulang pada database dev bila diperlukan
docker exec -i marketplace_backend php artisan migrate:fresh --seed
```

### B. Frontend Lint & Typecheck / Build
```powershell
# ESLint check
docker exec -i marketplace_frontend npm run lint

# TypeScript compile & Vite build
docker exec -i marketplace_frontend npm run build
```

---

## 4. Keputusan Penting & Masalah yang Diketahui

1. **Isolasi Database Pengujian (`marketplace_test`)**:
   - PHPUnit sebelumnya menggunakan database dev (`marketplace_db`), sehingga `RefreshDatabase` menghapus seluruh data dev setiap pengujian dijalankan.
   - Variabel environment yang disuntikkan oleh Docker Compose ke dalam kontainer dipetakan ke `$_SERVER`, yang mengabaikan tag `<env>` biasa pada `phpunit.xml`.
   - Solusi: Database `marketplace_test` dibuat terpisah, diinisialisasi otomatis via `docker/postgres/init-test-db.sql`. Konfigurasi `backend/phpunit.xml` menggunakan `<server force="true">` dan `<env force="true">`, didukung oleh `backend/.env.testing`.

2. **Pengiriman Form Data dengan File (Multipart Update)**:
   - PHP dan framework Laravel native tidak mem-parsing payload `multipart/form-data` pada request HTTP method `PUT` atau `PATCH`.
   - Solusi: Mutasi update pada frontend menggunakan method `POST` dengan field method spoofing `_method=PATCH`. Rute API `Route::match(['put', 'patch', 'post'], ...)` mendukung permintaan ini secara transparan.

3. **Proxy Aset Gambar Lokal (`/storage`)**:
   - File foto lokal yang diunggah disimpan di `storage/app/public` dan diakses melalui `/storage/...`.
   - Agar frontend Vite dev server (`http://localhost:5173`) dapat memuat gambar yang dikembalikan backend tanpa konflik CORS, proxy Vite menyertakan rule untuk `/storage` yang diteruskan ke `http://backend:8000`.

4. **Validasi Kepemilikan Relasi Foto (`delete_image_ids`)**:
   - Menghindari kerentanan IDOR (Insecure Direct Object Reference) di mana user dapat mengirim ID foto barang milik pengguna lain saat mengedit barang miliknya sendiri. Form request `UpdateListingRequest` memvalidasi ID foto dengan rule scoped ke ID listing aktif.
