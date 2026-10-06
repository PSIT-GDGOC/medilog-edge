import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Activity, User, Mail, Lock, Building2, UserPlus, AlertCircle, WifiOff } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isOnline } = useNetwork();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Community Health Worker',
    center: 'Primary Health Center'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        center: formData.center.trim()
      });
      navigate('/', { replace: true });
    } catch (err) {
      if (err.isNetworkError || !isOnline) {
        setError('Cannot register a new user while offline. Please connect to the internet.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
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
          Create Health Worker Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Register to begin recording and syncing community patient data
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="card-panel p-6 sm:p-8 space-y-6">
          {!isOnline && (
            <div className="p-3.5 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-300 text-xs flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>You are offline. Connecting to the network is required to register.</span>
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
              label="Full Name"
              name="name"
              placeholder="Dr. / Nurse / Worker Name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                >
                  <option value="Community Health Worker">Health Worker</option>
                  <option value="Primary Care Nurse">Primary Nurse</option>
                  <option value="Medical Officer">Medical Officer</option>
                  <option value="Field Volunteer">Field Volunteer</option>
                </select>
              </div>

              <Input
                label="Health Center / Station"
                name="center"
                placeholder="e.g. Sub-Center B"
                value={formData.center}
                onChange={handleChange}
                icon={Building2}
              />
            </div>

            <Input
              label="Password (min 6 characters)"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={loading}
              icon={UserPlus}
            >
              Complete Registration
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
