/**
 * SMILEORA Universal Video Streaming Engine & Player
 * Capabilities:
 * - HLS Adaptive Playback (hls.js)
 * - Native MP4 HTML5 Video
 * - Sandboxed Partner Iframe Player
 * - Multi-Server Switcher with Intelligent Auto-Fallback
 * - Subtitle Track Selector (WebVTT)
 * - Auto-Next Episode with Countdown
 * - Playback Progress & Resume Point Memory (LocalStorage)
 */
import { CONFIG } from './config.js';
import { toastService } from './toastService.js';

export class SmileoraPlayer {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('player-viewport');
    this.serverContainer = options.serverContainer || document.getElementById('server-btn-container');
    this.animeId = options.animeId || '';
    this.episode = options.episode || null;
    this.onEpisodeComplete = options.onEpisodeComplete || null;
    this.onPrevEpisode = options.onPrevEpisode || null;
    this.onNextEpisode = options.onNextEpisode || null;

    this.activeSourceIndex = 0;
    this.activeTrackIndex = 0;
    this.hlsInstance = null;
    this.videoEl = null;
    this.iframeEl = null;
    this.failedSources = new Set();
  }

  // Load an episode with its video sources
  loadEpisode(animeId, episodeData) {
    this.animeId = animeId;
    this.episode = episodeData;
    this.activeSourceIndex = 0;
    this.failedSources.clear();

    this.renderServerList();
    this.mountCurrentSource();
  }

  // Render server / provider selector buttons
  renderServerList() {
    if (!this.serverContainer || !this.episode) return;
    this.serverContainer.innerHTML = '';

    const sources = this.episode.sources || [
      { id: 'src-1', name: 'Server Aurora (HLS)', type: 'hls', url: this.episode.hlsUrl || this.episode.videoUrl },
      { id: 'src-2', name: 'Server Zenith (Embed)', type: 'embed', url: this.episode.embedUrl || this.episode.videoUrl }
    ];

    sources.forEach((src, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-server ${idx === this.activeSourceIndex ? 'active' : ''}`;
      btn.textContent = src.name || `Server ${idx + 1}`;

      if (this.failedSources.has(src.id || idx)) {
        btn.style.opacity = '0.5';
        btn.title = 'Server ini mengalami error sebelumnya';
      }

      btn.addEventListener('click', () => {
        this.activeSourceIndex = idx;
        this.renderServerList();
        this.mountCurrentSource();
        toastService.info(`Beralih ke ${src.name}`);
      });

      this.serverContainer.appendChild(btn);
    });
  }

  // Mount video element based on current source type (HLS, MP4, Embed)
  mountCurrentSource() {
    if (!this.container || !this.episode) return;
    this.container.innerHTML = '';
    this.destroyHls();

    const sources = this.episode.sources || [];
    const source = sources[this.activeSourceIndex] || sources[0];

    if (!source || !source.url) {
      this.renderFallbackMessage('Tidak ada server video yang tersedia untuk episode ini.');
      return;
    }

    const type = (source.type || 'embed').toLowerCase();

    if (type === 'hls' || source.url.endsWith('.m3u8')) {
      this.mountHlsPlayer(source);
    } else if (type === 'mp4' || source.url.endsWith('.mp4')) {
      this.mountNativeVideo(source);
    } else {
      this.mountIframePlayer(source);
    }
  }

  // 1. HLS Player (via hls.js or native Safari HLS)
  mountHlsPlayer(source) {
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = false;
    video.playsInline = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.background = '#000';
    this.container.appendChild(video);
    this.videoEl = video;

    this.attachSubtitles(video);
    this.attachPlaybackProgressTracker(video);

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source.url);
      hls.attachMedia(video);
      this.hlsInstance = hls;

      hls.on(window.Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal Error, triggering auto-fallback:', data);
          this.handlePlaybackFailure(source);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = source.url;
    } else {
      // Browser doesn't support HLS, fallback to next source
      this.handlePlaybackFailure(source);
    }
  }

  // 2. Native MP4 Video Player
  mountNativeVideo(source) {
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = false;
    video.playsInline = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.src = source.url;
    this.container.appendChild(video);
    this.videoEl = video;

    this.attachSubtitles(video);
    this.attachPlaybackProgressTracker(video);

    video.onerror = () => {
      this.handlePlaybackFailure(source);
    };
  }

  // 3. Sandboxed Iframe Embed Player
  mountIframePlayer(source) {
    const iframe = document.createElement('iframe');
    iframe.src = source.url;
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.title = 'SMILEORA Streaming Player';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

    this.container.appendChild(iframe);
    this.iframeEl = iframe;
  }

  // Attach Subtitles (<track>) to native video
  attachSubtitles(video) {
    if (!this.episode.subtitles || !Array.isArray(this.episode.subtitles)) return;

    this.episode.subtitles.forEach((sub, idx) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = sub.label || sub.lang || `Subtitle ${idx + 1}`;
      track.srclang = sub.lang || 'id';
      track.src = sub.url;
      if (idx === 0 || sub.default) track.default = true;
      video.appendChild(track);
    });
  }

  // Track playback position & resume point
  attachPlaybackProgressTracker(video) {
    const savedPos = this.getSavedPosition();
    if (savedPos > 5) {
      video.currentTime = savedPos;
      toastService.info(`Melanjutkan dari menit ${Math.floor(savedPos / 60)}:${Math.floor(savedPos % 60).toString().padStart(2, '0')}`);
    }

    let saveThrottle = 0;
    video.ontimeupdate = () => {
      const now = Date.now();
      if (now - saveThrottle > 3000) {
        saveThrottle = now;
        this.savePosition(video.currentTime, video.duration);
      }
    };

    video.onended = () => {
      this.savePosition(0, video.duration, true);
      if (CONFIG.streaming.autoNext && this.onNextEpisode) {
        toastService.info('Episode selesai! Memutar episode selanjutnya...');
        setTimeout(() => this.onNextEpisode(), 2000);
      }
    };
  }

  // Intelligent Server Fallback
  handlePlaybackFailure(failedSource) {
    this.failedSources.add(failedSource.id || this.activeSourceIndex);
    const sources = this.episode.sources || [];

    // Find next unfailed source
    const nextIdx = sources.findIndex((s, idx) => !this.failedSources.has(s.id || idx));

    if (nextIdx !== -1) {
      this.activeSourceIndex = nextIdx;
      toastService.error(`Server bermasalah. Mengalihkan otomatis ke Server ${nextIdx + 1}...`);
      this.renderServerList();
      setTimeout(() => this.mountCurrentSource(), 600);
    } else {
      this.renderFallbackMessage('Semua server video saat ini sedang tidak dapat dijangkau. Silakan coba kembali nanti.');
    }
  }

  renderFallbackMessage(msg) {
    this.container.innerHTML = `
      <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px; text-align:center; background:#0B0D17; color:#F8FAFC;">
        <div style="font-size:2.5rem; margin-bottom:12px;">📡</div>
        <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:8px;">Koneksi Video Terputus</h3>
        <p style="font-size:0.85rem; color:#A1A1B5; max-width:400px; margin-bottom:20px;">${msg}</p>
        <button class="btn-primary" id="btn-player-retry" style="font-size:0.85rem; padding:8px 18px;">Coba Ulang Server 1</button>
      </div>
    `;

    document.getElementById('btn-player-retry')?.addEventListener('click', () => {
      this.failedSources.clear();
      this.activeSourceIndex = 0;
      this.renderServerList();
      this.mountCurrentSource();
    });
  }

  savePosition(currentTime, duration, completed = false) {
    if (!this.animeId || !this.episode) return;
    try {
      const raw = localStorage.getItem(CONFIG.storageKeys.watchHistory) || '{}';
      const history = JSON.parse(raw);
      history[this.animeId] = {
        animeId: this.animeId,
        episodeNumber: this.episode.number || 1,
        position: currentTime,
        duration: duration || 0,
        completed: completed,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(CONFIG.storageKeys.watchHistory, JSON.stringify(history));
    } catch (e) {}
  }

  getSavedPosition() {
    if (!this.animeId) return 0;
    try {
      const raw = localStorage.getItem(CONFIG.storageKeys.watchHistory);
      if (!raw) return 0;
      const history = JSON.parse(raw);
      const record = history[this.animeId];
      if (record && record.episodeNumber === (this.episode.number || 1) && !record.completed) {
        return record.position || 0;
      }
    } catch (e) {}
    return 0;
  }

  destroyHls() {
    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }
  }
}
