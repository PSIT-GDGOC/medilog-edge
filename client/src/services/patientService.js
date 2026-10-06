import { apiRequest } from './api';
import {
  getAllLocalPatients,
  getLocalPatient,
  saveLocalPatient,
  saveAllLocalPatients,
  deleteLocalPatient,
  addToSyncQueue
} from '../db/indexDB';
import { syncService } from './syncService';

export const patientService = {
  /**
   * Fetch patients list:
   * 1. If online, fetch from server, store in IndexedDB, and return.
   * 2. If offline or server fetch fails, load from IndexedDB.
   */
  async getPatients({ search = '', bloodGroup = 'All', gender = 'All', isOnline = true } = {}) {
    let localPatients = await getAllLocalPatients();

    if (isOnline) {
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('q', search);
        if (bloodGroup && bloodGroup !== 'All') queryParams.append('bloodGroup', bloodGroup);
        if (gender && gender !== 'All') queryParams.append('gender', gender);

        const res = await apiRequest(`/patients?${queryParams.toString()}`);
        if (res.data) {
          // Merge with any unsynced offline records in local DB
          const unsyncedLocals = localPatients.filter((p) => p.isSynced === false);
          await saveAllLocalPatients(res.data);
          
          // Re-persist unsynced records
          for (const unsynced of unsyncedLocals) {
            await saveLocalPatient(unsynced);
          }

          localPatients = await getAllLocalPatients();
        }
      } catch (err) {
        console.warn('[PatientService] Network fetch failed, using local IndexedDB data:', err.message);
      }
    }

    // Filter local records client-side (for offline mode or filtered view)
    let filtered = localPatients;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.patientId?.toLowerCase().includes(q) ||
          p.phone?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q)
      );
    }

    if (bloodGroup && bloodGroup !== 'All') {
      filtered = filtered.filter((p) => p.bloodGroup === bloodGroup);
    }

    if (gender && gender !== 'All') {
      filtered = filtered.filter((p) => p.gender === gender);
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return filtered;
  },

  /**
   * Get single patient record by ID
   */
  async getPatientById(id, isOnline = true) {
    if (isOnline) {
      try {
        const res = await apiRequest(`/patients/${id}`);
        if (res.data) {
          await saveLocalPatient({ ...res.data, isSynced: true });
          return res.data;
        }
      } catch (err) {
        console.warn(`[PatientService] Server lookup failed for ${id}, falling back to IndexedDB:`, err.message);
      }
    }

    return await getLocalPatient(id);
  },

  /**
   * Create patient record
   */
  async createPatient(formData, isOnline = true) {
    const year = new Date().getFullYear();
    const tempNum = Math.floor(1000 + Math.random() * 9000);
    const generatedPatientId = `MED-${year}-${tempNum}`;

    const newPatient = {
      patientId: generatedPatientId,
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      phone: formData.phone?.trim() || '',
      address: formData.address?.trim() || '',
      bloodGroup: formData.bloodGroup || 'Unknown',
      notes: formData.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientTempId: generatedPatientId,
      isSynced: false
    };

    if (isOnline) {
      try {
        const res = await apiRequest('/patients', {
          method: 'POST',
          body: JSON.stringify({
            ...newPatient,
            clientTempId: generatedPatientId
          })
        });

        const savedPatient = { ...res.data, isSynced: true };
        await saveLocalPatient(savedPatient);
        return { patient: savedPatient, offline: false };
      } catch (err) {
        console.warn('[PatientService] Online create failed. Saving to offline queue:', err.message);
      }
    }

    // Offline flow
    newPatient.isSynced = false;
    await saveLocalPatient(newPatient);
    await addToSyncQueue({
      operation: 'CREATE',
      payload: newPatient,
      patientId: newPatient.patientId,
      clientTempId: newPatient.clientTempId
    });

    return { patient: newPatient, offline: true };
  },

  /**
   * Update patient record
   */
  async updatePatient(patientId, updates, isOnline = true) {
    const local = (await getLocalPatient(patientId)) || {};
    const updatedLocal = {
      ...local,
      ...updates,
      patientId: local.patientId || patientId,
      updatedAt: new Date().toISOString()
    };

    if (isOnline && local.isSynced !== false) {
      try {
        const res = await apiRequest(`/patients/${patientId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });

        const saved = { ...res.data, isSynced: true };
        await saveLocalPatient(saved);
        return { patient: saved, offline: false };
      } catch (err) {
        console.warn('[PatientService] Online update failed. Adding to offline queue:', err.message);
      }
    }

    // Offline update flow
    updatedLocal.isSynced = false;
    await saveLocalPatient(updatedLocal);
    await addToSyncQueue({
      operation: 'UPDATE',
      payload: updates,
      patientId
    });

    return { patient: updatedLocal, offline: true };
  },

  /**
   * Delete patient record
   */
  async deletePatient(patientId, isOnline = true) {
    if (isOnline) {
      try {
        await apiRequest(`/patients/${patientId}`, {
          method: 'DELETE'
        });
        await deleteLocalPatient(patientId);
        return { success: true, offline: false };
      } catch (err) {
        console.warn('[PatientService] Online delete failed. Queuing offline deletion:', err.message);
      }
    }

    // Offline delete flow
    await deleteLocalPatient(patientId);
    await addToSyncQueue({
      operation: 'DELETE',
      payload: { patientId },
      patientId
    });

    return { success: true, offline: true };
  }
};
