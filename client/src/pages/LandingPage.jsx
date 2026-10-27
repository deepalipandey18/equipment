import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StorentLogo from '../components/common/StorentLogo';
import Cartoon3DHeroStage from '../components/common/Cartoon3DHeroStage';
import { getIllustrationForEquipment } from '../components/common/EquipmentIllustration';
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
  Tag,
  Scale,
  Lock,
} from 'lucide-react';

// 3D Cartoon Illustrations Showcase Items
const showcaseItems = [
  {
    id: 'excavator',
    title: 'Caterpillar 320D & JCB 3DX Fleet',
    category: 'Construction',
    rate: '₹8,500/day',
    location: 'Gurugram, Haryana',
    distance: '2.4 km away',
    image: '/images/illustrations/jcb-excavator.svg',
    specs: 'Bucket: 1.0 m³ • Certified Operator • CPCB Compliant',
    tag: 'Highest Demand',
  },
  {
    id: 'crane',
    title: 'Hydraulic Mobile Telescopic Cranes',
    category: 'Construction & Lifting',
    rate: '₹14,000/day',
    location: 'Noida, Uttar Pradesh',
    distance: '5.1 km away',
    image: '/images/illustrations/crane.svg',
    specs: 'Boom Length: 38m • Capacity: 25-50 Ton • Load Chart Verified',
    tag: 'Infrastructure Verified',
  },
  {
    id: 'generator',
    title: 'Kirloskar Silent Diesel Generators',
    category: 'Industrial Power',
    rate: '₹4,200/day',
    location: 'Saket, New Delhi',
    distance: '3.8 km away',
    image: '/images/illustrations/generator.svg',
    specs: 'Prime Power: 125 kVA • Acoustic Enclosure • Low Fuel Burn',
    tag: 'Instant Dispatch',
  },
];

const HERO_SCENES = [
  {
    id: 'truck',
    title: 'Heavy Haulage Tipper',
    shortLabel: 'Dump Truck',
    icon: Truck,
    badge: 'Mining & Transport 3D Stream',
    name: 'BharatBenz 3528C Heavy Tipper',
    category: 'Transport & Haulage • 28 Ton Heavy Dump Truck',
    illustration: '/images/illustrations/dump-truck.svg',
    specs: [
      { label: 'Engine', value: '280 HP Turbo' },
      { label: 'Box Volume', value: '18 m³ HD Box' },
      { label: 'Payload', value: '28,000 kg' },
    ],
    distance: '1.8 km away',
    rate: '₹9,200',
    unit: '/day',
    operatorStatus: 'Certified Heavy Driver Included',
  },
  {
    id: 'jcb',
    title: 'JCB 3DX Excavator',
    shortLabel: 'JCB Backhoe',
    icon: Wrench,
    badge: 'Construction Earthmoving 3D Digging',
    name: 'JCB 3DX Super EcoXcellence',
    category: 'Construction • Hydraulic Backhoe Loader',
    illustration: '/images/illustrations/jcb-excavator.svg',
    specs: [
      { label: 'Engine', value: '76 HP Turbo' },
      { label: 'Bucket', value: '1.1 m³ HD' },
      { label: 'Dig Depth', value: '4.77 m' },
    ],
    distance: '2.4 km away',
    rate: '₹8,500',
    unit: '/day',
    operatorStatus: 'Certified Operator Included',
  },
  {
    id: 'crane',
    title: 'Hydraulic Mobile Crane',
    shortLabel: '25T Crane',
    icon: Container,
    badge: 'Heavy Lifting 3D Slewing',
    name: 'ACE 25X Mobile Telescopic Crane',
    category: 'Construction & Aerial • 25 Ton Telescopic Boom',
    illustration: '/images/illustrations/crane.svg',
    specs: [
      { label: 'Boom Reach', value: '34.5 m Reach' },
      { label: 'Capacity', value: '25 Ton Safe Load' },
      { label: 'Hoist Winch', value: '4-Fall Wire Hoist' },
    ],
    distance: '3.1 km away',
    rate: '₹14,500',
    unit: '/day',
    operatorStatus: 'Load Chart & Rigger Certified',
  },
];

