# Keamanan (Security)

> Dokumen ini mencatat implementasi keamanan yang diterapkan dan yang direncanakan untuk produksi.

---

## Autentikasi & Otorisasi

### Sanctum SPA Cookie Auth

- Session disimpan di **httpOnly cookie** → tidak dapat diakses JavaScript, kebal XSS.
- **CSRF protection** via `X-XSRF-TOKEN` header yang dibaca dari `XSRF-TOKEN` cookie (non-httpOnly).
- Laravel `auth:sanctum` middleware memvalidasi session setiap request.
- Logout menghapus session di server dan cookie di browser.

### Authorization

- Semua endpoint yang memodifikasi data memeriksa kepemilikan resource:
  ```php
  // Contoh: hanya pemilik listing yang bisa edit/hapus
  Gate::authorize('update', $listing); // atau
  if ($listing->user_id !== auth()->id()) abort(403);
  ```
- Policy Laravel digunakan untuk aturan otorisasi yang lebih kompleks.

---

## Input Validation

- Semua input divalidasi di Laravel **Form Request** sebelum diproses.
- File upload: validasi MIME type (`mimes:jpg,jpeg,png,webp`), ukuran maksimal (`max:2048` KB).
- SQL injection: **tidak mungkin** via Eloquent ORM (parameterized query).
- Harga: validasi `integer|min:0` — tidak menerima input negatif atau format tidak valid.

---

## CORS

- Konfigurasi `config/cors.php`:
  - `allowed_origins`: hanya domain frontend yang diizinkan (`localhost:5173`, domain production).
  - `supports_credentials: true` diperlukan untuk Sanctum cookie.
  - Method yang diizinkan: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.

---

## Rate Limiting

- **Login**: max 5 attempt per menit per IP → proteksi brute force.
- **Register**: max 3 per menit per IP.
- **Pasang listing**: max 10 per jam per user.
- **Global API**: max 60 request per menit per IP (Laravel default throttle).
- Implementasi via Laravel `RateLimiter` dengan Redis sebagai store.

---

## Upload Foto

- Validasi MIME type di server (bukan hanya ekstensi filename).
- File disimpan dengan **nama random** (`Str::uuid()`) — bukan nama asli dari user.
- Path upload tidak dapat di-traverse (disimpan di `storage/app/public/listings/`, tidak di `public/`).
- Ukuran maksimal: 2MB per foto.

---

## Secret Management

- Tidak ada secret yang di-commit ke repository.
- Semua konfigurasi sensitif via environment variable (`.env`) yang ter-listed di `.env.example`.
- `.env` ter-ignore oleh `.gitignore`.
- Di production: gunakan secret manager (AWS Secrets Manager, GCP Secret Manager, atau Vault).

---

## Security Headers

Tambahkan middleware untuk security headers di production:

| Header | Nilai | Deskripsi |
|--------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Cegah MIME sniffing |
| `X-Frame-Options` | `DENY` | Cegah clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter browser legacy |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Batasi referrer info |
| `Content-Security-Policy` | (custom per aplikasi) | Batasi sumber konten |
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS |

---

## Checklist Keamanan Production

- [ ] HTTPS everywhere (Cloudflare SSL/TLS)
- [ ] Environment variable di-manage via secret manager
- [ ] Rate limiting aktif di semua endpoint publik
- [ ] Security headers dikonfigurasi
- [ ] File upload divalidasi & disimpan aman
- [ ] Database tidak terekspos ke public internet
- [ ] Redis tidak terekspos ke public internet
- [ ] Log audit untuk aksi sensitif (login, pasang listing, hapus listing)
- [ ] Dependency audit berkala (`composer audit`, `npm audit`)
- [ ] PHP dan dependency di-update secara rutin

---

## Out of Scope (Future Work)

- Two-Factor Authentication (2FA)
- Email verification
- OAuth / Social login
- Enkripsi data at-rest
- Penetration testing
- Bug bounty program
