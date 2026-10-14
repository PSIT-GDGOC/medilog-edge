import { openDB } from 'idb';

const DB_NAME = 'medilog_edge_db';
const DB_VERSION = 1;

/**
 * Initializes and upgrades the IndexedDB instance
 */
export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Patients object store
      if (!db.objectStoreNames.contains('patients')) {
        const patientStore = db.createObjectStore('patients', { keyPath: 'patientId' });
        patientStore.createIndex('clientTempId', 'clientTempId', { unique: false });
        patientStore.createIndex('createdAt', 'createdAt', { unique: false });
        patientStore.createIndex('isSynced', 'isSynced', { unique: false });
      }

      // Offline Sync Queue object store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    }
  });
}

/* ============================================================
   PATIENTS STORE OPERATIONS
   ============================================================ */

export async function getAllLocalPatients() {
  const db = await getDB();
  return await db.getAll('patients');
}

export async function getLocalPatient(patientId) {
  const db = await getDB();
  let patient = await db.get('patients', patientId);
  if (!patient) {
    // Attempt lookup by clientTempId index
    const index = db.transaction('patients').store.index('clientTempId');
    patient = await index.get(patientId);
  }
  return patient;
}

export async function saveLocalPatient(patient) {
  const db = await getDB();
  const tx = db.transaction('patients', 'readwrite');
  await tx.store.put(patient);
  await tx.done;
  return patient;
}

export async function saveAllLocalPatients(patients) {
  if (!Array.isArray(patients) || patients.length === 0) return;
  const db = await getDB();
  const tx = db.transaction('patients', 'readwrite');
  for (const patient of patients) {
    await tx.store.put({
      ...patient,
      isSynced: patient.isSynced !== undefined ? patient.isSynced : true
    });
  }
  await tx.done;
}

export async function deleteLocalPatient(patientId) {
  const db = await getDB();
  const tx = db.transaction('patients', 'readwrite');
  await tx.store.delete(patientId);
  await tx.done;
}

export async function clearLocalPatients() {
  const db = await getDB();
  const tx = db.transaction('patients', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

/* ============================================================
   SYNC QUEUE STORE OPERATIONS
   ============================================================ */

/**
 * Adds an operation to the sync queue
 * @param {Object} op - { operation: 'CREATE'|'UPDATE'|'DELETE', payload, patientId, clientTempId }
 */
export async function addToSyncQueue({ operation, payload, patientId, clientTempId }) {
  const db = await getDB();
  const item = {
    operation,
    payload,
    patientId: patientId || payload?.patientId || clientTempId,
    clientTempId: clientTempId || payload?.clientTempId,
    timestamp: new Date().toISOString(),
    status: 'pending', // 'pending' | 'syncing' | 'failed'
    retryCount: 0,
    lastError: null
  };

  const id = await db.add('sync_queue', item);
  return { ...item, id };
}

export async function getPendingSyncQueue() {
  const db = await getDB();
  const all = await db.getAll('sync_queue');
  return all.filter((item) => item.status === 'pending' || item.status === 'failed');
}

export async function getAllSyncQueue() {
  const db = await getDB();
  return await db.getAll('sync_queue');
}

export async function updateSyncQueueItem(id, updates) {
  const db = await getDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const existing = await tx.store.get(id);
  if (existing) {
    const updated = { ...existing, ...updates };
    await tx.store.put(updated);
    await tx.done;
    return updated;
  }
  await tx.done;
  return null;
}

export async function removeSyncQueueItem(id) {
  const db = await getDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  await tx.store.delete(id);
  await tx.done;
}

export async function clearSyncQueue() {
  const db = await getDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

export async function getSyncQueueCount() {
  const items = await getPendingSyncQueue();
  return items.length;
}
