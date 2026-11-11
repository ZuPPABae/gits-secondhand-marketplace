# Strategi Skalabilitas & Keandalan (±100.000 DAU)

Dokumen ini memuat analisis kapasitas, perhitungan matematis, strategi arsitektur skalabilitas, dan mitigasi keandalan untuk mendukung target **±100.000 Daily Active Users (DAU)**.

---

## 1. Asumsi Beban Kerja & Perhitungan Matematis

Perhitungan beban sistem didasarkan pada 9 asumsi bernomor berikut:

1. **Target Pengguna Aktif Harian (DAU)**:
   - $100.000$ pengguna aktif per hari yang mengakses platform untuk mencari, melihat, atau memasang barang bekas.
2. **Aktivitas Rata-rata per Sesi**:
   - Setiap pengguna melakukan rata-rata **±20 request HTTP** per sesi (membuka beranda, mengetik pencarian debounced, memfilter kategori, paginasi, membuka 2–3 detail barang, dan melakukan kontak WhatsApp).
3. **Total Request Harian**:
   - $100.000 \text{ pengguna} \times 20 \text{ request} = \mathbf{2.000.000 \text{ (2 juta) request/hari}}$.
4. **Throughput Rata-rata Harian (Average RPS)**:
   - 1 hari = 86.400 detik.
   - $\text{Throughput} = \frac{2.000.000}{86.400} \approx 23,15 \text{ RPS} \approx \mathbf{25 \text{ RPS rata-rata}}$.
5. **Throughput Jam Sibuk (Peak RPS)**:
   - Pola akses pengguna komunitas terpusat pada jam istirahat makan siang (12.00–13.00) dan malam hari (19.00–22.00 WIB).
   - Faktor lonjakan traffic (*peak multiplier*) berada pada kisaran **5x hingga 10x** dari rata-rata harian.
   - $\text{Puncak RPS} = 25 \text{ RPS} \times (5 \text{ hingga } 10) = \mathbf{125 \text{ hingga } 250 \text{ RPS}}$.
6. **Rasio Baca vs Tulis (Read : Write Ratio)**:
   - Karakteristik marketplace komunitas sangat *read-heavy* dengan rasio **95% Read : 5% Write**.
   - **Operasi Baca (95% = 1.900.000 request/hari)**: Query katalog, search trigram, filter kategori, detail barang, profil publik penjual.
   - **Operasi Tulis (5% = 100.000 request/hari)**: Login, pendaftaran akun, upload foto, simpan listing baru, update status tersedia/terjual, hapus listing.
7. **Karakteristik Berkas Media Foto**:
   - Rata-rata setiap listing memuat **3 hingga 5 foto** (diasumsikan rata-rata 4 foto per listing).
   - Melalui kompresi WebP/JPEG di frontend dan backend, ukuran berkas optimal adalah **±300 KB per foto** (1,2 MB per listing).
8. **Estimasi Pertumbuhan Penyimpanan (Storage) per Bulan**:
   - Asumsi rata-rata **500 listing baru dipasang per hari**.
   - Pertumbuhan data media harian: $500 \text{ listing} \times 4 \text{ foto} \times 300 \text{ KB} = 600.000 \text{ KB} \approx \mathbf{600 \text{ MB / hari}}$.
   - Pertumbuhan per bulan (30 hari): $600 \text{ MB} \times 30 = \mathbf{18 \text{ GB / bulan}}$ ($\approx 216 \text{ GB / tahun}$).
9. **Estimasi Bandwidth Keluar (Egress Traffic) per Bulan**:
   - Dari 100.000 sesi/hari, pengguna mengunduh rata-rata 10 thumbnail/foto berukuran kecil-menengah ($\approx 150 \text{ KB/foto}$) $\rightarrow$ $1,5 \text{ MB media}$ per pengguna.
   - Total konsumsi bandwidth media mentah: $100.000 \times 1,5 \text{ MB} = \mathbf{150 \text{ GB / hari}}$ ($\approx 4,5 \text{ TB / bulan}$).
   - **Efisiensi CDN**: Dengan Cloudflare CDN yang meng-cache foto pada Edge PoP (estimasi cache hit ratio 90%), bandwidth origin server hanya menanggung **10%** ($\approx 15 \text{ GB / hari}$ atau $\mathbf{450 \text{ GB / bulan}}$).

