/**
 * Aniwave Jikan / MyAnimeList Auto-Sync Worker
 * Fetches real-time anime metadata (synopsis, studio, score, cover, trailer, episodes)
 * directly from official public MyAnimeList API v4.
 */
import { toastService } from './toastService.js';

export const jikanSyncService = {
  baseUrl: 'https://api.jikan.moe/v4',

  // 1. Search anime by title from MyAnimeList
  async searchAnime(query) {
    const q = String(query || '').trim();
    if (!q) return [];

    try {
      const res = await fetch(`${this.baseUrl}/anime?q=${encodeURIComponent(q)}&limit=5&sfw=true`);
      if (!res.ok) throw new Error('Jikan API rate limit atau gagal terhubung.');
      const json = await res.json();
      return (json.data || []).map(item => this.mapJikanToAniwave(item));
    } catch (err) {
      console.error('Error fetching Jikan:', err);
      throw err;
    }
  },

  // 2. Fetch anime detail by MAL ID
  async fetchByMalId(malId) {
    const res = await fetch(`${this.baseUrl}/anime/${malId}`);
    if (!res.ok) throw new Error(`Gagal mengambil data MAL ID ${malId}`);
    const json = await res.json();
    return this.mapJikanToAniwave(json.data);
  },

  // 3. Normalizes Jikan response into Aniwave standardized schema
  mapJikanToAniwave(jikanData) {
    if (!jikanData) return null;

    const idSlug = (jikanData.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const genres = (jikanData.genres || []).map(g => g.name);
    const studio = (jikanData.studios && jikanData.studios[0]) ? jikanData.studios[0].name : 'Unknown Studio';

    let trailerEmbed = '';
    if (jikanData.trailer && jikanData.trailer.embed_url) {
      trailerEmbed = jikanData.trailer.embed_url;
    } else if (jikanData.trailer && jikanData.trailer.youtube_id) {
      trailerEmbed = `https://www.youtube.com/embed/${jikanData.trailer.youtube_id}`;
    }

    return {
      id: idSlug,
      title: jikanData.title || jikanData.title_english || 'Untitled',
      alternativeTitles: [
        jikanData.title_english,
        jikanData.title_japanese
      ].filter(Boolean),
      cover: jikanData.images?.webp?.large_image_url || jikanData.images?.jpg?.large_image_url || '',
      banner: jikanData.images?.webp?.large_image_url || jikanData.images?.jpg?.large_image_url || '',
      score: jikanData.score || 0,
      year: jikanData.year || (jikanData.aired?.from ? new Date(jikanData.aired.from).getFullYear() : null),
      season: jikanData.season ? (jikanData.season.charAt(0).toUpperCase() + jikanData.season.slice(1)) : 'Unknown',
      type: jikanData.type === 'Movie' ? 'Film' : 'Serial',
      status: jikanData.status === 'Finished Airing' ? 'finished' : 'ongoing',
      statusText: jikanData.status === 'Finished Airing' ? 'Tamat' : 'Sedang berlangsung',
      studio: studio,
      episodes: jikanData.episodes || 12,
      duration: jikanData.duration || '24 min',
      genres: genres.length ? genres : ['Aksi', 'Petualangan'],
      trailerUrl: trailerEmbed,
      sinopsis: jikanData.synopsis ? [jikanData.synopsis] : ['Sinopsis belum tersedia.'],
      mal: {
        id: jikanData.mal_id,
        url: jikanData.url
      },
      authorizedProviders: [
        { name: 'Crunchyroll', url: 'https://www.crunchyroll.com', type: 'subscription' },
        { name: 'Netflix', url: 'https://www.netflix.com', type: 'subscription' }
      ]
    };
  }
};
