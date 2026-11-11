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
| **Fase 4c** | Frontend Listing Saya (`/me/listings`) & Profil (`/users/:id`) | **Selesai** | Kelola status (Tersedia/Terjual), hapus konfirmasi dialog, navigasi edit, profil publik dengan grid listing, tanpa email/nomor HP demi privasi, tautan profil penjual di detail barang. |
| **Fase 5** | Polish, UI Audit, Responsive Layout, State Consistency | **Selesai** | Audit palet zinc + indigo, 1 kolom di HP, navbar responsif tanpa overflow, state skeleton/error/coba-lagi/empty, browser title per halaman, SVG favicon, keyboard focus ring. |
| **Docs** | Finalisasi Dokumentasi Teknis (`/write-docs`) | **Selesai** | Seluruh dokumen di `/docs` (arsitektur, scaling 100k DAU, security, database ERD, API spesifikasi, ADR + future work, operations) dan README.md telah lengkap. |
| **Final** | Verifikasi Akhir (`/final-check`) | **Berikutnya** | Verifikasi test, lint, build, dan tangkapan layar screenshot. |

---

## 2. Kredensial Akun Demo (Seeder)

Semua akun demo dibuat secara otomatis oleh `Database\Seeders\UserSeeder`:

| Nama | Email | Password | No. HP (WhatsApp Placeholder) | Lokasi |
|---|---|---|---|---|
| **Budi Santoso** | `budi@example.com` | `password123` | `628000000000` | Jakarta Selatan |
| **Siti Rahayu** | `siti@example.com` | `password123` | `628000000000` | Bandung |
| **Ahmad Fauzi** | `ahmad@example.com` | `password123` | `628000000000` | Surabaya |

*Catatan: Nomor WhatsApp demo menggunakan placeholder `628000000000` via `config/demo.php`. Dapat ditimpa dengan nomor sendiri via environment variable `DEMO_WHATSAPP_NUMBER` lalu jalankan seeder ulang.*

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

5. **Polish UI Responsif & Konfigurasi WhatsApp Demo**:
   - Navbar di layar sempit (<400px hingga 320px): logo disederhanakan menjadi ikon saja, tombol "Pasang Barang" menjadi tombol ikon `+` ber-aria-label, dan dropdown akun menjadi avatar tanpa teks agar tidak ada horizontal overflow.
   - Halaman edit listing (`/listings/:id/edit`): tombol/tautan Kembali dan Batal diarahkan ke `/me/listings`. Setelah berhasil update, redirect ke `/me/listings` dengan toast sukses.
   - Halaman Listing Saya (`/me/listings`): tombol aksi tiap item dirapikan menjadi satu baris sejajar rata kanan di desktop (Edit, Tandai Status, Hapus ikon) dan tersusun rapi dengan lebar sama di mobile.
   - Konfigurasi Demo WhatsApp: seluruh user demo menggunakan nomor placeholder `628000000000` via `config/demo.php` (`whatsapp_number`), dapat ditimpa via `DEMO_WHATSAPP_NUMBER`. Dokumentasi di `.agent/rules/backend-laravel.md`, `README.md`, dan `docs/operations.md` telah diperbarui.

6. **Toggle Tampilan Grid/List di Halaman Home**:
   - Komponen baru `ListingRow` di `frontend/src/components/ListingRow.tsx`: tampilan baris horizontal (foto kecil kiri, judul, harga, kondisi, lokasi, badge) tanpa duplikasi kode.
   - Skeleton baru `ListingRowSkeleton` di `Skeleton.tsx` mengikuti layout baris.
   - Segmented control dua tombol ikon (LayoutGrid/LayoutList lucide-react) dengan `aria-label` dan `aria-pressed`, tombol aktif berwarna indigo.
   - State view disimpan di URL `?view=list` dan `localStorage` key `pasar_warga_view_mode` (dibungkus try/catch).
   - Skeleton loading mengikuti mode aktif (grid vs list).
   - `.agent/rules/frontend-react.md` diperbarui pada bagian Home.



