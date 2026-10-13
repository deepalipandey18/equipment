import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(formData.email, formData.password);
    setSubmitting(false);

    if (result.success) {
      navigate(redirectPath);
    } else {
      setError(result.error);
    }
  };

  // Quick fill for testing
  const fillSampleAdmin = () => {
    setFormData({
      email: 'admin@equipmenthub.com',
      password: 'Admin@123456',
    });
  };

  const fillSampleUser = () => {
    setFormData({
      email: 'contractor@example.com',
      password: 'Password123',
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Truck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Log in to Equipment<span className="text-brand-600">Hub</span>
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Access your dual rental & listing dashboard with one single login
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Helpers */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Quick fill test accounts:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillSampleAdmin}
              className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition text-center"
            >
              Seed Admin Credentials
            </button>
            <button
              type="button"
              onClick={fillSampleUser}
              className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition text-center"
            >
              Contractor Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

