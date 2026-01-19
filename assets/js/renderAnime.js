/**
 * AniWave - Render Module
 * Menyusun dan merender UI list serta detail anime.
 */
import { formatRating, normalisasi, parseIdAnimeMal, starText, translateMusim } from './utils.js';
import { fetchJikanAnime, fetchJikanMeta } from './fetchAnime.js';
import { filterAnimeEntries, getAnimeStatusValue } from './filterAnime.js';

function setText(el, value) {
  if (!el) return;
  el.textContent = value ?? '';
}

function clearEl(el) {
  if (!el) return;
  el.innerHTML = '';
}

function getStatusLabel(anime) {
  const status = anime?.info?.Status;
  if (!status) return '';
  if (typeof status === 'string') return status;
  if (typeof status === 'object') {
    return String(status.text || status.value || '').trim();
  }
  return '';
}

function getAiringDay(anime) {
  const statusValue = normalisasi(getAnimeStatusValue(anime));
  if (statusValue === 'finished') return '';
  const raw = anime?.info?.['Hari Tayang'];
  const s = String(raw || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function getStudio(anime) {
  const s = String(anime?.info?.Studio || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function getYearSeason(anime) {
  const tahun = String(anime?.info?.Tahun || '').trim();
  const season = translateMusim(String(anime?.info?.Musim || '').trim());
  const left = tahun && tahun.toUpperCase() !== 'X' ? tahun : '';
  const right = season && season.toUpperCase() !== 'X' ? season : '';
  if (left && right) return `${left} ${right}`;
  return left || right || '';
}

function getSeason(anime) {
  const season = translateMusim(String(anime?.info?.Musim || '').trim());
  return season && season.toUpperCase() !== 'X' ? season : '';
}

function getType(anime) {
  const s = String(anime?.info?.Tipe || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function getDuration(anime) {
  const s = String(anime?.info?.Durasi || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function getReleaseLabel(anime) {
  return getYearSeason(anime) || getAiringDay(anime) || '—';
}

function getTotalEpisode(anime) {
  const s = String(anime?.info?.['Total Ep'] || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function getLocalRating(anime) {
  const r = anime?.info?.Rating;
  if (!r) return '—';
  if (typeof r === 'string') return r.trim() || '—';
  if (typeof r === 'number') return formatRating(r);
  if (typeof r === 'object' && r.type === 'mal') return '—';
  return formatRating(r);
}

function joinMeta(releaseText, ratingText) {
  const left = String(releaseText || '').trim() || '—';
  const right = starText(String(ratingText || '').trim() || '—');
  return `${left} • ${right}`;
}

function createChip(text) {
  const span = document.createElement('span');
  span.className = 'chip-meta';
  span.textContent = text;
  return span;
}

function getYear(anime) {
  const s = String(anime?.info?.Tahun || '').trim();
  return s && s.toUpperCase() !== 'X' ? s : '';
}

function getAiringPeriod(anime) {
  const tahun = getYear(anime);
  const musim = getSeason(anime);
  const hari = getAiringDay(anime);
  const statusValue = normalisasi(getAnimeStatusValue(anime));
  const statusLabel = getStatusLabel(anime);

  const base = [tahun, musim].filter(Boolean).join(' • ');
  if (base) {
    if (statusValue && statusValue !== 'finished' && hari) return `${base} • ${hari}`;
    return base;
  }

  if (statusValue === 'finished') return 'Sudah tamat';
  return statusLabel || '—';
}

function getTypeBadge(anime) {
  const tipe = String(anime?.info?.Tipe || '').trim();
  if (!tipe) return 'SERIAL';
  return tipe.toUpperCase();
}

function buildIndexFilterHref(typeFilter, valueFilter) {
  const type = String(typeFilter || '').trim().toLowerCase();
  const value = String(valueFilter || '').trim();
  if (!type || !value) return 'index.html';
  return `index.html#${encodeURIComponent(type)}=${encodeURIComponent(value)}`;
}

export function renderAnimeList(semuaData, state) {
  const list = document.getElementById('daftar-anime');
  if (!list) return;
  clearEl(list);

  const previewMode = !normalisasi(state?.q) && !normalisasi(state?.genre) && !normalisasi(state?.tipe) && !normalisasi(state?.status);
  list.dataset.preview = previewMode ? '1' : '0';

  const entries = filterAnimeEntries(semuaData, state);

  const serial = [];
  const film = [];

  for (const entry of entries) {
    const anime = entry[1];
    const tipe = normalisasi(anime?.info?.Tipe);
    if (tipe.includes('film') || tipe.includes('movie')) film.push(entry);
    else serial.push(entry);
  }

  const countGridColumns = (gridEl) => {
    if (!gridEl) return 1;
    const cols = window.getComputedStyle(gridEl).gridTemplateColumns;
    const parts = String(cols || '')
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean);
    return Math.max(1, parts.length);
  };

  const applyRowLimit = (gridEl, lihatEl, maxRows = 3) => {
    if (!gridEl) return;
    const cards = Array.from(gridEl.children).filter((n) => n && n.classList && n.classList.contains('kartu-beranda'));

    if (!previewMode) {
      for (const el of cards) el.hidden = false;
      if (lihatEl) lihatEl.hidden = true;
      return;
    }

    const cols = countGridColumns(gridEl);
    const maxVisible = cols * maxRows;
    for (let i = 0; i < cards.length; i++) {
      cards[i].hidden = i >= maxVisible;
    }

    const hasMore = cards.length > maxVisible;
    if (lihatEl) lihatEl.hidden = !hasMore;
  };

  const renderCardTo = (targetList, [id, anime]) => {
    const li = document.createElement('li');
    li.className = 'kartu-beranda';

    const a = document.createElement('a');
    a.className = 'kartu-link';
    a.href = `anime.html#${encodeURIComponent(id)}`;

    const thumb = document.createElement('div');
    thumb.className = 'kartu-thumb';

    const badge = document.createElement('span');
    badge.className = 'kartu-badge';
    badge.textContent = getTypeBadge(anime);
    thumb.appendChild(badge);

    const rating = document.createElement('span');
    rating.className = 'kartu-rating';
    const ratingLocal = getLocalRating(anime);
    rating.textContent = starText(ratingLocal);
    thumb.appendChild(rating);

    const coverSrc = String(anime?.cover || '').trim();
    if (coverSrc) {
      const img = document.createElement('img');
      img.className = 'kartu-img';
      img.loading = 'lazy';
      img.src = coverSrc;
      img.alt = anime?.title || id;
      thumb.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'kartu-img kartu-img--placeholder';
      placeholder.textContent = anime?.title || id;
      thumb.appendChild(placeholder);
    }

    const body = document.createElement('div');
    body.className = 'kartu-body';

    const title = document.createElement('div');
    title.className = 'kartu-judul';
    title.textContent = anime?.title || id;

    const periode = document.createElement('div');
    periode.className = 'kartu-periode';
    periode.textContent = getAiringPeriod(anime);

    body.appendChild(title);
    body.appendChild(periode);

    a.appendChild(thumb);
    a.appendChild(body);

    li.appendChild(a);
    targetList.appendChild(li);

    const malId = parseIdAnimeMal(anime?.mal) || parseIdAnimeMal(anime?.info?.Rating);
    if (malId) {
      fetchJikanMeta(malId)
        .then((meta) => {
          const ratingText = meta?.score ? formatRating(meta.score) : ratingLocal;
          if (rating.isConnected) rating.textContent = starText(ratingText);
        })
        .catch(() => {
          // offline? gapapa.
        });
    }
  };

  const renderSection = (label, entriesSection, lihatHref) => {
    const liSection = document.createElement('li');
    liSection.className = 'bab';

    const header = document.createElement('div');
    header.className = 'bab-header';

    const title = document.createElement('div');
    title.className = 'bab-judul';
    title.textContent = label;

    const lihat = document.createElement('a');
    lihat.className = 'bab-lihat';
    lihat.textContent = 'Lihat lainnya';
    lihat.href = lihatHref;
    lihat.hidden = true;

    header.appendChild(title);
    header.appendChild(lihat);

    const grid = document.createElement('ul');
    grid.className = 'bab-grid';
    grid.setAttribute('aria-label', `Daftar ${label}`);

    liSection.appendChild(header);
    liSection.appendChild(grid);
    list.appendChild(liSection);

    for (const entry of entriesSection) renderCardTo(grid, entry);

    window.requestAnimationFrame(() => {
      applyRowLimit(grid, lihat, 3);
    });
  };

  if (serial.length > 0) {
    renderSection('Serial', serial, 'index.html#tipe=serial');
  }

  if (film.length > 0) {
    renderSection('Film', film, 'index.html#tipe=film');
  }

  if (!window.__ANIWAVE_BERANDA_RESIZE_BOUND__) {
    window.__ANIWAVE_BERANDA_RESIZE_BOUND__ = true;
    let t = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const root = document.getElementById('daftar-anime');
        if (!root) return;
        if (root.dataset.preview !== '1') return;
        const grids = root.querySelectorAll('.bab-grid');
        for (const grid of grids) {
          const section = grid.closest('.bab');
          const lihat = section ? section.querySelector('.bab-lihat') : null;
          const cols = (grid && window.getComputedStyle(grid).gridTemplateColumns)
            ? String(window.getComputedStyle(grid).gridTemplateColumns).split(' ').filter(Boolean).length
            : 1;
          const cards = Array.from(grid.children).filter((n) => n && n.classList && n.classList.contains('kartu-beranda'));
          const maxVisible = Math.max(1, cols) * 3;
          for (let i = 0; i < cards.length; i++) cards[i].hidden = i >= maxVisible;
          if (lihat) lihat.hidden = !(cards.length > maxVisible);
        }
      }, 120);
    });
  }
}

export function createAnimeDetailElement(id, anime) {
  const detail = document.createElement('div');
  detail.className = 'detail-anime';
  detail.dataset.detailFor = id;

  const row = document.createElement('div');
  row.className = 'baris-detail';

  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'bungkus-thumbnail';

  const cover = document.createElement('img');
  cover.className = 'gambar-thumbnail';
  cover.loading = 'lazy';
  const coverSrc = String(anime?.cover || '').trim();
  cover.src = coverSrc;
  cover.alt = anime?.title || '';
  if (coverSrc) {
    thumbWrap.appendChild(cover);
    row.appendChild(thumbWrap);
  }

  const body = document.createElement('div');
  body.className = 'isi-detail';

  const sinopsis = document.createElement('div');
  sinopsis.className = 'sinopsis-detail';
  const semuaBaris = Array.isArray(anime?.sinopsis) ? anime.sinopsis : [];
  const pendek = semuaBaris.slice(0, 2);
  const p = document.createElement('p');
  p.className = 'baris-sinopsis';
  p.textContent = pendek.join(' ');
  sinopsis.appendChild(p);

  if (semuaBaris.length > 2) {
    const btnExpand = document.createElement('button');
    btnExpand.type = 'button';
    btnExpand.className = 'tombol-expand';
    btnExpand.textContent = 'Lihat selengkapnya';

    let expanded = false;
    btnExpand.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      expanded = !expanded;
      p.textContent = expanded ? semuaBaris.join(' ') : pendek.join(' ');
      btnExpand.textContent = expanded ? 'Tutup' : 'Lihat selengkapnya';
    });

    sinopsis.appendChild(btnExpand);
  }

  const meta = document.createElement('div');
  meta.className = 'meta-detail';
  const statusText = getStatusLabel(anime) || '—';
  meta.appendChild(createChip(`Status: ${statusText}`));
  meta.appendChild(createChip(`Tipe: ${getType(anime) || '—'}`));
  meta.appendChild(createChip(`Studio: ${getStudio(anime) || '—'}`));
  meta.appendChild(createChip(`Tahun/Musim: ${getYearSeason(anime) || '—'}`));
  meta.appendChild(createChip(`Total Ep: ${getTotalEpisode(anime) || '—'}`));
  const durasi = getDuration(anime);
  if (durasi) meta.appendChild(createChip(`Durasi: ${durasi}`));

  const genre = document.createElement('div');
  genre.className = 'genre-detail';
  const genreList = anime?.info?.Genre;
  if (Array.isArray(genreList)) {
    for (const g of genreList) {
      const a = document.createElement('a');
      a.href = `#genre=${encodeURIComponent(String(g))}`;
      a.className = 'lencana-genre';
      a.textContent = String(g);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.hash = `genre=${encodeURIComponent(String(g))}`;
      });
      genre.appendChild(a);
      genre.appendChild(document.createTextNode(' '));
    }
  }

  const actions = document.createElement('div');
  actions.className = 'aksi-detail';

  const open = document.createElement('a');
  open.className = 'tombol-buka';
  open.href = `anime.html#${encodeURIComponent(id)}`;
  open.textContent = 'Buka';
  actions.appendChild(open);

  body.appendChild(sinopsis);
  body.appendChild(meta);
  body.appendChild(genre);
  body.appendChild(actions);

  row.appendChild(thumbWrap);
  row.appendChild(body);
  detail.appendChild(row);

  return detail;
}

export function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '';
}

