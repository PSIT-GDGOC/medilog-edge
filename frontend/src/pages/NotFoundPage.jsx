import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
        <AlertCircle className="w-6 h-6 text-teal-400" />
      </div>
      <h1 className="text-xl font-bold text-slate-100 mb-1">Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        The healthcare view or resource you are searching for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary" icon={ArrowLeft}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
