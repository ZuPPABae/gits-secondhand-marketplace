# Dokumentasi REST API

Base URL: `http://localhost:8000/api/v1`

Seluruh permintaan API berbasis JSON menggunakan header standar:
```http
Accept: application/json
Content-Type: application/json
X-XSRF-TOKEN: <nilai-dari-cookie-XSRF-TOKEN>
```

> **Catatan Autentikasi SPA**:
> Sebelum memanggil endpoint mutasi atau autentikasi (`register`, `login`), klien SPA memanggil `GET /sanctum/csrf-cookie` untuk menginisialisasi cookie sesi dan CSRF token. Seluruh cookie ditransmisikan otomatis menggunakan `withCredentials: true`.

---

## Ringkasan Endpoint

| HTTP Method | Path Endpoint | Akses / Auth | Rate Limit | Deskripsi Singkat |
|---|---|---|---|---|
| `GET` | `/sanctum/csrf-cookie` | Publik | — | Inisialisasi cookie proteksi CSRF Sanctum. |
| `GET` | `/api/v1/health` | Publik | — | Pengecekan status kesehatan service API. |
| `POST` | `/api/v1/auth/register` | Tamu (Guest) | 5 req/menit | Pendaftaran akun pengguna baru. |
| `POST` | `/api/v1/auth/login` | Tamu (Guest) | 5 req/menit | Masuk ke akun dan buat sesi terautentikasi. |
| `POST` | `/api/v1/auth/logout` | Terproteksi | — | Keluar dari sesi dan invalidasi sesi server. |
| `GET` | `/api/v1/me` | Terproteksi | — | Dapatkan data pengguna yang sedang login. |
| `GET` | `/api/v1/categories` | Publik | — | Daftar seluruh kategori barang (Cache 24 jam). |
| `GET` | `/api/v1/listings` | Publik | 60 req/menit | Katalog barang (search, filter, sort, pagination). |
| `GET` | `/api/v1/listings/{id}` | Publik | — | Detail barang, galeri foto, & tautan WhatsApp. |
| `GET` | `/api/v1/users/{id}` | Publik | — | Profil publik penjual & barang aktif (privasi terjaga). |
| `GET` | `/api/v1/me/listings` | Terproteksi | — | Daftar listing milik sendiri (tersedia & terjual). |
| `POST` | `/api/v1/listings` | Terproteksi | 10 req/menit | Pasang barang baru + upload foto (multipart). |
| `POST` / `PATCH` | `/api/v1/listings/{id}` | Terproteksi | — | Perbarui barang & kelola foto (multipart + IDOR check). |
| `PATCH` | `/api/v1/listings/{id}/status`| Terproteksi | — | Ubah status ketersediaan barang (`available`/`sold`). |
| `DELETE` | `/api/v1/listings/{id}` | Terproteksi | — | Hapus listing dan seluruh berkas foto terkait. |

---

## 1. Endpoint Sistem & Autentikasi

### `GET /sanctum/csrf-cookie`
Menginisialisasi sesi dan menetapkan cookie `XSRF-TOKEN` dan `marketplace_session`.
- **Response**: `204 No Content`

### `GET /api/v1/health`
Pengecekan liveness probe server.
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-11-11T07:40:00.000000Z"
}
```

### `POST /api/v1/auth/register`
Mendaftarkan akun pengguna baru.
- **Request Body**:
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "6281234567890",
  "location": "Tebet, Jakarta Selatan"
}
```
- **Response**: `201 Created`
```json
{
  "message": "Pendaftaran akun berhasil.",
  "user": {
    "id": 4,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "6281234567890",
    "location": "Tebet, Jakarta Selatan",
    "created_at": "2026-11-11T07:40:00.000000Z"
  }
}
```
- **Kode Error**:
  - `422 Unprocessable Entity`: Validasi gagal (misal email duplikat, nomor HP bukan awalan 62, kata sandi < 8 karakter).
  - `429 Too Many Requests`: Melebihi batasan 5 request per menit.

### `POST /api/v1/auth/login`
Masuk ke sesi pengguna.
- **Request Body**:
```json
{
  "email": "budi@example.com",
  "password": "password123",
  "remember": true
}
```
- **Response**: `200 OK`
```json
{
  "message": "Login berhasil.",
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "6281234567890",
    "location": "Tebet, Jakarta Selatan",
    "created_at": "2026-11-11T00:00:00.000000Z"
  }
}
```
- **Kode Error**:
  - `422 Unprocessable Entity`: Kredensial email atau kata sandi tidak cocok.
  - `429 Too Many Requests`: Terkena throttle login.

