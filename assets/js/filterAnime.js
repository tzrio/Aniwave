/**
 * AniWave - Filter Module
 * Menangani state filter, parsing hash, dan filtering data anime.
 */
import { normalisasi } from './utils.js';

export function getAnimeStatusValue(anime) {
  const status = anime?.info?.Status;
  if (!status) return '';
  if (typeof status === 'string') return status;
  if (typeof status === 'object') {
    return String(status.value || status.text || '').trim();
  }
  return '';
}

export function readStateFromHash() {
  const raw = String(window.location.hash || '').replace(/^#/, '').trim();
  const params = new URLSearchParams(raw);
  return {
    q: (params.get('q') || '').trim(),
    genre: (params.get('genre') || '').trim(),
    tipe: (params.get('tipe') || '').trim(),
    status: (params.get('status') || '').trim(),
  };
}

export function setHashParams(next) {
  const currentRaw = String(window.location.hash || '').replace(/^#/, '').trim();
  const params = new URLSearchParams(currentRaw);
  for (const [key, value] of Object.entries(next || {})) {
    const v = String(value || '').trim();
    if (!v) params.delete(key);
    else params.set(key, v);
  }
  const out = params.toString();
  if (out) window.location.hash = out;
  else window.location.hash = '';
}

export function matchAnimeFilter(anime, state) {
  if (!anime) return false;

  const q = normalisasi(state?.q);
  if (q) {
    const title = normalisasi(anime?.title);
    if (!title.includes(q)) return false;
  }

  const wantedGenre = normalisasi(state?.genre);
  if (wantedGenre) {
    const genres = anime?.info?.Genre;
    if (!Array.isArray(genres)) return false;
    if (!genres.some((g) => normalisasi(g) === wantedGenre)) return false;
  }

  const wantedTipe = normalisasi(state?.tipe);
  if (wantedTipe) {
    const tipe = normalisasi(anime?.info?.Tipe);
    const iniFilm = tipe.includes('film') || tipe.includes('movie');
    if (wantedTipe === 'film' && !iniFilm) return false;
    if (wantedTipe === 'serial' && iniFilm) return false;
  }

  const wantedStatus = normalisasi(state?.status);
  if (wantedStatus) {
    if (normalisasi(getAnimeStatusValue(anime)) !== wantedStatus) return false;
  }

  return true;
}

export function filterAnimeEntries(semuaData, state) {
  return Object.entries(semuaData || {}).filter(([, anime]) => matchAnimeFilter(anime, state));
}

export function fillSelectOptions(selectEl, items) {
  if (!selectEl) return;
  // Sisain option pertama (Semua)
  while (selectEl.options.length > 1) {
    selectEl.remove(1);
  }
  for (const it of items || []) {
    const opt = document.createElement('option');
    opt.value = it.value;
    opt.textContent = it.label;
    selectEl.appendChild(opt);
  }
}

export function collectFilterOptions(semuaData) {
  const genreSet = new Map();
  const statusSet = new Map();

  for (const [, anime] of Object.entries(semuaData || {})) {
    const genres = anime?.info?.Genre;
    if (Array.isArray(genres)) {
      for (const g of genres) {
        const label = String(g || '').trim();
        if (!label) continue;
        const key = normalisasi(label);
        if (!genreSet.has(key)) genreSet.set(key, label);
      }
    }

    const statusRaw = anime?.info?.Status;
    if (statusRaw) {
      let value = '';
      let label = '';
      if (typeof statusRaw === 'string') {
        value = normalisasi(statusRaw);
        label = statusRaw.trim();
      } else if (typeof statusRaw === 'object') {
        value = normalisasi(statusRaw.value || statusRaw.text);
        label = String(statusRaw.text || statusRaw.value || '').trim();
      }
      if (value && label && !statusSet.has(value)) statusSet.set(value, label);
    }
  }

  const genres = Array.from(genreSet.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([, label]) => ({ value: label, label }));

  const statuses = Array.from(statusSet.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label }));

  return { genres, statuses };
}
