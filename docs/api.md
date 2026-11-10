# Dokumentasi API

Base URL: `http://localhost:8000/api/v1`

Semua request JSON menggunakan header:
```
Accept: application/json
Content-Type: application/json
X-XSRF-TOKEN: <token dari cookie>  # untuk request yang memerlukan auth
```

> Autentikasi menggunakan Sanctum SPA cookie. Panggil `GET /sanctum/csrf-cookie` terlebih dahulu sebelum login.

---

## Auth

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/sanctum/csrf-cookie` | ❌ | Ambil CSRF cookie |
| `POST` | `/api/v1/auth/register` | ❌ | Registrasi user baru |
| `POST` | `/api/v1/auth/login` | ❌ | Login |
| `POST` | `/api/v1/auth/logout` | ✅ | Logout |
| `GET` | `/api/v1/auth/me` | ✅ | Profil user yang sedang login |

### POST /auth/register

**Request body:**
```json
{
  "name": "string",
  "email": "string (email)",
  "phone": "string (opsional)",
  "password": "string (min 8)",
  "password_confirmation": "string"
}
```

**Response 201:**
```json
{
  "message": "Registrasi berhasil",
  "user": { "id": 1, "name": "...", "email": "..." }
}
```

### POST /auth/login

**Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "message": "Login berhasil",
  "user": { "id": 1, "name": "...", "email": "..." }
}
```

---

## Listings (Barang)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/v1/listings` | ❌ | Daftar listing (pagination, search, filter) |
| `GET` | `/api/v1/listings/{id}` | ❌ | Detail listing |
| `POST` | `/api/v1/listings` | ✅ | Pasang listing baru |
| `PUT` | `/api/v1/listings/{id}` | ✅ | Edit listing milik sendiri |
| `DELETE` | `/api/v1/listings/{id}` | ✅ | Hapus listing milik sendiri |
| `PATCH` | `/api/v1/listings/{id}/status` | ✅ | Ubah status (tersedia/terjual) |

### GET /listings

**Query params:**
| Param | Tipe | Deskripsi |
|-------|------|-----------|
| `search` | string | Cari nama/deskripsi |
| `category` | string | Filter kategori |
| `condition` | string | `new` atau `used` |
| `page` | integer | Halaman (default: 1) |
| `per_page` | integer | Jumlah per halaman (default: 12, max: 50) |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Sepeda Gunung Polygon",
      "price": 1500000,
      "condition": "used",
      "category": "Olahraga",
      "location": "Bandung",
      "image_url": "http://localhost:8000/storage/listings/foto.jpg",
      "seller": { "id": 2, "name": "Budi" },
      "status": "available",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 60
  }
}
```

### POST /listings

**Request:** `multipart/form-data`

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `title` | string | ✅ | Nama barang (max 255) |
| `category` | string | ✅ | Kategori |
| `price` | integer | ✅ | Harga dalam rupiah |
| `condition` | string | ✅ | `new` / `used` |
| `description` | string | ✅ | Deskripsi (min 10 karakter) |
| `location` | string | ✅ | Lokasi penjual |
| `photo` | file | ❌ | Foto (jpg/png, max 2MB) |

---

## User / Profil

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/v1/users/{id}` | ❌ | Profil publik user |
| `GET` | `/api/v1/users/{id}/listings` | ❌ | Listing milik user |
| `PUT` | `/api/v1/profile` | ✅ | Update profil sendiri |

---

## Health Check

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/up` | ❌ | Laravel health check |
| `GET` | `/api/v1/health` | ❌ | API health check |

**Response:**
```json
{ "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

## Error Response

Semua error mengikuti format:

```json
{
  "message": "Pesan error yang dapat dibaca pengguna",
  "errors": {
    "field": ["detail validasi"]
  }
}
```

| HTTP Code | Keterangan |
|-----------|-----------|
| 400 | Bad Request |
| 401 | Unauthenticated |
| 403 | Unauthorized (bukan milik sendiri) |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |
