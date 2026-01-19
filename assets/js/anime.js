/**
 * AniWave - Detail Entrypoint
 * Menginisialisasi halaman detail dan merender data anime terpilih.
 */
import { fetchAnimeData, searchJikanAnimeIdByTitle } from './fetchAnime.js';
import { normalisasiURIComponent, parseIdAnimeMal } from './utils.js';
import { renderDownloads, renderInfo, renderSynopsis, setCoverImage, setTextById } from './renderAnime.js';

function ambilIdAnime() {
  // 1) Query string: /anime.html?id=aot
  const params = new URLSearchParams(window.location.search);
  const fromQuery = (params.get('id') || '').trim().toLowerCase();
  if (fromQuery) return fromQuery;

  // 2) Hash: /anime.html#aot
  const fromHash = String(window.location.hash || '')
    .replace(/^#/, '')
    .trim()
    .toLowerCase();
  if (fromHash) return fromHash;

  // 3) Segmen path: /anime/aot (kepake kalau cleanUrls aktif)
  const parts = String(window.location.pathname || '')
    .split('/')
    .filter(Boolean);
  const last = (parts[parts.length - 1] || '').trim().toLowerCase();
  if (last && last !== 'anime' && last !== 'anime.html') return last;

  return '';
}

async function utama() {
  try {
    const animeId = ambilIdAnime();
    if (!animeId) {
      window.location.replace('index.html');
      return;
    }

    const allData = await fetchAnimeData();
    const aliasId = {
      aot: 'aot-s4',
      tpn: 'tpn-s2',
      drs: 'drs-s2',
    };

    const resolvedId = allData[animeId] ? animeId : (aliasId[animeId] || animeId);
    const anime = allData[resolvedId];

    if (resolvedId !== animeId && anime) {
      // Biar bookmark lama tetap jalan, tapi tampilannya pindah ke ID baru.
      const hash = String(window.location.hash || '').trim();
      if (hash && hash.replace(/^#/, '').toLowerCase() === animeId) {
        history.replaceState(null, '', `#${encodeURIComponent(resolvedId)}`);
      }
    }

    if (!anime) {
      setTextById('judul-anime', 'Anime tidak ditemukan');
      setTextById('subjudul-anime', 'Buka dari Beranda untuk melihat daftar lengkap anime.');
      setCoverImage('', '');
      return;
    }

    document.title = anime.title || 'Anime';
    setTextById('judul-anime', anime.title || '');
    setTextById('subjudul-anime', '');
    setCoverImage(anime.cover || '', anime.title || '');

    renderSynopsis(anime.sinopsis || []);
    renderInfo(anime.info || {});
    renderDownloads(anime.downloads || []);

    // Opsional: kalau ada internet, ambil bonus dari MAL (Jikan) tanpa ganggu flow
    const malMeta = anime?.mal;
    let malId = parseIdAnimeMal(malMeta) || parseIdAnimeMal(anime?.info?.Rating);

    const localSynopsis = Array.isArray(anime?.sinopsis) ? anime.sinopsis : [];
    const looksPlaceholderSynopsis =
      localSynopsis.length === 0 ||
      localSynopsis.some((l) => String(l || '').trim().toUpperCase() === 'X') ||
      (localSynopsis.length === 1 && normalisasiURIComponent(localSynopsis[0]).includes('masih%20dalam%20pengerjaan'));

    const allowSearchByTitle = !malId && Boolean(anime?.title);
    if (allowSearchByTitle) {
      try {
        const discoveredId = await searchJikanAnimeIdByTitle(anime.title);
        if (discoveredId) {
          malId = discoveredId;
          if (!(anime?.info?.Rating && typeof anime.info.Rating === 'object' && anime.info.Rating.type === 'mal')) {
            anime.info = anime.info || {};
            anime.info.Rating = { type: 'mal', id: discoveredId };
            renderInfo(anime.info);
          }
        }
      } catch {
        // Kalau gagal nyari, yaudah skip
      }
    }

    // Sinopsis: kita utamain yang lokal (biar tetap Bahasa Indonesia).
    // Kalau sinopsis lokal masih placeholder, mending tampilkan itu aja daripada ngambil versi MAL yang biasanya Inggris.
  } catch (err) {
    setTextById('judul-anime', 'Waduh, error');
    setTextById('subjudul-anime', String(err?.message || err));
  }
}

document.addEventListener('DOMContentLoaded', utama);
