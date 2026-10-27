import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Truck,
  Award,
  Users,
  Scale,
  CheckCircle2,
  ArrowRight,
  Clock,
  Target,
  Compass,
  Sparkles,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import StorentLogo from '../components/common/StorentLogo';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#181A1D]">
      {/* Hero Header */}
      <section className="relative bg-[#181A1D] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#34373C] overflow-hidden">
        {/* Ambient Golden Glow Effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFD400]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FFD400]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFD400] text-black text-xs font-black uppercase tracking-wider mb-5 shadow-sm">
            <Building2 className="h-4 w-4" />
            <span>STORENT • Intermediary Machinery Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Digitizing Heavy Equipment Rentals &amp; Fleet Logistics Across India
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            <strong>STORENT.SI</strong> is India&apos;s specialized digital directory and intermediary communication platform
            connecting contractors, project developers, and builders directly with verified machinery owners.
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-[#34373C]">
            <div className="bg-[#222428] p-4 rounded-2xl border border-[#34373C]">
              <div className="text-2xl sm:text-3xl font-black text-[#FFD400]">7</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Core Industries</div>
            </div>
            <div className="bg-[#222428] p-4 rounded-2xl border border-[#34373C]">
              <div className="text-2xl sm:text-3xl font-black text-[#FFD400]">Sec 79</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">IT Act Compliant</div>
            </div>
            <div className="bg-[#222428] p-4 rounded-2xl border border-[#34373C]">
              <div className="text-2xl sm:text-3xl font-black text-[#FFD400]">100%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Direct Owner Access</div>
            </div>
            <div className="bg-[#222428] p-4 rounded-2xl border border-[#34373C]">
              <div className="text-2xl sm:text-3xl font-black text-[#FFD400]">GPS</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Proximity Radar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        {/* Mission & Purpose */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#FFD400]/20 text-black text-xs font-black uppercase tracking-wider">
              <Target className="h-3.5 w-3.5" />
              <span>Our Mission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#181A1D]">
              Eliminating Idle Time for Equipment Owners &amp; Accelerating Infrastructure
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In India, billions of rupees in heavy machinery remain under-utilized between construction contracts.
              Simultaneously, infrastructure contractors frequently struggle to locate reliable, road-ready excavators,
              cranes, and generators near their project sites.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              STORENT bridges this gap by providing an intuitive, transparent marketplace with straight-line GPS radar,
              standardized technical specifications, verified owner documentation, and direct hirer-to-owner contact.
            </p>
          </div>

          <div className="bg-[#181A1D] text-white p-6 sm:p-8 rounded-3xl border border-[#34373C] space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-[#FFD400] flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Key Platform Principles</span>
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#FFD400] shrink-0 mt-0.5" />
                <span><strong>No Brokerage Markups:</strong> Direct negotiation and lease agreements between owner and hirer.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#FFD400] shrink-0 mt-0.5" />
                <span><strong>7 Key Industries Covered:</strong> Construction, Transport, Industrial, Marine, Road Works, Warehouse, and Agriculture.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#FFD400] shrink-0 mt-0.5" />
                <span><strong>Verified Owner Badges:</strong> RC document &amp; invoice verified machinery to prevent fraudulent listings.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#FFD400] shrink-0 mt-0.5" />
                <span><strong>Tax Invoiced Subscriptions:</strong> Transparent 18% GST invoicing with SAC 998365 classification.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 7 Core Categories */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-[#181A1D]">
              Supported Machinery Sectors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              STORENT organizes fleets into 7 primary industry classifications per national guidelines
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Construction', desc: 'JCB Backhoes, 320D Excavators, Transit Mixers, Cranes', icon: Truck, link: '/browse?category=construction' },
              { title: 'Transport', desc: 'Heavy Tippers, Multi-axle Trailers, Material Haulage', icon: Truck, link: '/browse?category=transport' },
              { title: 'Industrial', desc: '15-500+ kVA Silent Diesel Gensets, Air Compressors', icon: Zap, link: '/browse?category=industrial' },
              { title: 'Marine', desc: 'Dredging Pumps, Marine Winches, Port Handling Tools', icon: Compass, link: '/browse?category=marine' },
              { title: 'Road Works', desc: 'Vibratory Rollers, Soil Compactors, Asphalt Pavers', icon: Award, link: '/browse?category=road-works' },
              { title: 'Warehouse', desc: 'Electric & Diesel Forklifts, Reach Trucks, Pallet Stackers', icon: Building2, link: '/browse?category=warehouse' },
              { title: 'Agriculture', desc: 'Heavy Farm Tractors, Harvesters, Laser Levellers', icon: Users, link: '/browse?category=agriculture' },
              { title: 'Verified Owners', desc: 'Machines backed by RC Book verification & safe harbor', icon: ShieldCheck, link: '/browse' },
            ].map((sector, i) => {
              const Icon = sector.icon;
              return (
                <Link
                  key={i}
                  to={sector.link}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#FFD400] hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-[#FFD400]/20 text-black flex items-center justify-center font-bold mb-3 group-hover:bg-[#FFD400] transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-black text-sm text-[#181A1D] group-hover:text-black">
                      {sector.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {sector.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-black">
                    <span>Explore Fleet</span>
                    <ArrowRight className="h-3.5 w-3.5 text-black group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Legal Status & Grievance Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase text-black bg-[#FFD400] px-2.5 py-0.5 rounded-full mb-1">
                <Scale className="h-3.5 w-3.5" />
                <span>Statutory Compliance Notice</span>
              </div>
              <h3 className="text-lg font-black text-[#181A1D]">
                Section 79 &amp; 2(1)(w) IT Act, 2000 (India)
              </h3>
            </div>
            <Link
              to="/safe-harbor"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-black text-[#FFD400] font-black text-xs hover:bg-slate-900 transition shrink-0"
            >
              <span>View Safe Harbor Policy →</span>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            STORENT operates purely as an electronic listing intermediary. All equipment listings, rates, and specifications
            are provided by third-party machinery owners on an <strong>&quot;As-Is&quot;</strong> basis. STORENT does not possess,
            physically inspect, operate, transport, or lease machinery, nor does it hold security deposits or rental payments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-600">
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-slate-200 flex items-start space-x-2.5">
              <MapPin className="h-4 w-4 text-black shrink-0 mt-0.5" />
              <div>
                <strong>Platform Office:</strong> Sector 37 Industrial Corridor, Gurugram, Haryana - 122001, India
              </div>
            </div>
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-slate-200 flex items-start space-x-2.5">
              <Mail className="h-4 w-4 text-black shrink-0 mt-0.5" />
              <div>
                <strong>Grievance Officer:</strong> Rajesh V. Kulkarni (<a href="mailto:grievance@storent.si" className="text-black font-bold underline">grievance@storent.si</a>)
              </div>
            </div>
          </div>
        </div>

        {/* Dual CTA */}
        <div className="bg-[#FFD400] rounded-3xl p-8 sm:p-10 text-black flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Ready to Rent or List Equipment?
            </h2>
            <p className="text-sm font-semibold text-black/80 mt-1 max-w-xl">
              Join thousands of fleet owners and contractors using STORENT for fast, transparent machinery access.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/browse"
              className="px-5 py-3 rounded-xl bg-black text-[#FFD400] font-black text-sm hover:bg-slate-900 transition shadow-md"
            >
              Rent Equipment
            </Link>
            <Link
              to="/equipment/register"
              className="px-5 py-3 rounded-xl bg-white text-black font-black text-sm hover:bg-slate-50 transition border border-black/20"
            >
              List Equipment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

