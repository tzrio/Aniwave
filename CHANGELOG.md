# Changelog

Semua perubahan penting untuk proyek Aniwave didokumentasikan di sini.

## v2.0.0 — 2026-10-31 (Complete Professional & Commercial Transformation)

### Added
- **Modern Design Token & Theme Engine (`assets/css/theme.css`)**:
  - Dukungan penuh Dark Mode dan Light Mode instan dengan local preference persistence.
  - Skema warna White-Label komersial dengan CSS variables (`--color-primary`, `--color-surface`, `--color-bg`).
  - Skeleton shimmer animations untuk transisi pemuatan data yang mulus.
- **Hero Showcase Carousel & Banner**:
  - Tampilan unggulan interaktif di halaman beranda dengan sinopsis singkat, badge tipe, rating bintang, dan akses cepat ke trailer resmi.
- **Admin Management System (`admin.html` & `assets/js/admin.js`)**:
  - Dashboard administrasi dengan proteksi login role-based access (admin/user).
  - Manajemen CRUD lengkap: Tambah, Edit, Hapus data anime.
  - Fitur Ekspor dan Impor katalog JSON langsung dari browser.
- **Sistem Autentikasi Pengguna (`assets/js/authService.js`, `assets/js/navComponent.js`)**:
  - Modal login dan registrasi interaktif tanpa refresh halaman.
  - Manajemen sesi pengguna dan mode guest yang tetap fungsional.
- **Watchlist & Bookmark Engine (`assets/js/watchlistService.js`)**:
  - Pengguna dapat menyimpan anime ke watchlist personal dengan penanda status ('plan', 'watching', 'completed').
  - Tab navigasi khusus "Watchlist Saya" di halaman beranda.
- **SEO & Structured Microdata (`assets/js/seoService.js`)**:
  - Dynamic OpenGraph cards, Twitter cards, meta description generator, serta Schema.org JSON-LD (TVSeries & Movie).
  - File `sitemap.xml`, `robots.txt`, dan `manifest.json`.
- **Legal Streaming Direct Integration**:
  - Integrasi resmi ke penyedia berlisensi (Crunchyroll, Netflix, Bilibili, Muse Asia).
  - Pembersihan total link unduhan tidak berizin (Zippyshare/Mediafire).
- **Halaman Pemutar Video Streaming (`watch.html` & `assets/js/watch.js`)**:
  - Video player responsif dengan multi-server switcher.
  - Selektor episode (1 - N), tombol Previous / Next episode, dan auto-save riwayat tontonan.
  - Fitur Mode Bioskop (Cinema Mode).
- **Auto-Sync Metadata MyAnimeList (`assets/js/jikanSyncService.js`)**:
  - Tombol integrasi di Admin Dashboard untuk menarik data anime otomatis dari API MyAnimeList (Jikan v4).
- **Dual-Mode Firebase Cloud Adapter (`assets/js/firebaseService.js` & `assets/js/firebaseConfig.js`)**:
  - Sinkronisasi realtime Firestore jika dikonfigurasi, dengan fallback lokal instan saat offline.
- **Modal Pemutar Video Trailer**:
  - Putar trailer YouTube resmi langsung di modal pop-up responsif.
- **Dokumentasi Komersial Lengkap (`docs/`)**:
  - `TECHNICAL_AUDIT.md`, `ARCHITECTURE.md`, `ADMIN_GUIDE.md`, `COMMERCIAL_HANDOVER.md`, `DEPLOYMENT.md`.
- **Automated Validation Test Suite (`tests/test_suite.js`)**.

### Changed
- Pembaruan total markup HTML `index.html` dan `anime.html` ke standar semantic HTML5 modern.
- Refaktorisasi modular arsitektur JS ke ES Modules berorientasi layanan (`animeService`, `authService`, `seoService`, `watchlistService`, `toastService`).
- Normalisasi dan modernisasi skema `data/anime.json` mencakup ratings terverifikasi, genres array, dan link provider legal.

---

## v1.0.0 — 2026-01-02
- Rilis inisial katalog statis anime sederhana.