---

## 2. Strategi Caching Bertingkat (Multi-Tier Caching)

Untuk memastikan latensi respon API tetap di bawah 100 ms pada beban 250 RPS, diterapkan 3 lapisan cache:

1. **Lapisan 1: Edge CDN Caching (Cloudflare)**:
   - Aset statis frontend SPA (`index-[hash].js`, CSS, icon SVG) di-cache secara permanen dengan header `Cache-Control: public, max-age=31536000, immutable`.
   - Foto barang dari Cloudflare R2 / S3 di-cache selama 30 hari di edge CDN.
   - Endpoint publik statis seperti `GET /api/v1/categories` diberi header `Cache-Control: public, max-age=300` (5 menit), mengurangi 80% request kategori ke origin server.
2. **Lapisan 2: In-Memory Application Cache (Redis 7)**:
   - **Detail Listing**: Respons endpoint `GET /api/v1/listings/{id}` di-cache di Redis dengan kunci `listings:detail:{id}` dan TTL 5 menit.
   - **Invalidasi Reaktif**: Cache dihapus seketika (`Cache::forget`) saat pemilik melakukan update barang, menandai status terjual/tersedia, atau menghapus barang.
   - **Katalog Beranda**: Filter pencarian populer di-cache dengan TTL pendek (1 menit) menggunakan kunci berbasis hash parameter query: `listings:catalog:{hash(params)}`.
3. **Lapisan 3: Client-Side State Cache (TanStack Query)**:
   - Di sisi browser, TanStack Query mengonfigurasi `staleTime: 10 menit` untuk kategori dan `staleTime: 2 menit` untuk detail listing, mencegah refetch berulang saat berpindah halaman.

---

## 3. Optimasi Indexing & Kinerja Database

Pola query PostgreSQL dioptimasi secara spesifik berdasarkan beban kerja:

1. **GIN Index Trigram (`pg_trgm`)**:
   - Indeks `listings_title_trgm_idx` dibuat menggunakan operator class `gin_trgm_ops` pada kolom `title`.
   - Mengubah operasi pencarian substring (`ILIKE '%sepeda%'`) dari sequential scan (O(N)) menjadi index scan berbasis inverted index (O(log N)), mampu melayani pencarian dalam < 5 ms pada 100.000 baris data.
2. **Indeks Komposit (Composite B-Tree)**:
   - Indeks `(status, category_id, created_at)` mendukung filter utama katalog secara efisien: barang yang aktif (`status = 'available'`), dikelompokkan berdasarkan kategori, dan diurutkan dari yang terbaru (`ORDER BY created_at DESC`).
3. **Connection Pooling (PgBouncer)**:
   - Menerapkan mode *Transaction Pooling* pada PgBouncer.
   - Membatasi koneksi riil ke PostgreSQL pada angka 50–100 koneksi persisten, mendaur ulang koneksi tersebut untuk melayani ribuan koneksi konkuren dari pod aplikasi.
4. **Pemisahan Read/Write (Replica Routing)**:
   - Read Replicas (2 unit) menangani seluruh query `SELECT`. Primary database difokuskan 100% melayani transaksi mutasi data (`INSERT`, `UPDATE`, `DELETE`).

---

## 4. Horizontal Scaling (Stateless Application Pods)

Container aplikasi backend dirancang **100% stateless**:
- **Sesi Pengguna**: Disimpan di Redis Cluster, bukan file lokal.
- **Penyimpanan Berkas**: Menggunakan object storage terpusat (Cloudflare R2 / AWS S3).
- **Spesifikasi Pod Standar**:
  - CPU Request: 0.5 core, Limit: 1.0 core.
  - Memory Request: 512 MB, Limit: 1024 MB.
  - Setiap Pod PHP-FPM dapat memproses ~20–30 request dinamis per detik.
