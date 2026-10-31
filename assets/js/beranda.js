/**
 * Aniwave Homepage Entrypoint
 * Handles catalog loading, hero showcase, multi-filters, sorting, and trailer modals
 */
import { setupNavigation } from './navComponent.js';
import { animeService } from './animeService.js';
import { watchlistService } from './watchlistService.js';
import { seoService } from './seoService.js';
import { toastService } from './toastService.js';

let allAnimeData = {};
let activeFilters = {
  q: '',
  genre: '',
  type: '',
  status: '',
  sort: 'rating-desc',
  watchlistOnly: false
};

async function initHomepage() {
  setupNavigation();
  seoService.updatePageMeta({
    title: 'Platform Eksplorasi & Katalog Anime Resmi',
    description: 'Temukan anime terbaik, jadwal rilis, review, dan layanan streaming resmi.'
  });

  try {
    allAnimeData = await animeService.getAllAnime();
    setupHeroShowcase();
    populateGenreFilter();
    readUrlParams();
    bindEvents();
    applyFilterAndRender();
  } catch (err) {
    console.error('Gagal memuat katalog:', err);
    toastService.error('Gagal memuat katalog data anime.');
  }
}

// 1. Setup Hero Banner with top featured anime
function setupHeroShowcase() {
  const featuredId = 'aot-s4';
  const anime = allAnimeData[featuredId] || Object.values(allAnimeData)[0];
  if (!anime) return;

  const bg = document.getElementById('hero-bg');
  const title = document.getElementById('hero-title');
  const typeBadge = document.getElementById('hero-badge-type');
  const ratingBadge = document.getElementById('hero-rating');
  const metaYear = document.getElementById('hero-meta-year');
  const metaStudio = document.getElementById('hero-meta-studio');
  const metaEp = document.getElementById('hero-meta-ep');
  const synopsis = document.getElementById('hero-synopsis');
  const ctaDetail = document.getElementById('hero-cta-detail');
  const btnTrailer = document.getElementById('hero-btn-trailer');

  if (bg) bg.src = anime.banner || anime.cover;
  if (title) title.textContent = anime.title;
  if (typeBadge) typeBadge.textContent = (anime.type || 'SERIAL').toUpperCase();
  if (ratingBadge) ratingBadge.textContent = `★ ${anime.score || '—'}`;
  if (metaYear) metaYear.textContent = anime.year || '2024';
  if (metaStudio) metaStudio.textContent = anime.studio || 'Studio';
  if (metaEp) metaEp.textContent = `${anime.episodes || 12} Episode`;
  if (synopsis) synopsis.textContent = Array.isArray(anime.sinopsis) ? anime.sinopsis.join(' ') : anime.sinopsis;
  if (ctaDetail) ctaDetail.href = `anime.html#${encodeURIComponent(anime.id || featuredId)}`;

  if (btnTrailer && anime.trailerUrl) {
    btnTrailer.addEventListener('click', () => {
      openTrailerModal(anime.trailerUrl);
    });
  }
}

// 2. Populate Genre Filter dropdown dynamically
function populateGenreFilter() {
  const genreSet = new Set();
  for (const anime of Object.values(allAnimeData)) {
    if (Array.isArray(anime.genres)) {
      anime.genres.forEach(g => genreSet.add(g.trim()));
    }
  }

  const select = document.getElementById('filter-genre');
  if (!select) return;

  const sorted = Array.from(genreSet).sort((a, b) => a.localeCompare(b));
  sorted.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    select.appendChild(opt);
  });
}

