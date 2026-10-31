/**
 * SMILEORA Data Repository & Admin CRUD Service
 * Unified Architecture:
 * - Firebase Firestore (Cloud persistence & live delete)
 * - LocalStorage tombstone tracking (Clean UI updates)
 * - Local JSON fallback
 */
import { CONFIG } from './config.js';
import { firebaseService } from './firebaseService.js';

export const animeService = {
  dataCache: null,

  async getAllAnime() {
    if (this.dataCache) return this.dataCache;

    const overrides = this.getOverrides();
    let merged = {};

    // 1. Coba ambil dari Cloud Firebase Firestore
    const cloudData = await firebaseService.fetchAllAnime();

    if (cloudData && Object.keys(cloudData).length > 0) {
      merged = { ...cloudData };
    } else {
      // 2. Fallback baca file lokal data/anime.json jika Firebase offline
      try {
        const res = await fetch('data/anime.json', { cache: 'no-cache' });
        if (res.ok) {
          merged = await res.json();
        }
      } catch (e) {
        console.warn('Gagal memuat baseline anime.json:', e);
      }
    }

    // 3. Terapkan local overrides & tombstones (hapus anime yang ditandai _deleted)
    for (const [k, v] of Object.entries(overrides)) {
      if (v._deleted) {
        delete merged[k];
      } else {
        merged[k] = v;
      }
    }

    // Filter dokumen deleted jika terbawa
    const clean = {};
    for (const [k, v] of Object.entries(merged)) {
      if (!v._deleted) clean[k] = v;
    }

    this.dataCache = clean;
    return clean;
  },

  async getAnimeById(id) {
    const all = await this.getAllAnime();
    return all[id] || null;
  },

  getOverrides() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKeys.adminDataOverride);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveOverrides(overrides) {
    localStorage.setItem(CONFIG.storageKeys.adminDataOverride, JSON.stringify(overrides));
    this.dataCache = null; // Invalidate cache agar tabel langsung render data terkini
  },

  // Admin: Simpan atau Edit Anime
  async saveAnime(animeRecord, oldId = null) {
    if (!animeRecord.id) throw new Error('ID Anime wajib diisi.');
    if (!animeRecord.title) throw new Error('Judul Anime wajib diisi.');

    // Jika saat edit ID-nya berubah, hapus ID yang lama agar tidak ganda
    if (oldId && oldId !== animeRecord.id) {
      await this.deleteAnime(oldId);
    }

    // 1. Simpan langsung ke Firebase Firestore Cloud
    if (firebaseService.isOnline) {
      try {
        await firebaseService.saveAnime(animeRecord);
      } catch (err) {
        console.warn('Cloud save warning:', err);
      }
    }

    // 2. Simpan ke local overrides
    const overrides = this.getOverrides();
    overrides[animeRecord.id] = {
      ...animeRecord,
      _deleted: false,
      updatedAt: new Date().toISOString()
    };

    this.saveOverrides(overrides);
    return overrides[animeRecord.id];
  },

  // Admin: Hapus Anime Permanen (di Cloud Firestore & Local)
  async deleteAnime(animeId) {
    // 1. Hapus dari Firestore Cloud
    if (firebaseService.isOnline) {
      try {
        await firebaseService.deleteAnime(animeId);
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }

    // 2. Beri penanda tombstone _deleted di LocalStorage agar tidak muncul dari anime.json
    const overrides = this.getOverrides();
    overrides[animeId] = { _deleted: true };
    this.saveOverrides(overrides);

    // 3. Bersihkan dari memory cache
    if (this.dataCache && this.dataCache[animeId]) {
      delete this.dataCache[animeId];
    }

    return true;
  },

  async exportFullDataset() {
    const all = await this.getAllAnime();
    return JSON.stringify(all, null, 2);
  },

  async importDataset(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Format JSON tidak valid.');
    this.saveOverrides(parsed);
    return Object.keys(parsed).length;
  }
};
