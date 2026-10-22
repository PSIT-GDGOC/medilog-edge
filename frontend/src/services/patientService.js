import { apiRequest } from './api';
import {
  getAllLocalPatients,
  getLocalPatient,
  saveLocalPatient,
  saveAllLocalPatients,
  deleteLocalPatient,
  addToSyncQueue
} from '../db/indexDB';

export const patientService = {
  /**
   * Fetch patients from the server when online, preserving unsynced
   * local records and falling back to IndexedDB when the request fails.
   */
  async getPatients({
    search = '',
    bloodGroup = 'All',
    gender = 'All',
    isOnline = true
  } = {}) {
    let localPatients = await getAllLocalPatients();
    const hadCachedPatients = localPatients.length > 0;
    let fetchError = null;
    let source = 'local';
    let serverPatients = null;

    if (isOnline) {
      try {
        const queryParams = new URLSearchParams();

        if (search) queryParams.append('q', search);

        if (bloodGroup && bloodGroup !== 'All') {
          queryParams.append('bloodGroup', bloodGroup);
        }

        if (gender && gender !== 'All') {
          queryParams.append('gender', gender);
        }

        const res = await apiRequest(
          `/patients?${queryParams.toString()}`
        );

        if (Array.isArray(res.data)) {
          serverPatients = res.data;

          const unsyncedLocals = localPatients.filter(
            (patient) => patient.isSynced === false
          );

          if (res.data.length > 0) {
            await saveAllLocalPatients(res.data);
          }

          for (const patient of unsyncedLocals) {
            await saveLocalPatient(patient);
          }

          localPatients = await getAllLocalPatients();
          source = 'server';
        } else {
          fetchError =
            'The server returned an unexpected response. Please try again.';
        }
      } catch (err) {
        console.warn(
          '[PatientService] Server fetch failed; using local IndexedDB data:',
          err.message
        );

        fetchError = err.isNetworkError
          ? 'Unable to reach the server. Check your connection and try again.'
          : err.status
            ? `Unable to load patient records (HTTP ${err.status}). Please try again.`
            : 'Unable to load patient records because of a server error. Please try again.';
      }
    }

    const hasCachedPatients = localPatients.length > 0;

    // Use the successful server response for this request.
    // Otherwise, fall back to locally stored records.
    let filtered =
      serverPatients !== null
        ? [...serverPatients]
        : [...localPatients];

    if (search) {
      const query = search.toLowerCase();

      filtered = filtered.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(query) ||
          patient.patientId?.toLowerCase().includes(query) ||
          patient.phone?.toLowerCase().includes(query) ||
          patient.address?.toLowerCase().includes(query) ||
          patient.notes?.toLowerCase().includes(query)
      );
    }

    if (bloodGroup && bloodGroup !== 'All') {
      filtered = filtered.filter(
        (patient) => patient.bloodGroup === bloodGroup
      );
    }

    if (gender && gender !== 'All') {
      filtered = filtered.filter(
        (patient) => patient.gender === gender
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    return {
      patients: filtered,
      source,
      fetchError,
      hasCachedPatients: hasCachedPatients || hadCachedPatients
    };
  },

  /**
   * Get a single patient by ID, falling back to IndexedDB if needed.
   */
  async getPatientById(id, isOnline = true) {
    if (isOnline) {
      try {
        const res = await apiRequest(`/patients/${id}`);

        if (res.data) {
          await saveLocalPatient({
            ...res.data,
            isSynced: true
          });

          return res.data;
        }
      } catch (err) {
        console.warn(
          `[PatientService] Server lookup failed for ${id}, falling back to IndexedDB:`,
          err.message
        );
      }
    }

    return await getLocalPatient(id);
  },

  /**
   * Create a patient record online or queue it for offline sync.
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

        const savedPatient = {
          ...res.data,
          isSynced: true
        };

        await saveLocalPatient(savedPatient);

        return {
          patient: savedPatient,
          offline: false
        };
      } catch (err) {
        console.warn(
          '[PatientService] Online create failed. Saving to offline queue:',
          err.message
        );
      }
    }

    newPatient.isSynced = false;
    await saveLocalPatient(newPatient);

    await addToSyncQueue({
      operation: 'CREATE',
      payload: newPatient,
      patientId: newPatient.patientId,
      clientTempId: newPatient.clientTempId
    });

    return {
      patient: newPatient,
      offline: true
    };
  },

  /**
   * Update a patient record online or queue the update for offline sync.
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

        const saved = {
          ...res.data,
          isSynced: true
        };

        await saveLocalPatient(saved);

        return {
          patient: saved,
          offline: false
        };
      } catch (err) {
        console.warn(
          '[PatientService] Online update failed. Adding to offline queue:',
          err.message
        );
      }
    }

    updatedLocal.isSynced = false;
    await saveLocalPatient(updatedLocal);

    await addToSyncQueue({
      operation: 'UPDATE',
      payload: updates,
      patientId
    });

    return {
      patient: updatedLocal,
      offline: true
    };
  },

  /**
   * Delete a patient online or queue the deletion for offline sync.
   */
  async deletePatient(patientId, isOnline = true) {
    if (isOnline) {
      try {
        await apiRequest(`/patients/${patientId}`, {
          method: 'DELETE'
        });

        await deleteLocalPatient(patientId);

        return {
          success: true,
          offline: false
        };
      } catch (err) {
        console.warn(
          '[PatientService] Online delete failed. Queuing offline deletion:',
          err.message
        );
      }
    }

    await deleteLocalPatient(patientId);

    await addToSyncQueue({
      operation: 'DELETE',
      payload: { patientId },
      patientId
    });

    return {
      success: true,
      offline: true
    };
  }
};
