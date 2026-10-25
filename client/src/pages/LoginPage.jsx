import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import AuthBackgroundLayout from '../components/auth/AuthBackgroundLayout';
import StorentLogo from '../components/common/StorentLogo';

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
      <div className="space-y-6 bg-[#222428]/95 backdrop-blur-2xl p-7 sm:p-9 rounded-3xl border border-[#34373C] shadow-2xl shadow-black/80">
        <div className="text-center">
          <Link to="/" className="inline-block mb-3">
            {/* <StorentLogo variant="banner" className="h-12 w-auto shadow-md" /> */}
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Log in to <span className="text-[#FCC837]">STORENT</span>
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181A1D] border border-[#34373C] text-white placeholder-slate-500 text-sm focus:border-[#FCC837] focus:ring-2 focus:ring-[#FCC837]/20 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <span className="text-xs text-[#FCC837] hover:text-[#F0BA28] cursor-pointer">
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181A1D] border border-[#34373C] text-white placeholder-slate-500 text-sm focus:border-[#FCC837] focus:ring-2 focus:ring-[#FCC837]/20 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-slate-950 font-black text-sm transition shadow-lg shadow-[#FCC837]/25 flex items-center justify-center space-x-2 border border-[#E6B01B] disabled:opacity-70"
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
        <div className="pt-4 border-t border-[#34373C]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Quick fill test accounts:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={fillSampleFleetOwner}
              className="px-2 py-1.5 text-[11px] font-bold rounded-lg border border-[#FCC837]/40 bg-[#FCC837]/15 hover:bg-[#FCC837]/25 text-[#FCC837] transition text-center"
            >
              Fleet Owner
            </button>
            <button
              type="button"
              onClick={fillSampleRenter}
              className="px-2 py-1.5 text-[11px] font-bold rounded-lg border border-[#34373C] bg-[#181A1D] hover:bg-[#222428] text-white transition text-center"
            >
              Renter (Amit)
            </button>
            <button
              type="button"
              onClick={fillSampleAdmin}
              className="px-2 py-1.5 text-[11px] font-bold rounded-lg border border-[#34373C] bg-[#181A1D] hover:bg-[#222428] text-slate-200 transition text-center"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-[#FCC837] hover:text-[#F0BA28] transition">
            Sign up for free
          </Link>
        </div>
      </div>
    </AuthBackgroundLayout>
  );
};

export default LoginPage;