### `POST /api/v1/auth/logout`
Keluar dari sesi dan menginvaliasi cookie di server.
- **Headers**: Memerlukan cookie sesi aktif.
- **Response**: `200 OK`
```json
{
  "message": "Berhasil keluar."
}
```
- **Kode Error**:
  - `401 Unauthorized`: Sesi tidak valid atau telah berakhir.

### `GET /api/v1/me`
Mendapatkan data profil pengguna yang sedang login.
- **Headers**: Memerlukan cookie sesi aktif.
- **Response**: `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "6281234567890",
    "location": "Tebet, Jakarta Selatan",
    "created_at": "2026-11-11T00:00:00.000000Z"
  }
}
```

---

## 2. Endpoint Kategori & Katalog Publik

### `GET /api/v1/categories`
Mengambil daftar kategori barang aktif (di-cache di Redis selama 24 jam).
- **Response**: `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Elektronik & Gadget",
      "slug": "elektronik-gadget"
    },
    {
      "id": 2,
      "name": "Perkakas & Otomotif",
      "slug": "perkakas-otomotif"
    }
  ]
}
```

### `GET /api/v1/listings`
Daftar katalog barang dengan pencarian trigram, filter, dan paginasi.
- **Query Parameters**:
  - `q` (string, opsional): Kata kunci pencarian judul (didukung PostgreSQL `pg_trgm`).
  - `category` (string, opsional): Slug kategori (contoh: `elektronik-gadget`).
  - `condition` (string, opsional): `new`, `like_new`, `good`, `fair`.
  - `status` (string, opsional): `available` (default) atau `sold`.
  - `sort` (string, opsional): `latest` (default), `oldest`, `price_asc`, `price_desc`.
  - `page` (integer, opsional): Nomor halaman (default: `1`).
  - `per_page` (integer, opsional): Jumlah item per halaman (default: `12`, max: `50`).
- **Response**: `200 OK`
```json
{
  "data": [
    {
      "id": 10,
      "title": "Bor Listrik Bosch Impact Drill GSB 550",
      "description": "Kondisi sangat mulus, jarang dipakai...",
      "price": 450000,
      "condition": "like_new",
      "condition_label": "Seperti Baru",
      "location": "Tebet, Jakarta Selatan",
      "status": "available",
      "primary_image_url": "http://localhost:8000/storage/listings/bor-bosch.webp",
      "created_at": "2026-11-11T05:30:00.000000Z",
      "category": {
        "id": 2,
        "name": "Perkakas & Otomotif",
        "slug": "perkakas-otomotif"
      },
      "user": {
        "id": 1,
        "name": "Budi Santoso",
        "location": "Tebet, Jakarta Selatan"
      }
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/listings?page=1",
    "last": "http://localhost:8000/api/v1/listings?page=3",
    "prev": null,
    "next": "http://localhost:8000/api/v1/listings?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 12,
    "to": 12,
    "total": 30
  }
}
```

### `GET /api/v1/listings/{id}`
Mendapatkan detail lengkap satu barang (di-cache di Redis TTL 5 menit).
- **Response**: `200 OK`
```json
{
  "data": {
    "id": 10,
    "title": "Bor Listrik Bosch Impact Drill GSB 550",
    "description": "Kondisi sangat mulus, jarang dipakai untuk proyek DIY rumahan. Lengkap dengan koper boks dan mata bor cadangan.",
    "price": 450000,
    "condition": "like_new",
    "condition_label": "Seperti Baru",
    "location": "Tebet, Jakarta Selatan",
    "status": "available",
    "primary_image_url": "http://localhost:8000/storage/listings/bor-1.webp",
    "created_at": "2026-11-11T05:30:00.000000Z",
    "category": {
      "id": 2,
      "name": "Perkakas & Otomotif",
      "slug": "perkakas-otomotif"
    },
    "user": {
      "id": 1,
      "name": "Budi Santoso",
      "location": "Tebet, Jakarta Selatan",
      "whatsapp_url": "https://wa.me/6281234567890?text=Halo%20Budi%20Santoso%2C%20saya%20tertarik%20dengan%20%2ABor%20Listrik%20Bosch%20Impact%20Drill%20GSB%20550%2A%20seharga%20Rp%20450.000..."
    },
    "images": [
      {
        "id": 15,
        "url": "http://localhost:8000/storage/listings/bor-1.webp",
        "position": 0
      },
      {
        "id": 16,
        "url": "http://localhost:8000/storage/listings/bor-2.webp",
        "position": 1
      }
    ]
  }
}
```
- **Kode Error**:
  - `404 Not Found`: Barang tidak ditemukan atau sudah dihapus.

