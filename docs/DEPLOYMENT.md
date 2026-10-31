# Aniwave Installation & Deployment Guide

## 1. Persyaratan Sistem
- Web browser modern dengan dukungan ES Modules (Chrome, Edge, Firefox, Safari).
- Server statis lokal (Python, Node.js http-server, atau VS Code Live Server).

## 2. Menjalankan di Lokal (Development)

### Opsi A: Python (Bawaan OS)
```bash
python3 -m http.server 8000
```
Buka browser di `http://localhost:8000`.

### Opsi B: Node.js `serve` / `npx`
```bash
npx serve .
```

## 3. Deployment ke GitHub Pages (Production)
1. Push branch utama ke GitHub:
   ```bash
   git add .
   git commit -m "feat: complete v2.0 transformation"
   git push origin main
   ```
2. Buka repository di GitHub: **Settings** &rarr; **Pages**.
3. Di bagian **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main`, folder `/ (root)`
4. Klik **Save**. Platform akan online dalam 1-2 menit.

## 4. Deployment ke Cloudflare Pages / Vercel
- Buat proyek baru di Cloudflare Pages atau Vercel.
- Pilih direktori root repositori.
- Build command: *(Kosongkan / None)*
- Output directory: *(Root `.`)*
