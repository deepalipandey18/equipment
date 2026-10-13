import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, MapPin, Phone, Mail, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Equipment<span className="text-brand-500">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's premier marketplace for construction equipment and heavy machinery. Rent JCBs,
              cranes, generators, and tractors with verified owners and secure escrow payments.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Listings & Secure Payments</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore Marketplace
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/browse?category=jcb-excavators" className="hover:text-white transition">
                  JCB & Excavators
                </Link>
              </li>
              <li>
                <Link to="/browse?category=cranes-lifting" className="hover:text-white transition">
                  Cranes & Aerial Lifts
                </Link>
              </li>
              <li>
                <Link to="/browse?category=generators-power" className="hover:text-white transition">
                  Diesel Generators
                </Link>
              </li>
              <li>
                <Link to="/browse?category=tractors-farm" className="hover:text-white transition">
                  Tractors & Farm Machinery
                </Link>
              </li>
              <li>
                <Link to="/browse?category=concrete-mixers" className="hover:text-white transition">
                  Concrete Mixers
                </Link>
              </li>
            </ul>
          </div>

          {/* For Equipment Owners */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              For Equipment Owners
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/plans" className="hover:text-white transition">
                  Subscription Plans & Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-white transition">
                  Listing Limits & Benefits
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Rental Agreement Guidelines</span>
              </li>
              <li>
                <span className="text-slate-500">Insurance & Verification Help</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Support & Inquiries
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <span>DLF CyberCity, Sector 24, Gurugram, Haryana 122002, India</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-brand-500 shrink-0" />
                <span>+91 1800-200-MACH (Toll Free)</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-brand-500 shrink-0" />
                <span>support@equipmenthub.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EquipmentHub Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Razorpay Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

