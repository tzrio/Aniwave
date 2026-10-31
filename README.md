# Aniwave (v2.0.0 Production Edition)

Platform penemuan katalog anime modern, cepat, dan siap komersial (White-Label Ready).

**Brand Asli:** TzRIO  
**Versi:** `v2.0.0` (Production & Commercial Release)  
**Demo / URL:** https://tzrio.github.io/Aniwave

---

## Fitur Utama

- 🎨 **Modern Dark/Light UI/UX**: Sistem token desain adaptif dengan transisi tema halus dan shimmer skeleton loader.
- 🎬 **Hero Showcase & Trailer**: Banner unggulan anime dengan pemutar trailer YouTube resmi di modal terisolasi.
- 🔍 **Pencarian & Multi-Filter Canggih**: Cari berdasarkan judul, judul alternatif, genre dinamis, format (Serial/Film), status tayang, serta sorting (Rating, Rilis, Alfabet).
- 📌 **Watchlist Personal**: Simpan anime favorit ke daftar pantau (*Plan to Watch*, *Watching*, *Completed*) tanpa wajib login.
- 🔒 **Sistem Autentikasi Pengguna**: Modal login/registrasi modern, dukungan sesi pengguna, dan kontrol akses berbasis peran (RBAC).
- 🛠️ **Admin Dashboard (`admin.html`)**: CRUD anime lengkap (Tambah, Edit, Hapus) dengan fitur **Ekspor/Impor JSON** instan.
- 🛡️ **Kepatuhan Hak Cipta & Legalitas**: Bersih dari link unduhan ilegal; terhubung langsung ke mitra berlisensi resmi (Crunchyroll, Netflix, Bilibili, Muse Asia).
- 🚀 **SEO & Structured Data**: Dukungan OpenGraph, Twitter Cards, dan Schema.org JSON-LD (`TVSeries` / `Movie`) teruji.
- 📦 **White-Label Architecture**: Kustomisasi nama merek, slogan, logo, dan skema warna terpusat di `assets/js/config.js` dan `assets/css/theme.css`.

---

## Panduan Cepat Menjalankan

Jalankan server statis lokal di root folder:

```bash
# Menggunakan Python 3
python3 -m http.server 8000
```
Buka browser Anda di `http://localhost:8000`.

Untuk kredensial default Administrator:
- **Username:** `admin` (atau `admin@aniwave.local`)
- **Password:** `admin123`

---

## Dokumentasi Lengkap

1. [Technical Audit (docs/TECHNICAL_AUDIT.md)](docs/TECHNICAL_AUDIT.md)
2. [Arsitektur Sistem (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)
3. [Panduan Administrator (docs/ADMIN_GUIDE.md)](docs/ADMIN_GUIDE.md)
4. [Panduan Serah Terima Komersial / White-Label (docs/COMMERCIAL_HANDOVER.md)](docs/COMMERCIAL_HANDOVER.md)
5. [Panduan Instalasi & Deployment (docs/DEPLOYMENT.md)](docs/DEPLOYMENT.md)

---

## Menjalankan Unit & Integrity Test

Verifikasi integritas skema data dan ketersediaan modul dengan menjalankan:

```bash
node tests/test_suite.js
```
