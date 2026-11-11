# Kebijakan & Implementasi Keamanan (Security)

Dokumen ini menjelaskan implementasi teknis kontrol keamanan aplikasi **PasarWarga**, mencakup autentikasi, otorisasi, validasi input, perlindungan API, manajemen rahasia, dan perlindungan privasi data pengguna.

---

## 1. Autentikasi (Sanctum SPA Cookie-Based Auth)

Aplikasi mengimplementasikan Laravel Sanctum dalam mode **SPA Authentication**, yang menggunakan mekanisme sesi berbasis cookie bawaan web, bukan menyimpan access token di browser `localStorage`.

### Keunggulan Arsitektur:
- **Kebal terhadap Pencurian Token via XSS**:
  - Cookie sesi (`marketplace_session`) dikirimkan dengan atribut `HttpOnly`, sehingga skrip JavaScript sisi klien (termasuk potensi injeksi XSS berbahaya) tidak memiliki akses ke nilai cookie.
- **Konfigurasi Cookie Aman**:
  - `HttpOnly`: Mencegah pembacaan cookie oleh skrip browser.
  - `SameSite=Lax` (atau `Strict` pada produksi): Mencegah pengiriman cookie otomatis dari situs pihak ketiga yang mencurigakan.
  - `Secure`: Menjamin cookie hanya ditransmisikan melalui kanal terenkripsi HTTPS di lingkungan produksi.
- **Proteksi CSRF (Cross-Site Request Forgery)**:
  - Sebelum login atau registrasi, frontend React memanggil endpoint `/sanctum/csrf-cookie`.
  - Backend menerbitkan cookie `XSRF-TOKEN` terenkripsi yang dapat dibaca JavaScript.
  - Klien Axios secara otomatis membaca token tersebut dan menyertakannya pada header HTTP `X-XSRF-TOKEN` pada setiap mutasi state (`POST`, `PUT`, `PATCH`, `DELETE`).
  - Middleware `VerifyCsrfToken` Laravel memvalidasi kecocokan token sebelum permintaan dieksekusi.

---

## 2. Otorisasi & Pencegahan IDOR (Insecure Direct Object Reference)

Seluruh aksi modifikasi data dilindungi oleh otorisasi berbasis kebijakan (*Laravel Authorization Policies*) yang ketat:

### A. Kebijakan Listing (`ListingPolicy`)
- Setiap operasi mutasi barang (`update`, `delete`, `updateStatus`) mewajibkan pengecekan kepemilikan:
  ```php
  public function update(User $user, Listing $listing): bool
  {
      return $user->id === $listing->user_id;
  }
  ```
- Controller memanggil `$this->authorize('update', $listing);`. Permintaan dari pengguna yang bukan pemilik sah langsung ditolak dengan kode status HTTP `403 Forbidden`.

### B. Validasi Kepemilikan Relasi Foto (`delete_image_ids`)
- Saat pengguna mengedit barang dan memilih foto yang ingin dihapus, terdapat potensi kerentanan IDOR di mana penyerang dapat mengirimkan array ID foto milik barang pengguna lain.
- Sistem mengamankannya melalui aturan validasi scoped pada `UpdateListingRequest`:
  ```php
  'delete_image_ids.*' => [
      'integer',
      Rule::exists('listing_images', 'id')->where(function ($query) use ($listingId) {
          $query->where('listing_id', $listingId);
      }),
  ],
  ```
  Aturan ini menjamin pengguna hanya dapat menghapus foto yang benar-benar terasosiasi dengan listing miliknya.

---

## 3. Validasi Input & Sanitasi Data

Prinsip *Defense-in-Depth* diterapkan dengan validasi berlapis di sisi klien dan server:

1. **Client-Server Validation Parity**:
   - Di frontend, skema **Zod** memvalidasi tipe data, format nomor telepon, ukuran file, dan kelengkapan field sebelum request dikirimkan.
   - Di backend, **Laravel Form Request** (`StoreListingRequest`, `UpdateListingRequest`, `RegisterRequest`, `LoginRequest`) memvalidasi ulang seluruh payload secara independen. Tidak ada asumsi bahwa data dari klien aman.