export function setCoverImage(src, alt) {
  const img = document.getElementById('sampul-anime');
  if (!img) return;
  const s = String(src || '').trim();
  if (!s) {
    img.src = '';
    img.alt = '';
    img.style.display = 'none';
    return;
  }
  img.style.display = '';
  img.src = s;
  img.alt = alt || '';
}

export function renderSynopsis(lines) {
  const tbody = document.getElementById('isi-sinopsis');
  if (!tbody) return;
  tbody.innerHTML = '';

  for (const line of lines || []) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = line;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

export function renderInfo(info) {
  const tbody = document.getElementById('isi-info');
  if (!tbody) return;
  tbody.innerHTML = '';

  const statusRaw = info?.Status;
  const statusValue = (typeof statusRaw === 'object')
    ? String(statusRaw.value || statusRaw.text || '').trim().toLowerCase()
    : String(statusRaw || '').trim().toLowerCase();

  const entries = Object.entries(info || {});
  for (const [label, value] of entries) {
    if (String(label).trim().toLowerCase() === 'uploader') {
      continue;
    }

    const tr = document.createElement('tr');

    const labelNorm = String(label).trim().toLowerCase();
    const tdLabel = document.createElement('td');
    tdLabel.textContent = label;

    const tdValue = document.createElement('td');
    tdValue.textContent = ':';

    const tdContent = document.createElement('td');

    if (labelNorm === 'hari tayang' && statusValue === 'finished') {
      tdContent.textContent = 'Sudah tamat';
    } else if (labelNorm === 'musim') {
      tdContent.textContent = translateMusim(value);
    } else

    if (Array.isArray(value)) {
      for (const item of value) {
        const genre = String(item);
        const a = document.createElement('a');
        a.href = buildIndexFilterHref('genre', genre);
        a.className = 'lencana-genre';
        a.textContent = genre;
        tdContent.appendChild(a);
        tdContent.appendChild(document.createTextNode(' '));
      }
    } else if (value && typeof value === 'object' && value.type === 'status') {
      const statusValue = String(value.value || value.text || '').trim();
      const statusText = String(value.text || value.value || '').trim() || '—';
      const a = document.createElement('a');
      a.href = buildIndexFilterHref('status', statusValue);
      a.textContent = statusText;
      if (value.class) a.className = value.class;
      tdContent.appendChild(a);
    } else if (value && typeof value === 'object' && value.type === 'mal') {
      const span = document.createElement('span');
      span.textContent = 'Lagi ngambil...';
      tdContent.appendChild(span);

      const malId = parseIdAnimeMal(value);
      if (!malId) {
        span.textContent = '—';
      } else {
        fetchJikanAnime(malId)
          .then((result) => {
            const score = result?.score;
            const formatted = (typeof score === 'number' && Number.isFinite(score)) ? formatRating(score) : '—';
            span.textContent = starText(formatted);
          })
          .catch(() => {
            span.textContent = '—';
          });
      }
    } else if (value && typeof value === 'object' && value.type === 'link') {
      const a = document.createElement('a');
      a.href = value.href || '#';
      a.textContent = value.text || '';
      if (value.target) a.target = value.target;
      if (a.target === '_blank') a.rel = 'noopener noreferrer';
      if (value.class) a.className = value.class;
      if (a.getAttribute('href') === '#') {
        a.addEventListener('click', (e) => e.preventDefault());
      }
      tdContent.appendChild(a);
    } else {
      tdContent.textContent = String(value ?? '');
    }

    tr.appendChild(tdLabel);
    tr.appendChild(tdValue);
    tr.appendChild(tdContent);
    tbody.appendChild(tr);
  }
}

export function renderDownloads(downloads) {
  const table = document.getElementById('tabel-unduh');
  const tbody = document.getElementById('isi-unduh');
  if (!table || !tbody) return;

  tbody.innerHTML = '';

  if (!downloads || downloads.length === 0) {
    table.style.display = 'none';
    return;
  }

  const isValidLink = (link) => {
    const text = String(link?.text ?? '').trim();
    const href = String(link?.href ?? '').trim();
    if (!text || !href) return false;
    if (text.toLowerCase() === 'x') return false;
    return true;
  };

  table.style.display = '';
  let anyValidRow = false;

  for (const group of downloads) {
    const trHeader = document.createElement('tr');
    trHeader.className = 'judul-tabel';

    const th = document.createElement('th');
    th.colSpan = 5;
    th.textContent = group.episode || '';

    trHeader.appendChild(th);
    tbody.appendChild(trHeader);

    for (const row of group.rows || []) {
      const tr = document.createElement('tr');

      const tdLabel = document.createElement('td');
      const b = document.createElement('b');
      b.textContent = row.label || '';
      tdLabel.appendChild(b);

      const tdLink1 = document.createElement('td');
      tdLink1.colSpan = 2;
      const tdLink2 = document.createElement('td');
      tdLink2.colSpan = 2;

      const links = row.links || [];
      const linkA = links[0];
      const linkB = links[1];

      const validA = isValidLink(linkA);
      const validB = isValidLink(linkB);

      if (!validA && !validB) {
        continue;
      }

      anyValidRow = true;

      if (validA) {
        const a1 = document.createElement('a');
        a1.href = linkA.href;
        a1.textContent = linkA.text;
        a1.className = 'tautan-unduh';
        tdLink1.appendChild(a1);
      }

      if (validB) {
        const a2 = document.createElement('a');
        a2.href = linkB.href;
        a2.textContent = linkB.text;
        a2.className = 'tautan-unduh';
        tdLink2.appendChild(a2);
      }

      tr.appendChild(tdLabel);
      tr.appendChild(tdLink1);
      tr.appendChild(tdLink2);
      tbody.appendChild(tr);
    }
  }

  if (!anyValidRow) {
    table.style.display = 'none';
  }
}
