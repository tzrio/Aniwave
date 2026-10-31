/**
 * Aniwave Multi-Source Anime Sync Worker
 * Primary: Jikan (MyAnimeList v4) with direct CORS / proxy fallback
 * Secondary Fallback: AniList GraphQL API (Direct CORS-friendly, zero rate-limit blocks)
 */

export const jikanSyncService = {
  jikanBase: 'https://api.jikan.moe/v4',
  anilistBase: 'https://graphql.anilist.co',

  async searchAnime(query) {
    const q = String(query || '').trim();
    if (!q) return [];

    // 1. Coba lewat Jikan (MyAnimeList v4)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${this.jikanBase}/anime?q=${encodeURIComponent(q)}&limit=5&sfw=true`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map(item => this.mapJikanToAniwave(item));
        }
      }
    } catch (err) {
      console.warn('Jikan API error/timeout, mencoba fallback ke AniList GraphQL...', err);
    }

    // 2. Fallback Otomatis ke AniList GraphQL (Lebih cepat, bebas CORS, stabil)
    return await this.searchAniList(q);
  },

  async searchAniList(query) {
    const gqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 5) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            averageScore
            seasonYear
            season
            format
            status
            episodes
            duration
            genres
            studios(isMain: true) {
              nodes {
                name
              }
            }
            trailer {
              id
              site
            }
            description(asHtml: false)
          }
        }
      }
    `;

    const res = await fetch(this.anilistBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: gqlQuery,
        variables: { search: query }
      })
    });

    if (!res.ok) {
      throw new Error('Gagal mengambil data dari MyAnimeList dan AniList.');
    }

    const json = await res.json();
    const list = json.data?.Page?.media || [];
    return list.map(item => this.mapAniListToAniwave(item));
  },

  mapJikanToAniwave(jikanData) {
    if (!jikanData) return null;

    const idSlug = (jikanData.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const genres = (jikanData.genres || []).map(g => g.name);
    const studio = (jikanData.studios && jikanData.studios[0]) ? jikanData.studios[0].name : 'Studio';

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
      score: jikanData.score ? Number(jikanData.score) : 8.0,
      year: jikanData.year || (jikanData.aired?.from ? new Date(jikanData.aired.from).getFullYear() : 2024),
      season: jikanData.season ? (jikanData.season.charAt(0).toUpperCase() + jikanData.season.slice(1)) : 'Musim Dingin',
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
      }
    };
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

    // Bersihkan tag HTML dari deskripsi jika ada
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
      statusText: item.status === 'FINISHED' ? 'Tamat' : 'Sedang berlangsung',
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
