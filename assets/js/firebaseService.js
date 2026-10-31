/**
 * SMILEORA Firebase Service Layer
 * Directly interfaces with Firebase Firestore REST API.
 */
import { FIREBASE_CONFIG, isFirebaseConfigured } from './firebaseConfig.js';

class FirebaseService {
  constructor() {
    this.projectId = FIREBASE_CONFIG.projectId;
    this.apiKey = FIREBASE_CONFIG.apiKey;
    this.isOnline = isFirebaseConfigured;
  }

  getBaseUrl() {
    return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/anime`;
  }

  // 1. Fetch all anime from Firebase Firestore
  async fetchAllAnime() {
    if (!this.isOnline) return null;

    try {
      const res = await fetch(`${this.getBaseUrl()}?key=${this.apiKey}`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Firebase status: ${res.status}`);
      const json = await res.json();

      const results = {};
      const docs = json.documents || [];
      for (const doc of docs) {
        const id = doc.name.split('/').pop();
        const decoded = this.decodeFirestoreFields(doc.fields);
        // Abaikan dokumen yang ditandai terhapus
        if (!decoded._deleted) {
          results[id] = decoded;
          results[id].id = id;
        }
      }
      return results;
    } catch (err) {
      console.warn('Firebase sync offline, falling back to local dataset:', err);
      return null;
    }
  }

  // 2. Save or update an anime directly to Firestore
  async saveAnime(animeRecord) {
    if (!this.isOnline) return;

    const id = animeRecord.id;
    const url = `${this.getBaseUrl()}/${encodeURIComponent(id)}?key=${this.apiKey}`;
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
      console.error(`Gagal menyimpan ke Firebase Firestore: ${err}`);
      throw new Error(`Gagal menyimpan ke cloud: ${err}`);
    }

    return await res.json();
  }

  // 3. Delete an anime permanently from Firestore Cloud
  async deleteAnime(animeId) {
    if (!this.isOnline) return;

    const url = `${this.getBaseUrl()}/${encodeURIComponent(animeId)}?key=${this.apiKey}`;
    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        console.warn(`Firestore delete status: ${res.status}`);
      }
      return true;
    } catch (err) {
      console.error('Gagal menghapus dokumen dari Firestore:', err);
      return false;
    }
  }

  // 4. Helper to decode Firestore typed format to clean JavaScript Object
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

  // 5. Helper to encode JS Object to Firestore typed format
  encodeFirestoreFields(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'id') continue;
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
