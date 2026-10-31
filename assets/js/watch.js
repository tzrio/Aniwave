/**
 * SMILEORA Watch & Video Streaming Controller
 * Integrated with SmileoraPlayer (HLS, multi-server auto-fallback, subtitles)
 */
import { setupNavigation } from './navComponent.js';
import { animeService } from './animeService.js';
import { seoService } from './seoService.js';
import { toastService } from './toastService.js';
import { SmileoraPlayer } from './streamingEngine.js';

let currentAnime = null;
let currentAnimeId = '';
let currentEpIndex = 0;
let playerInstance = null;

function parseWatchParams() {
  const hash = String(window.location.hash || '').replace(/^#/, '');
  const params = new URLSearchParams(hash || window.location.search);

  let id = params.get('id');
  let ep = parseInt(params.get('ep'), 10);

  if (!id && hash) {
    if (hash.includes('/')) {
      const parts = hash.split('/');
      id = parts[0];
      ep = parseInt(parts[1]?.replace('ep', ''), 10);
    } else {
      id = hash;
    }
  }

  return {
    id: (id || 'aot-s4').trim(),
    epNumber: Number.isFinite(ep) && ep > 0 ? ep : 1
  };
}

async function initWatch() {
  setupNavigation();
  const { id, epNumber } = parseWatchParams();
  currentAnimeId = id;

  try {
    currentAnime = await animeService.getAnimeById(currentAnimeId);

    if (!currentAnime) {
      document.getElementById('watch-anime-title').textContent = 'Anime tidak ditemukan';
      toastService.error('Data anime tidak ditemukan.');
      return;
    }

    const backLink = document.getElementById('nav-back-detail');
    if (backLink) backLink.href = `anime.html#${encodeURIComponent(currentAnimeId)}`;

    normalizeEpisodes(currentAnime);

    const epCount = currentAnime.episodesList.length;
    currentEpIndex = Math.max(0, Math.min(epNumber - 1, epCount - 1));

    // Initialize Smileora Universal Streaming Player
    playerInstance = new SmileoraPlayer({
      container: document.getElementById('player-viewport'),
      serverContainer: document.getElementById('server-btn-container'),
      animeId: currentAnimeId,
      onNextEpisode: () => goToNextEpisode(),
      onPrevEpisode: () => goToPrevEpisode()
    });

    renderCurrentEpisode();
    renderEpisodeGrid();
    bindWatchEvents();

    seoService.updatePageMeta({
      title: `Nonton ${currentAnime.title} Episode ${currentEpIndex + 1}`,
      description: `Streaming anime ${currentAnime.title} episode ${currentEpIndex + 1} di SMILEORA by SMILEON. Kualitas HD adaptif.`,
      image: currentAnime.cover
    });
  } catch (err) {
    console.error('Error in SMILEORA watch controller:', err);
    toastService.error('Gagal menyiapkan video player.');
  }
}

function normalizeEpisodes(anime) {
  if (Array.isArray(anime.episodesList) && anime.episodesList.length > 0) {
    return;
  }

  const total = anime.episodes || (String(anime.type || '').toLowerCase().includes('film') ? 1 : 12);
  const list = [];

  for (let i = 1; i <= total; i++) {
    // Sediakan multi-source (HLS stream + Embed)
    list.push({
      number: i,
      title: `Episode ${i}`,
      sources: [
        {
          id: `src-hls-${i}`,
          name: 'Server Aurora (HLS)',
          type: 'hls',
          // Test HLS stream open sample
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
        },
        {
          id: `src-embed-${i}`,
          name: 'Server Zenith (Embed)',
          type: 'embed',
          url: anime.trailerUrl || 'https://www.youtube.com/embed/M_OauHnAFc8'
        },
        {
          id: `src-partner-${i}`,
          name: 'Server Partner',
          type: 'embed',
          url: anime.trailerUrl || 'https://www.youtube.com/embed/LHtdKWJjeg4'
        }
      ],
      subtitles: [
        { lang: 'id', label: 'Indonesia', default: true, url: '' },
        { lang: 'en', label: 'English', default: false, url: '' }
      ]
    });
  }

  anime.episodesList = list;
}

function renderCurrentEpisode() {
  const currentEp = currentAnime.episodesList[currentEpIndex];
  if (!currentEp) return;

  document.getElementById('watch-anime-title').textContent = currentAnime.title;
  document.getElementById('watch-ep-subtitle').textContent = `Sedang Memutar: ${currentEp.title}`;
  document.getElementById('watch-meta-score').textContent = `★ ${currentAnime.score || '—'}`;

  const syn = document.getElementById('watch-synopsis');
  if (syn) {
    syn.textContent = Array.isArray(currentAnime.sinopsis) ? currentAnime.sinopsis.join(' ') : currentAnime.sinopsis;
  }

  // Load into player engine
  playerInstance.loadEpisode(currentAnimeId, currentEp);

  const prevBtn = document.getElementById('btn-prev-ep');
  const nextBtn = document.getElementById('btn-next-ep');
  if (prevBtn) prevBtn.disabled = currentEpIndex === 0;
  if (nextBtn) nextBtn.disabled = currentEpIndex === currentAnime.episodesList.length - 1;

  history.replaceState(null, '', `#id=${encodeURIComponent(currentAnimeId)}&ep=${currentEpIndex + 1}`);
}

function renderEpisodeGrid() {
  const grid = document.getElementById('episode-grid');
  const countBadge = document.getElementById('ep-count-badge');
  if (!grid || !currentAnime) return;

  const eps = currentAnime.episodesList;
  if (countBadge) countBadge.textContent = `${eps.length} Episode`;

  grid.innerHTML = '';
  eps.forEach((ep, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn-ep ${idx === currentEpIndex ? 'active' : ''}`;
    btn.textContent = ep.number;
    btn.title = ep.title;
    btn.addEventListener('click', () => {
      currentEpIndex = idx;
      renderCurrentEpisode();
      renderEpisodeGrid();
    });
    grid.appendChild(btn);
  });
}

function goToNextEpisode() {
  if (currentEpIndex < currentAnime.episodesList.length - 1) {
    currentEpIndex++;
    renderCurrentEpisode();
    renderEpisodeGrid();
  }
}

function goToPrevEpisode() {
  if (currentEpIndex > 0) {
    currentEpIndex--;
    renderCurrentEpisode();
    renderEpisodeGrid();
  }
}

function bindWatchEvents() {
  document.getElementById('btn-next-ep')?.addEventListener('click', () => goToNextEpisode());
  document.getElementById('btn-prev-ep')?.addEventListener('click', () => goToPrevEpisode());

  const cinemaBtn = document.getElementById('btn-cinema-mode');
  cinemaBtn?.addEventListener('click', () => {
    document.body.classList.toggle('cinema-mode-active');
    const isActive = document.body.classList.contains('cinema-mode-active');
    cinemaBtn.textContent = isActive ? '💡 Matikan Bioskop' : '💡 Mode Bioskop';
    toastService.info(isActive ? 'Mode bioskop aktif.' : 'Mode bioskop dinonaktifkan.');
  });
}

document.addEventListener('DOMContentLoaded', initWatch);
