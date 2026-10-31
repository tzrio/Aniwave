/**
 * Aniwave SEO & Structured Data Service
 * Injects OpenGraph, Twitter Cards, and Schema.org JSON-LD
 */
import { CONFIG } from './config.js';

export const seoService = {
  updatePageMeta({ title, description, image, type = 'website', canonical = window.location.href }) {
    const fullTitle = title ? `${title} | ${CONFIG.site.name}` : `${CONFIG.site.name} — ${CONFIG.site.tagline}`;
    const desc = description || CONFIG.site.description;
    const imgUrl = image ? (image.startsWith('http') ? image : `${window.location.origin}/${image}`) : `${window.location.origin}/${CONFIG.site.logoBadge}`;

    document.title = fullTitle;

    this.setMetaTag('name', 'description', desc);
    this.setMetaTag('property', 'og:title', fullTitle);
    this.setMetaTag('property', 'og:description', desc);
    this.setMetaTag('property', 'og:type', type);
    this.setMetaTag('property', 'og:url', canonical);
    this.setMetaTag('property', 'og:image', imgUrl);

    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', fullTitle);
    this.setMetaTag('name', 'twitter:description', desc);
    this.setMetaTag('name', 'twitter:image', imgUrl);
  },

  setMetaTag(attrName, attrVal, content) {
    let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attrName, attrVal);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  },

  injectAnimeJsonLd(anime) {
    if (!anime) return;
    const existing = document.getElementById('anime-jsonld');
    if (existing) existing.remove();

    const isMovie = String(anime.type || '').toLowerCase().includes('film');
    const schema = {
      "@context": "https://schema.org",
      "@type": isMovie ? "Movie" : "TVSeries",
      "name": anime.title,
      "alternateName": anime.alternativeTitles || [],
      "description": Array.isArray(anime.sinopsis) ? anime.sinopsis.join(' ') : anime.sinopsis,
      "image": anime.cover ? `${window.location.origin}/${anime.cover}` : undefined,
      "genre": anime.genres || [],
      "datePublished": anime.year ? String(anime.year) : undefined,
      "productionCompany": anime.studio ? { "@type": "Organization", "name": anime.studio } : undefined,
      "aggregateRating": anime.score ? {
        "@type": "AggregateRating",
        "ratingValue": anime.score,
        "bestRating": "10",
        "worstRating": "1",
        "ratingCount": "1000"
      } : undefined
    };

    const script = document.createElement('script');
    script.id = 'anime-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
};
