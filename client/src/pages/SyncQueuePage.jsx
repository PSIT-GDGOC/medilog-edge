import React, { useState, useEffect, useCallback } from 'react';
import { getAllSyncQueue, removeSyncQueueItem, clearSyncQueue } from '../db/indexDB';
import { useNetwork } from '../hooks/useNetwork';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export function SyncQueuePage() {
  const { isOnline, isSyncing, pendingCount, triggerSync, refreshPendingCount, lastSyncTime } = useNetwork();
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getAllSyncQueue();
      // Sort newest first
      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setQueueItems(items);
    } catch (err) {
      console.error('[SyncQueue] Failed to load sync queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue, isSyncing]);

  const handleManualSync = async () => {
    await triggerSync();
    await loadQueue();
  };

  const handleRemoveItem = async (id) => {
    await removeSyncQueueItem(id);
    await refreshPendingCount();
    await loadQueue();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all queued operations? Any unsynced changes will not reach the server.')) {
      await clearSyncQueue();
      await refreshPendingCount();
      await loadQueue();
    }
  };

  const getOperationBadge = (op) => {
    switch (op) {
      case 'CREATE':
        return <Badge variant="info" size="sm">CREATE</Badge>;
      case 'UPDATE':
        return <Badge variant="purple" size="sm">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="danger" size="sm">DELETE</Badge>;
      default:
        return <Badge size="sm">{op}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" dot size="sm">Pending</Badge>;
      case 'syncing':
        return <Badge variant="info" dot size="sm">Syncing</Badge>;
      case 'failed':
        return <Badge variant="danger" dot size="sm">Failed (Will Retry)</Badge>;
      case 'success':
        return <Badge variant="success" dot size="sm">Synchronized</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Offline Sync Queue</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inspection of client-side IndexedDB sync transactions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadQueue}
            icon={RefreshCw}
          >
            Refresh
          </Button>

          {isOnline && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSync}
              isLoading={isSyncing}
              icon={RefreshCw}
              disabled={queueItems.length === 0}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          )}

          {queueItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              icon={Trash2}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
            >
              Clear Queue
            </Button>
          )}
        </div>
      </div>

      {/* Sync Engine Architectural Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-panel p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            Queue Storage
          </span>
          <p className="text-sm font-semibold text-slate-200">
            IndexedDB: <span className="font-mono text-xs text-teal-400">sync_queue</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Survives browser reloads, network blackouts, and power cycling.
          </p>
        </div>

        <div className="card-panel p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-sky-400" />
            Central Server Target
          </span>
          <p className="text-sm font-semibold text-slate-200">
            Express / Node / MongoDB
          </p>
          <p className="text-[11px] text-slate-400">
            {isOnline ? 'Connection active. Ready for batch transmission.' : 'Waiting for network restoration.'}
          </p>
        </div>

        <div className="card-panel p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Deduplication Safety
          </span>
          <p className="text-sm font-semibold text-slate-200">
            Client Temp ID & Idempotency
          </p>
          <p className="text-[11px] text-slate-400">
            Prevents duplicate records if retry occurs under unstable signals.
          </p>
        </div>
      </div>

      {/* Queue items list */}
      {loading ? (
        <LoadingSpinner message="Inspecting IndexedDB sync queue..." />
      ) : queueItems.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sync queue is clean"
          description="All patient operations are fully synchronized with the central MongoDB backend. No pending offline transactions."
        />
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <th className="py-3.5 px-4">Queue ID</th>
                <th className="py-3.5 px-4">Operation</th>
                <th className="py-3.5 px-4">Target Patient</th>
                <th className="py-3.5 px-4">Queued Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Details / Errors</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {queueItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-slate-400 font-medium">
                    #{item.id}
                  </td>
                  <td className="py-3 px-4">
                    {getOperationBadge(item.operation)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-teal-400 font-medium">
                        {item.patientId || item.payload?.patientId || '—'}
                      </span>
                      {item.payload?.name && (
                        <span className="text-xs text-slate-200">
                          {item.payload.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                    {formatDateTime(item.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 max-w-xs">
                    {item.lastError ? (
                      <span className="text-rose-400 line-clamp-2">
                        {item.lastError} (Retries: {item.retryCount || 0})
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">
                        Ready for automatic transmission
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Discard queued item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SyncQueuePage;
