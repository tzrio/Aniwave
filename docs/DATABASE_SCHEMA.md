# SMILEORA Database Schema & Entity Relationships

**Product:** SMILEORA by SMILEON  
**Target:** PostgreSQL / Supabase / Firebase Firestore Hybrid  

---

## 1. Relational Entities (PostgreSQL Schema)

```sql
-- 1. Users & Accounts
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' | 'admin'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Anime Series & Movies
CREATE TABLE anime (
    id VARCHAR(100) PRIMARY KEY, -- Slug format: 'aot-s4'
    title VARCHAR(255) NOT NULL,
    title_english VARCHAR(255),
    title_japanese VARCHAR(255),
    format VARCHAR(20) NOT NULL DEFAULT 'Serial', -- 'Serial' | 'Film'
    score DECIMAL(4, 2) DEFAULT 0.00,
    release_year INT,
    season VARCHAR(30),
    status VARCHAR(30) DEFAULT 'finished', -- 'finished' | 'ongoing'
    studio VARCHAR(100),
    episodes INT DEFAULT 1,
    duration VARCHAR(50) DEFAULT '24 min',
    synopsis TEXT,
    cover_url TEXT NOT NULL,
    banner_url TEXT,
    trailer_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Episodes
CREATE TABLE episodes (
    id VARCHAR(120) PRIMARY KEY, -- 'aot-s4-ep-1'
    anime_id VARCHAR(100) REFERENCES anime(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    thumbnail_url TEXT,
    duration INT, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Video Sources per Episode (Multi-Server)
CREATE TABLE video_sources (
    id VARCHAR(120) PRIMARY KEY,
    episode_id VARCHAR(120) REFERENCES episodes(id) ON DELETE CASCADE,
    server_name VARCHAR(100) NOT NULL, -- 'Server Aurora (HLS)', 'Server Zenith'
    playback_type VARCHAR(30) NOT NULL, -- 'hls' | 'mp4' | 'embed'
    playback_url TEXT NOT NULL,
    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Watch History (Continue Watching)
CREATE TABLE watch_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    anime_id VARCHAR(100) REFERENCES anime(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    position_seconds INT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, anime_id)
);

-- 6. Watchlists & Bookmarks
CREATE TABLE watchlists (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    anime_id VARCHAR(100) REFERENCES anime(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'plan', -- 'plan' | 'watching' | 'completed' | 'on_hold'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, anime_id)
);
```

---

## 2. NoSQL / Cloud Firestore Mapping (`smileora-tzrio`)

In Cloud Firestore, document objects are stored directly under the collection `/anime/{animeId}` containing nested arrays of episodes, streaming sources, and authorized partner references:

```json
{
  "id": "aot-s4",
  "title": "Attack On Titan: The Final Season",
  "score": 8.81,
  "year": 2020,
  "format": "Serial",
  "status": "finished",
  "studio": "MAPPA",
  "episodesList": [
    {
      "number": 1,
      "title": "Episode 1",
      "sources": [
        { "id": "src-1", "name": "Server Aurora (HLS)", "type": "hls", "url": "https://..." },
        { "id": "src-2", "name": "Server Zenith (Embed)", "type": "embed", "url": "https://..." }
      ]
    }
  ]
}
```