- **Kebijakan Autoscaling (HPA)**:
  - **Baseline Normal (25 RPS)**: 4 Pods aktif (kapasitas 80–120 RPS).
  - **Peak Traffic (150–250 RPS)**: Skala otomatis naik hingga 10–12 Pods berdasarkan metrik CPU pemanfaatan > 70% atau HTTP queue length.
  - **Maksimum Cadangan**: 16 Pods.

---

## 5. Strategi Rate Limiting Bertingkat

Untuk melindungi API dari serangan bot scraping dan brute-force yang dapat menghabiskan kuota koneksi:

1. **Edge Rate Limiting (Cloudflare WAF)**:
   - Memblokir IP yang mengirimkan > 100 request/menit ke origin API.
2. **Application Rate Limiting (Laravel via Redis)**:
   - **Autentikasi (`/api/v1/auth/login`, `/register`)**: Dibatasi maksimal 5 request per menit per IP untuk mencegah brute-force password.
   - **Upload & Pasang Listing (`POST /api/v1/listings`)**: Dibatasi maksimal 10 request per menit per pengguna terautentikasi untuk mencegah *storage flooding*.
   - **Global Fallback**: 60 request per menit per IP untuk endpoint publik.

---

## 6. Penanganan Lonjakan Traffic Ekstrem (Traffic Spikes)

Jika terjadi lonjakan traffic tak terduga (misal liputan media viral hingga 500+ RPS):

1. **Queue Buffer untuk Operasi Tulis**:
   - Pemrosesan gambar berat (thumbnail generation, EXIF stripping) dialihkan ke antrean background (*Redis Queue*). Response upload langsung mengembalikan status sukses sementara gambar diproses asinkron oleh worker pod.
2. **Circuit Breaker & Graceful Degradation**:
   - Jika latency PostgreSQL melonjak > 500 ms, sistem beralih menyajikan katalog populer langsung dari cache Redis statis.
   - Penonaktifan sementara query fuzzy trigram berat, beralih ke pencarian exact match atau kategori browsing.

---

## 7. Rencana Backup & Disaster Recovery (RPO & RTO Target)

Target pemulihan bencana sistem:
- **Recovery Point Objective (RPO) < 5 Menit**:
  - Kerugian data maksimal yang dapat ditoleransi adalah 5 menit transaksi terakhir.
  - Dicapai melalui *Continuous WAL (Write-Ahead Logging) Archiving* ke object storage cross-region setiap interval 1 menit.
- **Recovery Time Objective (RTO) < 30 Menit**:
  - Waktu maksimal untuk memulihkan seluruh sistem beroperasi normal kembali.
  - Snapshot disk harian otomatis dibuat setiap pukul 02.00 WIB.
  - Skrip automasi Terraform / Kubernetes manifest siap melakukan provisioning ulang cluster dalam 15–20 menit.

---

## 8. Kriteria Migrasi ke Search Engine Terpisah

Penggunaan `pg_trgm` pada PostgreSQL sangat efektif dan efisien untuk skala puluhan hingga ratusan ribu listing. Namun, tim wajib merencanakan migrasi ke dedicated search engine (seperti **Meilisearch** atau **Elasticsearch**) apabila memenuhi salah satu kriteria ambang batas (*threshold*) berikut:

1. **Volume Data Listing Aktif Melampaui 1.000.000 Baris**:
   - Pada 1 juta baris data teks, indeks GIN PostgreSQL membutuhkan RAM buffer pool yang sangat besar dan penulisan listing baru mengalami write-amplification lambat.
2. **Kebutuhan Relevance Scoring Kompleks**:
   - Kebutuhan algoritma perangkingan berbasis bobot atribut (misal: kecocokan judul bernilai 3x dibanding deskripsi, boosting barang penjual terverifikasi, atau boosting berbasis radius lokasi geografis koordinat GPS).
3. **Toleransi Typo Bahasa Indonesia Lanjutan & Stemming**:
   - Kebutuhan fitur toleransi salah ketik dinamis (*typo tolerance*), lemmatization/stemming kata bahasa Indonesia (misal: "menjual" -> "jual"), dan saran kata instan (*instant search-as-you-type*).
