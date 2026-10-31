# SMILEORA Streaming Architecture & Universal Player System

**Product:** SMILEORA  
**Parent Organization:** SMILEON  
**Version:** 3.0.0-PRO  

---

## 1. Overview
SMILEORA introduces a modular, multi-server streaming architecture (`streamingEngine.js`) designed to provide uninterrupted anime viewing with automatic error recovery, adaptive HLS playback, and native subtitle rendering.

```
                      +-----------------------------+
                      |    SMILEORA Web Client      |
                      +--------------+--------------+
                                     |
                       [ SmileoraPlayer Engine ]
                                     |
            +------------------------+------------------------+
            |                        |                        |
     [ HLS.js Stream ]      [ Native HTML5 MP4 ]     [ Sandboxed Iframe ]
     - Adaptive bitrate     - Clean local playback   - Authorized partners
     - Multi-audio/subs     - Zero dependency        - Cross-origin isolation
```

---

## 2. Playback Adapter Types
1. **HLS Adaptive Streams (`type: "hls"`)**:
   - Employs `Hls.js` for progressive chunked streaming (`.m3u8`).
   - Automatically adapts video resolution (360p, 720p, 1080p) to match user bandwidth.
   - Listens to `Hls.Events.ERROR` and triggers intelligent server switching upon network or manifest failure.

2. **Native MP4 HTML5 Video (`type: "mp4"`)**:
   - Standard HTML5 `<video>` rendering.
   - Native hardware acceleration on mobile devices (iOS Safari & Android Chrome).

3. **Sandboxed Embed Player (`type: "embed"`)**:
   - Standard `<iframe>` wrapper with explicit security sandboxing (`allow="accelerometer; autoplay; encrypted-media; gyroscope"`).
   - Used for YouTube official trailers and licensed third-party embed links.

---

## 3. Intelligent Server Fallback Logic
When a video fails to play (e.g., source 404, CORS error, HLS fatal network issue):
1. The player registers the source ID into a `failedSources` set.
2. It immediately evaluates the remaining configured servers for that episode.
3. Automatically transitions playback to the next priority server (e.g., from *Server Aurora* to *Server Zenith*) without requiring page refresh.
4. Alerts the user with a subtle non-intrusive notification: *"Server bermasalah. Mengalihkan otomatis ke Server 2..."*.

---

## 4. Playback State & Progress Memory
- **Auto-Save Frequency**: Throttled every 3 seconds to `localStorage` (`smileora_history`).
- **Resume Point**: When reopening an episode, the player prompts to resume playback if the user stopped after more than 5 seconds.
- **Auto-Next Episode**: Automatically transitions to `episodeNumber + 1` upon video completion.
