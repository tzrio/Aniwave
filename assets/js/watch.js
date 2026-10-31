/**
 * Aniwave Watch & Video Streaming Controller
 * Handles multi-server switching, episode navigation (Prev/Next/List), and Cinema Mode
 */
import { setupNavigation } from './navComponent.js';
import { animeService } from './animeService.js';
import { seoService } from './seoService.js';
import { toastService } from './toastService.js';

let currentAnime = null;
let currentAnimeId = '';
let currentEpIndex = 0; // 0-indexed
let activeServerIndex = 0;

function parseWatchParams() {
  const hash = String(window.location.hash || '').replace(/^#/, '');
  const params = new URLSearchParams(hash || window.location.search);

  // Bisa via #id=aot-s4&ep=1 atau #aot-s4/ep1
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

    // Set link balik ke detail anime
    const backLink = document.getElementById('nav-back-detail');
    if (backLink) backLink.href = `anime.html#${encodeURIComponent(currentAnimeId)}`;

    // Normalisasi episode list
    normalizeEpisodes(currentAnime);

    // Cari index episode sesuai nomor
    const epCount = currentAnime.episodesList.length;
    currentEpIndex = Math.max(0, Math.min(epNumber - 1, epCount - 1));

    renderPlayer();
    renderEpisodeGrid();
    bindWatchEvents();

    seoService.updatePageMeta({
      title: `Nonton ${currentAnime.title} Episode ${currentEpIndex + 1}`,
      description: `Streaming gratis subtitle Indonesia ${currentAnime.title} episode ${currentEpIndex + 1}. Kualitas jernih HD.`,
      image: currentAnime.cover
    });
  } catch (err) {
    console.error('Error in watch player:', err);
    toastService.error('Gagal menyiapkan video player.');
  }
}

// Menghasilkan daftar episode jika belum ada di objek anime
function normalizeEpisodes(anime) {
  if (Array.isArray(anime.episodesList) && anime.episodesList.length > 0) {
    return;
  }

  const total = anime.episodes || (String(anime.type || '').toLowerCase().includes('film') ? 1 : 12);
  const list = [];

  for (let i = 1; i <= total; i++) {
    // Sediakan multi-server embed default (Trailer resmi / embed stream)
    list.push({
      number: i,
      title: `Episode ${i}`,
      servers: [
        {
          name: 'Server 1 (Official HD)',
          url: anime.trailerUrl || 'https://www.youtube.com/embed/M_OauHnAFc8'
        },
        {
          name: 'Server 2 (Cadangan)',
          url: anime.trailerUrl || 'https://www.youtube.com/embed/LHtdKWJjeg4'
        }
      ]
    });
  }

  anime.episodesList = list;
}

function renderPlayer() {
  const currentEp = currentAnime.episodesList[currentEpIndex];
  if (!currentEp) return;

  // Judul & Subtitle
  document.getElementById('watch-anime-title').textContent = currentAnime.title;
  document.getElementById('watch-ep-subtitle').textContent = `Sedang Memutar: ${currentEp.title}`;
  document.getElementById('watch-meta-score').textContent = `★ ${currentAnime.score || '—'}`;

  const syn = document.getElementById('watch-synopsis');
  if (syn) {
    syn.textContent = Array.isArray(currentAnime.sinopsis) ? currentAnime.sinopsis.join(' ') : currentAnime.sinopsis;
  }

  // Render Server Switcher Buttons
  const serverContainer = document.getElementById('server-btn-container');
  if (serverContainer) {
    serverContainer.innerHTML = '';
    currentEp.servers.forEach((srv, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-server ${idx === activeServerIndex ? 'active' : ''}`;
      btn.textContent = srv.name;
      btn.addEventListener('click', () => {
        activeServerIndex = idx;
        renderPlayer();
        toastService.info(`Beralih ke ${srv.name}`);
      });
      serverContainer.appendChild(btn);
    });
  }

  // Set URL Video Iframe
  const iframe = document.getElementById('video-frame');
  const targetServer = currentEp.servers[activeServerIndex] || currentEp.servers[0];
  if (iframe && targetServer) {
    iframe.src = targetServer.url;
  }

  // Update State Prev / Next Button
  const prevBtn = document.getElementById('btn-prev-ep');
  const nextBtn = document.getElementById('btn-next-ep');
  if (prevBtn) prevBtn.disabled = currentEpIndex === 0;
  if (nextBtn) nextBtn.disabled = currentEpIndex === currentAnime.episodesList.length - 1;

  // Simpan riwayat episode terakhir yang ditonton di LocalStorage
  saveWatchHistory(currentAnimeId, currentEpIndex + 1);

  // Update hash URL agar bookmark / share link tepat
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
      activeServerIndex = 0;
      renderPlayer();
      renderEpisodeGrid();
    });
    grid.appendChild(btn);
  });
}

function bindWatchEvents() {
  // Tombol Next Episode
  document.getElementById('btn-next-ep')?.addEventListener('click', () => {
    if (currentEpIndex < currentAnime.episodesList.length - 1) {
      currentEpIndex++;
      activeServerIndex = 0;
      renderPlayer();
      renderEpisodeGrid();
    }
  });

  // Tombol Prev Episode
  document.getElementById('btn-prev-ep')?.addEventListener('click', () => {
    if (currentEpIndex > 0) {
      currentEpIndex--;
      activeServerIndex = 0;
      renderPlayer();
      renderEpisodeGrid();
    }
  });

  // Mode Bioskop (Cinema Mode)
  const cinemaBtn = document.getElementById('btn-cinema-mode');
  cinemaBtn?.addEventListener('click', () => {
    document.body.classList.toggle('cinema-mode-active');
    const isActive = document.body.classList.contains('cinema-mode-active');
    cinemaBtn.textContent = isActive ? '💡 Matikan Bioskop' : '💡 Mode Bioskop';
    toastService.info(isActive ? 'Mode bioskop aktif.' : 'Mode bioskop dinonaktifkan.');
  });
}

function saveWatchHistory(animeId, episodeNumber) {
  try {
    const historyKey = 'aniwave_history';
    const raw = localStorage.getItem(historyKey);
    const history = raw ? JSON.parse(raw) : {};
    history[animeId] = {
      lastEpisode: episodeNumber,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    // Ignore localStorage issues
  }
}

document.addEventListener('DOMContentLoaded', initWatch);
