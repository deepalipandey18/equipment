import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
  Zap,
  ShieldCheck,
  Mail,
  Send,
  X,
  FileText,
  ChevronRight,
  Building2,
  Users,
} from 'lucide-react';

const OPEN_POSITIONS = [
  {
    id: 'fullstack-eng',
    title: 'Senior Full-Stack Engineer (MERN & Geospatial)',
    department: 'Engineering & Product',
    location: 'Gurugram / Hybrid',
    type: 'Full-Time',
    experience: '3-6 Years',
    description:
      'Scale our React 18, Node.js, and MongoDB 2dsphere geospatial platform. Build real-time radar search, OTP auth flows, and automated GST billing.',
    tags: ['React', 'Node.js', 'MongoDB', 'Tailwind', 'GeoJSON'],
  },
  {
    id: 'ops-lead',
    title: 'Machinery Onboarding & Inspection Lead',
    department: 'Fleet Operations',
    location: 'Delhi-NCR (Field & Hub)',
    type: 'Full-Time',
    experience: '2-5 Years',
    description:
      'Partner directly with commercial fleet owners to verify RC documents, inspect JCBs, mobile cranes, and gensets for "Verified Owner" badges.',
    tags: ['Fleet Management', 'RC Verification', 'Client Relations'],
  },
  {
    id: 'infra-sales',
    title: 'Key Accounts Manager - Infrastructure Fleets',
    department: 'Business Development',
    location: 'Mumbai / Delhi',
    type: 'Full-Time',
    experience: '4-8 Years',
    description:
      'Drive enterprise subscription onboarding for large highway, metro, and energy construction contractors with multi-unit fleet inventories.',
    tags: ['B2B Sales', 'Heavy Construction', 'Enterprise Subscriptions'],
  },
  {
    id: 'customer-ops',
    title: 'Customer Experience & Grievance Executive',
    department: 'Operations & Legal Support',
    location: 'Gurugram Hub',
    type: 'Full-Time',
    experience: '1-3 Years',
    description:
      'Manage hirer contact unlock support, owner feedback loops, and assist our statutory Grievance Officer with IT Act compliance queries.',
    tags: ['Customer Support', 'Grievance Resolution', 'CRM'],
  },
  {
    id: 'product-designer',
    title: 'UI/UX Product Designer (Heavy Industries)',
    department: 'Design',
    location: 'Remote / Hybrid',
    type: 'Full-Time',
    experience: '3-5 Years',
    description:
      'Craft intuitive, high-contrast interfaces for fleet owners and site managers under the STORENT yellow-black brand identity.',
    tags: ['Figma', 'Design Systems', 'Mobile-First UX'],
  },
];

