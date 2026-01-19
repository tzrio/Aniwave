# Web Anime (Aniwave)

Web simpel buat lihat daftar anime + halaman detail.

**Tags:** `static-site` `html` `css` `javascript` `anime` `filter` `github-pages`

**Release:** `v1.0.0` (lihat [CHANGELOG.md](CHANGELOG.md) dan tab **Releases** di GitHub)

## Daftar Isi
- [Fitur](#fitur)
- [Cara Menjalankan](#cara-menjalankan)
- [Update Terbaru (Jan 2026)](#update-terbaru-jan-2026)
- [Struktur & File Penting](#struktur--file-penting)
- [Upload ke GitHub (GitHub Pages)](#upload-ke-github-github-pages)

## Fitur
- Beranda: search + filter (Genre/Tipe/Status)
- Tampilan per bab: **Serial** dan **Film**
- Preview list per bab max **3 baris** (mode default), ada tombol **Lihat lainnya** di kanan
- Halaman detail: sinopsis, info, dan tabel unduhan
- UI konsisten: header seragam, font seragam, scrollbar nyatu tema

## Cara Menjalankan

### Direkomendasikan (pakai server lokal)
Karena browser sering membatasi `fetch()` saat dibuka via `file://`, paling aman jalankan pakai server lokal.

**Opsi A (Python)**
```bash
cd "Web Anime"
python -m http.server 5174
```
Lalu buka: `http://localhost:5174/index.html`

**Opsi B (VS Code Live Server)**
- Klik kanan `index.html` → **Open with Live Server**

### Tetap bisa tanpa server
Kalau dibuka langsung (double click `index.html`), web akan coba load data dari [data/anime.json](data/anime.json).

## Update Terbaru (Jan 2026)
- Per bab (Serial/Film) kartu dibatasi max **3 baris** saat mode default + tombol **Lihat lainnya** di pojok kanan bab.
- Layout filter lebih efisien: **filter di kiri** (digroup), **search di kanan**.
- Scrollbar dibuat lebih elegan dan sesuai tema.
- Header beranda dan page anime disamakan.
- Font diseragamkan via global style (nggak ada lagi override font halaman tertentu).

## Struktur & File Penting
- Beranda: [index.html](index.html)
- Detail: [anime.html](anime.html)
- Data utama: [data/anime.json](data/anime.json)
- CSS global (header + background + font + scrollbar): [assets/css/global.css](assets/css/global.css)
- CSS beranda: [assets/css/beranda.css](assets/css/beranda.css)
- CSS detail: [assets/css/hiasan.css](assets/css/hiasan.css)
- Modul fetch data: [assets/js/fetchAnime.js](assets/js/fetchAnime.js)
- Modul filter: [assets/js/filterAnime.js](assets/js/filterAnime.js)
- Modul render: [assets/js/renderAnime.js](assets/js/renderAnime.js)
- Entrypoint beranda: [assets/js/beranda.js](assets/js/beranda.js)
- Entrypoint detail: [assets/js/anime.js](assets/js/anime.js)
- Utilitas umum: [assets/js/utils.js](assets/js/utils.js)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

## Dokumentasi Modul
### Alur Data
1. Beranda: `beranda.js` memanggil `fetchAnimeData()` → `collectFilterOptions()` → `renderAnimeList()`.
2. Detail: `anime.js` memanggil `fetchAnimeData()` → `renderSynopsis()` + `renderInfo()` + `renderDownloads()`.

### Kontrak Data (Ringkas)
- `title`: string
- `cover`: string (path image)
- `sinopsis`: array of string
- `info`: object (mis. `Tipe`, `Status`, `Tahun`, `Genre`)
- `downloads`: array of group `{ episode, rows[] }`

### Catatan JSON
Semua data anime **wajib** berasal dari [data/anime.json](data/anime.json). Tidak ada data anime di HTML/JS.

## Upload ke GitHub (GitHub Pages)
1. Push repo ini ke GitHub.
2. Buka **Settings → Pages**.
3. Pilih **Deploy from a branch**.
4. Pilih branch (mis. `main`) dan folder **/** (root).
5. Setelah live, akses halaman utama dari `.../index.html`.

Catatan: karena ini static site, tidak perlu build step.
