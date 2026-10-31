# Aniwave Administrator & Operator Guide

## 1. Accessing Admin Dashboard
1. Buka halaman `admin.html` pada browser Anda.
2. Jika belum login, gunakan kredensial default sistem:
   - **Username:** `admin` (atau `admin@aniwave.local`)
   - **Password:** `admin123`
3. Setelah login berhasil, seluruh tabel dan tombol CRUD akan aktif secara otomatis.

## 2. Fitur Utama Admin
- **Tambah Anime Baru (`+ Tambah Anime Baru`)**: Membuka form modal lengkap untuk memasukkan judul, ID unik, format (Serial/Film), skor rating, tahun rilis, studio, cover path, link trailer YouTube, dan sinopsis.
- **Edit Data Anime**: Tombol `Edit` pada masing-masing baris memungkinkan perubahan instan data tanpa perlu menyentuh kode program.
- **Hapus Anime**: Menghapus anime dari katalog publik.
- **Ekspor JSON**: Mengunduh seluruh basis data katalog terbaru (termasuk hasil penambahan/perubahan lokal) ke file `.json`.
- **Impor JSON**: Memungkinkan migrasi atau restore basis data massal langsung dari file JSON.

## 3. Deployment Perubahan Data ke Server Permanen
Karena platform ini berjalan di atas arsitektur statis:
1. Lakukan ekspor dataset melalui tombol **Ekspor JSON**.
2. Timpa file `data/anime.json` di repositori dengan file hasil unduhan.
3. Commit dan push ke branch GitHub untuk memperbarui data permanen di GitHub Pages / Server produksi.
