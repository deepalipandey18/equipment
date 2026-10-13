import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
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
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
              <Truck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Equipment<span className="text-brand-600">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mt-0.5">
                Heavy Machinery Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-700">
            <Link
              to="/browse"
              className="flex items-center space-x-1.5 hover:text-brand-600 transition-colors"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span>Browse Equipment</span>
            </Link>

            <Link
              to="/plans"
              className="flex items-center space-x-1.5 hover:text-brand-600 transition-colors"
            >
              <Crown className="h-4 w-4 text-amber-500" />
              <span>Subscription Plans</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className="flex items-center space-x-1.5 hover:text-brand-600 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                <span>Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold hover:bg-slate-200 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Register Equipment CTA Button */}
            <button
              onClick={handleRegisterEquipmentClick}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition shadow-sm"
              title={
                hasActiveSubscription
                  ? 'List your equipment'
                  : 'Subscription plan required to list equipment'
              }
            >
              <PlusCircle className="h-4 w-4 text-brand-600" />
              <span>Register Equipment</span>
              {hasActiveSubscription && (
                <span className="ml-1 inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
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
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs border border-slate-300">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 transition"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-brand-600"
          >
            Browse Equipment
          </Link>
          <Link
            to="/plans"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-brand-600"
          >
            Subscription Plans
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-brand-600"
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-blue-700 hover:text-blue-900"
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
              className="w-full text-center py-2.5 px-4 font-semibold text-sm rounded-lg bg-amber-100 text-amber-900"
            >
              + Register Equipment
            </button>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
              >
                Log Out ({user.email})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg"
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

