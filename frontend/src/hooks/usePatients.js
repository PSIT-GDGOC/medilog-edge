import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';
import { useNetwork } from './useNetwork';

export function usePatients() {
  const { isOnline, refreshPendingCount } = useNetwork();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataNotice, setDataNotice] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    bloodGroup: 'All',
    gender: 'All'
  });

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDataNotice(null);

    try {
      const result = await patientService.getPatients({
        search: filters.search,
        bloodGroup: filters.bloodGroup,
        gender: filters.gender,
        isOnline
      });

      setPatients(result.patients);

      if (result.fetchError) {
        if (result.hasCachedPatients) {
          setDataNotice(
            `${result.fetchError} Showing locally saved patient records instead.`
          );
        } else {
          setError(result.fetchError);
        }
      } else if (!isOnline) {
        setDataNotice(
          'You are offline. Patient records are being loaded from this device.'
        );
      }
    } catch (err) {
      console.error('[usePatients] Error loading patient records:', err);
      setError(
        err.message ||
          'Unable to load patient records. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [filters, isOnline]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const addPatient = async (patientData) => {
    const result = await patientService.createPatient(patientData, isOnline);
    await refreshPendingCount();
    await loadPatients();
    return result;
  };

  const editPatient = async (patientId, updates) => {
    const result = await patientService.updatePatient(
      patientId,
      updates,
      isOnline
    );
    await refreshPendingCount();
    await loadPatients();
    return result;
  };

  const deletePatient = async (patientId) => {
    const result = await patientService.deletePatient(patientId, isOnline);
    await refreshPendingCount();
    await loadPatients();
    return result;
  };

  return {
    patients,
    loading,
    error,
    dataNotice,
    filters,
    setFilters,
    reload: loadPatients,
    addPatient,
    editPatient,
    deletePatient
  };
}
