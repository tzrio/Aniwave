/**
 * AniWave - Utility Module
 * Helper umum: normalisasi teks, rating, dan terjemahan musim.
 */
export function normalisasi(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalisasiURIComponent(value) {
  return encodeURIComponent(String(value || '').trim().toLowerCase());
}

export function parseIdAnimeMal(value) {
  if (!value) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const num = Number(value.trim());
    if (Number.isFinite(num) && num > 0) return num;
  }
  if (typeof value === 'object') {
    const id = Number(value.id);
    if (Number.isFinite(id) && id > 0) return id;
    const url = String(value.url || value.href || '').trim();
    const idMatch = url.match(/\/anime\/(\d+)(?:\/|$)/i);
    if (idMatch) return Number(idMatch[1]);
  }
  return null;
}

export function formatRating(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2);
  const num = Number(String(value || '').trim());
  if (Number.isFinite(num) && num > 0) return num.toFixed(2);
  return '—';
}

export function starText(ratingText) {
  const t = String(ratingText || '').trim();
  if (!t || t === '—') return '★ —';
  return `★ ${t}`;
}

export function translateMusim(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const key = raw.toLowerCase();

  // Kalau udah Indonesia, biarin.
  if (key.startsWith('musim ')) return raw;

  if (key === 'winter') return 'Musim Dingin';
  if (key === 'spring') return 'Musim Semi';
  if (key === 'summer') return 'Musim Panas';
  if (key === 'fall' || key === 'autumn') return 'Musim Gugur';

  return raw;
}
