import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StorentLogo from '../components/common/StorentLogo';
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

// 3D Cartoon Illustrations Showcase Items (100% matched to their equipment names)
const showcaseItems = [
  {
    id: 'excavator',
    title: 'Caterpillar 320D & JCB 3DX Fleet',
    category: 'Earthmoving & Digging',
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
    category: 'Heavy Lifting & Aerial',
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
    category: 'Continuous Site Power',
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
    badge: 'Mining & Aggregate Transport',
    name: 'BharatBenz 3528C Heavy Tipper',
    category: 'Mining & Road Construction • 28 Ton Heavy Dump Truck',
    illustration: '/images/illustrations/dump-truck.svg',
    bgImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=2400&auto=format&fit=crop&q=80',
    videoSources: [
      '/videos/truck-driving.mp4',
      '/videos/truck.mp4',
      '/videos/tipper.mp4',
      'https://raw.githubusercontent.com/AarohiSingla/Speed-detection-of-vehicles/main/highway_mini.mp4',
    ],
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
    badge: 'Heavy Earthmoving Active',
    name: 'JCB 3DX Super EcoXcellence',
    category: 'Heavy Earthmoving • Hydraulic Backhoe Loader',
    illustration: '/images/illustrations/jcb-excavator.svg',
    bgImage: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=2400&auto=format&fit=crop&q=80',
    videoSources: [
      '/videos/jcb.mp4',
      '/videos/jcb-working.mp4',
      '/videos/jcb-3dx.mp4',
      '/videos/excavator.mp4',
    ],
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
    badge: 'Infrastructure Heavy Lifting',
    name: 'ACE 25X Mobile Telescopic Crane',
    category: 'Heavy Lifting & Aerial • 25 Ton Telescopic Boom',
    illustration: '/images/illustrations/crane.svg',
    bgImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=2400&auto=format&fit=crop&q=80',
    videoSources: [
      '/videos/crane-working.mp4',
      '/videos/crane.mp4',
      '/videos/crane-lifting.mp4',
    ],
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

const DEFAULT_CATEGORIES = [
  { name: 'JCB & Excavators', slug: 'jcb-excavators', description: 'Backhoe loaders, mini excavators, and crawler excavators for earthmoving and digging.' },
  { name: 'Cranes & Lifting', slug: 'cranes-lifting', description: 'Hydraulic mobile cranes, tower cranes, and aerial lift boom trucks.' },
  { name: 'Generators & Power', slug: 'generators-power', description: 'Diesel silent generator sets (15 kVA to 500+ kVA) for construction and event power.' },
  { name: 'Tractors & Farm Machinery', slug: 'tractors-farm', description: 'Heavy duty tractors, rotavators, and agricultural earth preparation equipment.' },
  { name: 'Concrete Mixers', slug: 'concrete-mixers', description: 'Transit mixers, portable batching mixers, and concrete vibrators.' },
  { name: 'Forklifts & Material Handling', slug: 'forklifts-handling', description: 'Diesel, LPG, and electric forklifts, pallet trucks, and reach stackers.' },
  { name: 'Construction Tools & Compaction', slug: 'tools-compaction', description: 'Plate compactors, road rollers, jackhammers, and dewatering pumps.' },
  { name: 'Dump Trucks & Haulage', slug: 'dump-trucks', description: 'Tipper dump trucks and multi-axle heavy trailers for material transport.' },
];

const LandingPage = () => {
  const { user, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll position state for dynamic scroll-driven animation
  const [scrollY, setScrollY] = useState(0);

  // Multi-machine sequential showcase (Truck ➔ JCB ➔ Crane ➔ Loop)
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [hudFading, setHudFading] = useState(false);
  const [playingVideos, setPlayingVideos] = useState({});

  const handleVideoPlaying = (sceneId) => {
    setPlayingVideos((prev) => ({ ...prev, [sceneId]: true }));
  };

  const handleVideoError = (sceneId) => {
    setPlayingVideos((prev) => ({ ...prev, [sceneId]: false }));
  };

  const changeScene = (nextIdx) => {
    if (nextIdx === activeSceneIndex) return;
    setHudFading(true);
    setTimeout(() => {
      setActiveSceneIndex(nextIdx);
      setTimeout(() => setHudFading(false), 50);
    }, 450);
  };

  // Relaxed 8.5-second timer with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setHudFading(true);
      setTimeout(() => {
        setActiveSceneIndex((prev) => (prev + 1) % HERO_SCENES.length);
        setTimeout(() => setHudFading(false), 50);
      }, 450);
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col overflow-x-hidden">
      {/* Hero Section with Multi-Machine Cinematic Video Showcase (Truck ➔ JCB ➔ Crane) */}
      <section className="relative bg-[#181A1D] text-white overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-[#34373C]">
        {/* Full-bleed Stable Multi-Scene Background Container */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
          style={{
            transform: `translate3d(0, ${scrollY * 0.16}px, 0)`,
          }}
        >
          {HERO_SCENES.map((scene, idx) => {
            const isCurrent = activeSceneIndex === idx;
            const isVideoPlaying = !!playingVideos[scene.id];

            return (
              <div
                key={scene.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-[2200ms] ease-in-out ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
                style={{
                  willChange: 'opacity',
                }}
              >
                {/* High-Resolution Stable Machinery Background Image */}
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[8500ms] ease-out"
                  style={{
                    backgroundImage: `url('${scene.bgImage}')`,
                    backgroundPosition: 'center 48%',
                    transform: isCurrent ? 'scale(1.04)' : 'scale(1)',
                    filter: 'brightness(0.95) contrast(1.1) saturate(1.05)',
                  }}
                />

                {/* Local Video / Stream for this machine */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  ref={(el) => {
                    if (el && isCurrent && el.paused) {
                      el.play().catch(() => {});
                    }
                  }}
                  onPlaying={() => handleVideoPlaying(scene.id)}
                  onError={() => handleVideoError(scene.id)}
                  className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-1000 ease-in-out ${
                    isVideoPlaying ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    filter: 'brightness(0.95) contrast(1.1) saturate(1.05)',
                  }}
                >
                  {scene.videoSources.map((vSrc, vIdx) => (
                    <source
                      key={vIdx}
                      src={vSrc}
                      type={vSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
                    />
                  ))}
                  <source src="/videos/hero-sequence.mp4" type="video/mp4" />
                </video>
              </div>
            );
          })}
        </div>

        {/* Directional Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#181A1D]/90 via-[#181A1D]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#181A1D] via-[#181A1D]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#181A1D]/60 to-transparent pointer-events-none" />

        {/* Ambient Yellow Glow Orbs */}
        <div className="absolute -top-32 -right-32 w-[35rem] h-[35rem] rounded-full bg-[#FCC837]/15 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-40 left-1/4 w-[30rem] h-[30rem] rounded-full bg-[#FCC837]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FCC837] border border-[#E6B01B] text-[#222428] text-xs font-black uppercase tracking-wider mb-6 shadow-lg shadow-[#FCC837]/20 animate-hero-fade-in">
                <span className="h-2 w-2 rounded-full bg-[#222428] animate-ping mr-1" />
                <span>STORENT • Heavy Machinery Rental Platform</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none animate-hero-fade-in-delay-1 drop-shadow-lg text-white">
                Find the right Equipments <br />
                <span className="text-[#FCC837]">
                  for your next PROJECT.
                </span>
              </h1>

              {/* Subheading */}
              <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed font-normal max-w-2xl animate-hero-fade-in-delay-2 drop-shadow">
                Find JCBs, crawler excavators, cranes, silent generators, and tractors with GPS radar.
                Or list your machines, enforce subscription limits, and collect rental revenue through secure escrow.
              </p>

              {/* Quick Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="mt-8 flex flex-col sm:flex-row items-stretch gap-2.5 max-w-2xl bg-[#222428]/80 p-2 rounded-2xl backdrop-blur-md border border-[#34373C] shadow-2xl animate-hero-fade-in-delay-2"
              >
                <div className="flex-1 flex items-center bg-white rounded-xl px-3.5 py-2.5">
                  <Search className="h-5 w-5 text-[#34373C]/60 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search JCB 3DX, 25 Ton Crane, 125 kVA Generator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-[#222428] placeholder-[#34373C]/50 text-sm focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#FCC837] hover:bg-[#F0BA28] font-black text-sm rounded-xl text-[#222428] border border-[#E6B01B] shadow-lg shadow-[#FCC837]/30 transition flex items-center justify-center space-x-2 shrink-0"
                >
                  <span>Find Machinery</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Dual CTAs & Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4 animate-hero-fade-in-delay-3">
                <Link
                  to="/browse"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#222428] hover:bg-[#34373C] border border-[#34373C] text-sm font-bold text-[#FCC837] transition shadow-sm backdrop-blur-md"
                >
                  <Search className="h-4 w-4 text-[#FCC837]" />
                  <span>Rent Equipment</span>
                </Link>

                <button
                  onClick={handleRegisterClick}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-sm border border-[#E6B01B] transition-all duration-300 shadow-xl shadow-[#FCC837]/25"
                >
                  <PlusCircle className="h-4 w-4 text-[#222428]" />
                  <span>List Your Equipment</span>
                </button>

                <Link
                  to="/plans"
                  className="inline-flex items-center space-x-1.5 text-xs text-white/70 hover:text-[#FCC837] transition px-2 py-1"
                >
                  <span>Listing Plans from ₹499/mo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
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

            {/* Right: Translucent Glassmorphism Live Machine Radar & 3D Cartoon Model HUD */}
            <div className="lg:col-span-5 relative perspective-1000 mt-6 lg:mt-0 animate-hero-zoom-in">
              <div
                className="relative rounded-3xl p-6 sm:p-7 bg-[#222428]/80 backdrop-blur-xl border border-[#34373C] shadow-2xl transition-transform duration-300 ease-out preserve-3d"
                style={{
                  transform: `perspective(1000px) rotateX(${heroTilt}deg) rotateY(-${heroTilt * 0.6}deg) translateY(${heroTranslateY}px) scale(${heroScale})`,
                }}
              >
                {/* HUD Header */}
                <div className="flex items-center justify-between border-b border-[#34373C] pb-4">
                  <div className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#FCC837]/20 border border-[#FCC837]/40 text-[#FCC837] text-[10px] font-bold uppercase tracking-wider transition-opacity duration-500 ${hudFading ? 'opacity-30' : 'opacity-100'}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FCC837] animate-pulse" />
                    <span>{currentScene.badge}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-white/60">3D Fleet Telemetry</span>
                </div>

                {/* Machine Details with 3D Cartoon Illustration Preview */}
                <div className={`transition-all duration-500 ease-out ${hudFading ? 'opacity-20 translate-y-1' : 'opacity-100 translate-y-0'}`}>
                  {/* 3D Model Image Box & Title */}
                  <div className="mt-4 flex items-center gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#181A1D] border border-[#FCC837]/30 p-2 flex items-center justify-center shrink-0 shadow-inner group">
                      <img
                        src={currentScene.illustration}
                        alt={currentScene.name}
                        className="w-full h-full object-contain transition-transform duration-500 hover:scale-110 drop-shadow-md"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight line-clamp-1">
                        {currentScene.name}
                      </h3>
                      <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
                        {currentScene.category}
                      </p>
                    </div>
                  </div>

                  {/* 3-Col Quick Technical Specs */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {currentScene.specs.map((sp, sIdx) => (
                      <div key={sIdx} className="bg-[#181A1D]/80 backdrop-blur-md rounded-xl p-2.5 border border-[#34373C] text-center">
                        <div className="text-[10px] uppercase font-bold text-white/60">{sp.label}</div>
                        <div className="text-sm font-black text-[#FCC837] mt-0.5 truncate">{sp.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Live Distance & Verification Row */}
                  <div className="mt-5 p-3 rounded-2xl bg-[#FCC837]/10 border border-[#FCC837]/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#FCC837] text-[#222428] flex items-center justify-center font-bold">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#FCC837] animate-ping" />
                          <span className="text-xs font-black text-white">{currentScene.distance}</span>
                        </div>
                        <div className="text-[10px] text-[#FCC837] font-medium">
                          MongoDB 2dsphere GPS Proximity
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white">{currentScene.rate}<span className="text-[10px] text-white/60 font-normal">{currentScene.unit}</span></div>
                      <div className="text-[10px] text-white/60">Escrow Secured</div>
                    </div>
                  </div>

                  {/* Direct Action Link */}
                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#34373C]">
                    <span className="text-xs text-white/80 flex items-center space-x-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#FCC837]" />
                      <span>{currentScene.operatorStatus}</span>
                    </span>
                    <Link
                      to={`/browse?search=${encodeURIComponent(currentScene.shortLabel)}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#FCC837] hover:underline transition"
                    >
                      <span>View Machine</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Floating Parallax Badge 1: GPS Radar (Top-Left) */}
                <div
                  className="absolute -top-5 -left-5 bg-[#222428] text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-[#34373C] flex items-center space-x-2.5 animate-float-slow"
                  style={{
                    transform: `translateY(${scrollY * -0.1}px)`,
                  }}
                >
                  <div className="h-8 w-8 rounded-xl bg-[#FCC837] text-[#222428] flex items-center justify-center font-bold">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FCC837] animate-ping" />
                      <span className="text-xs font-black text-white">GPS Radar Active</span>
                    </div>
                    <div className="text-[10px] font-semibold text-white/60">
                      Real Coordinates
                    </div>
                  </div>
                </div>

                {/* Floating Parallax Badge 2: Escrow Protection (Bottom-Right) */}
                <div
                  className="absolute -bottom-5 -right-5 bg-[#222428] text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-[#34373C] flex items-center space-x-2.5 animate-float-reverse"
                  style={{
                    transform: `translateY(${scrollY * -0.07}px)`,
                  }}
                >
                  <div className="h-8 w-8 rounded-xl bg-[#FCC837] text-[#222428] flex items-center justify-center shadow-md font-bold">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                      STORENT Escrow
                    </div>
                    <div className="text-xs font-black text-[#FCC837]">
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
      <section className="bg-white border-b border-[#34373C]/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="border-r border-[#34373C]/10 last:border-none">
              <div className="text-2xl font-black text-[#222428]">100%</div>
              <div className="text-xs text-[#34373C]/70 font-medium mt-0.5">Verified Machine Owners</div>
            </div>
            <div className="border-r border-[#34373C]/10 last:border-none">
              <div className="text-2xl font-black text-[#222428]">2dsphere</div>
              <div className="text-xs text-[#34373C]/70 font-medium mt-0.5">GPS Nearby Radar Search</div>
            </div>
            <div className="border-r border-[#34373C]/10 last:border-none">
              <div className="text-2xl font-black text-[#222428]">Escrow</div>
              <div className="text-xs text-[#34373C]/70 font-medium mt-0.5">Secure Escrow Payments</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#222428]">0%</div>
              <div className="text-xs text-[#34373C]/70 font-medium mt-0.5">Double-Booking Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED SCROLL ANIMATION SHOWCASE: "Fleet in Motion" with 3D Cartoon Illustrations */}
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
                Real equipment available across major project corridors. Every machine is inspected,
                CPCB certified, and backed by direct owner coordination.
              </p>
            </div>

            <Link
              to="/browse"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] text-xs font-black uppercase tracking-wider transition self-start md:self-auto shadow-md border border-[#E6B01B]"
            >
              <span>Explore All 8 Categories</span>
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
                  {/* 3D Cartoon Illustration Container */}
                  <div className="relative h-64 w-full overflow-hidden bg-gradient-to-b from-[#181A1D] to-[#222428] flex items-center justify-center p-6">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                    />

                    {/* Tag Badge */}
                    <div className="absolute top-4 left-4 bg-[#FCC837] text-[#222428] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg border border-[#E6B01B]">
                      {item.tag}
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute top-4 right-4 bg-[#222428]/90 backdrop-blur-md text-[#FCC837] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#FCC837]/30 flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.distance}</span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-black text-white mt-0.5 line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Specs */}
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

      {/* Category Explorer with 3D Cartoon Illustrations */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FCC837]/20 text-[#222428] border border-[#FCC837]/40 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Machinery Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222428]">
              Browse Machinery Categories
            </h2>
            <p className="text-sm text-[#34373C]/70 mt-1">
              Select any category to explore verified machines with real GPS radar proximity.
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

        {/* 8 Category Cards with 3D Cartoon Illustrations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const illustrationSrc = getIllustrationForEquipment(cat.name, cat.slug);
            return (
              <Link
                key={cat._id || cat.slug}
                to={`/browse?category=${cat.slug}`}
                className="group p-5 bg-white rounded-2xl border border-[#34373C]/15 hover:border-[#FCC837] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* 3D Cartoon Illustration Frame */}
                  <div className="h-36 w-full rounded-xl bg-gradient-to-b from-[#F8F9FA] to-[#ECEEF0] border border-[#34373C]/10 mb-4 p-3 flex items-center justify-center group-hover:border-[#FCC837] group-hover:bg-[#FCC837]/10 transition-all duration-300 overflow-hidden">
                    <img
                      src={cat.imageUrl || illustrationSrc}
                      alt={cat.name}
                      className="h-28 w-28 object-contain group-hover:scale-115 transition-transform duration-300 drop-shadow-md"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-base text-[#222428] group-hover:text-black transition">
                    {cat.name}
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

      {/* Value Proposition: Dual-Role Model */}
      <section className="bg-[#F8F9FA] py-16 border-y border-[#34373C]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-[#222428]">
              One Unified Account for Contractors & Fleet Owners
            </h2>
            <p className="mt-3 text-[#34373C]/80 text-sm">
              No need to switch between owner and customer profiles. Your single login gives you
              full access to rent machines or accept booking requests on STORENT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Box 1: For Renters */}
            <div className="bg-white p-8 rounded-2xl border border-[#34373C]/15 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#222428] text-[#FCC837] mb-4">
                  Option A: Rent Equipment
                </div>
                <h3 className="text-xl font-bold text-[#222428] mb-3">
                  Find Machines For Your Project Site
                </h3>
                <ul className="space-y-3 text-sm text-[#34373C] mb-6">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#FCC837] shrink-0 mt-0.5" />
                    <span>Search by your GPS coordinates with real distance in km</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#FCC837] shrink-0 mt-0.5" />
                    <span>Hourly, daily, and monthly rates with clear operator options</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#FCC837] shrink-0 mt-0.5" />
                    <span>Real-time availability calendar preventing double-bookings</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/browse"
                className="w-full py-2.5 px-4 text-center rounded-lg bg-[#222428] hover:bg-[#34373C] text-[#FCC837] font-bold text-sm transition border border-[#34373C]"
              >
                Browse Marketplace
              </Link>
            </div>

            {/* Box 2: For Machine Owners */}
            <div className="bg-white p-8 rounded-2xl border border-[#FCC837]/50 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCC837]/10 rounded-bl-full pointer-events-none" />
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#FCC837] text-[#222428] mb-4">
                  Option B: Register Equipment
                </div>
                <h3 className="text-xl font-bold text-[#222428] mb-3">
                  Monetize Idle Machinery & Tools
                </h3>
                <ul className="space-y-3 text-sm text-[#34373C] mb-6">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#222428] shrink-0 mt-0.5" />
                    <span>Choose monthly tiers from ₹499/mo or Lifetime Unlimited VIP</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#222428] shrink-0 mt-0.5" />
                    <span>Receive direct booking requests and review renter profiles</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-[#222428] shrink-0 mt-0.5" />
                    <span>Keep 100% of agreed rental earnings with automated invoices</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleRegisterClick}
                className="w-full py-2.5 px-4 text-center rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-sm transition-all duration-300 shadow-md shadow-[#FCC837]/25 border border-[#E6B01B]"
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
