import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNetwork } from '../../hooks/useNetwork';

export function StatusIndicator({ showDetails = false, className = '' }) {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetwork();

  let statusConfig = {
    label: 'Online',
    variant: 'success',
    icon: Wifi,
    description: 'Connected to central server'
  };

  if (!isOnline) {
    statusConfig = {
      label: 'Offline',
      variant: 'warning',
      icon: WifiOff,
      description: 'IndexedDB active. Data cached locally.'
    };
  } else if (isSyncing) {
    statusConfig = {
      label: 'Syncing',
      variant: 'info',
      icon: RefreshCw,
      description: `Syncing ${pendingCount} offline record(s)...`,
      spin: true
    };
  } else if (pendingCount > 0) {
    statusConfig = {
      label: 'Pending Sync',
      variant: 'warning',
      icon: AlertCircle,
      description: `${pendingCount} record(s) queued for sync`
    };
  }

  const IconComponent = statusConfig.icon;

  const bgStyles = {
    success: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300',
    warning: 'bg-amber-950/60 border-amber-800/60 text-amber-300',
    info: 'bg-teal-950/60 border-teal-800/60 text-teal-300'
  };

  const dotStyles = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    info: 'bg-teal-400 animate-pulse'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
          bgStyles[statusConfig.variant]
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${dotStyles[statusConfig.variant]}`} />
        <IconComponent
          className={`w-3.5 h-3.5 ${statusConfig.spin ? 'animate-spin' : ''}`}
        />
        <span>{statusConfig.label}</span>
        {pendingCount > 0 && (
          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {pendingCount}
          </span>
        )}
      </div>

      {isOnline && pendingCount > 0 && !isSyncing && (
        <button
          onClick={triggerSync}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-300 bg-teal-950 hover:bg-teal-900 border border-teal-800/70 rounded-lg transition-colors"
          title="Synchronize queued operations now"
        >
          <RefreshCw className="w-3 h-3" />
          Sync Now
        </button>
      )}

      {showDetails && (
        <p className="text-xs text-slate-400 mt-1">{statusConfig.description}</p>
      )}
    </div>
  );
}

export default StatusIndicator;
