/**
 * Aniwave Data Repository & Admin CRUD Service
 * Combines static JSON baseline with LocalStorage overrides for Admin operations
 */
import { CONFIG } from './config.js';

export const animeService = {
  dataCache: null,

  async getAllAnime() {
    if (this.dataCache) return this.dataCache;

    // 1. Fetch static baseline
    let baseline = {};
    try {
      const res = await fetch('data/anime.json', { cache: 'no-cache' });
      if (res.ok) {
        baseline = await res.json();
      }
    } catch (e) {
      console.warn('Gagal memuat baseline anime.json:', e);
    }

    // 2. Merge local admin overrides if present
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

    // If it exists in overrides, delete or mark as deleted
    if (overrides[animeId]) {
      delete overrides[animeId];
    }
    // Record deletion tombstone if was present in baseline
    overrides[animeId] = { _deleted: true };
    this.saveOverrides(overrides);
    return true;
  },

  // Admin: Export complete dataset to JSON
  async exportFullDataset() {
    const all = await this.getAllAnime();
    // Filter out tombstones
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
