/**
 * Aniwave Data Repository & Admin CRUD Service
 * Triple-Tier Architecture:
 * 1. Cloud Firestore (Firebase) if configured
 * 2. LocalStorage Overrides (for client modifications)
 * 3. Static data/anime.json Baseline (reliable zero-failure fallback)
 */
import { CONFIG } from './config.js';
import { firebaseService } from './firebaseService.js';

export const animeService = {
  dataCache: null,

  async getAllAnime() {
    if (this.dataCache) return this.dataCache;

    // 1. Try Cloud Firebase first if available
    const cloudData = await firebaseService.fetchAllAnime();
    if (cloudData && Object.keys(cloudData).length > 0) {
      this.dataCache = cloudData;
      return cloudData;
    }

    // 2. Fallback to static baseline JSON
    let baseline = {};
    try {
      const res = await fetch('data/anime.json', { cache: 'no-cache' });
      if (res.ok) {
        baseline = await res.json();
      }
    } catch (e) {
      console.warn('Gagal memuat baseline anime.json:', e);
    }

    // 3. Merge local overrides
    const overrides = this.getOverrides();
    const merged = { ...baseline, ...overrides };
    this.dataCache = merged;
    return merged;
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
    this.dataCache = null; // Invalidate cache
  },

  // Admin: Save or update an anime entry
  async saveAnime(animeRecord) {
    if (!animeRecord.id) throw new Error('ID Anime wajib diisi.');
    if (!animeRecord.title) throw new Error('Judul Anime wajib diisi.');

    // 1. Sync to Firebase if online
    if (firebaseService.isOnline) {
      try {
        await firebaseService.saveAnime(animeRecord);
      } catch (err) {
        console.warn('Cloud save warning:', err);
      }
    }

    // 2. Persist locally
    const overrides = this.getOverrides();
    overrides[animeRecord.id] = {
      ...animeRecord,
      updatedAt: new Date().toISOString()
    };

    this.saveOverrides(overrides);
    return overrides[animeRecord.id];
  },

  // Admin: Delete an anime entry
  async deleteAnime(animeId) {
    const overrides = this.getOverrides();
    const all = await this.getAllAnime();

    if (!all[animeId]) return false;

    if (overrides[animeId]) {
      delete overrides[animeId];
    }
    overrides[animeId] = { _deleted: true };
    this.saveOverrides(overrides);
    return true;
  },

  // Admin: Export complete dataset to JSON
  async exportFullDataset() {
    const all = await this.getAllAnime();
    const clean = {};
    for (const [k, v] of Object.entries(all)) {
      if (!v._deleted) clean[k] = v;
    }
    return JSON.stringify(clean, null, 2);
  },

  // Admin: Import dataset
  async importDataset(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Format JSON tidak valid.');
    this.saveOverrides(parsed);
    return Object.keys(parsed).length;
  }
};