// Exact 7 Primary Categories specified in STORENT guidelines
const DEFAULT_CATEGORIES = [
  {
    name: 'Construction',
    slug: 'construction',
    description: 'Backhoe loaders, crawler excavators, mobile cranes, and transit mixers for building sites.',
    illustration: '/images/illustrations/jcb-excavator.svg',
  },
  {
    name: 'Transport',
    slug: 'transport',
    description: 'Heavy tipper dump trucks, multi-axle trailers, and bulk material haulage vehicles.',
    illustration: '/images/illustrations/dump-truck.svg',
  },
  {
    name: 'Industrial',
    slug: 'industrial',
    description: 'Diesel silent generator sets (15 kVA to 500+ kVA), site compressors, and continuous power.',
    illustration: '/images/illustrations/generator.svg',
  },
  {
    name: 'Marine',
    slug: 'marine',
    description: 'Barges, winches, dredging pumps, and port material handling equipment.',
    illustration: '/images/illustrations/crane.svg',
  },
  {
    name: 'Road Works',
    slug: 'road-works',
    description: 'Vibratory road rollers, soil compactors, asphalt pavers, and motor graders for highways.',
    illustration: '/images/illustrations/road-roller.svg',
  },
  {
    name: 'Warehouse',
    slug: 'warehouse',
    description: 'Diesel and electric forklifts, reach stackers, pallet trucks, and order pickers.',
    illustration: '/images/illustrations/forklift.svg',
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'High-torque farm tractors, rotavators, harvesters, and agricultural earth tillers.',
    illustration: '/images/illustrations/tractor.svg',
  },
];

