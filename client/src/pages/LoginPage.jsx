import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Activity, Mail, Lock, ShieldCheck, AlertCircle, WifiOff } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { isOnline } = useNetwork();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.isNetworkError || !isOnline) {
        setError('Cannot verify login credentials while offline. Please connect to the network to authenticate.');
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-teal-600/20 border border-teal-500/40 rounded-2xl flex items-center justify-center text-teal-400 shadow-md">
            <Activity className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-100">
          MediLog <span className="text-teal-400">Edge</span>
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Offline-First Primary Healthcare Field Station
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="card-panel p-6 sm:p-8 space-y-6">
          {!isOnline && (
            <div className="p-3.5 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-300 text-xs flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>You are offline. An active connection is required for initial authentication.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="worker@phc-health.org"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={loading}
              icon={ShieldCheck}
            >
              Sign In to MediLog Edge
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Need a field station account?{' '}
              <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
                Register health worker
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
