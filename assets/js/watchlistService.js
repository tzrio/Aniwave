/**
 * Aniwave Watchlist & Bookmark Service
 * Manages user bookmarks with statuses: 'plan', 'watching', 'completed'
 */
import { CONFIG } from './config.js';

export const watchlistService = {
  getWatchlist() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKeys.watchlist);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  isSaved(animeId) {
    const list = this.getWatchlist();
    return Boolean(list[animeId]);
  },

  getStatus(animeId) {
    const list = this.getWatchlist();
    return list[animeId]?.status || null;
  },

  save(animeId, status = 'plan') {
    const list = this.getWatchlist();
    list[animeId] = {
      animeId,
      status, // 'plan' | 'watching' | 'completed'
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CONFIG.storageKeys.watchlist, JSON.stringify(list));
    return list[animeId];
  },

  remove(animeId) {
    const list = this.getWatchlist();
    if (list[animeId]) {
      delete list[animeId];
      localStorage.setItem(CONFIG.storageKeys.watchlist, JSON.stringify(list));
      return true;
    }
    return false;
  },

  getAllSavedIds() {
    return Object.keys(this.getWatchlist());
  }
};
