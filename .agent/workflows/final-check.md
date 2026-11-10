---
description: Verifikasi akhir sebelum submit repo ke GITS
---

Jalankan semua pengecekan, perbaiki yang gagal, lalu laporkan hasilnya dalam bentuk checklist.

1. Bersihkan lalu jalankan dari nol: `docker compose down -v && docker compose up --build`; migrate + seed berjalan otomatis atau terdokumentasi jelas di README. Aplikasi terbuka di `http://localhost:5173`.
2. Uji manual semua fitur wajib di `AGENTS.md` dari UI (register → login → pasang barang dengan foto → edit → tandai terjual → hapus → logout; search & filter; tombol WhatsApp; profil).
3. `php artisan test`, `./vendor/bin/pint --test`, `npm run lint`, `npm run build` semuanya lolos.
4. Cari secret yang tidak sengaja ter-commit: `.env` asli, API key, password nyata, token (`git ls-files | grep -i env`, grep pola key). Pastikan hanya `.env.example` yang ada.
5. Semua dokumen di `README.md` dan `/docs` ada, tidak ada placeholder "TODO", dan setiap diagram Mermaid valid.
6. README memuat: akun demo, langkah setup lokal, link ke docs, screenshot, dan catatan jujur tentang apa yang dibangun vs hanya dirancang (CDN, replica, dsb).
7. `git status` bersih, commit history rapi. Laporkan daftar yang lolos/tidak lolos dan hal yang disarankan diperbaiki jika waktu masih ada.
