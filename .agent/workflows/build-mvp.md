---
description: Bangun MVP marketplace secara bertahap sesuai prioritas, dengan checkpoint tiap fase
---

Baca `AGENTS.md` dan semua file di `.agent/rules/` terlebih dahulu. Kerjakan fase berurutan; setelah tiap fase, jalankan test/lint/build, buat commit, lalu ringkas hasilnya sebelum lanjut. Jangan lompat fase dan jangan menambah fitur di luar scope.

## Fase 0 — Fondasi (±30 menit)
1. Buat struktur repo, `.gitignore`, `docker-compose.yml` (backend, frontend, postgres, redis) + Dockerfile backend & frontend untuk dev, dan semua `.env.example`.
2. Inisialisasi Laravel 12 di `/backend` dan Vite React TS di `/frontend` (Tailwind v4, proxy `/api` & `/sanctum`).
3. Pastikan `docker compose up --build` berjalan dan kedua service bisa dibuka.

## Fase 1 — Database & seeder
1. Migration + model + enum + relasi sesuai rule backend (termasuk index dan pg_trgm).
2. Seeder kategori, user demo, ±30 listing.

## Fase 2 — Auth
1. Backend: register, login, logout, `/me` (Sanctum SPA cookie) + rate limit + feature test.
2. Frontend: halaman Login/Register, auth context/hook, route protection, navbar dinamis.

## Fase 3 — Listing publik
1. Backend: `GET /listings` (search `q`, filter kategori & kondisi, pagination), `GET /listings/{id}`, `GET /categories`, cache Redis.
2. Frontend: Home (grid + search + filter + pagination, state di URL), Detail + tombol WhatsApp, komponen state loading/empty/error.

## Fase 4 — Kelola listing
1. Backend: create (upload foto), update, delete, ubah status, `/me/listings`, Policy, validasi, feature test otorisasi.
2. Frontend: form pasang/edit, Listing Saya (edit/hapus/tandai terjual), Profil user.

## Fase 5 — Polish
1. Rapikan UI sesuai `design-system.md`, cek responsif mobile, cek semua state.
2. Ambil screenshot ke `/screenshots` (halaman Home, Detail, Form, Listing Saya, Profil).

Setelah selesai, jalankan `/write-docs` lalu `/final-check`.
