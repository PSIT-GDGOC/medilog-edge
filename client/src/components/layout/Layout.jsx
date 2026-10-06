import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useNetwork } from '../../hooks/useNetwork';
import { WifiOff, AlertTriangle, RefreshCw, LayoutDashboard, Users, Clock, Cpu } from 'lucide-react';

export function Layout() {
  const { isOnline, isSyncing, pendingCount, triggerSync, syncMessage } = useNetwork();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Offline Status Top Banner */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 text-amber-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl">
            <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              <strong>Offline Mode Active:</strong> You can continue creating, updating, and viewing patient records. Operations are persisted in IndexedDB and will synchronize automatically upon reconnection.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/60 hidden sm:inline-block">
            IndexedDB Active
          </span>
        </div>
      )}

      {/* Reconnected / Pending Sync Banner */}
      {isOnline && pendingCount > 0 && !isSyncing && (
        <div className="bg-teal-950/80 border-b border-teal-800/80 text-teal-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-teal-400" />
            <span>
              <strong>Pending Synchronization:</strong> You have {pendingCount} offline operation(s) ready to sync with the central server.
            </span>
          </div>
          <button
            onClick={triggerSync}
            className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-md transition-colors shadow-sm"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Main workspace layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg transition-colors ${
              isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg transition-colors ${
              isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Patients</span>
        </NavLink>

        <NavLink
          to="/sync-queue"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg relative transition-colors ${
              isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <RefreshCw className="w-5 h-5" />
          <span>Sync</span>
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </NavLink>

        <NavLink
          to="/extensions"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg transition-colors ${
              isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Cpu className="w-5 h-5" />
          <span>AI / Voice</span>
        </NavLink>
      </div>
    </div>
  );
}

export default Layout;
