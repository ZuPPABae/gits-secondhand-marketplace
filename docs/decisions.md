# Architecture Decision Records (ADR)

Dokumen ini mencatat keputusan teknis non-trivial beserta konteks, alasan, dan trade-off-nya.

---

## ADR-001: Laravel + React Terpisah (SPA)

**Konteks**: Aplikasi marketplace membutuhkan UI yang responsif dan interaktif, dengan API yang dapat di-consume oleh berbagai klien di masa depan.

**Keputusan**: Backend Laravel 12 sebagai REST API murni, frontend React + Vite sebagai SPA terpisah. Keduanya berjalan di container berbeda.

**Alasan**:
- Separation of concerns yang jelas: backend fokus ke business logic & data, frontend fokus ke UX.
- Tim backend dan frontend dapat berkembang secara independen.
- API yang sama dapat di-consume oleh mobile app di masa depan.
- Laravel Sanctum mendukung SPA cookie auth secara native.

**Alternatif**: Laravel Blade + Livewire (monolith) atau Inertia.js.

**Trade-off**: Kompleksitas deployment bertambah (dua container, perlu proxy), CORS harus dikonfigurasi dengan benar, dan terdapat overhead request ekstra untuk CSRF cookie.

---

## ADR-002: Sanctum SPA Cookie Auth (vs Token di localStorage)

**Konteks**: Aplikasi perlu mekanisme autentikasi yang aman antara SPA dan API Laravel.

**Keputusan**: Gunakan Laravel Sanctum dalam mode SPA authentication menggunakan httpOnly session cookie, bukan token yang disimpan di localStorage.

**Alasan**:
- Cookie `httpOnly` tidak dapat diakses JavaScript, sehingga kebal terhadap serangan XSS.
- Sanctum SPA mode sudah built-in di Laravel, tidak perlu library tambahan.
- Proteksi CSRF tersedia otomatis melalui XSRF-TOKEN cookie.
- Cocok untuk SPA yang berbagi domain/subdomain dengan backend (atau via proxy).

**Alternatif**: Sanctum API token (Bearer token), JWT (via tymon/jwt-auth), atau Passport.

**Trade-off**: SPA dan API harus berbagi domain atau dikonfigurasi `SANCTUM_STATEFUL_DOMAINS` dengan benar. Sedikit lebih kompleks untuk setup lintas domain murni.

---

## ADR-003: PostgreSQL 16 (vs MySQL)

**Konteks**: Pemilihan database relasional untuk menyimpan data listing, user, dan transaksi.

**Keputusan**: Gunakan PostgreSQL 16 sebagai primary database.

**Alasan**:
- Ekstensi `pg_trgm` memungkinkan full-text search dengan trigram tanpa Elasticsearch (lihat ADR-005).
- PostgreSQL lebih unggul dalam query kompleks, indeks parsial, dan JSON operations.
- JSONB cocok untuk menyimpan metadata fleksibel (atribut barang yang bervariasi per kategori).
- Dukungan `LISTEN/NOTIFY` untuk fitur real-time di masa depan.
- Managed PostgreSQL tersedia di semua cloud provider utama.

**Alternatif**: MySQL 8, SQLite (dev only), MongoDB.

**Trade-off**: PostgreSQL sedikit lebih berat dari MySQL untuk setup minimal. Kurva belajar lebih tinggi untuk DBA yang terbiasa MySQL.

---

## ADR-004: Redis 7 (untuk Cache dan Session)

**Konteks**: Aplikasi membutuhkan cache dan session store yang cepat untuk mendukung skalabilitas.

**Keputusan**: Gunakan Redis 7 untuk cache Laravel (`CACHE_DRIVER=redis`) dan session (`SESSION_DRIVER=redis`), serta rate limiting.

**Alasan**:
- Redis in-memory store memberikan latency sub-millisecond untuk read/write.
- Shared session store diperlukan ketika backend di-scale horizontal (multiple instance).
- Laravel terintegrasi native dengan Redis untuk cache, session, queue, dan rate limiting.
- Rate limiting di level Redis mencegah abuse endpoint auth dan listing.

**Alternatif**: Memcached (tidak ada persistence), database session (lambat di scale), file session (tidak bisa horizontal scale).