// 3. Read initial filters from Hash / URL Search Params
function readUrlParams() {
  const hash = String(window.location.hash || '').replace(/^#/, '');
  const params = new URLSearchParams(hash);

  if (hash === 'watchlist') {
    activeFilters.watchlistOnly = true;
    const navWatchlist = document.getElementById('nav-link-watchlist');
    if (navWatchlist) navWatchlist.classList.add('active');
  }

  if (params.get('q')) activeFilters.q = params.get('q');
  if (params.get('genre')) activeFilters.genre = params.get('genre');
  if (params.get('tipe')) activeFilters.type = params.get('tipe');
  if (params.get('status')) activeFilters.status = params.get('status');
  if (params.get('sort')) activeFilters.sort = params.get('sort');

  // Sync inputs
  const inputSearch = document.getElementById('cari-anime');
  const selectGenre = document.getElementById('filter-genre');
  const selectType = document.getElementById('filter-tipe');
  const selectStatus = document.getElementById('filter-status');
  const selectSort = document.getElementById('filter-sort');

  if (inputSearch) inputSearch.value = activeFilters.q;
  if (selectGenre) selectGenre.value = activeFilters.genre;
  if (selectType) selectType.value = activeFilters.type;
  if (selectStatus) selectStatus.value = activeFilters.status;
  if (selectSort) selectSort.value = activeFilters.sort;
}

function syncUrlHash() {
  if (activeFilters.watchlistOnly) {
    window.location.hash = 'watchlist';
    return;
  }
  const params = new URLSearchParams();
  if (activeFilters.q) params.set('q', activeFilters.q);
  if (activeFilters.genre) params.set('genre', activeFilters.genre);
  if (activeFilters.type) params.set('tipe', activeFilters.type);
  if (activeFilters.status) params.set('status', activeFilters.status);
  if (activeFilters.sort && activeFilters.sort !== 'rating-desc') params.set('sort', activeFilters.sort);

  const hashStr = params.toString();
  if (hashStr) history.replaceState(null, '', `#${hashStr}`);
  else history.replaceState(null, '', window.location.pathname);
}

// 4. Bind Filter Toolbar Events
function bindEvents() {
  const inputSearch = document.getElementById('cari-anime');
  const selectGenre = document.getElementById('filter-genre');
  const selectType = document.getElementById('filter-tipe');
  const selectStatus = document.getElementById('filter-status');
  const selectSort = document.getElementById('filter-sort');
  const btnReset = document.getElementById('reset-filter');
  const navWatchlist = document.getElementById('nav-link-watchlist');

  let debounceTimer = null;
  inputSearch?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      activeFilters.q = e.target.value.trim();
      activeFilters.watchlistOnly = false;
      syncUrlHash();
      applyFilterAndRender();
    }, 200);
  });

  selectGenre?.addEventListener('change', (e) => {
    activeFilters.genre = e.target.value;
    activeFilters.watchlistOnly = false;
    syncUrlHash();
    applyFilterAndRender();
  });

  selectType?.addEventListener('change', (e) => {
    activeFilters.type = e.target.value;
    activeFilters.watchlistOnly = false;
    syncUrlHash();
    applyFilterAndRender();
  });

  selectStatus?.addEventListener('change', (e) => {
    activeFilters.status = e.target.value;
    activeFilters.watchlistOnly = false;
    syncUrlHash();
    applyFilterAndRender();
  });

  selectSort?.addEventListener('change', (e) => {
    activeFilters.sort = e.target.value;
    syncUrlHash();
    applyFilterAndRender();
  });

  btnReset?.addEventListener('click', () => {
    activeFilters = { q: '', genre: '', type: '', status: '', sort: 'rating-desc', watchlistOnly: false };
    if (inputSearch) inputSearch.value = '';
    if (selectGenre) selectGenre.value = '';
    if (selectType) selectType.value = '';
    if (selectStatus) selectStatus.value = '';
    if (selectSort) selectSort.value = 'rating-desc';
    navWatchlist?.classList.remove('active');
    syncUrlHash();
    applyFilterAndRender();
  });

  navWatchlist?.addEventListener('click', (e) => {
    e.preventDefault();
    activeFilters.watchlistOnly = true;
    navWatchlist.classList.add('active');
    syncUrlHash();
    applyFilterAndRender();
  });

  // Modal Trailer Close
  document.getElementById('trailer-modal-close')?.addEventListener('click', closeTrailerModal);
  document.getElementById('trailer-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'trailer-modal') closeTrailerModal();
  });
}

