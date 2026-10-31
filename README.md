# SMILEORA (v3.0.0-PRO by SMILEON)

> *"Where Stories Create Smiles."*  
> A universe of stories, emotions, and unforgettable adventures.

**Official Product:** SMILEORA  
**Parent Company:** SMILEON  
**Release Version:** `v3.0.0-PRO`  
**Live Production URL:** https://tzrio.github.io/Aniwave  

---

## 🌟 Tentang SMILEORA

**SMILEORA** menggabungkan esensi **SMILE** (kebahagiaan, emosi positif, dan kenangan indah bersama cerita) dengan **ORA** (aura, aurora, dan semesta imajinasi tanpa batas). Platform ini dibangun sebagai sistem penemuan dan streaming anime premium yang cepat, aman, elegan, dan siap dikomersialkan (*white-label commercial ready*).

---

## ✨ Fitur Unggulan

- 🎨 **Deep Aurora Design System (`assets/css/theme.css`)**:
  - Tema elegan modern Deep Navy (`#0B0D17`) dengan aksen Aurora Purple (`#A78BFA` & `#7C5CFC`).
  - Dark/Light mode instan dengan *local storage persistence*.
  - *Skeleton shimmer loaders* dan layout responsif untuk seluruh ukuran layar (Mobile 360px hingga Desktop 4K).
- 🎬 **Hero Showcase & Continue Watching Row**:
  - Tampilan unggulan dinamis dengan akses cepat ke episode 1.
  - Baris riwayat *"Lanjutkan Menonton"* yang mengingat progress menit dan episode terakhir.
- 📺 **Universal Video Player & Streaming Engine (`watch.html`)**:
  - Dukungan streaming adaptif **HLS (`hls.js`)**, **HTML5 MP4**, dan **Sandboxed Partner Embed**.
  - **Multi-Server Switcher** (*Server Aurora*, *Server Zenith*, dll) dengan fitur cerdas **Intelligent Server Auto-Fallback**.
  - Dukungan subtitle multi-bahasa (WebVTT), selektor episode (1–N), tombol Prev/Next, dan **Mode Bioskop (Cinema Mode)**.
- ⚡ **Auto-Sync Metadata Dual-API (Jikan v4 + AniList GraphQL)**:
  - Tarik data instan (judul, sinopsis, poster HD, rating, trailer YouTube, studio, tahun) dari MyAnimeList dan AniList tanpa kendala CORS/rate-limit.
- ☁️ **Dual-Mode Cloud Architecture (Firebase Firestore `smileora-tzrio`)**:
  - Terhubung langsung ke cloud Firestore untuk sinkronisasi antar-perangkat.
  - Memiliki fitur *zero-failure graceful fallback* ke data lokal saat offline.
- 📌 **Watchlist & Bookmark Personal**:
  - Simpan anime ke daftar pantau (*Plan to Watch*, *Watching*, *Completed*) tanpa wajib login.
- 🔒 **Sistem Akun & Autentikasi Pengguna**:
  - Modal login/registrasi interaktif, manajemen profil, dan Role-Based Access Control (RBAC).
- 🛠️ **SMILEORA Studio Admin (`admin.html`)**:
  - CRUD lengkap untuk mengelola anime, episode, dan server streaming.
  - Tombol **Sync ke Firestore Cloud**, **Ekspor JSON**, dan **Impor JSON**.
- 🛡️ **Kepatuhan Legalitas & Hak Cipta**:
  - 100% bebas dari link unduhan bajakan.
  - Terintegrasi langsung dengan distributor resmi berlisensi (Crunchyroll, Netflix, Bilibili, Muse Asia).
- 🚀 **SEO & Structured Microdata**:
  - OpenGraph, Twitter Cards, Schema.org JSON-LD (`TVSeries` / `Movie`), `sitemap.xml`, `robots.txt`, dan `manifest.json`.

---

## 📸 Antarmuka Platform (Screenshots)

### 1. Beranda & Katalog Anime (Deep Aurora Interface)
![SMILEORA Homepage](docs/img/screenshot-home.svg)

### 2. Universal Streaming Player & Multi-Server (`watch.html`)
![SMILEORA Universal Player](docs/img/screenshot-player.svg)

### 3. Studio Admin Dashboard & Auto-Sync (`admin.html`)
![SMILEORA Studio Admin](docs/img/screenshot-admin.svg)

---

## 🚀 Panduan Menjalankan

Jalankan server lokal di root folder:

```bash
# Menggunakan Python 3
python3 -m http.server 8000
```
Buka browser di:
- **Katalog & Beranda:** `http://localhost:8000/index.html`
- **Streaming Player:** `http://localhost:8000/watch.html#id=aot-s4&ep=1`
- **SMILEORA Studio Admin:** `http://localhost:8000/admin.html`
  - *Username:* `admin` (atau `admin@aniwave.local`)
  - *Password:* `admin123`

---

## 📚 Dokumentasi Lengkap

1. [Technical Audit (docs/TECHNICAL_AUDIT.md)](docs/TECHNICAL_AUDIT.md)
2. [Sistem Streaming & Player (docs/STREAMING_SYSTEM.md)](docs/STREAMING_SYSTEM.md)
3. [Skema Database (docs/DATABASE_SCHEMA.md)](docs/DATABASE_SCHEMA.md)
4. [Arsitektur Sistem (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)
5. [Panduan Administrator (docs/ADMIN_GUIDE.md)](docs/ADMIN_GUIDE.md)
6. [Keamanan & Proteksi Siber (docs/SECURITY.md)](docs/SECURITY.md)
7. [Kebijakan Hak Cipta & Lisensi (docs/LICENSING_AND_ATTRIBUTION.md)](docs/LICENSING_AND_ATTRIBUTION.md)
8. [Panduan Serah Terima Komersial (docs/COMMERCIAL_HANDOVER.md)](docs/COMMERCIAL_HANDOVER.md)
9. [Panduan Deployment (docs/DEPLOYMENT.md)](docs/DEPLOYMENT.md)

---

## 🧪 Validasi & Integrity Test

Verifikasi integritas seluruh skema data, konfigurasi merek, dan berkas sistem:

```bash
node tests/test_suite.js
```
