import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, hasActiveSubscription, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* STORENT Logo */}
          <Link to="/" className="flex items-center">
            <StorentLogo variant="default" className="h-9 w-auto" showSubtitle={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-700">
            <Link
              to="/browse"
              className="flex items-center space-x-1.5 hover:text-slate-950 transition-colors"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span>Browse Equipment</span>
            </Link>

            <Link
              to="/plans"
              className="flex items-center space-x-1.5 hover:text-slate-950 transition-colors"
            >
              <Crown className="h-4 w-4 text-[#FCC837]" />
              <span>Subscription Plans</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className="flex items-center space-x-1.5 hover:text-slate-950 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                <span>Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#222428] text-[#FCC837] border border-[#34373C] text-xs font-bold hover:bg-black transition"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#FCC837]" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Register Equipment CTA Button */}
            <button
              onClick={handleRegisterEquipmentClick}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-bold rounded-lg bg-[#FCC837] text-slate-950 border border-[#E6B01B] hover:bg-[#F0BA28] transition shadow-sm"
              title={
                hasActiveSubscription
                  ? 'List your equipment'
                  : 'Subscription plan required to list equipment'
              }
            >
              <PlusCircle className="h-4 w-4 text-slate-950" />
              <span>Register Equipment</span>
              {hasActiveSubscription && (
                <span className="ml-1 inline-flex items-center px-1.5 py-0.2 text-[10px] font-black rounded-full bg-[#222428] text-[#FCC837]">
                  Subscribed
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-sm text-slate-700 hover:text-slate-900"
                >
                  <div className="h-8 w-8 rounded-full bg-[#222428] text-[#FCC837] border border-[#34373C] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold hidden lg:inline max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out of STORENT"
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-bold rounded-lg bg-[#222428] text-[#FCC837] hover:bg-black transition-colors border border-[#34373C]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-950 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-bold text-slate-700 hover:text-slate-950"
          >
            Browse Equipment
          </Link>
          <Link
            to="/plans"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-bold text-slate-700 hover:text-slate-950"
          >
            Subscription Plans
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-bold text-slate-700 hover:text-slate-950"
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-bold text-[#FCC837] bg-[#222428] px-3 py-1.5 rounded-lg"
            >
              Admin Panel
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleRegisterEquipmentClick();
              }}
              className="w-full text-center py-2.5 px-4 font-bold text-sm rounded-lg bg-[#FCC837] text-slate-950 border border-[#E6B01B]"
            >
              + Register Equipment
            </button>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded"
              >
                Log Out ({user.email})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-bold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-black text-slate-950 bg-[#FCC837] border border-[#E6B01B] rounded-lg"
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
