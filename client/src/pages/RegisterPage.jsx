import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, User, Mail, Phone, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import AuthBackgroundLayout from '../components/auth/AuthBackgroundLayout';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthBackgroundLayout
      badgeText="One Unified Account for Heavy Machinery"
      maxWidth="max-w-2xl sm:max-w-3xl"
    >
      <div className="space-y-4 bg-slate-900/85 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl shadow-black/80">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 mb-2.5">
            <Truck className="h-5 w-5 stroke-[2.3]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="mt-0.5 text-xs text-slate-300">
            One unified account to rent machinery and list your equipment
          </p>
        </div>

        {/* Dual Capability Badge */}
        <div className="py-2 px-3 bg-amber-500/10 rounded-xl border border-amber-500/25 flex items-center space-x-2 text-xs text-amber-200">
          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>Dual Access:</strong> Rent machines and register your own equipment simultaneously with zero extra paperwork.
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start space-x-2 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ramesh Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
              </div>
            </div>

            {/* Email Address (Span 2 cols on desktop) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ramesh@infraprojects.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Password * (Min 6 chars)
              </label>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2.5 border-t border-white/10">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300 transition">
            Log in here
          </Link>
        </div>
      </div>
    </AuthBackgroundLayout>
  );
};

export default RegisterPage;

