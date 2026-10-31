/**
 * SMILEORA Multi-Source Anime Sync Worker
 * Direct CORS-Friendly Endpoints:
 * 1. AniList GraphQL API (Direct CORS permitted globally)
 * 2. Kitsu.io Public REST API (Direct CORS permitted)
 * 3. Jikan as fallback
 */

export const jikanSyncService = {
  anilistBase: 'https://graphql.anilist.co',
  kitsuBase: 'https://kitsu.io/api/edge',
  jikanBase: 'https://api.jikan.moe/v4',

  extractMalId(input) {
    const s = String(input || '').trim();
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    const match = s.match(/myanimelist\.net\/anime\/(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return null;
  },

  async fetchByQueryOrUrl(input) {
    const clean = String(input || '').trim();
    if (!clean) return [];

    const malId = this.extractMalId(clean);

    // ============================================================
    // KASUS 1: Menggunakan Link MAL atau Angka ID (misal: 32281)
    // ============================================================
    if (malId) {
      console.log('[SMILEORA Sync] Mencari via MAL ID:', malId);

      // 1. AniList idMal query (Bebas blokir, direct CORS)
      try {
        const aniListRes = await this.queryAniList(`
          query ($idMal: Int) {
            Media(idMal: $idMal, type: ANIME) {
              id
              idMal
              title { romaji english native }
              coverImage { large extraLarge }
              bannerImage
              averageScore
              seasonYear
              season
              format
              status
              episodes
              duration
              genres
              studios(isMain: true) { nodes { name } }
              trailer { id site }
              description(asHtml: false)
            }
          }
        `, { idMal: malId });

        if (aniListRes?.data?.Media) {
          return [this.mapAniListToAniwave(aniListRes.data.Media)];
        }
      } catch (err) {
        console.warn('AniList idMal lookup error:', err);
      }

      // 2. Kitsu fallback jika ada judul di URL (misal: "Kimi_no_Na_wa")
      const titleSlug = clean.split('/').pop()?.replace(/_/g, ' ');
      if (titleSlug && !/^\d+$/.test(titleSlug)) {
        return await this.searchKitsu(titleSlug);
      }
    }

    // ============================================================
    // KASUS 2: Pencarian Judul (misal: "naruto", "bleach", "your name")
    // ============================================================
    console.log('[SMILEORA Sync] Mencari via Nama Anime:', clean);

    // 1. Prioritas Utama: AniList GraphQL Search
    try {
      const aniListRes = await this.queryAniList(`
        query ($search: String) {
          Page(page: 1, perPage: 8) {
            media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
              id
              idMal
              title { romaji english native }
              coverImage { large extraLarge }
              bannerImage
              averageScore
              seasonYear
              season
              format
              status
              episodes
              duration
              genres
              studios(isMain: true) { nodes { name } }
              trailer { id site }
              description(asHtml: false)
            }
          }
        }
      `, { search: clean });

      const mediaList = aniListRes?.data?.Page?.media || [];
      if (mediaList.length > 0) {
        return mediaList.map(item => this.mapAniListToAniwave(item));
      }
    } catch (err) {
      console.warn('AniList GraphQL query error, trying Kitsu fallback...', err);
    }

    // 2. Prioritas Cadangan: Kitsu.io Public API (100% CORS Allowed)
    try {
      const kitsuResults = await this.searchKitsu(clean);
      if (kitsuResults.length > 0) return kitsuResults;
    } catch (err) {
      console.warn('Kitsu API error:', err);
    }

    return [];
  },

  // Helper AniList GraphQL
  async queryAniList(query, variables) {
    const res = await fetch(this.anilistBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });
    if (!res.ok) throw new Error(`AniList returned status: ${res.status}`);
    return await res.json();
  },

  // Helper Kitsu.io
  async searchKitsu(query) {
    const res = await fetch(`${this.kitsuBase}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=6`);
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data || [];

    return data.map(item => {
      const attr = item.attributes || {};
      const title = attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp || 'Untitled';
      const idSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const score = attr.averageRating ? Number((parseFloat(attr.averageRating) / 10).toFixed(2)) : 8.0;

      let trailerUrl = '';
      if (attr.youtubeVideoId) {
        trailerUrl = `https://www.youtube.com/embed/${attr.youtubeVideoId}`;
      }

      return {
        id: idSlug,
        title: title,
        alternativeTitles: [attr.titles?.en, attr.titles?.ja_jp].filter(Boolean),
        cover: attr.posterImage?.large || attr.posterImage?.original || '',
        banner: attr.coverImage?.large || attr.posterImage?.original || '',
        score: score,
        year: attr.startDate ? new Date(attr.startDate).getFullYear() : 2024,
        season: 'Musim Dingin',
        type: attr.subtype === 'movie' ? 'Film' : 'Serial',
        status: attr.status === 'finished' ? 'finished' : 'ongoing',
        statusText: attr.status === 'finished' ? 'Tamat' : 'Sedang tayang',
        studio: 'Studio',
        episodes: attr.episodeCount || 12,
        duration: attr.episodeLength ? `${attr.episodeLength} min` : '24 min',
        genres: ['Aksi', 'Petualangan'],
        trailerUrl: trailerUrl,
        sinopsis: attr.synopsis ? [attr.synopsis] : ['Sinopsis belum tersedia.'],
        mal: {
          id: item.id,
          url: `https://kitsu.io/anime/${item.id}`
        }
      };
    });
  },

  mapAniListToAniwave(item) {
    const title = item.title?.english || item.title?.romaji || 'Untitled';
    const idSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const studio = item.studios?.nodes?.[0]?.name || 'Studio';
    const score = item.averageScore ? Number((item.averageScore / 10).toFixed(2)) : 8.0;

    let trailerEmbed = '';
    if (item.trailer && item.trailer.site === 'youtube') {
      trailerEmbed = `https://www.youtube.com/embed/${item.trailer.id}`;
    }

    const cleanDesc = (item.description || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();

    return {
      id: idSlug,
      title: title,
      alternativeTitles: [item.title?.romaji, item.title?.native].filter(Boolean),
      cover: item.coverImage?.extraLarge || item.coverImage?.large || '',
      banner: item.bannerImage || item.coverImage?.extraLarge || '',
      score: score,
      year: item.seasonYear || new Date().getFullYear(),
      season: item.season || 'Musim Dingin',
      type: item.format === 'MOVIE' ? 'Film' : 'Serial',
      status: item.status === 'FINISHED' ? 'finished' : 'ongoing',
      statusText: item.status === 'FINISHED' ? 'Tamat' : 'Sedang tayang',
      studio: studio,
      episodes: item.episodes || 12,
      duration: item.duration ? `${item.duration} min` : '24 min',
      genres: item.genres || ['Aksi'],
      trailerUrl: trailerEmbed,
      sinopsis: cleanDesc ? [cleanDesc] : ['Sinopsis belum tersedia.'],
      mal: {
        id: item.idMal || item.id,
        url: item.idMal ? `https://myanimelist.net/anime/${item.idMal}` : `https://anilist.co/anime/${item.id}`
      }
    };
  }
};
