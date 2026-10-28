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
  Search,
  Crown,
  LayoutDashboard,
  Scale,
  Building2,
  Briefcase,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
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

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* STORENT Brand Logo: Yellow outer background badge, Gray circle, Yellow rhino, Gray STORENT wordmark */}
          <Link to="/" className="flex items-center shrink-0 focus:outline-none py-1" title="STORENT Home">
            <StorentLogo variant="banner" className="h-9 sm:h-10 w-auto" showSubtitle={false} />
          </Link>

          {/* Desktop Navigation Links (>= lg: 1024px) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs xl:text-sm font-bold shrink-0 text-slate-700">
            <Link
              to="/browse"
              className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/browse')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Search className={`h-4 w-4 ${isActive('/browse') ? 'text-slate-950' : 'text-slate-500'}`} />
              <span className="hidden xl:inline">Browse Equipment</span>
              <span className="xl:hidden">Browse</span>
            </Link>

            {/* About Us Link */}
            <Link
              to="/about"
              className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/about')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Building2 className={`h-4 w-4 ${isActive('/about') ? 'text-slate-950' : 'text-slate-500'}`} />
              <span>About Us</span>
            </Link>

            {/* Careers Link */}
            <Link
              to="/careers"
              className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/careers')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Briefcase className={`h-4 w-4 ${isActive('/careers') ? 'text-slate-950' : 'text-slate-500'}`} />
              <span>Careers</span>
            </Link>

            <Link
              to="/plans"
              className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/plans')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Crown className={`h-4 w-4 ${isActive('/plans') ? 'text-slate-950' : 'text-slate-500'}`} />
              <span className="hidden xl:inline">Subscription Plans</span>
              <span className="xl:hidden">Plans</span>
            </Link>

            <Link
              to="/safe-harbor"
              className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/safe-harbor')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Scale className={`h-4 w-4 ${isActive('/safe-harbor') ? 'text-slate-950' : 'text-slate-500'}`} />
              <span>Safe Harbor</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className={`h-4 w-4 ${isActive('/dashboard') ? 'text-slate-950' : 'text-slate-500'}`} />
                <span>Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-[#FFD400] text-xs font-black hover:bg-black transition-colors shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#FFD400]" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Action Container (Desktop >= lg) */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            {user ? (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-slate-800 hover:text-black transition-colors group"
                  title="Go to Dashboard"
                >
                  <div className="h-8 w-8 rounded-full bg-slate-900 text-[#FFD400] flex items-center justify-center font-black text-xs shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-extrabold max-w-[100px] xl:max-w-[130px] truncate text-slate-800 group-hover:text-black">
                    {user.name || user.email}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out of STORENT"
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs xl:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs xl:text-sm font-black rounded-xl bg-[#FFD400] text-slate-950 hover:bg-[#F5CA28] border border-[#E0BC00] transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Header Controls (< lg) */}
          <div className="flex lg:hidden items-center space-x-2.5">
            {user && (
              <Link
                to="/dashboard"
                className="h-8 w-8 rounded-full bg-slate-900 text-[#FFD400] flex items-center justify-center font-black text-xs shrink-0 shadow-sm"
                title="Dashboard"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Link>
            )}

            {/* Mobile Hamburger Button in Black */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-slate-900" /> : <Menu className="h-6 w-6 text-slate-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (< lg) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 text-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <Link
              to="/browse"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive('/browse')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Browse Equipment</span>
            </Link>

            {/* About Us Link in Mobile Drawer */}
            <Link
              to="/about"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive('/about')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>About Us</span>
            </Link>

            {/* Careers Link in Mobile Drawer */}
            <Link
              to="/careers"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive('/careers')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Careers</span>
            </Link>

            <Link
              to="/plans"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive('/plans')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Crown className="h-4 w-4" />
              <span>Subscription Plans</span>
            </Link>

            <Link
              to="/safe-harbor"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive('/safe-harbor')
                  ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Scale className="h-4 w-4" />
              <span>Safe Harbor &amp; Intermediary Disclaimer</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                  isActive('/dashboard')
                    ? 'bg-[#FFD400] text-slate-950 font-black shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-black text-[#FFD400] bg-slate-900 shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 text-[#FFD400]" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Action Row inside Mobile Drawer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col space-y-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-center py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center justify-center space-x-2"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-600" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  className="text-center py-2.5 text-xs font-bold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2.5 text-xs font-black text-slate-950 bg-[#FFD400] hover:bg-[#F5CA28] border border-[#E0BC00] rounded-xl transition shadow-sm"
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