**Trade-off**: Menambah satu service tambahan (container Redis). Data in-memory hilang jika Redis restart tanpa persistence — untuk dev ini tidak masalah, di production gunakan Redis dengan AOF/RDB.

---

## ADR-005: Search dengan pg_trgm (vs Elasticsearch)

**Konteks**: Fitur search barang berdasarkan nama/deskripsi diperlukan, namun anggaran dan kompleksitas infrastruktur harus dijaga minimal untuk MVP.

**Keputusan**: Gunakan ekstensi `pg_trgm` PostgreSQL dengan GIN index untuk fuzzy search pada kolom `name` dan `description`.

**Alasan**:
- `pg_trgm` sudah tersedia di PostgreSQL, tidak perlu service tambahan.
- GIN index pada trigram memberikan performa search yang memadai untuk volume data MVP (ribuan listing).
- Query filter kategori + kondisi + search dapat dijalankan dalam satu query SQL efisien.
- Implementasi sederhana: `WHERE name ILIKE '%keyword%'` dengan indeks, atau `similarity()` untuk fuzzy match.

**Alternatif**: Elasticsearch/OpenSearch (powerful tapi berat), Meilisearch (lightweight dedicated search), Laravel Scout + Algolia (SaaS, berbayar).

**Trade-off**: `pg_trgm` tidak sebaik Elasticsearch untuk relevance ranking kompleks, autocomplete, atau multi-language stemming. Jika listing mencapai > 1 juta, perlu migrasi ke dedicated search engine.

---

## ADR-006: WhatsApp Link (vs Chat In-App)

**Konteks**: Pembeli perlu cara untuk menghubungi penjual setelah melihat listing.

**Keputusan**: Gunakan deep link `wa.me/{phone}?text={pesan_otomatis}` yang membuka WhatsApp native di perangkat pengguna.

**Alasan**:
- Implementasi trivial: satu anchor tag dengan URL terformat.
- WhatsApp sudah dimiliki dan dipercaya oleh pengguna komunitas.
- Tidak perlu membangun, maintain, dan men-scale real-time messaging infrastructure.
- Tidak ada data percakapan yang perlu disimpan → beban compliance lebih rendah.
- Pesan awal otomatis (pre-filled) meningkatkan UX tanpa kompleksitas tambahan.

**Alternatif**: Chat in-app (WebSocket/Pusher/Firebase), email kontak, sistem pesan internal.

**Trade-off**: Tidak ada riwayat chat di platform, nomor HP penjual terekspos ke pembeli. Chat in-app dicatat sebagai future work.

---

## ADR-007: Upload Foto via API (vs Presigned URL S3)

**Konteks**: Penjual perlu mengupload foto barang. Perlu ditentukan apakah foto diproses melalui backend atau langsung ke object storage.

**Keputusan**: Upload foto melalui backend Laravel API (`multipart/form-data` → `Storage::disk('public')`), disimpan di local storage untuk dev dan dapat dikonfigurasi ke S3/R2 untuk production.

**Alasan**:
- Validasi dan resize foto dapat dilakukan di server sebelum disimpan.
- Implementasi lebih sederhana untuk MVP: tidak perlu mengelola presigned URL, CORS di S3, dan signed URL lifecycle.
- Laravel `Storage` facade abstrak penyimpanan: ganti `FILESYSTEM_DISK` dari `public` ke `s3` tanpa ubah kode aplikasi.

**Alternatif**: Frontend upload langsung ke S3 dengan presigned URL (lebih efisien, bypass backend), Cloudflare Images.

**Trade-off**: Upload melalui backend mengonsumsi bandwidth server. Untuk production dengan banyak upload foto, presigned URL ke S3/R2 lebih efisien dan scalable.

---

## ADR-008: Docker Compose untuk Dev (vs Bare Metal)

**Konteks**: Tim pengembang membutuhkan environment development yang konsisten dan mudah di-setup.

**Keputusan**: Gunakan Docker Compose untuk menjalankan semua service (backend, frontend, postgres, redis) dalam satu perintah `docker-compose up --build`.

**Alasan**:
- Satu perintah setup untuk semua developer, tidak ada "works on my machine" syndrome.
- Isolasi service: versi PHP, Node, PostgreSQL, Redis terjamin konsisten.
- Mudah di-reset: `docker-compose down -v` menghapus semua data, `up --build` mulai dari awal.
- Mendekati kondisi production (containerized), memudahkan transisi ke Kubernetes/cloud.

