/**
 * Aniwave Firebase Service Layer
 * Directly interfaces with Firebase Firestore REST/SDK.
 * Features automatic fallback to local anime.json if credentials are empty or offline.
 */
import { FIREBASE_CONFIG, isFirebaseConfigured } from './firebaseConfig.js';
import { toastService } from './toastService.js';

class FirebaseService {
  constructor() {
    this.projectId = FIREBASE_CONFIG.projectId;
    this.apiKey = FIREBASE_CONFIG.apiKey;
    this.isOnline = isFirebaseConfigured;
  }

  // REST Firestore Endpoint (Zero-dependency, runs natively without heavy npm SDK)
  getBaseUrl() {
    return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/anime`;
  }

  // 1. Fetch all anime from Firebase Firestore
  async fetchAllAnime() {
    if (!this.isOnline) {
      return null; // Signals caller to use local fallback
    }

    try {
      const res = await fetch(`${this.getBaseUrl()}?key=${this.apiKey}`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Firebase status: ${res.status}`);
      const json = await res.json();

      const results = {};
      const docs = json.documents || [];
      for (const doc of docs) {
        const id = doc.name.split('/').pop();
        results[id] = this.decodeFirestoreFields(doc.fields);
        results[id].id = id;
      }
      return results;
    } catch (err) {
      console.warn('Firebase sync offline, falling back to local dataset:', err);
      return null;
    }
  }

  // 2. Save or update an anime directly to Firestore
  async saveAnime(animeRecord) {
    if (!this.isOnline) {
      throw new Error('Firebase belum dikonfigurasi. Isi kredensial di assets/js/firebaseConfig.js');
    }

    const id = animeRecord.id;
    const url = `${this.getBaseUrl()}/${id}?key=${this.apiKey}`;
    const firestoreBody = {
      fields: this.encodeFirestoreFields(animeRecord)
    };

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firestoreBody)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gagal menyimpan ke Firebase: ${err}`);
    }

    return await res.json();
  }

  // 3. Helper to decode Firestore typed format to clean JavaScript Object
  decodeFirestoreFields(fields) {
    if (!fields) return {};
    const res = {};
    for (const [k, v] of Object.entries(fields)) {
      if ('stringValue' in v) res[k] = v.stringValue;
      else if ('doubleValue' in v) res[k] = Number(v.doubleValue);
      else if ('integerValue' in v) res[k] = Number(v.integerValue);
      else if ('booleanValue' in v) res[k] = v.booleanValue;
      else if ('arrayValue' in v) {
        res[k] = (v.arrayValue.values || []).map(item => Object.values(item)[0]);
      }
    }
    return res;
  }

  // 4. Helper to encode JS Object to Firestore typed format
  encodeFirestoreFields(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') fields[k] = { stringValue: v };
      else if (typeof v === 'number') fields[k] = { doubleValue: v };
      else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
      else if (Array.isArray(v)) {
        fields[k] = {
          arrayValue: {
            values: v.map(item => ({ stringValue: String(item) }))
          }
        };
      }
    }
    return fields;
  }
}

export const firebaseService = new FirebaseService();
