import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertTriangle,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Scale,
  CheckCircle2,
} from 'lucide-react';

const SafeHarborPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8 text-[#222428]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-[#181A1D] text-white p-8 sm:p-10 rounded-3xl border border-[#34373C] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCC837]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#FCC837] text-[#222428] text-xs font-black uppercase tracking-wider mb-4 border border-[#E6B01B]">
            <Scale className="h-4 w-4" />
            <span>Legal Compliance & Safe Harbor Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Safe Harbor & Intermediary Disclaimer
          </h1>
          <p className="mt-3 text-sm text-white/80 max-w-2xl leading-relaxed">
            Statutory declaration under Section 79 and Section 2(1)(w) of the Information Technology
            Act, 2000 (India) governing platform liability, &quot;As-Is&quot; equipment listings, and Grievance Redressal.
          </p>
          <div className="mt-4 text-xs text-[#FCC837] font-semibold">
            Last Updated & Verified: Effective October 2026 • Platform: STORENT.SI
          </div>
        </div>

        {/* Section 1: Status as an Intermediary */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#34373C]/15 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-[#34373C]/10">
            <div className="p-2.5 rounded-xl bg-[#FCC837]/20 text-[#222428] font-black">
              1.0
            </div>
            <h2 className="text-xl font-black text-[#222428]">
              Status as an Intermediary &amp; Safe Harbor Protection
            </h2>
          </div>

          <div className="space-y-4 text-sm text-[#34373C] leading-relaxed">
            <div>
              <h3 className="font-bold text-[#222428] text-base mb-1">
                1.1 Declaration of Intermediary Role
              </h3>
              <p>
                The Platform <strong>STORENT.SI</strong> operates solely as a digital listing
                directory, information portal, and communication enabler. Under{' '}
                <strong>Section 2(1)(w)</strong> and <strong>Section 79</strong> of the Information
                Technology Act, 2000 (India), the Platform is an <strong>&quot;Intermediary&quot;</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#222428] text-base mb-1">
                1.2 Exemption from Liability
              </h3>
              <p>
                In accordance with Section 79 of the Information Technology Act, 2000, STORENT.SI
                shall not be liable, financially, legally, or otherwise, for any third-party
                information, data, listing content, machinery details, photographs, pricing, or
                communication links made available or hosted on the Platform.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#222428] text-base mb-1">
                1.3 Limited Scope of Services
              </h3>
              <p>
                STORENT.SI website sole functionality is to provide a subscription-based advertising
                space for Equipment Owners (&quot;Listings&quot;) and display publicly accessible or unlocked
                contact information to prospective Hirers/Users (&quot;Seekers&quot;).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#34373C]/15">
              <h4 className="font-bold text-[#222428] text-xs uppercase tracking-wider mb-2 text-red-700">
                Explicit Limitations — STORENT.SI website does NOT:
              </h4>
              <ul className="space-y-2 text-xs text-[#34373C]">
                <li className="flex items-start space-x-2">
                  <span className="font-black text-red-600">✕</span>
                  <span>Initiate, control, or select the receiver of any transmission or transaction.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-black text-red-600">✕</span>
                  <span>Select, modify, or verify the information contained in any third-party listing.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-black text-red-600">✕</span>
                  <span>Possess, inspect, manage, store, transport, lease, or deliver any equipment or machinery.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-black text-red-600">✕</span>
                  <span>
                    Process, hold, collect, or mediate rental payments, security deposits, or booking fees
                    between Hirers and Equipment Owners.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Disclaimer of Warranties */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#34373C]/15 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-[#34373C]/10">
            <div className="p-2.5 rounded-xl bg-[#FCC837]/20 text-[#222428] font-black">
              2.0
            </div>
            <h2 className="text-xl font-black text-[#222428]">
              Complete Disclaimer of Machinery &amp; Transaction Liability
            </h2>
          </div>

          <div className="space-y-4 text-sm text-[#34373C] leading-relaxed">
            <div>
              <h3 className="font-bold text-[#222428] text-base mb-1">
                2.1 &quot;As-Is&quot; Listings
              </h3>
              <p>
                All equipment descriptions, technical specifications, photographs, locations,
                availability statuses, and pricing information displayed on STORENT.SI are uploaded
                solely by third-party Equipment Owners. STORENT.SI makes no representations,
                guarantees, or warranties (express or implied) regarding:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-[#34373C]/90">
                <li>The accuracy, truthfulness, or completeness of any listing detail.</li>
                <li>The legal title, ownership status, or authorization of the Owner to rent the equipment.</li>
                <li>
                  The physical condition, fitness for purpose, mechanical soundness, safety, age, or
                  roadworthiness of any listed equipment or vehicle.
                </li>
                <li>
                  The existence or validity of necessary government permits, registration certificates
                  (RC), road tax compliance, pollution certificates (PUC), or insurance policies (including
                  Contractor&apos;s Plant &amp; Machinery insurance or Third-Party Liability insurance).
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FCC837]/10 border border-[#FCC837]/40">
              <h3 className="font-bold text-[#222428] text-sm mb-1 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-[#222428]" />
                <span>2.2 Independent Verification Mandatory</span>
              </h3>
              <p className="text-xs text-[#34373C] mt-1 leading-relaxed">
                Users and prospective Hirers acknowledge and agree that unlocking or obtaining the
                contact details of an Equipment Owner is done entirely at their own risk. Users are
                strictly advised to conduct independent due diligence, physical inspections, document
                verifications, and execution of formal written contracts directly with the Equipment Owner
                prior to making any financial payment or taking delivery of any equipment.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#222428] text-base mb-1">
                2.3 Exclusion of Damages
              </h3>
              <p>
                Under no circumstances shall STORENT.SI as entity, directors, officers, employees,
                agents, or affiliates be held liable for any direct, indirect, incidental,
                consequential, special, punitive, or exemplary damages arising out of or in connection with:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-[#34373C]/90">
                <li>Any transaction, negotiation, agreement, or interaction between Hirers and Equipment Owners.</li>
                <li>
                  Non-delivery, delayed delivery, machinery breakdown, site accidents, personal injury,
                  property damage, or loss of life associated with any listed equipment.
                </li>
                <li>Payment defaults, non-refund of security deposits, fraud, or misrepresentation by either party.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: User Indemnification & Grievance Redressal */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#34373C]/15 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-[#34373C]/10">
            <div className="p-2.5 rounded-xl bg-[#FCC837]/20 text-[#222428] font-black">
              3.0
            </div>
            <h2 className="text-xl font-black text-[#222428]">
              User Indemnification &amp; Statutory Grievance Redressal
            </h2>
          </div>

          <div className="space-y-4 text-sm text-[#34373C] leading-relaxed">
            <div>
              <h3 className="font-bold text-[#222428] text-base mb-1">
                3.1 Indemnification Clause
              </h3>
              <p>
                Both Equipment Owners and Hirers agree to defend, indemnify, and hold harmless
                STORENT.SI website, its parent entity, directors, officers, and employees from and
                against any claims, liabilities, losses, demands, damages, expenses, or legal fees
                (including reasonable attorneys&apos; fees) resulting from or arising out of:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-[#34373C]/90">
                <li>Use of or reliance on the STORENT.SI listing directory.</li>
                <li>Breach of any agreement executed independently between Hirer and Owner.</li>
                <li>
                  Any violation of applicable municipal, state, or national laws, including machinery
                  safety standards and transportation regulations.
                </li>
              </ul>
            </div>

            {/* Grievance Redressal Officer Card */}
            <div className="p-6 rounded-2xl bg-[#181A1D] text-white border border-[#34373C] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#34373C]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FCC837]">
                    Compliance with Rule 3(2) IT Rules, 2021
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Designated Grievance Redressal Officer
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-[#FCC837] text-[#222428] flex items-center justify-center font-black">
                  <UserCheck className="h-5 w-5" />
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines
                and Digital Media Ethics Code) Rules, 2021, any user or interested party who believes a
                listing violates applicable law, infringes intellectual property, or contains
                fraudulent content may report the listing to our designated Grievance Officer:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#222428] border border-[#34373C]">
                  <div className="text-[10px] uppercase font-bold text-[#FCC837]">Grievance Officer</div>
                  <div className="font-black text-white text-sm mt-0.5">Rajesh V. Kulkarni</div>
                  <div className="text-white/70 text-[11px]">Grievance &amp; Legal Compliance Officer</div>
                </div>

                <div className="p-3 rounded-xl bg-[#222428] border border-[#34373C]">
                  <div className="text-[10px] uppercase font-bold text-[#FCC837]">Official Email</div>
                  <a
                    href="mailto:grievance@storent.si"
                    className="font-black text-white text-sm mt-0.5 hover:text-[#FCC837] transition block"
                  >
                    grievance@storent.si
                  </a>
                  <div className="text-white/70 text-[11px]">Response timeline: Within 36-48 hours</div>
                </div>

                <div className="p-3 rounded-xl bg-[#222428] border border-[#34373C]">
                  <div className="text-[10px] uppercase font-bold text-[#FCC837]">Toll-Free Helpline</div>
                  <div className="font-black text-white text-sm mt-0.5">1800-889-STORENT</div>
                  <div className="text-white/70 text-[11px]">Mon-Sat, 9:00 AM - 6:00 PM IST</div>
                </div>

                <div className="p-3 rounded-xl bg-[#222428] border border-[#34373C]">
                  <div className="text-[10px] uppercase font-bold text-[#FCC837]">Registered Office Address</div>
                  <div className="font-black text-white text-xs mt-0.5">
                    Sector 37 Industrial Corridor, Gurugram, Haryana - 122001, India
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-white/60 pt-2 italic">
                Upon receipt of a valid and lawful notice, STORENT.SI reserves the right to remove or
                disable access to the relevant material within the statutory timelines prescribed under
                the Information Technology Rules.
              </p>
            </div>
          </div>
        </div>

        {/* Back and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#34373C]/15 text-xs">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-[#222428] text-white hover:bg-[#34373C] font-bold transition border border-[#34373C]"
          >
            ← Return to Homepage
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to="/browse"
              className="px-5 py-2.5 rounded-xl bg-[#FCC837] text-[#222428] font-black uppercase tracking-wider hover:bg-[#F0BA28] transition border border-[#E6B01B]"
            >
              Browse Equipment Directory
            </Link>
            <Link
              to="/plans"
              className="px-5 py-2.5 rounded-xl bg-white text-[#222428] font-bold border border-[#34373C]/20 hover:bg-slate-50 transition"
            >
              Owner Listing Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeHarborPage;

