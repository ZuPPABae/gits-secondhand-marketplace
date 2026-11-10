# Rule: Dokumentasi & Git

## Dokumen yang wajib ada (bahasa Indonesia, ringkas, rapi)
- `README.md`: overview, fitur, tech stack, struktur proyek, prasyarat, cara menjalankan (Docker dan non-Docker), akun demo, cara test, link ke `/docs`, screenshot.
- `docs/architecture-app.md`: diagram Mermaid arsitektur aplikasi (alur user → frontend → API → DB/Redis/storage → layanan eksternal WhatsApp) + penjelasan.
- `docs/architecture-infra.md`: diagram Mermaid infrastruktur (DNS/CDN, WAF, load balancer, container autoscaling, PostgreSQL primary + read replica, Redis, object storage, monitoring/logging, backup, security boundary/subnet).
- `docs/scaling-reliability.md`: **asumsi** (100k DAU, ±20 request/sesi → ±2 juta request/hari ≈ 25 RPS rata-rata, puncak 5-10x ≈ 150-250 RPS, rasio baca:tulis ≈ 95:5, 3-5 foto/listing ≈ 300 KB setelah kompres, estimasi storage & bandwidth), caching, indexing, horizontal scaling, rate limiting, backup/recovery (RPO/RTO), strategi lonjakan traffic, kapan pindah ke search engine terpisah.
- `docs/security.md`: auth/otorisasi, validasi input, proteksi API, secret management, perlindungan data.
- `docs/database.md`: ERD Mermaid + penjelasan field penting + index.
- `docs/api.md`: tiap endpoint (method, path, auth, parameter/body, contoh response, kode error).
- `docs/decisions.md`: format ADR singkat (konteks, keputusan, alasan, alternatif, trade-off). Minimal: Laravel+React terpisah, Sanctum cookie, PostgreSQL, Redis, search Postgres trigram vs Elasticsearch, WhatsApp vs chat in-app, upload via API vs presigned, Docker Compose.
- `docs/operations.md`: deployment, env var, logging/monitoring, backup, troubleshooting dasar.

Semua diagram pakai Mermaid (` ```mermaid `). Pastikan sintaks valid.

## Git
- Commit kecil, bermakna, Conventional Commits berbahasa Inggris: `feat(listings): add search and filters`, `docs: add infra diagram`.
- `.gitignore` mencakup `.env`, `vendor/`, `node_modules/`, `storage` upload, `.DS_Store`, dsb. **Jangan pernah** commit `.env`, key, atau data pribadi.
- `.env.example` harus lengkap, berisi nilai placeholder aman.
