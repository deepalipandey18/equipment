import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Search,
  PlusCircle,
  Truck,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Zap,
  Boxes,
  RotateCw,
  Container,
  Activity,
  Compass,
  Star,
  ExternalLink,
} from 'lucide-react';

const categoryIcons = {
  'jcb-excavators': Truck,
  'cranes-lifting': Container,
  'generators-power': Zap,
  'tractors-farm': Truck,
  'concrete-mixers': RotateCw,
  'forklifts-handling': Boxes,
  'tools-compaction': Wrench,
  'dump-trucks': Truck,
};

const showcaseItems = [
  {
    id: 'excavator',
    title: 'Caterpillar 320D & JCB 3DX Fleet',
    category: 'Earthmoving & Digging',
    rate: '₹8,500/day',
    location: 'Gurugram, Haryana',
    distance: '2.4 km away',
    image:
      'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=900&auto=format&fit=crop&q=80',
    specs: 'Bucket: 1.0 m³ • Certified Operator • CPCB Compliant',
    tag: 'Highest Demand',
  },
  {
    id: 'crane',
    title: 'Hydraulic Mobile Telescopic Cranes',
    category: 'Heavy Lifting & Aerial',
    rate: '₹14,000/day',
    location: 'Noida, Uttar Pradesh',
    distance: '5.1 km away',
    image:
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=900&auto=format&fit=crop&q=80',
    specs: 'Boom Length: 38m • Capacity: 25-50 Ton • Load Chart Verified',
    tag: 'Infrastructure Verified',
  },
  {
    id: 'generator',
    title: 'Kirloskar Silent Diesel Generators',
    category: 'Continuous Site Power',
    rate: '₹4,200/day',
    location: 'Saket, New Delhi',
    distance: '3.8 km away',
    image:
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=900&auto=format&fit=crop&q=80',
    specs: 'Prime Power: 125 kVA • Acoustic Enclosure • Low Fuel Burn',
    tag: 'Instant Dispatch',
  },
];

