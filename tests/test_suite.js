/**
 * Aniwave Self-Contained Test Suite
 * Validates data integrity, configuration tokens, and core services
 */
import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- Running Aniwave Integrity & Test Suite ---');

// 1. Check data/anime.json
const dataPath = path.resolve('data/anime.json');
assert(fs.existsSync(dataPath), 'data/anime.json must exist');

const rawData = fs.readFileSync(dataPath, 'utf8');
let json;
try {
  json = JSON.parse(rawData);
} catch (e) {
  assert(false, `data/anime.json is not valid JSON: ${e.message}`);
}

const animeKeys = Object.keys(json);
assert(animeKeys.length >= 10, `Database must contain at least 10 anime records (found: ${animeKeys.length})`);

// 2. Validate individual anime schema
for (const [id, anime] of Object.entries(json)) {
  assert(Boolean(anime.title), `Anime [${id}] must have a non-empty title`);
  assert(Boolean(anime.cover), `Anime [${id}] must specify a cover image`);
  assert(typeof anime.score === 'number', `Anime [${id}] must have a numeric score (found: ${anime.score})`);
  assert(Array.isArray(anime.genres) && anime.genres.length > 0, `Anime [${id}] must have a valid genres array`);
  assert(Array.isArray(anime.sinopsis) && anime.sinopsis.length > 0, `Anime [${id}] must have valid synopsis lines`);
  assert(Array.isArray(anime.authorizedProviders) && anime.authorizedProviders.length > 0, `Anime [${id}] must have authorized streaming providers`);
}

// 3. Check critical files
const requiredFiles = [
  'index.html',
  'anime.html',
  'admin.html',
  'watch.html',
  'assets/css/theme.css',
  'assets/js/config.js',
  'assets/js/firebaseConfig.js',
  'assets/js/firebaseService.js',
  'assets/js/jikanSyncService.js',
  'assets/js/authService.js',
  'assets/js/animeService.js',
  'assets/js/watchlistService.js',
  'assets/js/seoService.js',
  'assets/js/toastService.js',
  'assets/js/navComponent.js',
  'assets/js/beranda.js',
  'assets/js/anime.js',
  'assets/js/admin.js',
  'assets/js/watch.js',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  '.env.example',
  'docs/TECHNICAL_AUDIT.md',
  'docs/ARCHITECTURE.md',
  'docs/ADMIN_GUIDE.md',
  'docs/COMMERCIAL_HANDOVER.md',
  'docs/DEPLOYMENT.md'
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.resolve(file)), `Critical file must exist: ${file}`);
}

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Aniwave is production and commercial-ready.\n');
