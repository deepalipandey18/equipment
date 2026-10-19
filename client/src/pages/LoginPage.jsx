import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import AuthBackgroundLayout from '../components/auth/AuthBackgroundLayout';

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

  const fillSampleFleetOwner = () => {
    setFormData({
      email: 'rajesh.fleet@equipmenthub.com',
      password: 'Password@123',
    });
  };

  const fillSampleRenter = () => {
    setFormData({
      email: 'amit.builder@equipmenthub.com',
      password: 'Password@123',
    });
  };

  return (
    <AuthBackgroundLayout badgeText="Verified Dual-Account Gateway">
      <div className="space-y-6 bg-slate-900/85 backdrop-blur-2xl p-7 sm:p-9 rounded-3xl border border-white/15 shadow-2xl shadow-black/80">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Truck className="h-6 w-6 stroke-[2.3]" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-white tracking-tight">
            Log in to Machine<span className="text-amber-400">Hub</span>
          </h2>
          <p className="mt-1.5 text-xs text-slate-300">
            Access your dual rental & listing dashboard with one single login
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start space-x-2 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <span className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer">
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
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
        <div className="pt-4 border-t border-white/10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Quick fill test accounts:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={fillSampleFleetOwner}
              className="px-2 py-1.5 text-[11px] font-semibold rounded-lg border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition text-center"
            >
              Fleet Owner
            </button>
            <button
              type="button"
              onClick={fillSampleRenter}
              className="px-2 py-1.5 text-[11px] font-semibold rounded-lg border border-blue-500/30 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition text-center"
            >
              Renter (Amit)
            </button>
            <button
              type="button"
              onClick={fillSampleAdmin}
              className="px-2 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition text-center"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-amber-400 hover:text-amber-300 transition">
            Sign up for free
          </Link>
        </div>
      </div>
    </AuthBackgroundLayout>
  );
};

export default LoginPage;