**Alternatif**: Laravel Sail (wrapper Docker Compose), Valet/Herd (macOS only), Vagrant, bare metal install.

**Trade-off**: Docker Desktop membutuhkan resource RAM/CPU lebih besar dari bare metal. Build pertama lebih lambat karena download image. Networking antar container perlu dipahami (nama service sebagai hostname).

---

## ADR-009: Isolasi Database Pengujian (`marketplace_test`) dan Atribut `force="true"`

**Konteks**: Saat pengujian otomatis dijalankan (`php artisan test`), trait `RefreshDatabase` me-reset seluruh skema tabel. Variabel environment Docker Compose (`DB_DATABASE=marketplace_db`) diteruskan langsung ke container dan otomatis terpopulasi di `$_SERVER`.

**Keputusan**: Buat database terpisah `marketplace_test` di PostgreSQL yang diinisialisasi melalui `docker/postgres/init-test-db.sql`. Di `backend/phpunit.xml`, tetapkan `DB_DATABASE=marketplace_test`, `CACHE_STORE=array`, dan `SESSION_DRIVER=array` menggunakan atribut `force="true"` pada tag `<server>` dan `<env>`, serta lengkapi dengan `backend/.env.testing`.

**Alasan**:
- Tanpa atribut `force="true"`, PHPUnit tidak menimpa variabel `$_SERVER` bawaan dari environment Docker, sehingga `RefreshDatabase` menghapus bersih seluruh data development di `marketplace_db`.
- Penggunaan `CACHE_STORE=array` dan `SESSION_DRIVER=array` mencegah pengujian membersihkan atau mencemari data cache dan session Redis development.
- Menjamin pengujian dapat dijalankan kapan saja tanpa merusak data seeder development.

**Trade-off**: Memerlukan pembuatan database tambahan `marketplace_test` pada instance PostgreSQL lokal.

---

## ADR-010: Tabel `personal_access_tokens` Tidak Digunakan pada Alur SPA

**Konteks**: Menjalankan `php artisan install:api` secara otomatis membuat file migrasi `personal_access_tokens` untuk token autentikasi Sanctum Bearer.

**Keputusan**: Biarkan migrasi tabel `personal_access_tokens` tetap ada di repository demi integritas generator Laravel 12 API, namun seluruh alur autentikasi aplikasi MVP secara eksklusif menggunakan Sanctum SPA Cookie Auth (`httpOnly` session + `XSRF-TOKEN`).

**Alasan**:
- Cookie `httpOnly` kebal terhadap pencurian token via serangan XSS dibandingkan penyimpanan Bearer token di `localStorage`.
- Menghindari modifikasi destruktif pada struktur bawaan Laravel `install:api`.
- Tabel ini tetap tersedia untuk masa depan jika ada kebutuhan integrasi mobile app native atau third-party API keys tanpa perlu migrasi ulang.

**Trade-off**: Terdapat satu tabel kosong di database selama aplikasi beroperasi dalam mode SPA web.

---

## ADR-011: Caching Detail Listing dengan TTL 5 Menit dan Invalidasi Eksplisit

**Konteks**: Pola akses marketplace sangat read-heavy (asumsi rasio baca:tulis ~95:5). Endpoint detail barang (`GET /api/v1/listings/{id}`) memuat banyak relasi (kategori, galeri foto, profil penjual).

**Keputusan**: Cache respons detail barang di Redis dengan kunci `listings:detail:{id}` dan TTL pendek 5 menit. Hapus cache secara eksplisit (`Cache::forget(...)`) setiap kali listing diperbarui, statusnya diubah, atau dihapus.

**Alasan**:
- Menghindari query repetitif ke PostgreSQL untuk barang-barang populer / trending.
- TTL pendek (5 menit) membatasi dampak cache stale jika terjadi kegagalan invalidasi.
- Invalidasi instan pada mutasi menjamin penjual dan pembeli langsung melihat status barang terkini (misal: saat ditandai "Terjual").

**Trade-off**: Pengembang harus memastikan setiap rute mutasi yang memengaruhi data listing memanggil invalidasi cache yang sesuai.
