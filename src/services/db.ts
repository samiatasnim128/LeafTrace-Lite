import { openDB, DBSchema } from 'idb';
import { Track, Geofence } from '../types/gps';

interface LeafTraceDB extends DBSchema {
  tracks: {
    key: string;
    value: Track;
    indexes: { 'by-date': Date };
  };
  geofences: {
    key: string;
    value: Geofence;
  };
}

const DB_NAME = 'leaftrace-lite';
const DB_VERSION = 1;

export async function initDB() {
  return openDB<LeafTraceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create tracks store
      if (!db.objectStoreNames.contains('tracks')) {
        const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
        trackStore.createIndex('by-date', 'date');
      }

      // Create geofences store
      if (!db.objectStoreNames.contains('geofences')) {
        db.createObjectStore('geofences', { keyPath: 'id' });
      }
    },
  });
}

// Track operations
export async function saveTracks(track: Track) {
  const db = await initDB();
  return db.put('tracks', track);
}

export async function getTracks() {
  const db = await initDB();
  return db.getAllFromIndex('tracks', 'by-date');
}

export async function getTrack(id: string) {
  const db = await initDB();
  return db.get('tracks', id);
}

export async function deleteTrack(id: string) {
  const db = await initDB();
  return db.delete('tracks', id);
}

// Geofence operations
export async function saveGeofence(geofence: Geofence) {
  const db = await initDB();
  return db.put('geofences', geofence);
}

export async function getGeofences() {
  const db = await initDB();
  return db.getAll('geofences');
}

export async function getGeofence(id: string) {
  const db = await initDB();
  return db.get('geofences', id);
}

export async function deleteGeofence(id: string) {
  const db = await initDB();
  return db.delete('geofences', id);
}