const LandingPage = () => {
  const { user, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Scroll position state for dynamic scroll-driven animation
  const [scrollY, setScrollY] = useState(0);

  // Multi-machine sequential showcase (Truck ➔ JCB ➔ Crane ➔ Loop)
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const changeScene = (nextIdx) => {
    if (nextIdx === activeSceneIndex) return;
    setActiveSceneIndex(nextIdx);
  };

  // Relaxed 8.5-second timer with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % HERO_SCENES.length);
    }, 8500);
    return () => clearInterval(timer);
  }, []);

  const currentScene = HERO_SCENES[activeSceneIndex];

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
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          // If server categories have the 7 primary or legacy, merge smoothly
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
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate(`/browse?${params.toString()}`);
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col overflow-x-hidden">
      {/* Hero Section: 50/50 Equal Balance (Left Content + Right Borderless Aesthetic 3D Stage) */}
      <section className="relative bg-[#181A1D] text-white overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-[#34373C]">
        {/* Ambient Dark Charcoal Background with Isometric Floor & Glow */}
        <div className="absolute inset-0 bg-[#141619] pointer-events-none overflow-hidden">
          {/* Isometric Perspective Grid */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 opacity-15"
            style={{
              backgroundImage: `
                linear-gradient(to right, #FCC837 1px, transparent 1px),
                linear-gradient(to bottom, #FCC837 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
              transform: 'perspective(600px) rotateX(65deg) scale(2)',
              transformOrigin: 'center bottom',
            }}
          />
          {/* Ambient Golden Glow Orbs */}
          <div className="absolute -top-32 -right-32 w-[35rem] h-[35rem] rounded-full bg-[#FCC837]/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/4 w-[30rem] h-[30rem] rounded-full bg-[#FCC837]/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (6 cols): 50% Equal Balance */}
            <div className="lg:col-span-6 xl:col-span-6 z-10 flex flex-col justify-center">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FCC837] border border-[#E6B01B] text-[#222428] text-xs font-black uppercase tracking-wider mb-3.5 shadow-lg shadow-[#FCC837]/20 self-start animate-hero-fade-in">
                <span className="h-2 w-2 rounded-full bg-[#222428] animate-ping mr-1" />
                <span>STORENT.SI • Heavy Machinery Listing Directory</span>
              </div>

              {/* Luxury Editorial Heading: Cormorant Garamond */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight leading-tight sm:leading-none animate-hero-fade-in-delay-1 drop-shadow-lg text-white">
                Find the right Equipments <br />
                <span className="text-[#FCC837]">
                  for your next PROJECT.
                </span>
              </h1>

              {/* Subheading */}
              <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed font-normal max-w-xl animate-hero-fade-in-delay-2 drop-shadow">
                India&apos;s digital directory connecting contracting companies and equipment owners.
                Search by keyword or city, verify mobile OTP, and unlock direct owner contacts.
              </p>

              {/* Search Window with Custom Filters (Keyword + Location) */}
              <form
                onSubmit={handleSearchSubmit}
                className="mt-7 flex flex-col sm:flex-row items-stretch gap-2 max-w-xl bg-[#222428]/90 p-2.5 rounded-2xl backdrop-blur-md border border-[#34373C] shadow-2xl animate-hero-fade-in-delay-2"
              >
                {/* Keyword Filter */}
                <div className="flex-1 flex items-center bg-white rounded-xl px-3 py-2.5 min-w-0">
                  <Search className="h-4 w-4 text-[#34373C]/60 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="JCB 3DX, Crane, Generator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-[#222428] placeholder-[#34373C]/50 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                {/* Location Filter (City / State) */}
                <div className="sm:w-44 flex items-center bg-white rounded-xl px-3 py-2.5 min-w-0">
                  <MapPin className="h-4 w-4 text-[#FCC837] mr-1.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="City or State"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full text-[#222428] placeholder-[#34373C]/50 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs sm:text-sm rounded-xl text-[#222428] border border-[#E6B01B] shadow-lg shadow-[#FCC837]/30 transition flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Dual Hero CTAs: "Rent equipment" and "List equipment" as required */}
              <div className="mt-7 flex flex-wrap items-center gap-3.5 animate-hero-fade-in-delay-3">
                <Link
                  to="/browse?listingType=rent"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#222428] hover:bg-[#34373C] border border-[#34373C] text-sm font-black text-[#FCC837] transition shadow-sm backdrop-blur-md"
                >
                  <Search className="h-4 w-4 text-[#FCC837]" />
                  <span>Rent equipment</span>
                </Link>

                <button
                  onClick={handleRegisterClick}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-sm border border-[#E6B01B] transition-all duration-300 shadow-xl shadow-[#FCC837]/25"
                >
                  <PlusCircle className="h-4 w-4 text-[#222428]" />
                  <span>List equipment</span>
                </button>

                <Link
                  to="/safe-harbor"
                  className="inline-flex items-center space-x-1.5 text-xs text-white/70 hover:text-[#FCC837] transition px-2 py-1"
                >
                  <Scale className="h-3.5 w-3.5 text-[#FCC837]" />
                  <span>Section 79 Safe Harbor</span>
                </Link>
              </div>

              {/* Interactive Multi-Machine Sequence Selector (Truck ➔ JCB ➔ Crane) */}
              <div className="mt-7 flex flex-wrap items-center gap-2 animate-hero-fade-in-delay-3">
                <span className="text-xs font-bold text-white/60 mr-1 uppercase tracking-wider">
                  Live Fleet View:
                </span>
                <div className="inline-flex p-1 bg-[#222428] backdrop-blur-md rounded-xl border border-[#34373C]">
                  {HERO_SCENES.map((scene, idx) => {
                    const isSelected = activeSceneIndex === idx;
                    const SceneIcon = scene.icon;
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => changeScene(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-500 ease-in-out flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-[#FCC837] text-[#222428] shadow-md shadow-[#FCC837]/25 font-black'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <SceneIcon className={`h-3.5 w-3.5 transition-colors duration-500 ${isSelected ? 'text-[#222428]' : 'text-[#FCC837]'}`} />
                        <span>{scene.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (6 cols): Borderless Ultra-Aesthetic 3D Showcase Arena (50% Equal Balance) */}
            <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]">
              {/* Soft Ethereal Center Spotlight Aura */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] sm:w-[32rem] sm:h-[32rem] rounded-full bg-[#FCC837]/15 blur-[120px] pointer-events-none animate-pulse-glow" />

              {/* Seamless Ground Perspective Grid with Soft Vignette Fade */}
              <div
                className="absolute inset-x-0 bottom-4 h-60 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #FCC837 1px, transparent 1px),
                    linear-gradient(to bottom, #FCC837 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                  transform: 'perspective(450px) rotateX(65deg) scale(1.8)',
                  transformOrigin: 'center bottom',
                  maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 75%)',
                }}
              />

              {/* Borderless 3D Animated Stage Canvas */}
              <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] flex items-center justify-center select-none">
                <Cartoon3DHeroStage activeSceneId={currentScene.id} showBackground={false} />
              </div>

              {/* Floating Minimalist Top Status Pill */}
              <div className="absolute top-3 right-4 flex items-center space-x-2 pointer-events-none z-20">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#181A1D]/80 backdrop-blur-md border border-[#FCC837]/30 text-[#FCC837] text-[10px] font-black uppercase tracking-wider shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FCC837] animate-ping" />
                  <span>3D Simulation Fleet</span>
                </div>
              </div>

              {/* Floating Minimalist Bottom Machine Tag */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
                <div className="bg-[#181A1D]/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#34373C]/70 shadow-lg flex items-center space-x-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#FCC837]" />
                  <div>
                    <div className="text-xs font-black text-white">{currentScene.name}</div>
                    <div className="text-[10px] text-[#FCC837] font-semibold">{currentScene.category}</div>
                  </div>
                </div>

                <div className="bg-[#181A1D]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#34373C]/70 text-[10px] font-bold text-white/70">
                  Model 100% Match
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Bar with Intermediary & OTP Highlights */}
      <section className="bg-white border-b border-[#34373C]/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="border-r border-[#34373C]/10 last:border-none">
              <div className="text-2xl font-black text-[#222428]">100%</div>
              <div className="text-xs text-[#34373C]/70 font-medium mt-0.5">Verified Machine Owners (RC Verified)</div>
            </div>
            <div className="border-r border-[#34373C]/10 last:border-none">
              <div className="text-2xl font-black text-[#222428]">2dsphere</div>
              <div className="text-xs text-[#34373C]/70 font-medium mt-0.5">GPS Nearby Radar Search</div>
            </div>
            <div className="border-r border-[#34373C]/10 last:border-none">
              <div className="text-2xl font-black text-[#222428]">OTP Unlock</div>
              <div className="text-xs text-[#34373C]/70 font-medium mt-0.5">Verified Contact Exchange</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#222428]">Section 79</div>
              <div className="text-xs text-[#34373C]/70 font-medium mt-0.5">Safe Harbor Intermediary Platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Buttons Explorer - 7 Categories as explicitly mandated by guidelines */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FCC837]/20 text-[#222428] border border-[#FCC837]/40 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Equipment Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222428]">
              Browse by Industry 
            </h2>
            <p className="text-sm text-[#34373C]/70 mt-1">
              Select any of the 7 industry sectors to find available equipment near your site.
            </p>
          </div>
          <Link
            to="/browse"
            className="mt-3 sm:mt-0 text-sm font-bold text-[#222428] hover:underline flex items-center space-x-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4 text-[#FCC837]" />
          </Link>
        </div>

        {/* 7 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {DEFAULT_CATEGORIES.map((cat) => {
            const illustrationSrc = cat.illustration || getIllustrationForEquipment(cat.name, cat.slug);
            return (
              <Link
                key={cat.slug}
                to={`/browse?category=${cat.slug}`}
                className="group p-5 bg-white rounded-2xl border border-[#34373C]/15 hover:border-[#FCC837] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* 3D Illustration Frame */}
                  <div className="h-36 w-full rounded-xl bg-gradient-to-b from-[#F8F9FA] to-[#ECEEF0] border border-[#34373C]/10 mb-4 p-3 flex items-center justify-center group-hover:border-[#FCC837] group-hover:bg-[#FCC837]/10 transition-all duration-300 overflow-hidden relative">
                    <img
                      src={illustrationSrc}
                      alt={cat.name}
                      className="h-28 w-28 object-contain group-hover:scale-115 group-hover:-translate-y-1 transition-all duration-300 drop-shadow-md group-hover:drop-shadow-[0_12px_20px_rgba(252,200,55,0.35)]"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-base text-[#222428] group-hover:text-black transition flex items-center justify-between">
                    <span>{cat.name}</span>
                    <span className="text-[10px] font-bold text-[#34373C]/50 uppercase">Category</span>
                  </h3>
                  <p className="text-xs text-[#34373C]/70 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#34373C]/10 flex items-center justify-between text-xs font-bold text-[#222428]">
                  <span>Explore listings</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#FCC837] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Dedicated Showcase Section: "Fleet in Motion" */}
      <section className="py-20 bg-[#181A1D] text-white relative overflow-hidden border-b border-[#34373C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FCC837]/20 text-[#FCC837] border border-[#FCC837]/40 text-xs font-bold uppercase tracking-wider mb-3">
                <Activity className="h-3.5 w-3.5" />
                <span>3D Heavy Machinery Fleet</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Scroll Through Our Active Construction Fleet
              </h2>
              <p className="text-sm text-white/70 mt-2 max-w-2xl">
                Equipment available across major infrastructure corridors. Verified owners,
                transparent specifications, and direct mobile OTP unlock.
              </p>
            </div>

            <Link
              to="/browse"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] text-xs font-black uppercase tracking-wider transition self-start md:self-auto shadow-md border border-[#E6B01B]"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 3 Interactive Cards Animating with Scroll Perspective */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {showcaseItems.map((item, idx) => {
              const cardOffset = Math.sin((scrollY * 0.003) + idx) * 10;
              const cardScale = Math.min(1.03, 0.98 + (scrollY > 300 ? 0.03 : 0));

              return (
                <div
                  key={item.id}
                  className="relative rounded-3xl bg-[#222428] border border-[#34373C] overflow-hidden shadow-2xl hover:border-[#FCC837] transition-all duration-500 group flex flex-col justify-between"
                  style={{
                    transform: `translateY(${cardOffset}px) scale(${cardScale})`,
                  }}
                >
                  <div className="relative h-64 w-full overflow-hidden bg-gradient-to-b from-[#181A1D] to-[#222428] flex items-center justify-center p-6">
                    <div
                      className="absolute inset-x-0 bottom-0 h-24 opacity-25 pointer-events-none"
                      style={{
                        backgroundImage: 'linear-gradient(to right, #FCC837 1px, transparent 1px), linear-gradient(to bottom, #FCC837 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                        transform: 'perspective(300px) rotateX(60deg)',
                        transformOrigin: 'bottom center',
                      }}
                    />

                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-115 group-hover:-translate-y-2 transition-all duration-500 drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_20px_35px_rgba(252,200,55,0.35)]"
                    />

                    <div className="absolute top-4 left-4 bg-[#FCC837] text-[#222428] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg border border-[#E6B01B] flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#222428] animate-pulse" />
                      <span>{item.tag}</span>
                    </div>

                    <div className="absolute top-4 right-4 bg-[#222428]/90 backdrop-blur-md text-[#FCC837] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#FCC837]/30 flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.distance}</span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 bg-[#181A1D]/85 backdrop-blur-sm p-2 rounded-xl border border-[#34373C]/60">
                      <span className="text-[10px] font-bold text-[#FCC837] uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h3 className="text-base font-black text-white mt-0.5 line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                      {item.specs}
                    </p>

                    <div className="pt-3 border-t border-[#34373C] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/60 uppercase">Daily Hire</span>
                        <div className="text-xl font-black text-[#FCC837]">{item.rate}</div>
                      </div>

                      <Link
                        to="/browse"
                        className="px-4 py-2 rounded-xl bg-[#34373C] hover:bg-[#FCC837] hover:text-[#222428] text-white text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 border border-[#34373C]"
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

      {/* Value Proposition: Intermediary Model & Dual Options */}
      <section className="bg-[#F8F9FA] py-16 border-y border-[#34373C]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-[#222428]">
              One Unified Account for Contractors &amp; Fleet Owners
            </h2>
            <p className="mt-3 text-[#34373C]/80 text-sm">
              Single sign-on allows you to hire machines or advertise your fleet.
              STORENT operates under Section 79 Safe Harbor as a pure digital directory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Box 1: For Hirers */}
            <div className="bg-white p-8 rounded-2xl border border-[#34373C]/15 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#222428] text-[#FCC837] mb-4">
                  For Hirers &amp; Contractors
                </div>
                <h3 className="text-xl font-bold text-[#222428] mb-3">
                  Find &amp; Rent Heavy Machinery
                </h3>
                <ul className="space-y-3 text-sm text-[#34373C] mb-6">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#FCC837] shrink-0 mt-0.5" />
                    <span>Search by GPS radius and location city/state</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#FCC837] shrink-0 mt-0.5" />
                    <span>Verify mobile OTP to unlock direct owner contact numbers</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#FCC837] shrink-0 mt-0.5" />
                    <span>Independent inspection &amp; direct contractor negotiations</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/browse?listingType=rent"
                className="w-full py-2.5 px-4 text-center rounded-lg bg-[#222428] hover:bg-[#34373C] text-[#FCC837] font-bold text-sm transition border border-[#34373C]"
              >
                Rent equipment
              </Link>
            </div>

            {/* Box 2: For Machine Owners */}
            <div className="bg-white p-8 rounded-2xl border border-[#FCC837]/50 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCC837]/10 rounded-bl-full pointer-events-none" />
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#FCC837] text-[#222428] mb-4">
                  For Equipment Owners
                </div>
                <h3 className="text-xl font-bold text-[#222428] mb-3">
                  Advertise Equipment for Rent or Sale
                </h3>
                <ul className="space-y-3 text-sm text-[#34373C] mb-6">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#222428] shrink-0 mt-0.5" />
                    <span>Subscription tiers with 18% GST inclusive tax invoices</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#222428] shrink-0 mt-0.5" />
                    <span>Instant SMS alert whenever a hirer unlocks your contact</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#222428] shrink-0 mt-0.5" />
                    <span>Upload RC book / purchase invoice to earn &quot;Verified Owner&quot; badge</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleRegisterClick}
                className="w-full py-2.5 px-4 text-center rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-sm transition-all duration-300 shadow-md shadow-[#FCC837]/25 border border-[#E6B01B]"
              >
                List equipment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
