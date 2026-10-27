import React from 'react';
import { Link } from 'react-router-dom';
import StorentLogo from './StorentLogo';
import { ShieldCheck, MapPin, Phone, Mail, Scale, UserCheck, AlertCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#181A1D] text-slate-300 pt-12 pb-8 border-t border-[#34373C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#34373C]">
          {/* Brand & Intermediary Role */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <StorentLogo variant="light" className="h-10 w-auto" />
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>STORENT.SI</strong> operates solely as a digital listing directory, information portal,
              and communication enabler under Section 79 &amp; Section 2(1)(w) of the Information
              Technology Act, 2000 (India).
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#FFD400] font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Section 79 Intermediary Safe Harbor</span>
            </div>
            <Link
              to="/safe-harbor"
              className="inline-flex items-center space-x-1.5 text-xs text-[#FFD400] hover:underline font-bold"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Safe Harbor &amp; Intermediary Disclaimer →</span>
            </Link>
          </div>

          {/* 7 Industry Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Machinery Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/browse?category=construction" className="hover:text-[#FFD400] transition">
                  Construction
                </Link>
              </li>
              <li>
                <Link to="/browse?category=transport" className="hover:text-[#FFD400] transition">
                  Transport
                </Link>
              </li>
              <li>
                <Link to="/browse?category=industrial" className="hover:text-[#FFD400] transition">
                  Industrial
                </Link>
              </li>
              <li>
                <Link to="/browse?category=marine" className="hover:text-[#FFD400] transition">
                  Marine
                </Link>
              </li>
              <li>
                <Link to="/browse?category=road-works" className="hover:text-[#FFD400] transition">
                  Road Works
                </Link>
              </li>
              <li>
                <Link to="/browse?category=warehouse" className="hover:text-[#FFD400] transition">
                  Warehouse
                </Link>
              </li>
              <li>
                <Link to="/browse?category=agriculture" className="hover:text-[#FFD400] transition">
                  Agriculture
                </Link>
              </li>
            </ul>
          </div>

          {/* Equipment Owners & Legal Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Company &amp; Fleet Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/about" className="hover:text-[#FFD400] transition font-bold text-white">
                  About STORENT
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-[#FFD400] transition font-bold text-white">
                  Careers &amp; Open Roles
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-[#FFD400] transition">
                  Subscription Plans (18% GST Incl.)
                </Link>
              </li>
              <li>
                <Link to="/equipment/register" className="hover:text-[#FFD400] transition">
                  List Equipment for Rent or Sale
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#FFD400] transition">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/safe-harbor"
                  className="hover:text-[#FFD400] transition font-bold text-white flex items-center space-x-1"
                >
                  <span>Safe Harbor &amp; Intermediary Disclaimer</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Statutory Grievance Redressal (Rule 3(2) IT Rules 2021) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2 flex items-center space-x-1.5">
              <UserCheck className="h-4 w-4 text-[#FFD400]" />
              <span>Grievance Officer</span>
            </h4>
            <div className="p-3 bg-[#222428] rounded-xl border border-[#34373C] text-xs space-y-1.5 text-slate-300">
              <div className="font-bold text-white">Rajesh V. Kulkarni</div>
              <div className="text-[11px] text-slate-400">Grievance &amp; Compliance Officer</div>
              <div className="flex items-center space-x-1 text-[11px]">
                <Mail className="h-3.5 w-3.5 text-[#FFD400] shrink-0" />
                <a href="mailto:grievance@storent.si" className="hover:text-[#FFD400] transition">
                  grievance@storent.si
                </a>
              </div>
              <div className="flex items-center space-x-1 text-[11px]">
                <Phone className="h-3.5 w-3.5 text-[#FFD400] shrink-0" />
                <span>1800-889-STORENT (Toll Free)</span>
              </div>
            </div>
            <div className="flex items-start space-x-2 text-[11px] text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-[#FFD400] mt-0.5 shrink-0" />
              <span>Sector 37 Industrial Corridor, Gurugram, Haryana - 122001, India</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="my-6 p-4 rounded-xl bg-[#222428] border border-[#34373C] text-[11px] text-slate-400 leading-relaxed space-y-1">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>Statutory Legal Notice &amp; Disclaimer of Liability</span>
          </div>
          <p>
            STORENT.SI provides advertising listing space for equipment owners. Listings are published
            by third-party owners on an <strong>&quot;As-Is&quot;</strong> basis. STORENT.SI does not inspect, possess,
            transport, or lease machinery, nor does it process or hold rental payments. Independent verification
            and due diligence by hirers are mandatory prior to any financial transaction.
          </p>
        </div>

        {/* Bottom Bar with Links */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} STORENT.SI (Intermediary Platform). All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 sm:mt-0">
            <Link to="/about" className="hover:text-[#FFD400] transition font-bold text-slate-300">
              About Us
            </Link>
            <Link to="/careers" className="hover:text-[#FFD400] transition font-bold text-slate-300">
              Careers
            </Link>
            <Link to="/safe-harbor" className="hover:text-[#FFD400] transition font-bold text-slate-300">
              Safe Harbor &amp; Intermediary Disclaimer
            </Link>
            <Link to="/safe-harbor#grievance" className="hover:text-[#FFD400] transition">
              Grievance Redressal
            </Link>
            <Link to="/plans" className="hover:text-[#FFD400] transition">
              Subscription &amp; GST Invoicing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