2. **Pencegahan SQL Injection**:
   - Seluruh query basis data menggunakan **Eloquent ORM** dan query builder Laravel dengan prepared statements / parameter binding otomatis (`$pdo->prepare()`).
   - Tidak ada konstruksi string SQL mentah yang menggabungkan variabel input pengguna.
3. **Penyaringan & Validasi Berkas Media**:
   - Memvalidasi MIME type berkas riil di sisi server (`mimes:jpg,jpeg,png,webp`).
   - Membatasi ukuran berkas maksimal 2048 KB (2 MB) per foto dan maksimal 5 foto per listing.
   - Penamaan file menggunakan UUID acak (`Str::uuid() . '.' . $extension`) untuk mencegah penimpaan file (*file overwrite*), path traversal, atau eksekusi nama berkas berbahaya.
   - Berkas disimpan di direktori privat `storage/app/public/listings/` yang tidak dapat mengeksekusi skrip PHP secara langsung.

---

## 4. Proteksi API & Pembatasan Frekuensi (Rate Limiting)

Untuk mengamankan API dari serangan *Denial of Service* (DoS), credential stuffing, dan eksploitasi bandwidth:

| Rute Endpoint | Batasan (Throttle) | Tujuan Keamanan |
|---|---|---|
| `POST /api/v1/auth/login` | 5 request / menit per IP | Mencegah brute-force password cracking. |
| `POST /api/v1/auth/register` | 5 request / menit per IP | Mencegah spam pembuatan akun bot otomatis. |
| `POST /api/v1/listings` | 10 request / menit per User | Mencegah pembanjiran upload media (*storage flooding*). |
| Seluruh Rute API Publik | 60 request / menit per IP | Proteksi scraping agresif dan DoS origin server. |

Implementasi rate limiting ditenagai oleh store in-memory **Redis** (`RateLimiter::for(...)`), memberikan respons instan kode status HTTP `429 Too Many Requests` beserta header `Retry-After`.

---

## 5. Pengelolaan Kredensial Sensitif (Secret Management)

1. **Zero Secret in Codebase**:
   - Tidak ada kredensial, API key, password database, atau app key yang di-*hardcode* ke dalam repositori kode sumber Git.
   - Berkas konfigurasi `.env` telah didaftarkan dalam `.gitignore`.
2. **Standardisasi `.env.example`**:
   - Repositori hanya menyertakan `.env.example` yang memuat placeholder aman untuk memudahkan setup lokal.
3. **Rancangan Produksi**:
   - Di lingkungan cloud, variabel rahasia diinjeksikan secara terenkripsi saat runtime menggunakan layanan cloud secret manager (**AWS Secrets Manager**, **GCP Secret Manager**, atau **HashiCorp Vault**) dan tidak disimpan dalam image container Docker.

---

## 6. Perlindungan Privasi Data Pengguna (Data Protection & PII)

1. **Hasing Kata Sandi**:
   - Seluruh password di-hash secara satu arah menggunakan algoritma modern standar industri (**Argon2id** atau **Bcrypt** dengan work factor tinggi). Password dalam bentuk plain text tidak pernah disimpan atau dicatat di log.
2. **Perlindungan Data Pribadi (PII) di Endpoint Publik**:
   - **Profil Pengguna Publik (`GET /api/v1/users/{id}`)**:
     - Hanya menampilkan data publik: nama, lokasi umum (kota/kecamatan), tanggal bergabung, dan daftar barang yang dijual.
     - **Email dan Nomor WhatsApp TIDAK PERNAH diekspos** di endpoint profil untuk melindungi pengguna dari profiling data pribadi dan pesan spam.
   - **Kontak Penjual di Detail Barang (`GET /api/v1/listings/{id}`)**:
     - Nomor HP asli tidak dikembalikan sebagai string mentah.
     - Backend hanya menyertakan URL tautan deep link WhatsApp yang terformat (`https://wa.me/{phone}?text=...`).
     - Jika status barang telah ditandai **"sold" (terjual)**, URL kontak WhatsApp **dinonaktifkan secara otomatis** oleh backend untuk menghentikan pesan masuk yang tidak relevan kepada penjual.