### `GET /api/v1/users/{id}`
Mendapatkan data profil penjual dan barang aktif yang sedang dijualnya (Privasi Terjaga: Tanpa email dan tanpa nomor telepon).
- **Response**: `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "location": "Tebet, Jakarta Selatan",
    "created_at": "2026-11-11T00:00:00.000000Z"
  },
  "listings": {
    "data": [ ... ],
    "meta": { "total": 8, "current_page": 1, "last_page": 1 }
  }
}
```
- **Kode Error**:
  - `404 Not Found`: Pengguna tidak ditemukan.

---

## 3. Endpoint Manajemen Barang (Penjual Terautentikasi)

### `GET /api/v1/me/listings`
Daftar seluruh barang yang dipasang oleh pengguna yang sedang login (baik `available` maupun `sold`).
- **Query Parameters**: `page` (default 1), `per_page` (default 12).
- **Response**: `200 OK` (Paginasi koleksi `ListingResource`).
- **Kode Error**:
  - `401 Unauthorized`: Sesi tidak aktif.

### `POST /api/v1/listings`
Membuat dan memasang barang baru dengan foto (Content-Type: `multipart/form-data`).
- **Headers**: Memerlukan cookie sesi aktif.
- **Form Data**:
  - `title` (string, wajib, max 255): Judul barang.
  - `category_id` (integer, wajib): ID kategori valid.
  - `price` (integer, wajib, min 0): Harga Rupiah bulat.
  - `condition` (string, wajib): `new`, `like_new`, `good`, atau `fair`.
  - `description` (string, wajib): Deskripsi detail barang.
  - `location` (string, wajib, max 255): Lokasi COD.
  - `images[]` (file, opsional, max 5 file): File JPG, PNG, atau WebP (maks. 2 MB/file).
- **Response**: `201 Created`
```json
{
  "message": "Barang berhasil dipasang.",
  "data": {
    "id": 31,
    "title": "Sepeda Lipat Dahon Boardwalk D8",
    "price": 3800000,
    "status": "available", ...
  }
}
```
- **Kode Error**:
  - `401 Unauthorized`: Belum login.
  - `422 Unprocessable Entity`: Kesalahan input form atau format file foto tidak valid.
  - `429 Too Many Requests`: Melebihi batas upload 10 listing per menit.

### `POST /api/v1/listings/{id}` (Update Barang)
Memperbarui data barang dan mengelola galeri foto (`multipart/form-data`).
> **Catatan Multipart**: Klien menyertakan field `_method=PATCH` atau `_method=PUT` saat mengirim data via POST untuk memastikan parsing berkas multipart di PHP/Laravel berjalan normal.
- **Form Data**:
  - `title`, `category_id`, `price`, `condition`, `description`, `location`: Field data teks.
  - `images[]` (file, opsional): File foto tambahan baru.
  - `delete_image_ids[]` (integer array, opsional): ID foto yang ingin dihapus.
- **Response**: `200 OK`
```json
{
  "message": "Barang berhasil diperbarui.",
  "data": { ... }
}
```
- **Kode Error**:
  - `401 Unauthorized`: Belum login.
  - `403 Forbidden`: Pengguna bukan pemilik barang (`ListingPolicy`).
  - `404 Not Found`: Listing tidak ditemukan.
  - `422 Unprocessable Entity`: Validasi gagal (termasuk jika `delete_image_ids` memuat ID foto milik listing lain / proteksi IDOR).

### `PATCH /api/v1/listings/{id}/status`
Mengubah status barang antara tersedia dan terjual.
- **Request Body**:
```json
{
  "status": "sold"
}
```
(Pilihan nilai status: `"available"` atau `"sold"`).
- **Response**: `200 OK`
```json
{
  "message": "Status barang berhasil diubah.",
  "data": {
    "id": 10,
    "status": "sold", ...
  }
}
```
- **Kode Error**:
  - `403 Forbidden`: Pengguna bukan pemilik barang.
  - `422 Unprocessable Entity`: Nilai status tidak valid.

### `DELETE /api/v1/listings/{id}`
Menghapus barang dan membersihkan seluruh berkas foto dari penyimpanan storage.
- **Response**: `200 OK`
```json
{
  "message": "Barang berhasil dihapus."
}
```
- **Kode Error**:
  - `403 Forbidden`: Pengguna bukan pemilik barang.
  - `404 Not Found`: Barang tidak ditemukan.
