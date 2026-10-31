/**
 * Aniwave Global Configuration
 * Centralized White-Label Settings, Brand Identity, API Endpoints & Monetization
 */

export const CONFIG = {
  // Brand identity (White-label customizable)
  site: {
    name: 'Aniwave',
    tagline: 'Anime Discovery & Catalog Platform',
    creator: 'TzRIO',
    description: 'Discover trending, popular, and seasonal anime with detailed synopsis, official streaming providers, and personalized watchlists.',
    canonicalUrl: 'https://tzrio.github.io/Aniwave',
    version: '2.0.0',
    logoText: 'Aniwave',
    logoBadge: 'assets/img/aniwave-mark.svg',
    creatorMark: 'assets/img/tzrio-mark.svg',
    defaultTheme: 'dark', // 'dark' | 'light'
    contactEmail: 'contact@aniwave.local',
    social: {
      github: 'https://github.com/tzrio/Aniwave',
      twitter: 'https://twitter.com',
      discord: 'https://discord.com',
    },
  },

  // Color theme presets (CSS variable overrides)
  theme: {
    accentColor: '#e50914', // Brand red accent
    accentHover: '#ff2832',
    accentGlow: 'rgba(229, 9, 20, 0.35)',
  },

  // Monetization & Affiliate Slots
  monetization: {
    enabled: true,
    affiliateBanner: {
      show: true,
      text: 'Support the industry: Watch legally on Crunchyroll, Netflix, and Muse Asia.',
      ctaText: 'Explore Streaming Services',
      ctaUrl: 'https://www.crunchyroll.com',
    },
    adSlots: {
      topBanner: false, // Set to true and configure provider script in production
      sidebar: false,
    },
  },

  // Third-party API integration
  apis: {
    jikanBaseUrl: 'https://api.jikan.moe/v4',
    enableLiveMalSync: true,
  },

  // Storage keys for LocalStorage
  storageKeys: {
    theme: 'aniwave_theme',
    userSession: 'aniwave_session',
    usersList: 'aniwave_users',
    watchlist: 'aniwave_watchlist',
    adminDataOverride: 'aniwave_data_override',
  },

  // Pagination & Display limits
  pagination: {
    itemsPerPage: 12,
  },
};
