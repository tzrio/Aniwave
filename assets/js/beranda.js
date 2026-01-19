/**
 * AniWave - Beranda Entrypoint
 * Menginisialisasi filter, membaca state hash, dan merender daftar anime.
 */
import { fetchAnimeData } from './fetchAnime.js';
import { collectFilterOptions, fillSelectOptions, readStateFromHash, setHashParams } from './filterAnime.js';
import { renderAnimeList } from './renderAnime.js';
import { normalisasi } from './utils.js';

async function utama() {
  try {
    const semuaData = await fetchAnimeData();
    const inputCari = document.getElementById('cari-anime');
    const selectGenre = document.getElementById('filter-genre');
    const selectTipe = document.getElementById('filter-tipe');
    const selectStatus = document.getElementById('filter-status');
    const tombolReset = document.getElementById('reset-filter');

    const { genres, statuses } = collectFilterOptions(semuaData);
    fillSelectOptions(selectGenre, genres);
    fillSelectOptions(selectStatus, statuses);

    const render = () => {
      const state = readStateFromHash();
      if (inputCari) inputCari.value = state.q || '';
      if (selectGenre) selectGenre.value = state.genre || '';
      if (selectTipe) selectTipe.value = normalisasi(state.tipe || '') || '';
      if (selectStatus) selectStatus.value = normalisasi(state.status || '') || '';

      renderAnimeList(semuaData, state);
      const openDetails = document.querySelectorAll('.detail-anime');
      for (const d of openDetails) {
        if (d.parentElement) d.parentElement.removeChild(d);
      }
    };

    render();
    window.addEventListener('hashchange', render);

    let timerCari = 0;
    if (inputCari) {
      inputCari.addEventListener('input', () => {
        window.clearTimeout(timerCari);
        timerCari = window.setTimeout(() => {
          setHashParams({ q: inputCari.value });
        }, 150);
      });
    }

    if (selectGenre) {
      selectGenre.addEventListener('change', () => {
        setHashParams({ genre: selectGenre.value });
      });
    }

    if (selectTipe) {
      selectTipe.addEventListener('change', () => {
        setHashParams({ tipe: selectTipe.value });
      });
    }

    if (selectStatus) {
      selectStatus.addEventListener('change', () => {
        setHashParams({ status: selectStatus.value });
      });
    }

    if (tombolReset) {
      tombolReset.addEventListener('click', () => {
        setHashParams({ q: '', genre: '', tipe: '', status: '' });
      });
    }
  } catch (err) {
    const list = document.getElementById('daftar-anime');
    if (list) {
      list.innerHTML = `<li class="entri-anime">Yah, gagal muat data: ${String(err?.message || err)}</li>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', utama);
