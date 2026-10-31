# Aniwave Architecture & System Design Documentation

**Version:** 2.0.0 Production  
**Target:** Commercial Web Platform  

## 1. Architectural Model
Aniwave v2.0 is built as a zero-dependency, high-performance static application (JAMstack architecture) capable of deploying immediately to edge networks (GitHub Pages, Cloudflare Pages, Vercel, Netlify, or standard Nginx/Apache servers).

```
                      +-----------------------------+
                      |   Client Browser (UI/UX)    |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
     [ HTML5 Pages ]          [ ESM Services ]       [ Local & Remote Store ]
     - index.html             - config.js            - data/anime.json (Baseline)
     - anime.html             - authService.js       - LocalStorage (Overrides/User)
     - admin.html             - animeService.js      - Jikan REST API (Optional sync)
                              - watchlistService.js
                              - seoService.js
```

## 2. Core Service Modules
- **`config.js`**: Central repository for site white-label tokens, primary accents, brand identity, monetization flags, and storage keys.
- **`authService.js`**: Session manager supporting guest access, user registration, role authorization, and root admin authentication.
- **`animeService.js`**: Data abstraction layer handling static baseline reads merged seamlessly with local administrator mutations (Create, Read, Update, Delete) and JSON export/import.
- **`watchlistService.js`**: Personal bookmarking management persisting user watch status (`plan`, `watching`, `completed`).
- **`seoService.js`**: Dynamic updater of meta tags, OpenGraph cards, Twitter cards, and Schema.org JSON-LD microdata for search engines.
- **`toastService.js`**: Unobtrusive user feedback messaging for UI state changes.

## 3. Security Considerations
- **XSS Mitigation**: All dynamic user and admin input strings are passed through strict HTML entity escaping (`escapeHtml()`) before DOM insertion.
- **Zero Third-Party Dependency Vulnerabilities**: Pure vanilla standard Web APIs ensure zero supply-chain vulnerabilities from external NPM packages.
- **Legal Compliance**: Zero direct file host links. All anime titles link only to verified, authorized streaming platforms (Crunchyroll, Netflix, Bilibili).
