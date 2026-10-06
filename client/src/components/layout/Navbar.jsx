import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import StatusIndicator from '../common/StatusIndicator';
import { Activity, LogOut, User, Building2 } from 'lucide-react';
import Button from '../common/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const { isOnline } = useNetwork();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600/20 border border-teal-500/30 rounded-xl flex items-center justify-center text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-base tracking-tight">
                MediLog <span className="text-teal-400">Edge</span>
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
                Core MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Primary Healthcare Field Station
            </p>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3 sm:gap-4">
          <StatusIndicator />

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  {user.center || 'Health Post'}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Log Out"
                className="text-slate-400 hover:text-rose-400"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
