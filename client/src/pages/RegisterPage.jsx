import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck, Scale } from 'lucide-react';
import AuthBackgroundLayout from '../components/auth/AuthBackgroundLayout';
import StorentLogo from '../components/common/StorentLogo';

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!termsAccepted) {
      setError('You must agree to the Terms of Service & Intermediary Safe Harbor Disclaimer.');
      return;
    }

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
      <div className="space-y-4 bg-[#222428]/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-[#34373C] shadow-2xl shadow-black/80">
        <div className="text-center">
          <Link to="/" className="inline-block mb-3">
            <StorentLogo variant="banner" className="h-10 w-auto shadow-md" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Your <span className="text-[#FCC837]">STORENT</span> Account
          </h2>
          <p className="mt-0.5 text-xs text-slate-300">
            One unified account to rent machinery and list your equipment
          </p>
        </div>

        {/* Dual Capability Badge */}
        <div className="py-2.5 px-3.5 bg-[#FCC837]/15 rounded-xl border border-[#FCC837]/40 flex items-center space-x-2 text-xs text-white">
          <ShieldCheck className="h-4 w-4 text-[#FCC837] shrink-0" />
          <span>
            <strong className="text-[#FCC837]">Intermediary Directory:</strong> Rent machines and register your own equipment directly under Section 79 Safe Harbor.
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181A1D] border border-[#34373C] text-white placeholder-slate-500 text-sm focus:border-[#FCC837] focus:ring-2 focus:ring-[#FCC837]/20 outline-none transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Phone Number (Required for OTP) *
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181A1D] border border-[#34373C] text-white placeholder-slate-500 text-sm focus:border-[#FCC837] focus:ring-2 focus:ring-[#FCC837]/20 outline-none transition"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181A1D] border border-[#34373C] text-white placeholder-slate-500 text-sm focus:border-[#FCC837] focus:ring-2 focus:ring-[#FCC837]/20 outline-none transition"
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181A1D] border border-[#34373C] text-white placeholder-slate-500 text-sm focus:border-[#FCC837] focus:ring-2 focus:ring-[#FCC837]/20 outline-none transition"
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181A1D] border border-[#34373C] text-white placeholder-slate-500 text-sm focus:border-[#FCC837] focus:ring-2 focus:ring-[#FCC837]/20 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Checkbox as required by PDF */}
          <div className="p-3.5 rounded-xl bg-[#181A1D] border border-[#34373C] text-xs text-slate-300">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-[#FCC837] rounded shrink-0 cursor-pointer"
              />
              <span className="leading-relaxed">
                I agree to the{' '}
                <Link to="/safe-harbor" target="_blank" className="font-bold text-[#FCC837] hover:underline">
                  Terms of Service, &quot;As-Is&quot; Disclaimer &amp; Intermediary Safe Harbor Policy
                </Link>{' '}
                under Section 79 of the Information Technology Act, 2000.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !termsAccepted}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-slate-950 font-black text-sm transition shadow-lg shadow-[#FCC837]/25 flex items-center justify-center space-x-2 border border-[#E6B01B] disabled:opacity-50"
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

        <div className="text-center text-xs text-slate-400 pt-2.5 border-t border-[#34373C]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#FCC837] hover:text-[#F0BA28] transition">
            Log in here
          </Link>
        </div>
      </div>
    </AuthBackgroundLayout>
  );
};

export default RegisterPage;
