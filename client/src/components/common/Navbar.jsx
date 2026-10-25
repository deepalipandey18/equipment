import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StorentLogo from './StorentLogo';
import {
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Search,
  Crown,
  LayoutDashboard,
  Scale,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, hasActiveSubscription, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRegisterEquipmentClick = () => {
    if (!user) {
      navigate('/login?redirect=/equipment/register');
    } else if (!hasActiveSubscription) {
      navigate('/plans?reason=subscription_required');
    } else {
      navigate('/equipment/register');
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#181A1D]/95 backdrop-blur-md border-b border-[#34373C] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* STORENT Brand Logo */}
          <Link to="/" className="flex items-center shrink-0 focus:outline-none">
            <StorentLogo variant="light" className="h-8 sm:h-9 w-auto" showSubtitle={false} />
          </Link>

          {/* Desktop Navigation Links (>= lg: 1024px) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-sm font-semibold shrink-0">
            <Link
              to="/browse"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/browse')
                  ? 'text-[#FCC837] bg-white/5 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className={`h-4 w-4 ${isActive('/browse') ? 'text-[#FCC837]' : 'text-slate-400'}`} />
              <span>Browse Equipment</span>
            </Link>

            <Link
              to="/plans"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/plans')
                  ? 'text-[#FCC837] bg-white/5 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Crown className={`h-4 w-4 ${isActive('/plans') ? 'text-[#FCC837]' : 'text-[#FCC837]/80'}`} />
              <span>Subscription Plans</span>
            </Link>

            <Link
              to="/safe-harbor"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/safe-harbor')
                  ? 'text-[#FCC837] bg-white/5 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Scale className={`h-4 w-4 ${isActive('/safe-harbor') ? 'text-[#FCC837]' : 'text-slate-400'}`} />
              <span>Safe Harbor</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'text-[#FCC837] bg-white/5 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className={`h-4 w-4 ${isActive('/dashboard') ? 'text-[#FCC837]' : 'text-slate-400'}`} />
                <span>Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#222428] text-[#FCC837] border border-[#34373C] text-xs font-bold hover:bg-black transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#FCC837]" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Right Action Container (Desktop >= lg) */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            {/* Primary CTA: "List equipment" per Storent Guidelines */}
            <button
              onClick={handleRegisterEquipmentClick}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-black rounded-lg bg-[#FCC837] text-[#181A1D] border border-[#E6B01B] hover:bg-[#F0BA28] active:scale-95 transition-all shadow-sm shrink-0"
              title={
                hasActiveSubscription
                  ? 'List your equipment on STORENT'
                  : 'Subscription plan required to list equipment'
              }
            >
              <PlusCircle className="h-4 w-4 text-[#181A1D]" />
              <span>List equipment</span>
              {hasActiveSubscription && (
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 text-[9px] font-black rounded bg-[#181A1D] text-[#FCC837]">
                  PRO
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2.5 pl-2 border-l border-[#34373C]">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-slate-200 hover:text-white transition-colors group"
                  title="Go to Dashboard"
                >
                  <div className="h-8 w-8 rounded-full bg-[#222428] text-[#FCC837] border border-[#34373C] flex items-center justify-center font-black text-xs group-hover:border-[#FCC837] transition-colors">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold max-w-[100px] xl:max-w-[130px] truncate">
                    {user.name || user.email}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out of STORENT"
                  className="p-1.5 text-slate-400 hover:text-[#FCC837] hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-[#34373C]">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-black rounded-lg bg-[#222428] text-[#FCC837] hover:bg-black transition-colors border border-[#34373C]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Header Controls (< lg) */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Quick Mobile Action CTA */}
            <button
              onClick={handleRegisterEquipmentClick}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-black rounded-lg bg-[#FCC837] text-[#181A1D] border border-[#E6B01B] hover:bg-[#F0BA28] active:scale-95 transition shrink-0"
              title="List equipment on STORENT"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#181A1D]" />
              <span className="hidden sm:inline">List equipment</span>
              <span className="sm:hidden">List</span>
            </button>

            {user && (
              <Link
                to="/dashboard"
                className="h-8 w-8 rounded-full bg-[#222428] text-[#FCC837] border border-[#34373C] flex items-center justify-center font-bold text-xs shrink-0"
                title="Dashboard"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-[#FCC837]" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (< lg) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#34373C] bg-[#181A1D] px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <Link
              to="/browse"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive('/browse')
                  ? 'bg-[#222428] text-[#FCC837] border border-[#34373C]'
                  : 'text-slate-300 hover:text-white hover:bg-[#222428]'
              }`}
            >
              <Search className="h-4 w-4 text-[#FCC837]" />
              <span>Browse Equipment</span>
            </Link>

            <Link
              to="/plans"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive('/plans')
                  ? 'bg-[#222428] text-[#FCC837] border border-[#34373C]'
                  : 'text-slate-300 hover:text-white hover:bg-[#222428]'
              }`}
            >
              <Crown className="h-4 w-4 text-[#FCC837]" />
              <span>Subscription Plans</span>
            </Link>

            <Link
              to="/safe-harbor"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive('/safe-harbor')
                  ? 'bg-[#222428] text-[#FCC837] border border-[#34373C]'
                  : 'text-slate-300 hover:text-white hover:bg-[#222428]'
              }`}
            >
              <Scale className="h-4 w-4 text-[#FCC837]" />
              <span>Safe Harbor &amp; Intermediary Disclaimer</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                  isActive('/dashboard')
                    ? 'bg-[#222428] text-[#FCC837] border border-[#34373C]'
                    : 'text-slate-300 hover:text-white hover:bg-[#222428]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-[#FCC837]" />
                <span>Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-[#FCC837] bg-[#222428] border border-[#34373C]"
              >
                <ShieldCheck className="h-4 w-4 text-[#FCC837]" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Action Row inside Mobile Drawer */}
          <div className="pt-3 border-t border-[#34373C] flex flex-col space-y-2.5">
            <button
              onClick={handleRegisterEquipmentClick}
              className="w-full text-center py-2.5 px-4 font-black text-sm rounded-xl bg-[#FCC837] text-[#181A1D] border border-[#E6B01B] shadow-sm flex items-center justify-center space-x-2"
            >
              <PlusCircle className="h-4 w-4 text-[#181A1D]" />
              <span>List equipment</span>
              {hasActiveSubscription && (
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 text-[9px] font-black rounded bg-[#181A1D] text-[#FCC837]">
                  PRO
                </span>
              )}
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-center py-2.5 px-4 text-xs font-bold text-slate-300 hover:text-white hover:bg-[#222428] rounded-xl border border-[#34373C] transition flex items-center justify-center space-x-2"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-400" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  className="text-center py-2.5 text-xs font-bold text-slate-200 border border-[#34373C] rounded-xl hover:bg-[#222428] transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2.5 text-xs font-black text-[#181A1D] bg-[#FCC837] border border-[#E6B01B] rounded-xl transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
