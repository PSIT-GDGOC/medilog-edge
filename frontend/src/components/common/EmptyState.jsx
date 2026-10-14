import React from 'react';
import { Users, Plus } from 'lucide-react';
import Button from './Button';

export function EmptyState({
  icon: Icon = Users,
  title = 'No records found',
  description = 'Add your first patient to get started.',
  actionLabel,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={Plus}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
