/**
 * AniWave - Data Fetch Module
 * Mengambil data anime dari JSON dan data tambahan dari Jikan (MAL).
 */
import { normalisasiURIComponent } from './utils.js';

export async function fetchAnimeData() {
  const response = await fetch('data/anime.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Yah, gagal muat data anime.json');
  return response.json();
}

export async function searchJikanAnimeIdByTitle(title) {
  const q = String(title || '').trim();
  if (!q) return null;

  const cacheKey = `jikanSearch:${normalisasiURIComponent(q)}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const num = Number(cached);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Yah, gagal nyari anime di MAL');
  const json = await res.json();
  const id = json?.data?.[0]?.mal_id;
  if (typeof id === 'number' && Number.isFinite(id) && id > 0) {
    sessionStorage.setItem(cacheKey, String(id));
    return id;
  }
  return null;
}

export async function fetchJikanAnime(malAnimeId) {
  const cacheKey = `jikanAnime:${malAnimeId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const res = await fetch(`https://api.jikan.moe/v4/anime/${malAnimeId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Yah, gagal ngambil data dari MAL');
  const json = await res.json();
  const data = json?.data;
  const result = {
    score: data?.score,
    synopsis: data?.synopsis,
  };
  sessionStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}

export async function fetchJikanMeta(malAnimeId) {
  const cacheKey = `jikanMeta:${malAnimeId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const res = await fetch(`https://api.jikan.moe/v4/anime/${malAnimeId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Yah, gagal ambil meta dari MAL');
  const json = await res.json();
  const data = json?.data;

  const score = data?.score;
  const year =
    (typeof data?.year === 'number' && Number.isFinite(data.year))
      ? data.year
      : (data?.aired?.from ? new Date(data.aired.from).getFullYear() : null);

  const result = { score, year };
  sessionStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}
