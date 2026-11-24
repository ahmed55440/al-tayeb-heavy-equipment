'use client';

import { useEffect, useState, useRef } from 'react';
import { FastForward } from 'lucide-react';

interface CinematicIntroProps {
  siteNameAr?: string;
  siteNameEn?: string;
  logoUrl?: string;
  enabled?: boolean;
}

export default function CinematicIntro({
  siteNameAr = 'معرض الطيب للمعدات الثقيلة',
  siteNameEn = 'Al Tayeb Heavy Equipment',
  logoUrl,
  enabled = true,
}: CinematicIntroProps) {
  const [show, setShow] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [loaderPosition, setLoaderPosition] = useState(115); // Starts offscreen right (115%)
  const [revealName, setRevealName] = useState(false);
  const [revealLogo, setRevealLogo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exhaustRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Show only once per browser session
    const hasSeen = sessionStorage.getItem('altayeb_intro_seen');
    if (hasSeen) return;

    setShow(true);

    const startTime = performance.now();
    const duration = 3000; // 3 seconds crossing

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Heavy machinery steady powerful movement from 115% down to -35%
      const currentPos = 115 - progress * 150;
      setLoaderPosition(currentPos);

      // Trigger cinematic reveals in sequence
      if (progress > 0.42 && !revealName) {
        setRevealName(true);
      }
      if (progress > 0.62 && !revealLogo) {
        setRevealLogo(true);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Fade out and transition smoothly into homepage
    const fadeTimer = setTimeout(() => {
      handleComplete();
    }, 4800);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearTimeout(fadeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Particle physics simulation: Exhaust smoke & Ground dust
  useEffect(() => {
    if (!show || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface SmokeParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxSize: number;
      growth: number;
      alpha: number;
      decay: number;
      hue: number; // For yellow variations
      isGroundDust: boolean;
    }

    const particles: SmokeParticle[] = [];
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      // 1. Visibly emit yellow exhaust smoke specifically from the loader's exhaust pipe tip
      if (exhaustRef.current && loaderPosition > -30 && loaderPosition < 110) {
        const rect = exhaustRef.current.getBoundingClientRect();
        const stackX = rect.left + rect.width / 2;
        const stackY = rect.top + rect.height / 2;

        if (stackX > -50 && stackX < width + 50) {
          // Emit 3-5 yellow smoke particles per frame from the exhaust pipe
          for (let i = 0; i < 4; i++) {
            particles.push({
              x: stackX + (Math.random() - 0.5) * 8,
              y: stackY + (Math.random() - 0.5) * 6,
              // Machine moves right-to-left, so exhaust smoke pushes backwards (positive X)
              vx: Math.random() * 2.8 + 2.0,
              // Hot exhaust gas ascends upward
              vy: -Math.random() * 2.5 - 1.2,
              size: Math.random() * 6 + 6,
              maxSize: Math.random() * 80 + 50,
              growth: Math.random() * 1.4 + 0.8,
              alpha: Math.random() * 0.35 + 0.45,
              decay: Math.random() * 0.007 + 0.005,
              hue: Math.random() > 0.5 ? 46 : 48, // 46-48 = #F5C400 Industrial Yellow
              isGroundDust: false,
            });
          }

          // Subtle ground tire dust
          if (Math.random() > 0.3) {
            const groundY = rect.bottom + 65;
            particles.push({
              x: stackX + (Math.random() - 0.5) * 40,
              y: groundY,
              vx: Math.random() * 2.5 + 1.0,
              vy: -Math.random() * 1.5 - 0.5,
              size: Math.random() * 12 + 10,
              maxSize: Math.random() * 45 + 30,
              growth: Math.random() * 0.8 + 0.4,
              alpha: 0.25,
              decay: 0.009,
              hue: 42, // Sandier dust
              isGroundDust: true,
            });
          }
        }
      }

      // 2. Update and render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Atmospheric air resistance
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Smoke expands continuously as it dissipates
        if (p.size < p.maxSize) {
          p.size += p.growth;
        }

        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw soft, glowing volumetric smoke puff
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        if (p.isGroundDust) {
          grad.addColorStop(0, `hsla(${p.hue}, 60%, 45%, ${p.alpha * 0.8})`);
          grad.addColorStop(0.6, `hsla(${p.hue}, 50%, 35%, ${p.alpha * 0.4})`);
          grad.addColorStop(1, `hsla(${p.hue}, 50%, 30%, 0)`);
        } else {
          // Yellow Exhaust Smoke
          grad.addColorStop(0, `hsla(${p.hue}, 100%, 55%, ${p.alpha * 1.0})`);
          grad.addColorStop(0.35, `hsla(${p.hue}, 95%, 48%, ${p.alpha * 0.7})`);
          grad.addColorStop(0.75, `hsla(${p.hue - 4}, 90%, 42%, ${p.alpha * 0.25})`);
          grad.addColorStop(1, `hsla(${p.hue}, 90%, 35%, 0)`);
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [show, loaderPosition]);

  const handleComplete = () => {
    setFadingOut(true);
    try {
      sessionStorage.setItem('altayeb_intro_seen', 'true');
    } catch {
      // storage disabled
    }
    setTimeout(() => {
      setShow(false);
    }, 850);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#080808] text-white flex flex-col items-center justify-center overflow-hidden transition-opacity duration-800 cinematic-intro-wrapper ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Skip Intro Button */}
      <button
        type="button"
        onClick={handleComplete}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-[#151515]/85 hover:bg-[#F5C400] text-gray-200 hover:text-black border border-[#333] hover:border-[#F5C400] px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-xl cursor-pointer"
        aria-label="Skip Intro"
      >
        <span>تخطي العرض / Skip Intro</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* Atmospheric Smoke & Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Atmospheric Industrial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-[#F5C400]/12 rounded-full blur-[160px] opacity-80 pointer-events-none"></div>
      </div>

      {/* CENTER REVEAL: Showroom Name & Logo */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl select-none">
        {/* Accent Golden Line */}
        <div
          className={`h-1 bg-gradient-to-r from-transparent via-[#F5C400] to-transparent transition-all duration-1000 ${
            revealName ? 'w-48 sm:w-64 opacity-100 mb-5' : 'w-0 opacity-0 mb-0'
          }`}
        ></div>

        {/* 1. Showroom Name Reveal (معرض الطيب) with Distinctive Bold Arabic Typography */}
        <div
          className={`transition-all duration-1000 transform ${
            revealName
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wide leading-tight"
            style={{
              fontFamily: "'Noto Kufi Arabic', 'Cairo', 'Tajawal', sans-serif",
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF4CC 35%, #F5C400 70%, #D4A000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 35px rgba(245, 196, 0, 0.5)) drop-shadow(0 4px 15px rgba(0, 0, 0, 0.9))',
            }}
          >
            معرض الطيب
          </h1>

          <p className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.3em] text-[#F5C400] mt-2 drop-shadow-md">
            {siteNameEn}
          </p>
        </div>

        {/* 2. Logo Reveal: Horizontal Rectangular Composition with Industrial Yellow Aesthetics */}
        <div
          className={`mt-6 sm:mt-8 transition-all duration-1000 delay-150 transform ${
            revealLogo
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-90'
          }`}
        >
          <div className="relative group rounded-xl bg-gradient-to-b from-[#F5C400] to-[#E5B200] p-1 shadow-[0_0_50px_rgba(245,196,0,0.35)] border border-[#FFD429]">
            {/* Horizontal Rectangular Card */}
            <div className="bg-[#0D0D0D] rounded-[10px] px-6 sm:px-10 py-3.5 sm:py-4 flex items-center justify-center gap-4 sm:gap-6 border border-[#2a2a2a]">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={siteNameAr}
                  className="h-12 sm:h-16 md:h-18 max-w-[240px] sm:max-w-[320px] object-contain drop-shadow"
                />
              ) : (
                <div className="flex items-center gap-3.5 sm:gap-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#F5C400] text-black font-black flex items-center justify-center text-xl sm:text-2xl shadow-md">
                    ط
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-black text-white leading-tight">
                      {siteNameAr}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#F5C400] font-bold tracking-wider uppercase">
                      HEAVY MACHINERY SHOWROOM
                    </p>
                  </div>
                </div>
              )}

              {/* Industrial Accent Badges */}
              <div className="hidden sm:flex flex-col border-r border-[#333] pr-4 rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-4">
                <span className="text-[10px] font-black text-[#F5C400] tracking-widest uppercase">
                  EST. 1995
                </span>
                <span className="text-[9px] font-semibold text-gray-400">
                  ORIGINAL FLEET
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. High-Fidelity Wheel Loader SVG Moving Right to Left */}
      <div
        className="absolute bottom-[6%] z-15 pointer-events-none transform -translate-y-1/2 will-change-transform"
        style={{
          left: `${loaderPosition}%`,
          transform: 'translateX(0) scaleX(-1)', // Mirrored so bucket faces forward (LEFT)
        }}
      >
        <div className="relative w-[340px] sm:w-[480px] md:w-[540px] h-[180px] sm:h-[250px] md:h-[280px]">
          {/* Exhaust Pipe Tip Anchor for Screen Coordinate Sampling */}
          {/* In SVG space (600x320), stack mouth is at x=145, y=78. In container: left: 24.17%, top: 24.37% */}
          <div
            ref={exhaustRef}
            className="absolute w-3 h-3 pointer-events-none"
            style={{
              left: '24.17%',
              top: '24.37%',
            }}
          />

          <svg
            viewBox="0 0 600 320"
            className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground Shadow */}
            <ellipse cx="300" cy="290" rx="270" ry="18" fill="rgba(0,0,0,0.7)" />

            {/* Rear Chassis & Engine Compartment */}
            <path
              d="M50 215 L95 125 L225 125 L255 170 L255 225 L50 225 Z"
              fill="#E5B200"
              stroke="#B38A00"
              strokeWidth="3.5"
            />
            {/* Engine Hood Louver Grills */}
            <rect x="70" y="140" width="45" height="28" rx="4" fill="#151515" stroke="#333" strokeWidth="1.5" />
            <line x1="82" y1="140" x2="82" y2="168" stroke="#F5C400" strokeWidth="2" opacity="0.6" />
            <line x1="92" y1="140" x2="92" y2="168" stroke="#F5C400" strokeWidth="2" opacity="0.6" />
            <line x1="102" y1="140" x2="102" y2="168" stroke="#F5C400" strokeWidth="2" opacity="0.6" />

            {/* Heavy Vertical Exhaust Stack Pipe (Chimney) */}
            <rect x="139" y="78" width="12" height="48" rx="2" fill="#1c1c1c" stroke="#333" strokeWidth="1.5" />
            {/* Exhaust Pipe Rim Opening */}
            <ellipse cx="145" cy="78" rx="7" ry="3.5" fill="#555" stroke="#F5C400" strokeWidth="1" />
            {/* Glowing Heat at Stack Tip */}
            <ellipse cx="145" cy="78" rx="4" ry="2" fill="#F5C400" opacity="0.7" />

            {/* Cab Structure (Heavy Roll Cage & Glass) */}
            <path
              d="M210 128 L250 65 L345 65 L335 170 L240 170 Z"
              fill="#181818"
              stroke="#F5C400"
              strokeWidth="4"
            />
            {/* Cab Glass Window */}
            <path
              d="M255 72 L336 72 L328 135 L232 135 Z"
              fill="rgba(56, 189, 248, 0.3)"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="2"
            />
            {/* Operator Silhouette */}
            <circle cx="282" cy="100" r="13" fill="#0D0D0D" />
            <path d="M266 135 C266 118, 298 118, 298 135 Z" fill="#0D0D0D" />

            {/* Central Articulation Joint & Pins */}
            <circle cx="260" cy="205" r="18" fill="#222" stroke="#444" strokeWidth="3" />
            <circle cx="260" cy="205" r="8" fill="#F5C400" />

            {/* Front Boom Lift Arms */}
            <path
              d="M260 190 L450 175 L430 155 L270 168 Z"
              fill="#F5C400"
              stroke="#B38A00"
              strokeWidth="3.5"
            />
            {/* Secondary Hydraulic Tilt Ram Linkage */}
            <path
              d="M310 148 L430 105 L420 95 L300 138 Z"
              fill="#222"
              stroke="#444"
              strokeWidth="2"
            />
            {/* Hydraulic Chrome Cylinder */}
            <rect
              x="320"
              y="126"
              width="68"
              height="15"
              rx="4"
              fill="#E0E0E0"
              stroke="#888"
              strokeWidth="2"
            />

            {/* Massive Front Digging Bucket (Scoop) */}
            <path
              d="M440 178 L535 145 L575 210 L510 250 L425 222 Z"
              fill="#D9A300"
              stroke="#997300"
              strokeWidth="4"
            />
            {/* Heavy Reinforced Bucket Digging Teeth */}
            <polygon points="575,210 592,215 580,226" fill="#222" stroke="#111" strokeWidth="1.5" />
            <polygon points="560,220 577,225 565,236" fill="#222" stroke="#111" strokeWidth="1.5" />
            <polygon points="545,230 562,235 550,246" fill="#222" stroke="#111" strokeWidth="1.5" />
            <polygon points="530,240 547,245 535,256" fill="#222" stroke="#111" strokeWidth="1.5" />

            {/* Massive Industrial Wheels with Aggressive Deep Treads */}
            {/* Rear Wheel */}
            <g>
              <circle cx="150" cy="235" r="54" fill="#141414" stroke="#000" strokeWidth="6" />
              <circle cx="150" cy="235" r="34" fill="#E5B200" stroke="#B38A00" strokeWidth="3" />
              <circle cx="150" cy="235" r="16" fill="#222" />
              {/* Rim Bolts */}
              <circle cx="150" cy="223" r="3.5" fill="#FFF" />
              <circle cx="150" cy="247" r="3.5" fill="#FFF" />
              <circle cx="138" cy="235" r="3.5" fill="#FFF" />
              <circle cx="162" cy="235" r="3.5" fill="#FFF" />
            </g>

            {/* Front Wheel */}
            <g>
              <circle cx="375" cy="235" r="54" fill="#141414" stroke="#000" strokeWidth="6" />
              <circle cx="375" cy="235" r="34" fill="#E5B200" stroke="#B38A00" strokeWidth="3" />
              <circle cx="375" cy="235" r="16" fill="#222" />
              {/* Rim Bolts */}
              <circle cx="375" cy="223" r="3.5" fill="#FFF" />
              <circle cx="375" cy="247" r="3.5" fill="#FFF" />
              <circle cx="363" cy="235" r="3.5" fill="#FFF" />
              <circle cx="387" cy="235" r="3.5" fill="#FFF" />
            </g>

            {/* Working Powerful Headlights Beam */}
            <polygon
              points="450,145 600,120 600,270 450,170"
              fill="url(#headlightBeam)"
              opacity="0.45"
            />

            <defs>
              <linearGradient id="headlightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#F5C400" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#F5C400" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Bottom Ground Border Line */}
      <div className="absolute bottom-0 inset-x-0 h-[8%] bg-gradient-to-t from-black via-[#080808] to-transparent border-t border-[#1C1C1C]"></div>
    </div>
  );
}
