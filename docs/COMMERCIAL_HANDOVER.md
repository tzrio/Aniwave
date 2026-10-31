# Aniwave Commercial Handover & White-Label Customization Guide

## 1. White-Label Customization
Untuk mengubah identitas merek, logo, dan skema warna untuk pembeli atau pemilik baru:
1. Buka file `assets/js/config.js`.
2. Ubah atribut `CONFIG.site`:
   - `name`: Nama website baru Anda.
   - `tagline`: Slogan platform.
   - `creator`: Nama pemilik / lisensi brand.
   - `contactEmail`: Email resmi support.
3. Ubah warna aksen di `assets/css/theme.css`:
   - `--color-primary`: Ganti kode warna hex (misal `#00c853` untuk aksen hijau neon).
   - `--color-primary-rgb`: Nilai RGB untuk efek glow.

## 2. Monetization Configuration
1. **Affiliate Streaming Links**:
   - Di `assets/js/config.js`, sesuaikan `CONFIG.monetization.affiliateBanner`.
   - Masukkan ID afiliasi Crunchyroll atau platform streaming resmi Anda.
2. **Sponsorship & Ad Slots**:
   - Terdapat slot kontainer di `index.html` dan `anime.html` yang siap menerima script iklan display dari Google AdSense atau jaringan iklan resmi lainnya.

## 3. Copyright & Legal Notice
- Seluruh poster, visual cover, dan cuplikan video adalah milik masing-masing komite produksi studio animasi Jepang.
- Aniwave bertindak sebagai direktori katalog dan kurator penemuan (discovery engine). Platform ini tidak melakukan hosting video berhak cipta ilegal, melainkan mengarahkan pengguna ke distributor lisensi resmi.
