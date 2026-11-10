---
description: Tulis seluruh dokumentasi teknis dan diagram Mermaid berdasarkan kode yang sudah ada
---

Baca kode aktual di `/backend` dan `/frontend` (jangan mengarang endpoint atau tabel yang tidak ada) dan ikuti `.agent/rules/docs-git.md` serta `.agent/rules/storage-cdn.md`.

1. Buat/lengkapi `README.md` dan semua file di `/docs` sesuai daftar di rule docs-git. Bahasa Indonesia.
2. `docs/api.md` harus cocok dengan route sebenarnya (`php artisan route:list --path=api`).
3. `docs/database.md` harus cocok dengan migration sebenarnya; ERD dalam Mermaid `erDiagram`.
4. `docs/architecture-app.md` dan `docs/architecture-infra.md`: diagram Mermaid `flowchart` yang valid; jelaskan alasan tiap komponen. Pisahkan jelas mana yang sudah dibangun di MVP dan mana yang hanya rancangan skala 100k DAU.
5. `docs/scaling-reliability.md`: tulis asumsi traffic dengan angka dan perhitungan singkat, lalu strategi scaling, caching, indexing, rate limiting, backup & recovery (sebutkan RPO/RTO target).
6. `docs/decisions.md`: minimal 8 keputusan dengan alternatif dan trade-off.
7. Pastikan setiap diagram Mermaid dapat ter-render (cek sintaks, tidak ada karakter yang merusak node label — bungkus label dengan tanda kutip).
8. Tambahkan bagian "Future work" (chat in-app, presigned upload, search engine terpisah, CI/CD, admin).