// 5. Filter & Sorting Engine
function applyFilterAndRender() {
  const grid = document.getElementById('anime-grid');
  const countEl = document.getElementById('catalog-count');
  const heading = document.getElementById('catalog-heading');
  if (!grid) return;

  if (activeFilters.watchlistOnly) {
    if (heading) heading.textContent = 'Watchlist Saya';
  } else {
    if (heading) heading.textContent = 'Katalog Anime';
  }

  const savedIds = new Set(watchlistService.getAllSavedIds());
  let entries = Object.entries(allAnimeData).filter(([, a]) => !a._deleted);

  // Watchlist filter
  if (activeFilters.watchlistOnly) {
    entries = entries.filter(([id]) => savedIds.has(id));
  }

  // Search filter (query)
  if (activeFilters.q) {
    const q = activeFilters.q.toLowerCase();
    entries = entries.filter(([, a]) => {
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchAlt = (a.alternativeTitles || []).some(t => t.toLowerCase().includes(q));
      return matchTitle || matchAlt;
    });
  }

  // Genre filter
  if (activeFilters.genre) {
    const g = activeFilters.genre.toLowerCase();
    entries = entries.filter(([, a]) => (a.genres || []).some(item => item.toLowerCase() === g));
  }

  // Type filter
  if (activeFilters.type) {
    const t = activeFilters.type.toLowerCase();
    entries = entries.filter(([, a]) => {
      const animeType = (a.type || 'serial').toLowerCase();
      if (t === 'film') return animeType.includes('film') || animeType.includes('movie');
      if (t === 'serial') return !animeType.includes('film') && !animeType.includes('movie');
      return true;
    });
  }

  // Status filter
  if (activeFilters.status) {
    const s = activeFilters.status.toLowerCase();
    entries = entries.filter(([, a]) => (a.status || '').toLowerCase() === s);
  }

  // Sorting
  entries.sort(([, a], [, b]) => {
    if (activeFilters.sort === 'rating-desc') return (b.score || 0) - (a.score || 0);
    if (activeFilters.sort === 'year-desc') return (b.year || 0) - (a.year || 0);
    if (activeFilters.sort === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  if (countEl) countEl.textContent = `Menampilkan ${entries.length} anime`;

  if (entries.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <p style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 8px;">Tidak ada anime yang cocok</p>
        <p style="font-size: 0.85rem; color: var(--color-text-muted);">Coba ubah kata kunci pencarian atau sesuaikan opsi filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  for (const [id, anime] of entries) {
    const card = createAnimeCard(id, anime);
    grid.appendChild(card);
  }
}

// 6. Component: Anime Card
function createAnimeCard(id, anime) {
  const card = document.createElement('article');
  card.className = 'anime-card';

  const type = (anime.type || 'Serial').toUpperCase();
  const score = anime.score ? `★ ${anime.score}` : '★ —';
  const year = anime.year || '—';

  card.innerHTML = `
    <a href="anime.html#${encodeURIComponent(id)}" class="anime-card-poster" aria-label="Lihat detail ${escapeHtml(anime.title)}">
      <span class="poster-badge">${type}</span>
      <span class="poster-rating">${score}</span>
      <img class="anime-card-img" src="${anime.cover || 'assets/img/aniwave-mark.svg'}" alt="${escapeHtml(anime.title)}" loading="lazy" />
    </a>
    <div class="anime-card-body">
      <h3 class="anime-card-title">
        <a href="anime.html#${encodeURIComponent(id)}">${escapeHtml(anime.title)}</a>
      </h3>
      <div class="anime-card-sub">
        <span>${year}</span>
        <span>${anime.statusText || 'Tamat'}</span>
      </div>
    </div>
  `;

  return card;
}

// 7. Trailer Video Modal
function openTrailerModal(embedUrl) {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  if (modal && iframe) {
    iframe.src = embedUrl;
    modal.classList.add('active');
  }
}

function closeTrailerModal() {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  if (modal && iframe) {
    iframe.src = '';
    modal.classList.remove('active');
  }
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

document.addEventListener('DOMContentLoaded', initHomepage);
