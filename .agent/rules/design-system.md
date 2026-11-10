# Rule: Design System (minimalis, modern, tidak ramai warna)

## Prinsip
Bersih, lega, mudah dipindai. Konten (foto & harga) jadi fokus. Tampilan seperti produk SaaS modern, bukan toko online ramai.

## Palet
- Netral dominan: skala `zinc` (background `white` / `zinc-50`, teks `zinc-900`, teks sekunder `zinc-500`, border `zinc-200`).
- **Satu** warna aksen: `indigo-600` (hover `indigo-700`) untuk tombol utama, link aktif, fokus ring.
- Warna semantik hanya untuk status, dan versi lembut: Tersedia = `emerald-50` bg + `emerald-700` teks; Terjual = `zinc-100` bg + `zinc-500` teks; error = `red-600`.
- DILARANG: gradient, warna neon, lebih dari satu aksen, shadow tebal, animasi berlebihan.

## Tipografi & bentuk
- Font: Inter (via `@fontsource-variable/inter`, jangan CDN eksternal). Judul `font-semibold tracking-tight`; body 14-16px.
- Radius `rounded-lg` (kartu `rounded-xl`), border 1px `zinc-200`, shadow hanya `shadow-sm` pada hover kartu.
- Spasi lega: container `max-w-6xl mx-auto px-4`, gap grid 16-24px.

## Komponen
- ListingCard: foto rasio 4:3 (`object-cover`), judul 1-2 baris (`line-clamp-2`), harga tebal, baris kecil kondisi (badge netral) + lokasi. Hover: border sedikit lebih gelap, tanpa zoom berlebihan.
- Tombol: primary (indigo solid), secondary (putih + border), ghost; tinggi 40px; state disabled & loading jelas.
- Input: border `zinc-300`, fokus `ring-2 ring-indigo-600/20 border-indigo-600`.
- Navbar sederhana: logo teks di kiri, search/link di tengah/kanan, tombol "Pasang Barang" (primary) dan menu akun.
- Gunakan ikon `lucide-react` ukuran 16-20px, stroke tipis, seperlunya.
- Dark mode: tidak perlu untuk MVP.

## Copy (Bahasa Indonesia)
Singkat, ramah, tidak formal berlebihan. Contoh: "Pasang Barang", "Cari barang bekas…", "Belum ada barang yang cocok", "Hubungi via WhatsApp", "Tandai Terjual".
