/**
 * Aniwave Anime Detail Page Controller
 * Renders backdrop, posters, structured metadata, official providers, watchlist toggle, and recommendations
 */
import { setupNavigation } from './navComponent.js';
import { animeService } from './animeService.js';
import { watchlistService } from './watchlistService.js';
import { seoService } from './seoService.js';
import { toastService } from './toastService.js';

let currentAnime = null;
let currentAnimeId = '';

function resolveAnimeId() {
  const hash = String(window.location.hash || '').replace(/^#/, '').trim();
  if (hash) return hash;

  const params = new URLSearchParams(window.location.search);
  const qId = params.get('id');
  if (qId) return qId.trim();

  return 'aot-s4'; // fallback default
}

async function initDetail() {
  setupNavigation();
  currentAnimeId = resolveAnimeId();

  try {
    currentAnime = await animeService.getAnimeById(currentAnimeId);

    if (!currentAnime) {
      document.getElementById('detail-title').textContent = 'Anime tidak ditemukan';
      document.getElementById('detail-synopsis-body').textContent = 'Maaf, anime yang Anda cari tidak tersedia dalam katalog kami.';
      return;
    }

    renderDetailContent(currentAnime);
    seoService.updatePageMeta({
      title: currentAnime.title,
      description: Array.isArray(currentAnime.sinopsis) ? currentAnime.sinopsis[0] : currentAnime.sinopsis,
      image: currentAnime.cover
    });
    seoService.injectAnimeJsonLd(currentAnime);

    setupWatchlistButton();
    setupTrailerButton();
    renderRelatedAnime();
  } catch (err) {
    console.error('Error saat memuat anime detail:', err);
    toastService.error('Gagal memuat detail anime.');
  }
}

function renderDetailContent(anime) {
  // Backdrop & Poster
  const backdrop = document.getElementById('detail-backdrop');
  const poster = document.getElementById('detail-poster');
  if (backdrop) backdrop.src = anime.banner || anime.cover;
  if (poster) poster.src = anime.cover;

  // Tombol Nonton Streaming (Link ke watch.html)
  const streamBtn = document.getElementById('btn-stream-now');
  if (streamBtn) {
    streamBtn.href = `watch.html#id=${encodeURIComponent(currentAnimeId)}&ep=1`;
  }

  // Title & Alternative Titles
  document.getElementById('detail-title').textContent = anime.title;
  const altEl = document.getElementById('detail-alt-titles');
  if (altEl && Array.isArray(anime.alternativeTitles) && anime.alternativeTitles.length > 0) {
    altEl.textContent = `Alternatif: ${anime.alternativeTitles.join(' / ')}`;
  }

  // Genre Badges
  const genreRow = document.getElementById('detail-genre-row');
  if (genreRow && Array.isArray(anime.genres)) {
    genreRow.innerHTML = '';
    anime.genres.forEach(g => {
      const span = document.createElement('span');
      span.className = 'badge-tag badge-tag-secondary';
      span.textContent = g;
      genreRow.appendChild(span);
    });
  }

  // Metadata Fields
  document.getElementById('meta-type').textContent = anime.type || 'Serial';
  document.getElementById('meta-score').textContent = anime.score ? `★ ${anime.score}` : '—';
  document.getElementById('meta-status').textContent = anime.statusText || 'Tamat';
  document.getElementById('meta-episodes').textContent = anime.episodes ? `${anime.episodes} Episode` : '—';
  document.getElementById('meta-studio').textContent = anime.studio || '—';
  document.getElementById('meta-season').textContent = `${anime.season || ''} ${anime.year || ''}`.trim() || '—';
  document.getElementById('meta-duration').textContent = anime.duration || '24 min';

  // MAL Link
  const malLink = document.getElementById('mal-link');
  if (malLink && anime.mal && anime.mal.url) {
    malLink.href = anime.mal.url;
  } else if (malLink) {
    malLink.parentElement.textContent = '—';
  }

  // Synopsis paragraphs
  const synopsisContainer = document.getElementById('detail-synopsis-body');
  if (synopsisContainer) {
    synopsisContainer.innerHTML = '';
    const lines = Array.isArray(anime.sinopsis) ? anime.sinopsis : [anime.sinopsis || ''];
    lines.forEach(line => {
      const p = document.createElement('p');
      p.style.marginBottom = '10px';
      p.textContent = line;
      synopsisContainer.appendChild(p);
    });
  }

  // Authorized Providers
  const providerList = document.getElementById('authorized-provider-list');
  if (providerList) {
    providerList.innerHTML = '';
    const providers = anime.authorizedProviders || [
      { name: 'Crunchyroll', url: 'https://www.crunchyroll.com', type: 'subscription' }
    ];

    providers.forEach(p => {
      const a = document.createElement('a');
      a.className = 'provider-link';
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `
        <span style="display:flex; align-items:center; gap:8px;">
          <strong style="color:var(--color-text-main); font-size:0.95rem;">${p.name}</strong>
          <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase;">(${p.type})</span>
        </span>
        <span style="color:var(--color-primary); font-weight:700;">Nonton Resmi &rarr;</span>
      `;
      providerList.appendChild(a);
    });
  }
}

function setupWatchlistButton() {
  const btn = document.getElementById('btn-toggle-watchlist');
  if (!btn) return;

  const updateBtn = () => {
    const isSaved = watchlistService.isSaved(currentAnimeId);
    if (isSaved) {
      btn.textContent = '✓ Tersimpan di Watchlist';
      btn.style.background = 'var(--color-success)';
      btn.style.boxShadow = 'none';
    } else {
      btn.textContent = '+ Tambah ke Watchlist';
      btn.style.background = 'var(--color-primary)';
      btn.style.boxShadow = 'var(--shadow-glow)';
    }
  };

  updateBtn();

  btn.addEventListener('click', () => {
    const isSaved = watchlistService.isSaved(currentAnimeId);
    if (isSaved) {
      watchlistService.remove(currentAnimeId);
      toastService.info('Dihapus dari Watchlist');
    } else {
      watchlistService.save(currentAnimeId, 'plan');
      toastService.success('Berhasil ditambahkan ke Watchlist!');
    }
    updateBtn();
  });
}

function setupTrailerButton() {
  const btn = document.getElementById('btn-watch-trailer');
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  const closeBtn = document.getElementById('trailer-modal-close');

  if (!btn || !modal) return;

  btn.addEventListener('click', () => {
    if (currentAnime && currentAnime.trailerUrl) {
      iframe.src = currentAnime.trailerUrl;
      modal.classList.add('active');
    } else {
      toastService.info('Trailer resmi untuk anime ini belum tersedia.');
    }
  });

  closeBtn?.addEventListener('click', () => {
    iframe.src = '';
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      iframe.src = '';
      modal.classList.remove('active');
    }
  });
}

async function renderRelatedAnime() {
  const container = document.getElementById('related-anime-grid');
  if (!container) return;

  const all = await animeService.getAllAnime();
  const others = Object.entries(all).filter(([id]) => id !== currentAnimeId);

  // Pick up to 4 recommendations
  const picks = others.slice(0, 4);
  container.innerHTML = '';

  for (const [id, anime] of picks) {
    const card = document.createElement('article');
    card.className = 'anime-card';
    card.innerHTML = `
      <a href="anime.html#${encodeURIComponent(id)}" class="anime-card-poster">
        <span class="poster-rating">★ ${anime.score || '—'}</span>
        <img class="anime-card-img" src="${anime.cover}" alt="${anime.title}" loading="lazy" />
      </a>
      <div class="anime-card-body">
        <h4 class="anime-card-title" style="font-size:0.85rem;">
          <a href="anime.html#${encodeURIComponent(id)}">${anime.title}</a>
        </h4>
      </div>
    `;
    container.appendChild(card);
  }
}

document.addEventListener('DOMContentLoaded', initDetail);
window.addEventListener('hashchange', () => {
  window.location.reload();
});
