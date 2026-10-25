import React from 'react';
import { Link } from 'react-router-dom';
import StorentLogo from './StorentLogo';
import { ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#222428] text-slate-300 pt-12 pb-8 border-t border-[#34373C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#34373C]">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <StorentLogo variant="light" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed">
              India's premier heavy machinery rental platform. Rent JCBs, excavators,
              cranes, generators, and tractors with verified machine owners and secure escrow payments.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#FCC837] font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Fleet Owners & Escrow Shield</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore Machinery
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/browse?category=jcb-excavators" className="hover:text-[#FCC837] transition">
                  JCB & Excavators
                </Link>
              </li>
              <li>
                <Link to="/browse?category=cranes-lifting" className="hover:text-[#FCC837] transition">
                  Cranes & Aerial Lifts
                </Link>
              </li>
              <li>
                <Link to="/browse?category=generators-power" className="hover:text-[#FCC837] transition">
                  Diesel Generators
                </Link>
              </li>
              <li>
                <Link to="/browse?category=tractors-farm" className="hover:text-[#FCC837] transition">
                  Tractors & Farm Machinery
                </Link>
              </li>
              <li>
                <Link to="/browse?category=concrete-mixers" className="hover:text-[#FCC837] transition">
                  Concrete Mixers
                </Link>
              </li>
            </ul>
          </div>

          {/* For Equipment Owners */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Fleet Owners
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/plans" className="hover:text-[#FCC837] transition">
                  Subscription Plans & Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#FCC837] transition">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-[#FCC837] transition">
                  Lifetime VIP Access
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Rental Agreement Guidelines</span>
              </li>
              <li>
                <span className="text-slate-400">Insurance & Verification Help</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Support & Inquiries
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#FCC837] mt-0.5 shrink-0" />
                <span>CyberCity Tech Corridor, Gurugram, NCR, India</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-[#FCC837] shrink-0" />
                <span>+91 1800-200-STORENT (Toll Free)</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-[#FCC837] shrink-0" />
                <span>support@storent.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} STORENT Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-[#FCC837] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#FCC837] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#FCC837] cursor-pointer">Escrow Shield Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
