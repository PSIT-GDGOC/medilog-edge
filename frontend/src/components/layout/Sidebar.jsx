import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  RefreshCw,
  Cpu,
  Layers,
  Database,
  Wifi
} from 'lucide-react';
import { useNetwork } from '../../hooks/useNetwork';

export function Sidebar() {
  const { pendingCount, isOnline } = useNetwork();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true
    },
    {
      to: '/patients',
      label: 'Patient Directory',
      icon: Users
    },
    {
      to: '/sync-queue',
      label: 'Offline Sync Queue',
      icon: RefreshCw,
      badge: pendingCount > 0 ? pendingCount : null
    },
    {
      to: '/extensions',
      label: 'Edge AI & Voice',
      icon: Cpu,
      tag: 'Roadmap'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600/15 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                ) : null}
                {item.tag ? (
                  <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.tag}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status info box */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-400" />
              IndexedDB Storage
            </span>
            <span className="text-emerald-400 font-medium">Ready</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Service Worker
            </span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-slate-500" />
              Network State
            </span>
            <span className={isOnline ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
