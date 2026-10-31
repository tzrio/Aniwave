/**
 * SMILEORA Admin Dashboard Controller
 * Enforces admin authorization, manages CRUD operations, imports/exports
 * Auto-Sync supports: Title Search, Direct MAL URL, and MAL ID with interactive picker
 */
import { setupNavigation } from './navComponent.js';
import { authService } from './authService.js';
import { animeService } from './animeService.js';
import { toastService } from './toastService.js';
import { jikanSyncService } from './jikanSyncService.js';
import { firebaseService } from './firebaseService.js';

let allAnimeData = {};

async function initAdmin() {
  setupNavigation();

  const user = authService.getCurrentUser();
  if (!user || user.role !== 'admin') {
    toastService.error('Akses ditolak. Silakan login sebagai administrator (admin / admin123).');
    const table = document.getElementById('admin-anime-table');
    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="6" style="padding:40px; text-align:center;">
            <p style="color:var(--color-danger); font-weight:700; font-size:1.1rem; margin-bottom:12px;">🔒 Diperlukan Hak Akses Administrator</p>
            <p style="color:var(--color-text-muted); font-size:0.9rem; margin-bottom:16px;">Gunakan akun <code>admin</code> dan password <code>admin123</code> untuk mengelola data katalog.</p>
          </td>
        </tr>
      `;
    }
    return;
  }

  await loadAndRenderAdmin();
  bindAdminEvents();
}

async function loadAndRenderAdmin() {
  allAnimeData = await animeService.getAllAnime();
  const entries = Object.entries(allAnimeData).filter(([, a]) => !a._deleted);

  // Update Stats
  document.getElementById('stat-total').textContent = entries.length;
  const seriesCount = entries.filter(([, a]) => String(a.type || '').toLowerCase() === 'serial').length;
  const movieCount = entries.filter(([, a]) => String(a.type || '').toLowerCase().includes('film')).length;
  document.getElementById('stat-series').textContent = seriesCount;
  document.getElementById('stat-movies').textContent = movieCount;

  // Render Table
  const tbody = document.getElementById('admin-anime-table');
  if (!tbody) return;
  tbody.innerHTML = '';

  for (const [id, anime] of entries) {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--color-border)';

    tr.innerHTML = `
      <td style="padding:12px 16px; display:flex; align-items:center; gap:12px;">
        <img src="${anime.cover || 'assets/img/smileora-mark.svg'}" alt="" style="width:40px; height:56px; object-fit:cover; border-radius:4px;" />
        <div>
          <div style="font-weight:700; color:var(--color-text-main); font-size:0.95rem;">${escapeHtml(anime.title)}</div>
          <div style="font-size:0.75rem; color:var(--color-text-subtle);">ID: ${escapeHtml(id)}</div>
        </div>
      </td>
      <td style="padding:12px 16px; font-size:0.85rem; font-weight:600;">${anime.type || 'Serial'}</td>
      <td style="padding:12px 16px; font-size:0.85rem; color:var(--color-text-muted);">${anime.year || '—'}</td>
      <td style="padding:12px 16px; font-size:0.85rem; color:var(--color-text-muted);">${anime.studio || '—'}</td>
      <td style="padding:12px 16px; font-size:0.85rem; font-weight:700; color:#FACC15;">★ ${anime.score || '—'}</td>
      <td style="padding:12px 16px; text-align:right;">
        <button class="btn-secondary btn-edit" data-id="${id}" style="padding:4px 10px; font-size:0.8rem; margin-right:4px;">Edit</button>
        <button class="btn-secondary btn-delete" data-id="${id}" style="padding:4px 10px; font-size:0.8rem; color:var(--color-danger); border-color:var(--color-danger);">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openEditForm(btn.dataset.id));
  });

  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const ok = await toastService.confirm({
        title: 'Hapus Anime?',
        message: `Apakah Anda yakin ingin menghapus anime <strong>${escapeHtml(id)}</strong> dari katalog?`,
        confirmText: 'Ya, Hapus',
        danger: true
      });
      if (ok) {
        await animeService.deleteAnime(id);
        toastService.success('Anime berhasil dihapus.');
        loadAndRenderAdmin();
      }
    });
  });
}