const LandingPage = () => {
  const { user, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll position state for dynamic scroll-driven animation
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const handleRegisterClick = () => {
    if (!user) {
      navigate('/login?redirect=/equipment/register');
    } else if (!hasActiveSubscription) {
      navigate('/plans?reason=subscription_required');
    } else {
      navigate('/equipment/register');
    }
  };

  // Dynamic parallax calculation
  const heroTilt = Math.min(12, Math.max(0, scrollY * 0.04));
  const heroTranslateY = Math.min(80, scrollY * 0.18);
  const heroScale = Math.min(1.04, 1 + scrollY * 0.0002);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      {/* Hero Section with Scroll-Animated Full Background Image */}
      <section className="relative bg-slate-950 text-white overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-slate-800">
        {/* Full-bleed JCB Background Image with Entrance Zoom, Continuous Ambient Animation & Scroll Parallax */}
        <div
          className="absolute inset-0 w-full h-[125%] -top-[12%] pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.32}px, 0) scale(${1.02 + scrollY * 0.0006})`,
          }}
        >
          <div
            className="w-full h-full bg-cover bg-no-repeat will-change-transform animate-jcb-full-motion"
            style={{
              backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/JCB_3CX_ECO_backhoe_loader_at_VDNKh%2C_Moscow.jpg/2560px-JCB_3CX_ECO_backhoe_loader_at_VDNKh%2C_Moscow.jpg')`,
              backgroundPosition: 'center 50%',
              filter: 'brightness(0.75) contrast(1.15)',
            }}
          />
        </div>

        {/* Multi-layer Dark Cinematic Overlays: Balanced for Deep Moody Contrast while keeping the JCB clearly visible */}
        <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/70 to-slate-950/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/70 pointer-events-none" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -right-32 w-[35rem] h-[35rem] rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-40 left-1/4 w-[30rem] h-[30rem] rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm animate-hero-fade-in">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                <span>Bharat's Trusted Heavy Machinery Network</span>
              </div>

              {/* Heading: Smooth Fade-in on load */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none animate-hero-fade-in-delay-1 drop-shadow-lg">
                Rent or List Heavy Equipment <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-brand-400 to-amber-500">
                  With One Single Account.
                </span>
              </h1>

              {/* Subheading: Smooth Fade-in delay */}
              <p className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl animate-hero-fade-in-delay-2 drop-shadow">
                Find JCBs, crawler excavators, cranes, silent generators, and tractors with GPS radar.
                Or list your machines, enforce subscription limits, and collect rental revenue through secure escrow.
              </p>

              {/* Quick Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="mt-8 flex flex-col sm:flex-row items-stretch gap-2.5 max-w-2xl bg-slate-900/60 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl animate-hero-fade-in-delay-2"
              >
                <div className="flex-1 flex items-center bg-white rounded-xl px-3.5 py-2.5">
                  <Search className="h-5 w-5 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search JCB 3DX, 25 Ton Crane, 125 kVA Generator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 font-bold text-sm rounded-xl text-white shadow-lg shadow-brand-500/30 transition flex items-center justify-center space-x-2 shrink-0"
                >
                  <span>Find Machinery</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Dual CTAs & Action Buttons: Delayed appearance */}
              <div className="mt-8 flex flex-wrap items-center gap-4 animate-hero-fade-in-delay-3">
                <Link
                  to="/browse"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-sm font-bold text-white transition shadow-sm backdrop-blur-md hover:border-slate-500"
                >
                  <Search className="h-4 w-4 text-amber-400" />
                  <span>Rent Equipment</span>
                </Link>

                <button
                  onClick={handleRegisterClick}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/25"
                >
                  <PlusCircle className="h-4 w-4 text-slate-950" />
                  <span>List Your Equipment</span>
                </button>

                <Link
                  to="/plans"
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white transition px-2 py-1"
                >
                  <span>Listing Plans from ₹499/mo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: Translucent Glassmorphism Live Machine Radar & Telemetry HUD (Over the Full JCB Background) */}
            <div className="lg:col-span-5 relative perspective-1000 mt-6 lg:mt-0 animate-hero-zoom-in">
              <div
                className="relative rounded-3xl p-6 sm:p-7 bg-slate-950/40 backdrop-blur-xl border border-white/20 shadow-2xl transition-transform duration-300 ease-out preserve-3d"
                style={{
                  transform: `perspective(1000px) rotateX(${heroTilt}deg) rotateY(-${heroTilt * 0.6}deg) translateY(${heroTranslateY}px) scale(${heroScale})`,
                }}
              >
                {/* HUD Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Live On-Site Telemetry</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">NCR Fleet Radar</span>
                </div>

                {/* Machine Name & Class */}
                <div className="mt-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    JCB 3DX Super EcoXcellence
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Heavy Earthmoving • Hydraulic Backhoe Loader
                  </p>
                </div>

                {/* 3-Col Quick Technical Specs */}
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Engine</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">76 HP Turbo</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Bucket</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">1.1 m³ HD</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Dig Depth</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">4.77 m</div>
                  </div>
                </div>

                {/* Live Distance & Verification Row */}
                <div className="mt-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-black text-white">2.4 km away</span>
                      </div>
                      <div className="text-[10px] text-emerald-300/80 font-medium">
                        MongoDB 2dsphere GPS Proximity
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white">₹8,500<span className="text-[10px] text-slate-300 font-normal">/day</span></div>
                    <div className="text-[10px] text-slate-400">Escrow Secured</div>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-slate-300 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Certified Operator Included</span>
                  </span>
                  <Link
                    to="/browse?search=JCB"
                    className="inline-flex items-center space-x-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                  >
                    <span>View Machine</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Floating Parallax Badge 1: GPS Radar (Top-Left) */}
                <div
                  className="absolute -top-5 -left-5 bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center space-x-2.5 animate-float-slow"
                  style={{
                    transform: `translateY(${scrollY * -0.1}px)`,
                  }}
                >
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-black">GPS Radar Active</span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      Real Coordinates
                    </div>
                  </div>
                </div>

                {/* Floating Parallax Badge 2: Escrow Protection (Bottom-Right) */}
                <div
                  className="absolute -bottom-5 -right-5 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center space-x-2.5 animate-float-reverse"
                  style={{
                    transform: `translateY(${scrollY * -0.07}px)`,
                  }}
                >
                  <div className="h-8 w-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Razorpay Escrow
                    </div>
                    <div className="text-xs font-black text-amber-400">
                      100% Payment Shield
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Bar */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="border-r border-slate-100 last:border-none">
              <div className="text-2xl font-black text-slate-900">100%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Verified Machine Owners</div>
            </div>
            <div className="border-r border-slate-100 last:border-none">
              <div className="text-2xl font-black text-brand-600">2dsphere</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">GPS Nearby Radar Search</div>
            </div>
            <div className="border-r border-slate-100 last:border-none">
              <div className="text-2xl font-black text-slate-900">Escrow</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Razorpay Test Payments</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">0%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Double-Booking Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED SCROLL ANIMATION SHOWCASE: "Fleet in Motion" */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Activity className="h-3.5 w-3.5" />
                <span>Heavy Machinery in Motion</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Scroll Through Our Active Construction Fleet
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                Real equipment available across major project corridors. Every machine is inspected,
                CPCB certified, and backed by direct owner coordination.
              </p>
            </div>

            <Link
              to="/browse"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold uppercase tracking-wider transition self-start md:self-auto shadow-md shadow-brand-600/30"
            >
              <span>Explore All 8 Categories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 3 Interactive Cards Animating with Scroll Perspective */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {showcaseItems.map((item, idx) => {
              // Dynamic stagger effect on scroll
              const cardOffset = Math.sin((scrollY * 0.003) + idx) * 10;
              const cardScale = Math.min(1.03, 0.98 + (scrollY > 300 ? 0.03 : 0));

              return (
                <div
                  key={item.id}
                  className="relative rounded-3xl bg-slate-800/80 border border-slate-700 overflow-hidden shadow-2xl hover:border-brand-500 transition-all duration-500 group flex flex-col justify-between"
                  style={{
                    transform: `translateY(${cardOffset}px) scale(${cardScale})`,
                  }}
                >
                  {/* Photo Container */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                    {/* Tag Badge */}
                    <div className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      {item.tag}
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.distance}</span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-black text-white mt-0.5 line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {item.specs}
                    </p>

                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">Daily Hire</span>
                        <div className="text-xl font-black text-amber-400">{item.rate}</div>
                      </div>

                      <Link
                        to="/browse"
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5"
                      >
                        <span>Check Dates</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Explorer */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Browse Machinery Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Earthmoving, lifting, generation, and heavy construction fleets available for rent.
            </p>
          </div>
          <Link
            to="/browse"
            className="mt-3 sm:mt-0 text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Wrench;
            return (
              <Link
                key={cat._id || cat.slug}
                to={`/browse?category=${cat.slug}`}
                className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-11 w-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                  <span>Explore listings</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Value Proposition: Dual-Role Model */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">
              One Unified Account for Contractors & Fleet Owners
            </h2>
            <p className="mt-3 text-slate-600 text-sm">
              No need to switch between owner and customer profiles. Your single login gives you
              full access to rent machines or accept booking requests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Box 1: For Renters */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-4">
                  Option A: Rent Equipment
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Find Machines For Your Project Site
                </h3>
                <ul className="space-y-3 text-sm text-slate-600 mb-6">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Search by your GPS coordinates with real distance in km</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Hourly, daily, and monthly rates with clear operator options</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Real-time availability calendar preventing double-bookings</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/browse"
                className="w-full py-2.5 px-4 text-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition"
              >
                Browse Marketplace
              </Link>
            </div>

            {/* Box 2: For Machine Owners */}
            <div className="bg-white p-8 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-4">
                  Option B: Register Equipment
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Monetize Idle Machinery & Tools
                </h3>
                <ul className="space-y-3 text-sm text-slate-600 mb-6">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Choose affordable subscription plans starting at ₹499/mo</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Receive direct booking requests and review renter profiles</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Keep 100% of agreed rental earnings with automated invoices</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleRegisterClick}
                className="w-full py-2.5 px-4 text-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition shadow-sm"
              >
                Subscribe & List Equipment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
