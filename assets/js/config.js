/**
 * SMILEORA Central Configuration
 * Brand: SMILEORA | Parent Company: SMILEON
 * Tagline: "Where Stories Create Smiles."
 * White-Label Ready, Multi-Provider Video Architecture
 */

export const CONFIG = {
  // Brand identity
  site: {
    name: 'SMILEORA',
    legalName: 'SMILEORA Entertainment Platform',
    parentCompany: 'SMILEON',
    tagline: 'Where Stories Create Smiles.',
    description: 'A universe of stories, emotions, and unforgettable adventures. Discover, track, and stream verified anime.',
    philosophy: 'SMILE (joy & shared memories) + ORA (aura, aurora & infinite imagination).',
    canonicalUrl: 'https://tzrio.github.io/Aniwave',
    version: '3.0.0-PRO',
    logoText: 'SMILEORA',
    logoMark: 'assets/img/smileora-mark.svg',
    logoFull: 'assets/img/smileora-logo.svg',
    favicon: 'assets/img/smileora-mark.svg',
    defaultTheme: 'dark',
    contactEmail: 'contact@smileon.media',
    social: {
      github: 'https://github.com/tzrio/Aniwave',
      twitter: 'https://twitter.com/smileora_media',
      discord: 'https://discord.gg/smileora',
      youtube: 'https://youtube.com/@smileora',
    },
    footerAttribution: '© 2026 SMILEORA by SMILEON. All rights reserved. Anime assets & trademarks remain property of their respective production committees.',
  },

  // Color Tokens & Themes
  theme: {
    accentPrimary: '#A78BFA', // Soft aurora violet
    accentSecondary: '#7C5CFC', // Deep radiant purple
    accentGlow: 'rgba(167, 139, 250, 0.35)',
    bgDark: '#0B0D17',
    bgSecondaryDark: '#111426',
    surfaceDark: '#191D31',
  },

  // Streaming & Playback Engine Settings
  streaming: {
    defaultProvider: 'smileora-hls',
    autoNext: true,
    autoNextCountdown: 5, // seconds
    defaultQuality: 'auto',
    resumePlaybackThreshold: 10, // seconds
    providers: [
      { id: 'smileora-hls', name: 'Smileora HLS (Adaptive)', type: 'hls', priority: 1, active: true },
      { id: 'smileora-stream-1', name: 'Server Aurora (HD)', type: 'embed', priority: 2, active: true },
      { id: 'smileora-stream-2', name: 'Server Zenith (Backup)', type: 'embed', priority: 3, active: true },
      { id: 'official-partner', name: 'Official Partner Player', type: 'partner', priority: 4, active: true },
    ],
  },

  // Monetization & Affiliate Slots
  monetization: {
    enabled: true,
    affiliateBanner: {
      show: true,
      text: 'Support the anime industry: Stream legally on Crunchyroll, Netflix, and Muse Asia.',
      ctaText: 'Official Streaming Directory',
      ctaUrl: 'https://www.crunchyroll.com',
    },
    sponsorSlots: {
      topBanner: false,
      sidebar: false,
    },
  },

  // External APIs
  apis: {
    jikanBaseUrl: 'https://api.jikan.moe/v4',
    anilistBaseUrl: 'https://graphql.anilist.co',
    enableLiveMalSync: true,
  },

  // Storage Keys
  storageKeys: {
    theme: 'smileora_theme',
    userSession: 'smileora_session',
    usersList: 'smileora_users',
    watchlist: 'smileora_watchlist',
    watchHistory: 'smileora_history',
    userPreferences: 'smileora_prefs',
    adminDataOverride: 'smileora_data_override',
  },

  pagination: {
    itemsPerPage: 12,
  },
};
