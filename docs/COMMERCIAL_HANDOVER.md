# SMILEORA Commercial Handover & White-Label Customization Guide

**Product Name:** SMILEORA  
**Parent Company:** SMILEON  
**Official Tagline:** "Where Stories Create Smiles."  

---

## 1. White-Label Customization
To rebrand SMILEORA for another business client or personal entity:
1. Open `assets/js/config.js`.
2. Modify the `CONFIG.site` object:
   - `name`: Change `"SMILEORA"` to your desired platform name.
   - `parentCompany`: Change `"SMILEON"` to your parent enterprise.
   - `tagline`: Your unique slogan.
   - `contactEmail`: Official support address.
3. Modify Design System Tokens in `assets/css/theme.css`:
   - `--color-primary`: Primary aurora accent (Default `#A78BFA`).
   - `--color-accent`: Deep accent (Default `#7C5CFC`).
   - `--color-bg`: Deep space background (Default `#0B0D17`).

---

## 2. Monetization & Revenue Points
1. **Official Affiliate Partnerships**:
   - Update `CONFIG.monetization.affiliateBanner` with your Crunchyroll, Amazon Prime Video, or distributor affiliate tracking parameters.
2. **Display Advertising**:
   - Container slots are marked in `index.html`, `anime.html`, and `watch.html` ready to accept Google AdSense, media banner tags, or custom sponsor deals.
3. **Optional Premium Membership**:
   - Ready for integration with Stripe / Midtrans / PayPal via the user profile and authentication state machine (`authService.js`).

---

## 3. Database & Cloud Transition
SMILEORA currently runs in dual-mode:
- **Cloud Firestore**: Connected to `smileora-tzrio` (Region Singapore).
- **Zero-Failure Local Fallback**: Automatically activates if offline or credentials are removed.
- To switch to your own Firebase project, simply replace the keys in `assets/js/firebaseConfig.js`.
