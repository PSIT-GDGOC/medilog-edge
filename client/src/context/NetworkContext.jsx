import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSyncQueueCount, getPendingSyncQueue } from '../db/indexDB';
import { syncService } from '../services/syncService';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getSyncQueueCount();
      setPendingCount(count);
    } catch (err) {
      console.warn('[NetworkContext] Failed to count sync queue:', err.message);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncMessage('Cannot synchronize while offline.');
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Synchronizing offline data with server...');
    const result = await syncService.processQueue();
    await refreshPendingCount();
    setIsSyncing(false);

    if (result.success) {
      setLastSyncTime(new Date());
      setSyncMessage(
        result.syncedCount > 0
          ? `Successfully synchronized ${result.syncedCount} record(s).`
          : 'All records are up to date.'
      );
    } else {
      setSyncMessage('Synchronization failed. Will retry automatically.');
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Browser is online.');
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      console.log('[Network] Browser is offline.');
      setIsOnline(false);
      setSyncMessage('Operating in offline mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync count check
    refreshPendingCount();

    // Subscribe to sync service events
    const unsubscribe = syncService.subscribe((event) => {
      if (event.type === 'sync_start') {
        setIsSyncing(true);
      } else if (event.type === 'sync_complete') {
        setIsSyncing(false);
        refreshPendingCount();
        if (event.syncedCount > 0) {
          setLastSyncTime(new Date());
        }
      } else if (event.type === 'sync_error') {
        setIsSyncing(false);
        refreshPendingCount();
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [triggerSync, refreshPendingCount]);

  const value = {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncMessage,
    triggerSync,
    refreshPendingCount
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
