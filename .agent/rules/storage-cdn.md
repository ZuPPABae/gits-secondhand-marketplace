# Rule: Penyimpanan foto & CDN (lokal vs production)

Tujuan: kode aplikasi **tidak tahu** soal CDN. CDN/object storage hanya urusan konfigurasi, jadi aplikasi jalan lokal tanpa Cloudflare, dan siap pindah ke production tanpa ubah kode.

## Lokal (development)
- `FILESYSTEM_DISK=public`, jalankan `php artisan storage:link`. URL foto via `Storage::disk(config('filesystems.default'))->url($path)`; jangan hard-code domain.
- Tidak ada CDN, tidak ada Cloudflare, tidak ada akun eksternal yang dibutuhkan untuk menjalankan proyek.

## Production (hanya didokumentasikan, bukan dibangun)
- `FILESYSTEM_DISK=s3` mengarah ke Cloudflare R2 / S3. Set `AWS_URL` ke domain CDN (mis. `https://media.contoh.id`). Karena memakai `Storage::url()`, kode tidak berubah.
- Upload production idealnya lewat presigned URL langsung ke bucket (API hanya menerbitkan URL) agar server tidak jadi bottleneck. Untuk MVP upload lewat API; catat sebagai trade-off di `docs/decisions.md`.
- Cloudflare di depan domain: cache aset statis frontend (hash filename → `Cache-Control: public, max-age=31536000, immutable`), cache foto, WAF + rate limiting + proteksi DDoS. Respons API terautentikasi TIDAK boleh di-cache publik (`Cache-Control: no-store`/`private`). Endpoint publik seperti `/categories` boleh `public, max-age=300`.
- Thumbnail/resize gambar: opsional lewat Cloudflare Images/Image Resizing atau worker queue; cukup dijelaskan di docs.

## Di README/docs wajib jujur
Tulis jelas: "CDN dan object storage dirancang di diagram infrastruktur dan dikonfigurasi lewat environment variable; tidak di-deploy pada MVP ini." Jangan mengklaim sudah terpasang jika belum.
