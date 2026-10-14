/**
 * Utility functions for date formatting, badges, and text utilities
 */

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
};

export const getBloodGroupBadgeClass = (bloodGroup) => {
  switch (bloodGroup) {
    case 'O+':
    case 'O-':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'A+':
    case 'A-':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'B+':
    case 'B-':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'AB+':
    case 'AB-':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};