function bindAdminEvents() {
  const modal = document.getElementById('anime-form-modal');
  const closeBtn = document.getElementById('anime-form-close');
  const cancelBtn = document.getElementById('form-cancel');

  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
  cancelBtn?.addEventListener('click', () => modal.classList.remove('active'));

  document.getElementById('btn-new-anime')?.addEventListener('click', () => {
    openCreateForm();
  });

  document.getElementById('btn-sync-mal')?.addEventListener('click', () => {
    openCreateForm();
    toastService.info('Tempelkan Link URL MAL atau ketik judul di kolom atas form.');
  });

  // Auto-Sync Jikan / MAL / AniList Button
  document.getElementById('btn-fetch-mal')?.addEventListener('click', async () => {
    const q = document.getElementById('mal-search-query').value.trim();
    if (!q) {
      toastService.error('Ketik judul anime, ID MAL, atau tempelkan link URL MyAnimeList terlebih dahulu.');
      return;
    }

    toastService.info(`Mencari data untuk "${q}"...`);
    const resultsContainer = document.getElementById('mal-search-results');

    try {
      const results = await jikanSyncService.fetchByQueryOrUrl(q);
      if (!results || results.length === 0) {
        toastService.error('Anime tidak ditemukan. Pastikan judul benar atau coba tempelkan link URL MAL langsung.');
        if (resultsContainer) resultsContainer.style.display = 'none';
        return;
      }

      // If exactly 1 match (e.g. from direct URL/ID), auto-fill directly
      if (results.length === 1) {
        fillFormWithAnime(results[0]);
        if (resultsContainer) resultsContainer.style.display = 'none';
        return;
      }

      // Multiple results: show interactive choice list
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'block';

        results.forEach(item => {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.alignItems = 'center';
          row.style.gap = '10px';
          row.style.padding = '8px 12px';
          row.style.borderBottom = '1px solid var(--color-border)';
          row.style.cursor = 'pointer';
          row.style.transition = 'background 0.15s ease';

          row.onmouseenter = () => row.style.background = 'var(--color-surface-hover)';
          row.onmouseleave = () => row.style.background = 'transparent';

          row.innerHTML = `
            <img src="${item.cover}" style="width:32px; height:46px; object-fit:cover; border-radius:3px;" />
            <div style="flex:1;">
              <strong style="font-size:0.85rem; color:var(--color-text-main);">${escapeHtml(item.title)}</strong>
              <div style="font-size:0.75rem; color:var(--color-text-muted);">${item.year || '—'} &bull; ${item.type} &bull; ★ ${item.score || '—'}</div>
            </div>
            <button type="button" class="btn-primary" style="padding:4px 10px; font-size:0.75rem;">Pilih Ini</button>
          `;

          row.onclick = () => {
            fillFormWithAnime(item);
            resultsContainer.style.display = 'none';
          };

          resultsContainer.appendChild(row);
        });
      }
    } catch (err) {
      toastService.error(`Gagal sync data: ${err.message}`);
    }
  });

  // Push Local Data to Firebase Cloud
  document.getElementById('btn-sync-firebase')?.addEventListener('click', async () => {
    if (!firebaseService.isOnline) {
      toastService.error('Firebase belum dikonfigurasi di assets/js/firebaseConfig.js');
      return;
    }

    const entries = Object.entries(allAnimeData).filter(([, a]) => !a._deleted);
    const ok = await toastService.confirm({
      title: 'Upload ke Firebase Cloud',
      message: `Sinkronkan <strong>${entries.length} anime</strong> lokal langsung ke cloud database Firestore? Data akan dapat diakses publik dari perangkat mana pun.`,
      confirmText: 'Mulai Sinkronisasi'
    });
    if (!ok) return;

    toastService.info(`Sedang mengupload ${entries.length} anime ke Firebase...`);
    let successCount = 0;
    for (const [id, anime] of entries) {
      try {
        await firebaseService.saveAnime({ ...anime, id });
        successCount++;
      } catch (e) {
        console.warn(`Gagal upload ${id}:`, e);
      }
    }
    toastService.success(`Selesai! ${successCount} dari ${entries.length} anime tersimpan di cloud Firestore.`);
  });

  // Export JSON
  document.getElementById('btn-export-json')?.addEventListener('click', async () => {
    const dataStr = await animeService.exportFullDataset();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smileora_anime_catalog_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toastService.success('Katalog berhasil diekspor.');
  });

  // Import JSON
  document.getElementById('btn-import-json')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const count = await animeService.importDataset(evt.target.result);
          toastService.success(`Berhasil mengimpor ${count} anime!`);
          loadAndRenderAdmin();
        } catch (err) {
          toastService.error(`Gagal impor: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // Form Submit
  document.getElementById('anime-record-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const id = document.getElementById('form-id').value.trim();
      const title = document.getElementById('form-title').value.trim();
      const type = document.getElementById('form-type').value;
      const score = parseFloat(document.getElementById('form-score').value) || null;
      const year = parseInt(document.getElementById('form-year').value, 10) || null;
      const studio = document.getElementById('form-studio').value.trim();
      const status = document.getElementById('form-status').value;
      const cover = document.getElementById('form-cover').value.trim();
      const trailerUrl = document.getElementById('form-trailer').value.trim();
      const genres = document.getElementById('form-genres').value.split(',').map(s => s.trim()).filter(Boolean);
      const synopsis = document.getElementById('form-synopsis').value.split('\n').filter(Boolean);

      const oldId = document.getElementById('form-editing-old-id').value.trim();

      const record = {
        id,
        title,
        type,
        score,
        year,
        studio,
        status,
        statusText: status === 'finished' ? 'Tamat' : 'Sedang tayang',
        cover: cover || 'assets/img/smileora-mark.svg',
        banner: cover || 'assets/img/smileora-mark.svg',
        trailerUrl,
        genres,
        sinopsis: synopsis.length ? synopsis : ['Sinopsis belum tersedia.'],
        authorizedProviders: allAnimeData[id]?.authorizedProviders || [
          { name: 'Crunchyroll', url: 'https://www.crunchyroll.com', type: 'subscription' }
        ]
      };

      await animeService.saveAnime(record, oldId);
      toastService.success(`Anime ${title} berhasil disimpan!`);
      modal.classList.remove('active');
      loadAndRenderAdmin();
    } catch (err) {
      toastService.error(err.message);
    }
  });
}

function fillFormWithAnime(match) {
  // Hanya timpa ID jika kita sedang dalam mode "Tambah Baru", bukan saat edit ID yang sudah ada
  const oldId = document.getElementById('form-editing-old-id').value;
  if (!oldId) {
    document.getElementById('form-id').value = match.id;
  }
  document.getElementById('form-title').value = match.title;
  document.getElementById('form-type').value = match.type;
  document.getElementById('form-score').value = match.score;
  document.getElementById('form-year').value = match.year;
  document.getElementById('form-studio').value = match.studio;
  document.getElementById('form-status').value = match.status;
  document.getElementById('form-cover').value = match.cover;
  document.getElementById('form-trailer').value = match.trailerUrl;
  document.getElementById('form-genres').value = match.genres.join(', ');
  document.getElementById('form-synopsis').value = match.sinopsis.join('\n');

  toastService.success(`Data "${match.title}" berhasil diisi otomatis!`);
}

function openCreateForm() {
  document.getElementById('form-modal-title').textContent = 'Tambah Anime Baru';
  document.getElementById('form-editing-old-id').value = '';
  document.getElementById('form-id').readOnly = false;
  document.getElementById('form-id').value = '';
  document.getElementById('form-title').value = '';
  document.getElementById('form-score').value = '';
  document.getElementById('form-year').value = new Date().getFullYear();
  document.getElementById('form-studio').value = '';
  document.getElementById('form-cover').value = 'assets/img/aot-s4.jpg';
  document.getElementById('form-trailer').value = '';
  document.getElementById('form-genres').value = 'Aksi, Petualangan';
  document.getElementById('form-synopsis').value = '';
  document.getElementById('mal-search-query').value = '';

  const results = document.getElementById('mal-search-results');
  if (results) results.style.display = 'none';

  document.getElementById('anime-form-modal')?.classList.add('active');
}

function openEditForm(animeId) {
  const anime = allAnimeData[animeId];
  if (!anime) return;

  document.getElementById('form-modal-title').textContent = `Edit Anime — ${anime.title}`;
  document.getElementById('form-editing-old-id').value = animeId;
  document.getElementById('form-id').value = animeId;
  document.getElementById('form-id').readOnly = true;
  document.getElementById('form-title').value = anime.title || '';
  document.getElementById('form-type').value = anime.type || 'Serial';
  document.getElementById('form-score').value = anime.score || '';
  document.getElementById('form-year').value = anime.year || '';
  document.getElementById('form-studio').value = anime.studio || '';
  document.getElementById('form-status').value = anime.status || 'finished';
  document.getElementById('form-cover').value = anime.cover || '';
  document.getElementById('form-trailer').value = anime.trailerUrl || '';
  document.getElementById('form-genres').value = (anime.genres || []).join(', ');
  document.getElementById('form-synopsis').value = Array.isArray(anime.sinopsis) ? anime.sinopsis.join('\n') : (anime.sinopsis || '');
  document.getElementById('mal-search-query').value = '';

  const results = document.getElementById('mal-search-results');
  if (results) results.style.display = 'none';

  document.getElementById('anime-form-modal')?.classList.add('active');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}

document.addEventListener('DOMContentLoaded', initAdmin);
window.addEventListener('auth-changed', initAdmin);
