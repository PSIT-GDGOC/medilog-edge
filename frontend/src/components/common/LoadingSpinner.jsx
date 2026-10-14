import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading patient records...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-teal-500 mb-3`} />
      {message && <p className="text-sm text-slate-400 font-medium">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
