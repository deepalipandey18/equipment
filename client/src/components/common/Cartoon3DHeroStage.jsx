import React from 'react';

/**
 * Cartoon3DHeroStage
 * A high-performance, 60fps animated 3D cartoon construction illustration arena
 * featuring dynamic cinematic motions:
 * - Scene 1 (Dump Truck): Driving suspension bounce, spinning wheels, tipping bed, smoke puffs, road speed lines.
 * - Scene 2 (JCB Excavator): Hydraulic arm digging articulation, shovel scooping, rock particles, flashing beacon.
 * - Scene 3 (Mobile Crane): Slewing turret rotation, telescopic boom extension, swinging steel girder, radar sweeps.
 */
const Cartoon3DHeroStage = ({ activeSceneId = 'truck', showBackground = true, className = '' }) => {
  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none ${className}`}>
      {/* Dynamic Background Animated Grid & Horizon Stars */}
      {showBackground && (
        <div className="absolute inset-0 bg-[#121417]">
          {/* Animated Isometric Ground Grid */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/5 opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(to right, #FCC837 1px, transparent 1px),
                linear-gradient(to bottom, #FCC837 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
              transform: 'perspective(600px) rotateX(65deg) scale(2.2)',
              transformOrigin: 'center bottom',
            }}
          />

          {/* Ambient Dark Charcoal & Golden Glow Orbs */}
          <div className="absolute top-1/4 right-1/4 w-[32rem] h-[32rem] rounded-full bg-[#FCC837]/10 blur-[120px] animate-pulse-glow" />
          <div className="absolute -bottom-20 left-1/3 w-[28rem] h-[28rem] rounded-full bg-[#FCC837]/15 blur-[100px]" />
        </div>
      )}

      {/* 3D SCENE 1: DUMP TRUCK IN CINEMATIC MOTION */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
          activeSceneId === 'truck'
            ? 'opacity-100 scale-100 translate-y-0 z-20'
            : 'opacity-0 scale-95 translate-y-8 z-0 pointer-events-none'
        }`}
      >
        <svg
          viewBox="0 0 900 500"
          className="w-full h-full max-w-5xl max-h-[85vh] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="truckBodyY" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFE169" />
              <stop offset="100%" stop-color="#FCC837" />
            </linearGradient>
            <linearGradient id="truckDarkG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#464A50" />
              <stop offset="100%" stop-color="#222428" />
            </linearGradient>
            <linearGradient id="truckDeepG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#282A2E" />
              <stop offset="100%" stop-color="#121315" />
            </linearGradient>
            <radialGradient id="headlightBeam" cx="0%" cy="50%" r="90%">
              <stop offset="0%" stop-color="#FFE169" stop-opacity="0.5" />
              <stop offset="60%" stop-color="#FCC837" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#FCC837" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="stageShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#000000" stop-opacity="0.7" />
              <stop offset="60%" stop-color="#000000" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
          </defs>

          {/* Style rules for Truck Scene Animations */}
          <style>{`
            @keyframes roadStream {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -120; }
            }
            @keyframes truckChassisRumble {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              25% { transform: translateY(-3px) rotate(0.4deg); }
              50% { transform: translateY(2px) rotate(-0.3deg); }
              75% { transform: translateY(-2px) rotate(0.2deg); }
            }
            @keyframes wheelRoll {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes tipperCycle {
              0%, 25%, 100% { transform: rotate(0deg); }
              45%, 70% { transform: rotate(-16deg); }
            }
            @keyframes gravelPour {
              0%, 35%, 100% { opacity: 0; transform: translateY(0) scale(0.6); }
              48%, 68% { opacity: 1; transform: translateY(35px) scale(1); }
            }
            @keyframes smokePuff {
              0% { opacity: 0.8; transform: translate(0, 0) scale(0.6); }
              100% { opacity: 0; transform: translate(-30px, -45px) scale(1.6); }
            }
            @keyframes beaconPulse {
              0%, 100% { opacity: 0.4; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            .animate-road { animation: roadStream 0.6s linear infinite; }
            .animate-truck-chassis { animation: truckChassisRumble 1.4s ease-in-out infinite; transform-origin: 450px 370px; }
            .animate-tipper-bed { animation: tipperCycle 8s ease-in-out infinite; transform-origin: 640px 320px; }
            .animate-gravel { animation: gravelPour 8s ease-in-out infinite; }
            .animate-smoke-1 { animation: smokePuff 1.8s ease-out infinite; }
            .animate-smoke-2 { animation: smokePuff 1.8s ease-out 0.9s infinite; }
            .animate-beacon { animation: beaconPulse 1s ease-in-out infinite; transform-origin: 290px 180px; }
          `}</style>

          {/* ROAD HIGHWAY PLATFORM & SPEED LINES */}
          <g>
            {/* Ground Shadow under truck */}
            <ellipse cx="460" cy="410" rx="340" ry="42" fill="url(#stageShadow)" />
            {/* Highway Road Strip */}
            <path d="M 80 410 L 820 410 L 760 445 L 140 445 Z" fill="#1C1E22" stroke="#34373C" stroke-width="2" />
            {/* Fast moving road lane dashes */}
            <line
              x1="120"
              y1="428"
              x2="780"
              y2="428"
              stroke="#FCC837"
              stroke-width="5"
              stroke-linecap="round"
              stroke-dasharray="35 25"
              className="animate-road"
            />
            {/* Curb safety strips */}
            <line x1="90" y1="412" x2="810" y2="412" stroke="#FCC837" stroke-width="2" stroke-opacity="0.4" />
          </g>

          {/* HEADLIGHT CONE (Shining into the dark) */}
          <polygon points="200,325 30,280 20,440" fill="url(#headlightBeam)" />

          {/* EXHAUST SMOKE PUFFS */}
          <g transform="translate(340, 210)">
            <circle cx="0" cy="0" r="12" fill="#FCC837" opacity="0.3" className="animate-smoke-1" />
            <circle cx="-5" cy="-8" r="16" fill="#FFFFFF" opacity="0.2" className="animate-smoke-2" />
          </g>

          {/* MAIN TRUCK BODY (With realistic chassis suspension rumble) */}
          <g className="animate-truck-chassis">
            {/* TRUCK CHASSIS FRAME */}
            <rect x="230" y="325" width="460" height="42" rx="6" fill="url(#truckDeepG)" stroke="#34373C" stroke-width="2" />
            <rect x="360" y="335" width="80" height="26" rx="4" fill="#34373C" /> {/* Fuel Tank */}
            <rect x="370" y="342" width="60" height="12" rx="2" fill="#FCC837" opacity="0.8" />

            {/* HYDRAULIC TIPPING BED (Lifting & Lowering with 3D cartoon gravel) */}
            <g className="animate-tipper-bed">
              {/* Hydraulic Telescopic Cylinder */}
              <line x1="380" y1="330" x2="420" y2="280" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" />
              <line x1="380" y1="330" x2="400" y2="305" stroke="#222428" stroke-width="16" stroke-linecap="round" />

              {/* Yellow Dump Box */}
              <path
                d="M 330 200 L 690 180 L 705 325 L 370 325 Z"
                fill="url(#truckBodyY)"
                stroke="#E5AA15"
                stroke-width="3"
              />
              {/* Canopy shield over cab */}
              <path d="M 330 200 L 290 195 L 310 235 L 340 235 Z" fill="#FCC837" />
              
              {/* Strengthening Side Ribs */}
              <rect x="420" y="195" width="10" height="130" rx="3" fill="#E5AA15" />
              <rect x="490" y="190" width="10" height="135" rx="3" fill="#E5AA15" />
              <rect x="560" y="186" width="10" height="139" rx="3" fill="#E5AA15" />
              <rect x="630" y="182" width="10" height="143" rx="3" fill="#E5AA15" />

              {/* STORENT Decal on Bed */}
              <rect x="445" y="235" width="165" height="36" rx="6" fill="#222428" />
              <text
                x="527"
                y="260"
                font-family="system-ui, -apple-system, sans-serif"
                font-weight="900"
                font-size="19"
                fill="#FCC837"
                text-anchor="middle"
                letter-spacing="2"
              >
                STORENT
              </text>

              {/* Cartoon Rocks / Gravel pouring out */}
              <g className="animate-gravel">
                <circle cx="705" cy="315" r="9" fill="#34373C" />
                <circle cx="720" cy="330" r="12" fill="#FCC837" />
                <circle cx="715" cy="350" r="8" fill="#464A50" />
                <circle cx="735" cy="360" r="10" fill="#222428" />
              </g>
            </g>

            {/* DRIVER CABIN (Heavy Commercial Hauler) */}
            <path
              d="M 210 220 L 335 210 L 345 350 L 200 350 Z"
              fill="url(#truckBodyY)"
              stroke="#E5AA15"
              stroke-width="3"
            />
            {/* Roof & Visor */}
            <path d="M 200 220 L 340 208 L 335 198 L 195 208 Z" fill="#222428" />

            {/* Windshield with reflective gloss */}
            <path d="M 208 228 L 275 224 L 270 285 L 202 288 Z" fill="#80A5B8" opacity="0.9" />
            <path d="M 280 224 L 330 220 L 334 280 L 276 284 Z" fill="#344855" opacity="0.95" />
            <polygon points="212,230 235,228 220,285 204,287" fill="#FFFFFF" opacity="0.4" />

            {/* Warning Roof Beacon */}
            <ellipse cx="270" cy="195" rx="8" ry="6" fill="#FCC837" className="animate-beacon" />
            <circle cx="270" cy="195" r="4" fill="#FFFFFF" />

            {/* Front Chrome / Dark Grille */}
            <rect x="195" y="295" width="22" height="48" rx="4" fill="url(#truckDeepG)" stroke="#FCC837" stroke-width="1.5" />
            <line x1="198" y1="305" x2="214" y2="305" stroke="#FCC837" stroke-width="2" />
            <line x1="198" y1="315" x2="214" y2="315" stroke="#FCC837" stroke-width="2" />
            <line x1="198" y1="325" x2="214" y2="325" stroke="#FCC837" stroke-width="2" />

            {/* Glowing Dual Headlight */}
            <circle cx="202" cy="330" r="7" fill="#FFE169" />
            <circle cx="202" cy="330" r="3" fill="#FFFFFF" />

            {/* Heavy Front Bumper */}
            <rect x="185" y="342" width="35" height="22" rx="5" fill="#222428" stroke="#34373C" stroke-width="2" />
          </g>

          {/* 3D CHUNKY SPINNING WHEELS (With tread rims & lug nuts) */}
          {/* Wheel 1: Front Steer Wheel */}
          <g transform="translate(255, 365)">
            <circle cx="0" cy="0" r="46" fill="#121315" />
            <circle cx="0" cy="0" r="28" fill="#222428" stroke="#34373C" stroke-width="4" />
            <circle cx="0" cy="0" r="16" fill="#FCC837" />
            <circle cx="0" cy="0" r="6" fill="#222428" />
            {/* Spinning Rim Spokes */}
            <g style={{ animation: 'wheelRoll 0.6s linear infinite', transformOrigin: '0px 0px' }}>
              <line x1="-22" y1="0" x2="22" y2="0" stroke="#121315" stroke-width="3" />
              <line x1="0" y1="-22" x2="0" y2="22" stroke="#121315" stroke-width="3" />
              <circle cx="-10" cy="-10" r="2" fill="#FFFFFF" />
              <circle cx="10" cy="-10" r="2" fill="#FFFFFF" />
              <circle cx="-10" cy="10" r="2" fill="#FFFFFF" />
              <circle cx="10" cy="10" r="2" fill="#FFFFFF" />
            </g>
          </g>

          {/* Wheel 2: Rear Tandem Axle 1 */}
          <g transform="translate(540, 365)">
            <circle cx="0" cy="0" r="48" fill="#121315" />
            <circle cx="0" cy="0" r="30" fill="#222428" stroke="#34373C" stroke-width="4" />
            <circle cx="0" cy="0" r="18" fill="#FCC837" />
            <circle cx="0" cy="0" r="7" fill="#222428" />
            <g style={{ animation: 'wheelRoll 0.6s linear infinite', transformOrigin: '0px 0px' }}>
              <line x1="-24" y1="0" x2="24" y2="0" stroke="#121315" stroke-width="3.5" />
              <line x1="0" y1="-24" x2="0" y2="24" stroke="#121315" stroke-width="3.5" />
            </g>
          </g>

          {/* Wheel 3: Rear Tandem Axle 2 */}
          <g transform="translate(635, 365)">
            <circle cx="0" cy="0" r="48" fill="#121315" />
            <circle cx="0" cy="0" r="30" fill="#222428" stroke="#34373C" stroke-width="4" />
            <circle cx="0" cy="0" r="18" fill="#FCC837" />
            <circle cx="0" cy="0" r="7" fill="#222428" />
            <g style={{ animation: 'wheelRoll 0.6s linear infinite', transformOrigin: '0px 0px' }}>
              <line x1="-24" y1="0" x2="24" y2="0" stroke="#121315" stroke-width="3.5" />
              <line x1="0" y1="-24" x2="0" y2="24" stroke="#121315" stroke-width="3.5" />
            </g>
          </g>
        </svg>
      </div>

      {/* 3D SCENE 2: JCB 3DX BACKHOE IN ACTION (Digging & Articulated Hydraulics) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
          activeSceneId === 'jcb'
            ? 'opacity-100 scale-100 translate-y-0 z-20'
            : 'opacity-0 scale-95 translate-y-8 z-0 pointer-events-none'
        }`}
      >
        <svg
          viewBox="0 0 900 500"
          className="w-full h-full max-w-5xl max-h-[85vh] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="jcbYellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFE169" />
              <stop offset="100%" stop-color="#FCC837" />
            </linearGradient>
            <linearGradient id="jcbDeep" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#2D3035" />
              <stop offset="100%" stop-color="#181A1D" />
            </linearGradient>
          </defs>

          <style>{`
            @keyframes frontLoaderScoop {
              0%, 100% { transform: rotate(0deg); }
              30% { transform: rotate(-8deg) translateY(-8px); }
              60% { transform: rotate(4deg) translateY(4px); }
            }
            @keyframes backhoeBoomDig {
              0%, 100% { transform: rotate(0deg); }
              35% { transform: rotate(-18deg); }
              65% { transform: rotate(14deg); }
            }
            @keyframes backhoeDipperSwing {
              0%, 100% { transform: rotate(0deg); }
              40% { transform: rotate(24deg); }
              75% { transform: rotate(-16deg); }
            }
            @keyframes backhoeBucketCurl {
              0%, 100% { transform: rotate(0deg); }
              45% { transform: rotate(-45deg); }
              80% { transform: rotate(25deg); }
            }
            @keyframes rockFlying {
              0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.4); }
              60% { opacity: 1; transform: translate(45px, -35px) scale(1); }
              85% { opacity: 0; transform: translate(75px, 20px) scale(0.6); }
            }
            .animate-front-loader { animation: frontLoaderScoop 4s ease-in-out infinite; transform-origin: 290px 330px; }
            .animate-backhoe-boom { animation: backhoeBoomDig 4.5s ease-in-out infinite; transform-origin: 520px 290px; }
            .animate-backhoe-dipper { animation: backhoeDipperSwing 4.5s ease-in-out infinite; transform-origin: 640px 170px; }
            .animate-backhoe-bucket { animation: backhoeBucketCurl 4.5s ease-in-out infinite; transform-origin: 740px 245px; }
            .animate-rocks { animation: rockFlying 4.5s ease-out infinite; }
          `}</style>

          {/* Ground Platform & Excavation Trench */}
          <ellipse cx="450" cy="410" rx="360" ry="42" fill="url(#stageShadow)" />
          {/* Trench Pit Cutout */}
          <path d="M 660 380 L 840 380 L 800 450 L 680 450 Z" fill="#0E1012" stroke="#FCC837" stroke-width="2" />

          {/* Flying Digging Dirt / Rock Cubes */}
          <g className="animate-rocks">
            <rect x="740" y="270" width="10" height="10" rx="2" fill="#FCC837" />
            <rect x="755" y="260" width="14" height="14" rx="3" fill="#34373C" />
            <rect x="765" y="280" width="8" height="8" rx="2" fill="#E5AA15" />
          </g>

          {/* MAIN JCB BODY & CABIN */}
          <g>
            {/* Lower Chassis Frame */}
            <rect x="260" y="315" width="280" height="45" rx="8" fill="url(#jcbDeep)" stroke="#34373C" stroke-width="2" />

            {/* Engine Hood (Front) */}
            <path d="M 230 255 L 340 245 L 345 320 L 220 325 Z" fill="url(#jcbYellow)" stroke="#E5AA15" stroke-width="2" />
            {/* Hood Vents */}
            <rect x="235" y="265" width="6" height="35" rx="2" fill="#222428" />
            <rect x="247" y="263" width="6" height="38" rx="2" fill="#222428" />
            <rect x="259" y="262" width="6" height="40" rx="2" fill="#222428" />

            {/* Operator Cabin (Tall Glass Structure) */}
            <path d="M 325 155 L 455 150 L 465 315 L 325 320 Z" fill="url(#jcbYellow)" stroke="#E5AA15" stroke-width="2.5" />
            <path d="M 320 155 L 460 148 L 450 138 L 315 145 Z" fill="#222428" /> {/* Cabin Roof */}

            {/* Curved Panoramic Windows */}
            <path d="M 335 165 L 390 162 L 388 240 L 332 242 Z" fill="#80A5B8" opacity="0.9" />
            <path d="M 395 162 L 448 158 L 452 238 L 393 240 Z" fill="#344855" opacity="0.95" />
            <polygon points="340,168 355,166 345,238 335,239" fill="#FFFFFF" opacity="0.45" />

            {/* Roof Flashing Hazard Beacon */}
            <circle cx="390" cy="136" r="7" fill="#FCC837" className="animate-beacon" />
            <circle cx="390" cy="136" r="3" fill="#FFFFFF" />

            {/* Exhaust Stack */}
            <rect x="330" y="180" width="7" height="45" rx="2" fill="#222428" />

            {/* STORENT Decal on Hood */}
            <rect x="275" y="270" width="60" height="18" rx="3" fill="#222428" />
            <text x="305" y="283" font-family="system-ui, sans-serif" font-weight="900" font-size="9" fill="#FCC837" text-anchor="middle">STORENT</text>
          </g>

          {/* FRONT LOADER ARM & SHOVEL (Animated Scooping Motion) */}
          <g className="animate-front-loader">
            {/* Loader Lift Arm */}
            <path d="M 300 320 L 160 300 L 140 340 L 295 345 Z" fill="url(#jcbYellow)" stroke="#E5AA15" stroke-width="2" />
            {/* Front Shovel Bucket */}
            <path d="M 160 270 L 110 260 L 95 365 L 155 360 Z" fill="url(#jcbDeep)" stroke="#FCC837" stroke-width="2" />
            {/* Digging Teeth */}
            <polygon points="95,365 80,378 100,374" fill="#FCC837" />
            <polygon points="105,364 92,376 110,372" fill="#FCC837" />
            <polygon points="115,363 104,374 120,370" fill="#FCC837" />
          </g>

          {/* REAR EXCAVATOR ARTICULATED DIGGING ARM (Multi-Joint Kinematics) */}
          {/* Base Swing Post Pivot */}
          <rect x="505" y="275" width="24" height="55" rx="6" fill="#222428" />

          {/* Joint 1: Main Boom */}
          <g className="animate-backhoe-boom">
            <path d="M 520 290 C 560 230, 600 190, 640 170 L 655 188 C 615 210, 580 250, 545 305 Z" fill="url(#jcbYellow)" stroke="#E5AA15" stroke-width="2" />
            {/* Hydraulic Cylinder */}
            <line x1="535" y1="310" x2="600" y2="215" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" />
            <line x1="535" y1="310" x2="570" y2="260" stroke="#222428" stroke-width="12" stroke-linecap="round" />

            {/* Joint 2: Dipper Arm */}
            <g className="animate-backhoe-dipper">
              <path d="M 640 170 L 740 245 L 725 260 L 630 185 Z" fill="url(#jcbYellow)" stroke="#E5AA15" stroke-width="2" />

              {/* Joint 3: Excavator Bucket */}
              <g className="animate-backhoe-bucket">
                <path d="M 740 245 C 775 255, 790 290, 775 320 L 735 305 C 748 285, 738 265, 725 255 Z" fill="url(#jcbDeep)" stroke="#FCC837" stroke-width="2" />
                {/* Bucket Digging Teeth */}
                <polygon points="775,320 788,332 770,330" fill="#FCC837" />
                <polygon points="768,318 780,330 762,328" fill="#FCC837" />
                <polygon points="760,315 772,327 754,325" fill="#FCC837" />
              </g>
            </g>
          </g>

          {/* FRONT WHEEL (Small Heavy Steering Tire) */}
          <g transform="translate(260, 365)">
            <ellipse cx="0" cy="0" rx="36" ry="46" fill="#121315" />
            <ellipse cx="0" cy="0" rx="20" ry="28" fill="#222428" stroke="#34373C" stroke-width="3" />
            <circle cx="0" cy="0" r="12" fill="#FCC837" />
            <circle cx="0" cy="0" r="4" fill="#222428" />
          </g>

          {/* REAR WHEEL (Massive Giant Off-Road Lug Tire) */}
          <g transform="translate(485, 350)">
            <ellipse cx="0" cy="0" rx="56" ry="68" fill="#121315" />
            <ellipse cx="0" cy="0" rx="34" ry="44" fill="#222428" stroke="#34373C" stroke-width="5" />
            <circle cx="0" cy="0" r="20" fill="#FCC837" />
            <circle cx="0" cy="0" r="7" fill="#222428" />
            {/* Lug Nuts */}
            <circle cx="-10" cy="-10" r="2.5" fill="#FFFFFF" />
            <circle cx="10" cy="-10" r="2.5" fill="#FFFFFF" />
            <circle cx="-10" cy="10" r="2.5" fill="#FFFFFF" />
            <circle cx="10" cy="10" r="2.5" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* 3D SCENE 3: HYDRAULIC MOBILE CRANE (Telescopic Boom & Girder Swing) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
          activeSceneId === 'crane'
            ? 'opacity-100 scale-100 translate-y-0 z-20'
            : 'opacity-0 scale-95 translate-y-8 z-0 pointer-events-none'
        }`}
      >
        <svg
          viewBox="0 0 900 500"
          className="w-full h-full max-w-5xl max-h-[85vh] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="craneYellowG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFE169" />
              <stop offset="100%" stop-color="#FCC837" />
            </linearGradient>
            <linearGradient id="steelGirder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#464A50" />
              <stop offset="100%" stop-color="#222428" />
            </linearGradient>
          </defs>

          <style>{`
            @keyframes craneTurretRotate {
              0%, 100% { transform: rotate(0deg); }
              40% { transform: rotate(-8deg); }
              75% { transform: rotate(10deg); }
            }
            @keyframes boomTelescope {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-35px); }
            }
            @keyframes girderSway {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(4deg); }
              75% { transform: rotate(-4deg); }
            }
            @keyframes radarWave {
              0% { r: 20px; opacity: 0.9; stroke-width: 4; }
              100% { r: 240px; opacity: 0; stroke-width: 1; }
            }
            .animate-turret { animation: craneTurretRotate 9s ease-in-out infinite; transform-origin: 520px 290px; }
            .animate-boom-ext { animation: boomTelescope 7s ease-in-out infinite; }
            .animate-girder-sway { animation: girderSway 4s ease-in-out infinite; transform-origin: 220px 105px; }
            .animate-radar-ring { animation: radarWave 3s ease-out infinite; }
            .animate-radar-ring-2 { animation: radarWave 3s ease-out 1.5s infinite; }
          `}</style>

          {/* Radar Scanner Concentric Circles on Ground */}
          <ellipse cx="520" cy="410" rx="350" ry="42" fill="url(#stageShadow)" />
          <ellipse cx="520" cy="410" rx="120" ry="24" fill="none" stroke="#FCC837" stroke-opacity="0.4" className="animate-radar-ring" />
          <ellipse cx="520" cy="410" rx="200" ry="36" fill="none" stroke="#FCC837" stroke-opacity="0.2" className="animate-radar-ring-2" />

          {/* TRUCK CARRIER BASE CHASSIS */}
          <rect x="260" y="325" width="460" height="40" rx="6" fill="#1C1E22" stroke="#34373C" stroke-width="2" />

          {/* OUTRIGGERS DEPLOYED WITH SAFETY PADS */}
          <path d="M 320 345 L 290 405 L 315 405 L 335 345 Z" fill="#FCC837" stroke="#E5AA15" stroke-width="1.5" />
          <rect x="280" y="402" width="45" height="8" rx="2" fill="#222428" />
          <path d="M 660 345 L 685 405 L 710 405 L 680 345 Z" fill="#FCC837" stroke="#E5AA15" stroke-width="1.5" />
          <rect x="675" y="402" width="45" height="8" rx="2" fill="#222428" />

          {/* FRONT CARRIER DRIVER CAB */}
          <path d="M 230 250 L 330 245 L 340 365 L 220 365 Z" fill="url(#craneYellowG)" stroke="#E5AA15" stroke-width="2" />
          <path d="M 225 255 L 285 250 L 280 305 L 222 308 Z" fill="#80A5B8" opacity="0.9" />
          <path d="M 290 250 L 325 248 L 328 302 L 286 304 Z" fill="#344855" opacity="0.95" />
          <polygon points="228,258 248,255 238,305 224,307" fill="#FFFFFF" opacity="0.4" />
          <circle cx="225" cy="345" r="7" fill="#FFE169" />

          {/* CRANE ROTATING TURRET & TELESCOPIC BOOM */}
          <g className="animate-turret">
            {/* Turret Platform */}
            <rect x="440" y="275" width="160" height="50" rx="8" fill="#222428" stroke="#34373C" stroke-width="2" />
            <rect x="540" y="260" width="75" height="50" rx="4" fill="#121315" /> {/* Counterweight */}
            <rect x="550" y="270" width="55" height="15" rx="3" fill="#FCC837" />

            {/* Operator Crane High Cab */}
            <path d="M 430 225 L 485 220 L 490 295 L 425 295 Z" fill="url(#craneYellowG)" stroke="#E5AA15" stroke-width="2" />
            <path d="M 432 230 L 480 226 L 483 275 L 430 278 Z" fill="#80A5B8" opacity="0.9" />

            {/* Hydraulic Boom Elevation Ram */}
            <line x1="490" y1="300" x2="410" y2="210" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" />
            <line x1="490" y1="300" x2="445" y2="250" stroke="#222428" stroke-width="18" stroke-linecap="round" />

            {/* Stage 1: Main Base Boom */}
            <path d="M 505 265 L 260 70 L 290 35 L 535 230 Z" fill="url(#craneYellowG)" stroke="#E5AA15" stroke-width="2.5" />

            {/* STORENT Decal on Boom */}
            <g transform="translate(370, 160) rotate(-38)">
              <rect x="0" y="0" width="85" height="20" rx="4" fill="#222428" />
              <text x="42" y="14" font-family="system-ui, sans-serif" font-weight="900" font-size="11" fill="#FCC837" text-anchor="middle" letter-spacing="1">STORENT</text>
            </g>

            {/* Stage 2: Telescopic Inner Extension Boom */}
            <g className="animate-boom-ext">
              <path d="M 270 78 L 195 18 L 215 -2 L 290 58 Z" fill="#2D3035" stroke="#34373C" stroke-width="2" />
              {/* Pulley Head Sheave */}
              <circle cx="205" cy="8" r="10" fill="#FCC837" />
              <circle cx="205" cy="8" r="4" fill="#222428" />

              {/* Cable Hoist and Swinging Steel Beam */}
              <g className="animate-girder-sway">
                {/* Hoist Steel Cable */}
                <line x1="205" y1="18" x2="205" y2="105" stroke="#FFFFFF" stroke-width="2.5" stroke-dasharray="4 2" />
                {/* Hook Block */}
                <rect x="195" y="105" width="20" height="24" rx="4" fill="#FCC837" stroke="#E5AA15" stroke-width="2" />
                <path d="M 205 129 C 205 145, 218 150, 218 140 C 218 132, 210 132, 208 136" stroke="#222428" stroke-width="5" fill="none" stroke-linecap="round" />

                {/* HEAVY STEEL I-BEAM GIRDER IN TRANSIT */}
                <g transform="translate(205, 150)">
                  <rect x="-90" y="0" width="180" height="26" rx="4" fill="url(#steelGirder)" stroke="#FCC837" stroke-width="2" />
                  {/* Warning Caution Diagonal Stripes on Beam */}
                  <line x1="-70" y1="0" x2="-55" y2="26" stroke="#FCC837" stroke-width="6" />
                  <line x1="-30" y1="0" x2="-15" y2="26" stroke="#FCC837" stroke-width="6" />
                  <line x1="10" y1="0" x2="25" y2="26" stroke="#FCC837" stroke-width="6" />
                  <line x1="50" y1="0" x2="65" y2="26" stroke="#FCC837" stroke-width="6" />
                </g>
              </g>
            </g>
          </g>

          {/* 8 HEAVY WHEELS ACROSS CARRIER */}
          {[270, 345, 545, 620].map((wx, i) => (
            <g key={i} transform={`translate(${wx}, 365)`}>
              <circle cx="0" cy="0" r="38" fill="#121315" />
              <circle cx="0" cy="0" r="22" fill="#222428" stroke="#34373C" stroke-width="3" />
              <circle cx="0" cy="0" r="12" fill="#FCC837" />
              <circle cx="0" cy="0" r="4" fill="#222428" />
            </g>
          ))}
        </svg>
      </div>

      {/* Floating 3D Construction Cones & Site Hazards */}
      {showBackground && (
        <div className="absolute bottom-6 left-12 hidden lg:flex items-center space-x-3 opacity-90 animate-float-slow">
          <svg viewBox="0 0 40 40" className="w-10 h-10">
            <polygon points="20,4 32,32 8,32" fill="#FCC837" stroke="#E5AA15" stroke-width="2" />
            <polygon points="17,14 23,14 25,20 15,20" fill="#FFFFFF" />
            <polygon points="14,24 26,24 28,30 12,30" fill="#FFFFFF" />
            <rect x="4" y="32" width="32" height="5" rx="2" fill="#222428" />
          </svg>
          <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider bg-[#222428]/80 backdrop-blur px-2.5 py-1 rounded-lg border border-[#34373C]">
            Site Zone Active
          </div>
        </div>
      )}
    </div>
  );
};

export default Cartoon3DHeroStage;
