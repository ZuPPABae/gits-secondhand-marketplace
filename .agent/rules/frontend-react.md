# Rule: Frontend (React + Vite + TypeScript + Tailwind)

- Folder `/frontend`. Vite + React + TypeScript strict. Tailwind CSS v4.
- Library (pakai ini saja): `react-router`, `@tanstack/react-query`, `axios`, `react-hook-form` + `zod`, `lucide-react`. Komponen UI dibuat sendiri dengan Tailwind (atau shadcn/ui seperlunya); jangan menambah UI kit besar.
- `vite.config.ts`: proxy `/api` dan `/sanctum` ke `VITE_API_PROXY_TARGET` (default `http://backend:8000` di Docker). axios `withCredentials: true`, kirim header XSRF otomatis; panggil `/sanctum/csrf-cookie` sebelum login/register.

## Struktur
```
src/
  api/          axios instance + fungsi per resource
  components/   komponen reusable (ListingCard, Filters, Button, Input, Badge, EmptyState, Skeleton)
  features/     auth/, listings/, profile/
  pages/        Home, ListingDetail, ListingForm (create/edit), MyListings, Profile, Login, Register, NotFound
  lib/          format (Rupiah, tanggal relatif), whatsapp link builder, constants
  types/        tipe TypeScript untuk API
```

## Halaman & perilaku
- Home: grid listing (foto, nama, harga Rupiah, kondisi, lokasi), search (debounce 400 ms), filter kategori & kondisi, pagination. State filter disimpan di URL query string.
- Detail: galeri foto, harga, deskripsi, kondisi, lokasi, info penjual, tombol "Hubungi via WhatsApp" membuka `https://wa.me/<phone>?text=<encodeURIComponent(pesan)>`. Pesan awal: "Halo, saya tertarik dengan *{judul}* seharga {harga} di marketplace komunitas. Apakah masih tersedia?" Jika status `sold`, tampilkan badge "Terjual" dan nonaktifkan tombol.
- Form pasang/edit: validasi client (zod) mencerminkan validasi server, preview foto, tampilkan error server per field.
- Listing Saya: daftar milik sendiri dengan aksi Edit, Hapus (dengan konfirmasi), Tandai Terjual/Tersedia.
- Profil: info dasar + listing user.
- Route yang butuh login dilindungi (redirect ke login, lalu kembali ke halaman asal).

## Kualitas
- Setiap data fetching punya state: loading (skeleton), error (pesan + coba lagi), kosong (empty state).
- Tombol submit dinonaktifkan saat loading; tampilkan feedback sukses/gagal (toast sederhana).
- Aksesibilitas dasar: label pada input, `alt` pada gambar, fokus terlihat, kontras cukup.
- Responsif mobile-first (pengguna utama kemungkinan di HP).
- Format harga selalu `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.
- Jalankan `npm run lint` dan `npm run build` sebelum dianggap selesai.