const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resumeLink: '',
    note: '',
  });

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setSubmitted(false);
    setApplicationModalOpen(true);
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#181A1D]">
      {/* Hero Header */}
      <section className="relative bg-[#181A1D] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#34373C] overflow-hidden">
        {/* Ambient Golden Glow Effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFD400]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FFD400]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFD400] text-black text-xs font-black uppercase tracking-wider mb-5 shadow-sm">
            <Briefcase className="h-4 w-4" />
            <span>Careers at STORENT • Build India&apos;s Backbone</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Power the Future of Heavy Machinery Logistics &amp; Infrastructure
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            We are assembling a mission-driven team of engineers, fleet operators, and logistics specialists
            revolutionizing how heavy machinery moves between contractors across India.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <a
              href="#openings"
              className="px-5 py-3 rounded-xl bg-[#FFD400] text-black font-black text-sm hover:bg-[#e6c000] transition shadow-md"
            >
              View Open Roles ({OPEN_POSITIONS.length})
            </a>
            <a
              href="mailto:careers@storent.si"
              className="px-5 py-3 rounded-xl bg-[#222428] text-white font-bold text-sm hover:bg-black transition border border-[#34373C]"
            >
              Email Resume: careers@storent.si
            </a>
          </div>
        </div>
      </section>

      {/* Culture & Perks */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#181A1D]">
            Why Build With STORENT?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Empowering our team with freedom, rapid ownership, and top-tier benefits
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              title: 'Massive Real-World Impact',
              desc: 'Directly accelerate highways, metros, irrigation, and power projects across 28+ states.',
            },
            {
              icon: ShieldCheck,
              title: 'Competitive Pay & ESOPs',
              desc: 'Top-of-market compensation packages with equity stakes in high-growth infrastructure tech.',
            },
            {
              icon: Heart,
              title: 'Comprehensive Health Cover',
              desc: 'Premium family health, medical, and accident insurance coverage for you and your dependents.',
            },
            {
              icon: Sparkles,
              title: 'Modern Tools & Equipment',
              desc: 'Top MacBook/workstations, remote-friendly hybrid policies, and generous learning allowances.',
            },
          ].map((perk, i) => {
            const Icon = perk.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#FFD400] transition shadow-sm space-y-2.5"
              >
                <div className="h-10 w-10 rounded-xl bg-[#FFD400]/20 text-black flex items-center justify-center font-bold">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-[#181A1D]">{perk.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{perk.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Open Positions List */}
      <section id="openings" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#181A1D]">
              Open Positions ({OPEN_POSITIONS.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Apply online in less than 2 minutes — no lengthy forms required
            </p>
          </div>
          <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
            📍 Headquarters: Gurugram, India
          </div>
        </div>

        <div className="space-y-4">
          {OPEN_POSITIONS.map((job) => (
            <div
              key={job.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-[#FFD400] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-[#FFD400] px-2.5 py-0.5 rounded-md">
                    {job.department}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{job.type}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    • Exp: {job.experience}
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#181A1D]">{job.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 self-start md:self-center">
                <button
                  onClick={() => handleOpenApply(job)}
                  className="px-4 py-2.5 rounded-xl bg-black text-[#FFD400] font-black text-xs hover:bg-slate-900 transition flex items-center space-x-1.5 shadow-sm active:scale-95"
                >
                  <span>Apply for Role</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* General Resume Submission Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-8 rounded-3xl bg-[#181A1D] text-white border border-[#34373C] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl font-black text-[#FFD400]">
              Don&apos;t see your exact role listed?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              We are constantly scouting exceptional talent in geospatial mapping, IoT fleet telemetry,
              and infrastructure finance. Send your resume directly to our talent team.
            </p>
          </div>
          <a
            href="mailto:careers@storent.si?subject=General%20Application%20-%20STORENT%20Fleet"
            className="px-5 py-3 rounded-xl bg-[#FFD400] text-black font-black text-sm hover:bg-[#e6c000] transition shrink-0 shadow-md"
          >
            Email: careers@storent.si
          </a>
        </div>
      </section>

      {/* Application Modal */}
      {applicationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              onClick={() => setApplicationModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-[#FFD400]/20 text-black flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-2xl font-black text-[#181A1D]">
                  Application Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for applying for <strong>{selectedJob?.title}</strong>. Our recruiting team in Gurugram
                  will review your credentials and contact you within 48 hours.
                </p>
                <button
                  onClick={() => setApplicationModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-black text-[#FFD400] font-black text-sm hover:bg-slate-900 transition"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-black uppercase tracking-wider bg-[#FFD400] px-2.5 py-0.5 rounded-md inline-block mb-1">
                    Job Application
                  </div>
                  <h3 className="text-xl font-black text-[#181A1D]">
                    {selectedJob?.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedJob?.department} • {selectedJob?.location}
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-normal text-slate-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-normal text-slate-900 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-normal text-slate-900 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">Resume / LinkedIn Profile URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://linkedin.com/in/username or drive link"
                      value={formData.resumeLink}
                      onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-normal text-slate-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Why do you want to join STORENT? (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us briefly about your experience with heavy machinery, geospatial tech, or scaling operations..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-normal text-slate-900 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setApplicationModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-black text-[#FFD400] font-black text-xs hover:bg-slate-900 transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersPage;

