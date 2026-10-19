import React, { useState } from 'react';
import { ShieldCheck, MapPin, Truck, Zap, Activity } from 'lucide-react';

/**
 * Reusable animated background layout for authentication pages (Login, Register).
 * Replaces the plain white background with a cinematic, animated machinery backdrop,
 * glowing ambient orbs, moving blueprint grid, and live floating trust badges.
 */
const AuthBackgroundLayout = ({ children, badgeText = 'Secure Dual-Account Gateway' }) => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden">
      {/* 1. Deep Animated Blueprint / Radar Grid Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 animate-auth-grid"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* 2. Cinematic Heavy Machinery Background Image (Continuous Ken Burns Drift) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none animate-auth-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=2400&auto=format&fit=crop&q=80')`,
          filter: 'brightness(0.38) contrast(1.15) saturate(1.1)',
        }}
      />

      {/* 3. Local Video Layer (Fades in smoothly if user has placed a video) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onPlaying={() => setVideoPlaying(true)}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
          videoPlaying ? 'opacity-30' : 'opacity-0'
        }`}
        style={{
          filter: 'brightness(0.4) contrast(1.2) saturate(1.1)',
        }}
      >
        <source src="/videos/truck-driving.mp4" type="video/mp4" />
        <source src="/videos/truck.mp4" type="video/mp4" />
        <source src="/videos/jcb.mp4" type="video/mp4" />
        <source src="/videos/hero-sequence.mp4" type="video/mp4" />
      </video>

      {/* 4. Directional Dark Vignette Overlays (Enhances card contrast while showing background motion) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none" />

      {/* 5. Animated Ambient Glowing Orbs */}
      {/* Top-Left Amber Orb */}
      <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-amber-500/20 blur-[110px] pointer-events-none animate-auth-orb-1" />
      {/* Bottom-Right Brand Orange Orb */}
      <div className="absolute -bottom-36 -right-36 w-[34rem] h-[34rem] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none animate-auth-orb-2" />
      {/* Center Ambient Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] rounded-full bg-amber-400/10 blur-[140px] pointer-events-none animate-auth-ring" />

      {/* 6. Diagonal Light Beam Sweep */}
      <div className="absolute inset-y-0 w-72 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent blur-2xl pointer-events-none animate-auth-sweep" />

      {/* 7. Floating Live Telemetry Badges (Desktop View) */}
      {/* Floating Badge Left: Escrow Protection */}
      <div className="hidden xl:flex absolute top-24 left-12 bg-slate-900/80 backdrop-blur-md border border-white/15 text-white px-4 py-3 rounded-2xl shadow-2xl items-center space-x-3 pointer-events-none animate-float-slow">
        <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-white">Razorpay Escrow Shield</span>
          </div>
          <div className="text-[10px] font-medium text-slate-400">
            100% Payment Secured & Verified
          </div>
        </div>
      </div>

      {/* Floating Badge Right: Fleet Radar */}
      <div className="hidden xl:flex absolute bottom-24 right-12 bg-slate-900/80 backdrop-blur-md border border-white/15 text-white px-4 py-3 rounded-2xl shadow-2xl items-center space-x-3 pointer-events-none animate-float-reverse">
        <div className="h-9 w-9 rounded-xl bg-brand-500/20 border border-brand-400/30 text-brand-400 flex items-center justify-center font-bold">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black text-white">GPS Nearby Fleet Radar</span>
          </div>
          <div className="text-[10px] font-medium text-slate-400">
            Real-Time Proximity Match (MongoDB 2dsphere)
          </div>
        </div>
      </div>

      {/* Floating Pill Top Center: Security Badge */}
      <div className="absolute top-6 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/15 text-amber-300 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
        <Activity className="h-3 w-3 text-amber-400" />
        <span>{badgeText}</span>
      </div>

      {/* 8. Main Form Card Container (Rendered with glassmorphic depth & entrance animation) */}
      <div className="relative z-10 w-full max-w-md animate-hero-fade-in">
        {children}
      </div>
    </div>
  );
};

export default AuthBackgroundLayout;

