# SMILEORA Cybersecurity & Hardening Policy

**Platform:** SMILEORA by SMILEON  
**Target:** Production Web Security  

---

## 1. Cross-Site Scripting (XSS) Prevention
- **HTML Entity Sanitization**: All user search queries, anime titles, studio names, and synopsis inputs are passed through strict HTML entity escaping before injection into the DOM (`escapeHtml()`).
- **Strict Attribute Binding**: Direct user inputs are never assigned to `eval()` or unvalidated `innerHTML` sinks.

---

## 2. Video Player & Iframe Sandboxing
- External video players and embed sources are rendered with explicit sandbox policies:
  ```html
  <iframe 
    src="..." 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
  ```
- **Allowlist Verification**: Admin forms validate that video URLs originate from trusted HTTPS endpoints before persistence.

---

## 3. Authentication & Access Control (RBAC)
- **Role Enforcement**: The Studio Admin dashboard (`admin.html`) inspects administrative credentials on load and dynamically blocks non-admin sessions from interacting with CRUD methods or Cloud Firestore write endpoints.
- **Credential Safety**: No sensitive administrator passwords or private cloud server keys are embedded in public production Git histories.

---

## 4. Content Security Policy (CSP) Directives (Production Reference)
For server or edge deployment (Cloudflare / Nginx / Vercel), the following CSP header is recommended:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https: blob:; connect-src 'self' https://firestore.googleapis.com https://api.jikan.moe https://graphql.anilist.co; frame-src 'self' https://www.youtube.com https://*.youtube-nocookie.com;
```
