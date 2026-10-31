# Aniwave Technical Audit & Architecture Review

**Date:** 2026-10-31  
**Project:** Aniwave  
**Original Brand:** TzRIO  
**Target:** Production-grade, commercial-ready anime catalog & discovery platform  

---

## 1. Executive Summary

Aniwave is currently a lightweight client-side static catalog built using vanilla HTML5, CSS3, and modern ES Modules (ESM). Data is served from a local JSON document (`data/anime.json`) supplemented with live lookups to the Jikan REST API (MyAnimeList v4).

While functional as a hobbyist proof-of-concept, the current codebase exhibits critical structural limitations that prevent commercial use:
- **Zero authentication / authorization**: Login buttons are dead anchors (`href="#login"`).
- **No persistent data manipulation**: No admin CRUD interface or database layer.
- **Copyright & Compliance risks**: Direct links to unverified file hosts (Zippyshare, Mediafire) in `downloads` records. These must be replaced with authorized streaming/licensing references (e.g., Crunchyroll, Netflix, Bilibili) and clean watch provider metadata.
- **Outdated UI/UX paradigm**: White/red harsh contrast, table-based layouts for detail screens, center tags, lack of responsive hero banners, carousel, skeleton loaders, and modern dark aesthetics standard across AniList, Crunchyroll, and modern web apps.
- **SEO & Social Discovery**: Lacks dynamic OpenGraph, JSON-LD structured data (Schema.org/TVSeries & Movie), canonical links, and sitemaps.
- **Security**: Inadequate input sanitization for user search inputs, potential XSS vectors in DOM insertion routines (`innerHTML`).

---

## 2. Component-by-Component Audit

### 2.1 Markup & Semantics (`index.html`, `anime.html`)
- **Issues**:
  - `anime.html` heavily relies on obsolete HTML attributes: `align="center"`, `border="1"`, `cellspacing="3"`, `cellpadding="10"`.
  - Lack of OpenGraph / Twitter card metadata.
  - Lack of Web App Manifest (`manifest.json`) and mobile theme-color configuration.
  - Dead buttons: `Login / Signup` does nothing.
- **Remediation**:
  - Rewrite using modern semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<dialog>`).
  - Add accessible modal dialogs for Authentication (Login / Register / Profile) and trailer view.
  - Inject structured JSON-LD and meta tags dynamically.

### 2.2 Styling & Design System (`assets/css/`)
- **Issues**:
  - CSS reset in `beranda.css` is an archaic Meyer-style reset mixed with component rules.
  - Hard-coded color variables (`--primary: red; --bg: #ffffff;`) with poor dark-mode contrast.
  - No CSS variables for theme switching (light/dark/custom white-label brand colors).
  - Lack of skeleton screen styles, toast notifications, responsive drawer menus, and hero carousel.
- **Remediation**:
  - Implement a centralized Design Token system in `assets/css/theme.css` supporting light and dark modes, configurable primary/accent colors, elevation surfaces, and fluid typography.
  - Replace old styles with a modular BEM-like structure.
  - Create dedicated modern components: Hero slider, anime cards with badge overlays, skeleton shimmers, toast system, tabs, modal sheets, and admin controls.

### 2.3 JavaScript Modules (`assets/js/`)
- **Issues**:
  - `fetchAnime.js`: No error fallback if `data/anime.json` fails; tight coupling to external Jikan API without graceful rate-limit handling.
  - `renderAnime.js`: Uses string concatenation and innerHTML in certain blocks; lack of skeleton placeholders during image loading.
  - `filterAnime.js`: Hash-only state; does not sync cleanly with HTML5 History API (`pushState` / `URLSearchParams`) for canonical sharable URLs.
  - Missing features: Watchlist/Favorites store (Client-side localStorage with encrypted/validated schema), Theme persistence, User authentication state machine, and Admin content management.
- **Remediation**:
  - Modularize into clean service layers:
    - `config.js` (White-label & brand configuration)
    - `authService.js` (Session management, user storage, guest fallback, admin credential checks)
    - `watchlistService.js` (Favorites, Watching, Completed, Plan-to-watch with local persistence & export/import)
    - `adminService.js` (Full CRUD operations, JSON import/export, record validation)
    - `seoService.js` (Dynamic meta tags and JSON-LD schema generation)
    - `toastService.js` (Unified notification system)

### 2.4 Data Schema (`data/anime.json`)
- **Issues**:
  - Schema inconsistencies: Some entries have empty download arrays, placeholder strings like `"X"`, inconsistent property keys.
  - Unauthorized download links pointing to defunct hosts (e.g. Zippyshare).
- **Remediation**:
  - Modernize schema: Add `banner`, `score`, `episodes`, `status`, `genres`, `format`, `studio`, `year`, `season`, `trailerUrl`, `authorizedProviders` (Official links e.g. Crunchyroll, Netflix, Muse Asia).
  - Clean all illegal/dead links.
  - Add validator script `scripts/validateData.js` to ensure schema integrity.

---

## 3. Transformation Strategy & Architecture Decisions

1. **Architecture Model**:
   - Modern Client-First Static Single-Page/Multi-Page Application (MPA with client routing).
   - Zero-dependency runtime for lightning-fast loads on GitHub Pages, Cloudflare Pages, Vercel, or any standard HTTP server.
   - Built-in Local & IndexedDB/LocalStorage persistence for User Profiles, Watchlists, and Admin Staging.
   - Built-in Data Migration & Export/Import capability for full white-label portability.
2. **White-Label Readiness**:
   - Central `assets/js/config.js` with site name, logos, navigation, copyright, monetization slots (affiliate links, banners), and theme presets.
3. **Legal & Copyright Compliance**:
   - Explicit disclaimer and removal of pirated download hosts.
   - Integration of official authorized streaming providers (Crunchyroll, Netflix, Disney+, Bilibili, YouTube Muse/Ani-One).

---

## 4. Phase Plan & Verification Checklist
- [x] Phase 1: Technical Audit (this document)
- [ ] Phase 2: Design Tokens, Dark/Light Themes, Global & Component CSS
- [ ] Phase 3: Modern Data Schema & Verified Dataset (`data/anime.json`)
- [ ] Phase 4: Core JavaScript Services (Config, Auth, Watchlist, Admin CRUD, SEO, Toasts)
- [ ] Phase 5: Rebuilt Homepage (`index.html`) with Hero Banner, Trending, Filters, Pagination, & Search
- [ ] Phase 6: Rebuilt Detail Page (`anime.html`) with Hero Backdrop, Trailer Modal, Meta, Official Streaming Links, & Recommendations
- [ ] Phase 7: Admin Panel (`admin.html`) with complete anime management, data import/export, and schema validation
- [ ] Phase 8: SEO (sitemap.xml, robots.txt, JSON-LD), Documentation, and Automated Testing
