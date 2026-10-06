import { apiRequest } from './api';
import {
  getPendingSyncQueue,
  updateSyncQueueItem,
  removeSyncQueueItem,
  saveLocalPatient,
  deleteLocalPatient,
  getLocalPatient,
  getDB
} from '../db/indexDB';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event) {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('[SyncService] Listener error:', err);
      }
    });
  }

  /**
   * Run sync process on pending queue items
   */
  async processQueue() {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress.');
      return { success: true, inProgress: true };
    }

    const token = localStorage.getItem('medilog_token');
    if (!token) {
      console.log('[SyncService] No auth token found. Skipping sync.');
      return { success: false, reason: 'unauthenticated' };
    }

    this.isSyncing = true;
    this.notify({ type: 'sync_start' });

    let syncedCount = 0;
    let failedCount = 0;

    try {
      const pendingItems = await getPendingSyncQueue();
      if (pendingItems.length === 0) {
        this.isSyncing = false;
        this.notify({ type: 'sync_complete', syncedCount: 0, failedCount: 0 });
        return { success: true, syncedCount: 0, failedCount: 0 };
      }

      console.log(`[SyncService] Processing ${pendingItems.length} queued operations...`);

      for (const item of pendingItems) {
        try {
          await updateSyncQueueItem(item.id, { status: 'syncing' });

          if (item.operation === 'CREATE') {
            const res = await apiRequest('/patients', {
              method: 'POST',
              body: JSON.stringify({
                ...item.payload,
                clientTempId: item.clientTempId || item.payload.patientId
              })
            });

            const serverPatient = res.data;

            // Update local IndexedDB
            const db = await getDB();
            const tx = db.transaction('patients', 'readwrite');
            
            // If local temp ID was different from server assigned patientId, remove old key
            if (item.payload.patientId && item.payload.patientId !== serverPatient.patientId) {
              await tx.store.delete(item.payload.patientId);
            }
            await tx.store.put({
              ...serverPatient,
              isSynced: true
            });
            await tx.done;

            await removeSyncQueueItem(item.id);
            syncedCount++;
          } else if (item.operation === 'UPDATE') {
            const targetId = item.patientId || item.payload.patientId || item.payload._id;
            const res = await apiRequest(`/patients/${targetId}`, {
              method: 'PUT',
              body: JSON.stringify(item.payload)
            });

            const updatedPatient = res.data;
            await saveLocalPatient({
              ...updatedPatient,
              isSynced: true
            });

            await removeSyncQueueItem(item.id);
            syncedCount++;
          } else if (item.operation === 'DELETE') {
            const targetId = item.patientId || item.payload?.patientId || item.payload?.id;
            try {
              await apiRequest(`/patients/${targetId}`, {
                method: 'DELETE'
              });
            } catch (delErr) {
              // If already 404 on server, consider it successfully deleted
              if (delErr.status !== 404) throw delErr;
            }

            await deleteLocalPatient(targetId);
            await removeSyncQueueItem(item.id);
            syncedCount++;
          }
        } catch (opErr) {
          console.error(`[SyncService] Failed operation for item #${item.id}:`, opErr.message);

          if (opErr.isNetworkError) {
            // Revert back to pending since network dropped
            await updateSyncQueueItem(item.id, {
              status: 'pending',
              lastError: 'Network disconnected during sync'
            });
            failedCount++;
            break; // Stop loop if offline
          } else {
            // Permanent or validation error
            await updateSyncQueueItem(item.id, {
              status: 'failed',
              lastError: opErr.message,
              retryCount: (item.retryCount || 0) + 1
            });
            failedCount++;
          }
        }
      }

      this.notify({ type: 'sync_complete', syncedCount, failedCount });
      return { success: true, syncedCount, failedCount };
    } catch (err) {
      console.error('[SyncService] Global sync queue error:', err);
      this.notify({ type: 'sync_error', error: err.message });
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
