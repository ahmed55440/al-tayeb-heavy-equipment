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
  const [loaderPosition, setLoaderPosition] = useState(110); // start offscreen right (110%)
  const [revealText, setRevealText] = useState(false);
  const [revealLogo, setRevealLogo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If disabled from admin settings, do not show
    if (!enabled) return;

    // Check if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Check if already seen this session
    const hasSeen = sessionStorage.getItem('altayeb_intro_seen');
    if (hasSeen) return;

    setShow(true);

    // Timeline Sequence:
    // 0s: start black screen
    // 0.3s -> 3.2s: loader moves from right (110%) to left (-30%), pushing sand & spawning dust
    // 2.2s: dust spreads, reveal showroom name
    // 2.7s: reveal logo
    // 4.5s: fade out intro completely

    const startTime = performance.now();
    const duration = 2800; // ms for loader crossing

    const animateLoader = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for heavy machinery: constant power movement
      const pos = 110 - progress * 135; // from 110% down to -25%
      setLoaderPosition(pos);

      if (progress > 0.45 && !revealText) {
        setRevealText(true);
      }
      if (progress > 0.65 && !revealLogo) {
        setRevealLogo(true);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateLoader);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateLoader);

    const fadeOutTimer = setTimeout(() => {
      handleComplete();
    }, 4500);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(fadeOutTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Particle simulation for sand, dust & smoke
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

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }

    const particles: Particle[] = [];
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      // Current loader X in pixels (moving right to left)
      const loaderPx = (loaderPosition / 100) * width;
      const groundY = height * 0.72;

      // Spawn sand & dust particles in front of the bucket (left of loader)
      if (loaderPosition > -10 && loaderPosition < 105) {
        const bucketX = loaderPx - 50; // In front of the loader bucket
        for (let i = 0; i < 7; i++) {
          const isDust = Math.random() > 0.4;
          particles.push({
            x: bucketX + (Math.random() - 0.5) * 40,
            y: groundY + (Math.random() - 0.5) * 30,
            vx: -Math.random() * 5 - 2, // propelled forward/left
            vy: -Math.random() * 4 - 0.5, // rising upward
            size: isDust ? Math.random() * 25 + 15 : Math.random() * 4 + 1.5,
            color: isDust ? 'rgba(180, 160, 120,' : 'rgba(245, 196, 0,',
            alpha: isDust ? 0.35 : 0.8,
            decay: isDust ? 0.006 : 0.015,
          });
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `${p.color}${p.alpha})`;
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
    sessionStorage.setItem('altayeb_intro_seen', 'true');
    setTimeout(() => {
      setShow(false);
    }, 800);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-800 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Skip button */}
      <button
        onClick={handleComplete}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-[#151515]/80 hover:bg-[#F5C400] text-gray-300 hover:text-black border border-[#333] hover:border-[#F5C400] px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-lg cursor-pointer"
      >
        <span>تخطي / Skip Intro</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* Particle Canvas for Sand, Dust & Smoke */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Atmospheric Industrial Fog Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#F5C400]/10 rounded-full blur-[140px] opacity-70"></div>
      </div>

      {/* Center Cinematic Showroom Reveal */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl select-none">
        {/* Yellow Glass Accent Line */}
        <div
          className={`h-1 bg-gradient-to-r from-transparent via-[#F5C400] to-transparent transition-all duration-1000 ${
            revealText ? 'w-48 opacity-100 mb-6' : 'w-0 opacity-0 mb-0'
          }`}
        ></div>

        {/* Showroom Title (Arabic) */}
        <h1
          className={`text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-wide transition-all duration-1000 transform ${
            revealText
              ? 'opacity-100 translate-y-0 filter blur-0'
              : 'opacity-0 translate-y-8 filter blur-sm'
          }`}
          style={{ textShadow: '0 0 40px rgba(245, 196, 0, 0.4)' }}
        >
          {siteNameAr}
        </h1>

        {/* English Title */}
        <p
          className={`text-sm sm:text-lg md:text-xl font-bold uppercase tracking-[0.25em] text-[#F5C400] mt-3 transition-all duration-1000 delay-200 transform ${
            revealText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {siteNameEn}
        </p>

        {/* Showroom Logo Underneath */}
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Al Tayeb Showroom Logo"
            className={`h-16 md:h-20 object-contain mt-6 transition-all duration-700 transform ${
              revealLogo
                ? 'opacity-100 scale-100 filter drop-shadow-[0_0_20px_rgba(245,196,0,0.3)]'
                : 'opacity-0 scale-90'
            }`}
          />
        ) : (
          <div
            className={`mt-6 px-5 py-2 rounded-xl bg-[#151515] border border-[#F5C400]/30 text-xs font-semibold text-gray-300 transition-all duration-700 transform ${
              revealLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          >
            <span className="text-[#F5C400]">★</span> PREMIER HEAVY MACHINERY SHOWROOM <span className="text-[#F5C400]">★</span>
          </div>
        )}
      </div>

      {/* Realistic Heavy Wheel Loader SVG Animation */}
      <div
        className="absolute bottom-[8%] z-15 pointer-events-none transform -translate-y-1/2 will-change-transform"
        style={{
          left: `${loaderPosition}%`,
          transform: 'translateX(0) scaleX(-1)', // Flip horizontally so it faces left while moving right-to-left
        }}
      >
        {/* Wheel Loader SVG Graphic */}
        <div className="relative w-[340px] sm:w-[480px] h-[180px] sm:h-[240px]">
          <svg
            viewBox="0 0 600 320"
            className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground Shadow */}
            <ellipse cx="300" cy="285" rx="260" ry="20" fill="rgba(0,0,0,0.6)" />

            {/* Rear Chassis & Engine Compartment */}
            <path
              d="M60 210 L100 130 L220 130 L250 170 L250 220 L60 220 Z"
              fill="#E5B200"
              stroke="#B38A00"
              strokeWidth="3"
            />
            {/* Engine Hood Grill */}
            <rect x="75" y="145" width="40" height="25" rx="3" fill="#151515" />
            <line x1="85" y1="145" x2="85" y2="170" stroke="#333" strokeWidth="2" />
            <line x1="95" y1="145" x2="95" y2="170" stroke="#333" strokeWidth="2" />
            <line x1="105" y1="145" x2="105" y2="170" stroke="#333" strokeWidth="2" />

            {/* Exhaust Pipe & Smoke */}
            <rect x="140" y="80" width="10" height="50" rx="2" fill="#222" />
            <ellipse cx="145" cy="80" rx="6" ry="3" fill="#555" />

            {/* Cab Structure (Glassmorphism & Roll Cage) */}
            <path
              d="M210 130 L250 70 L340 70 L330 170 L240 170 Z"
              fill="#1A1A1A"
              stroke="#F5C400"
              strokeWidth="4"
            />
            {/* Cab Windows */}
            <path
              d="M255 78 L330 78 L322 135 L230 135 Z"
              fill="rgba(56, 189, 248, 0.25)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
            {/* Cab Interior Operator Silhouette */}
            <circle cx="280" cy="105" r="12" fill="#111" />
            <path d="M265 135 C265 120, 295 120, 295 135 Z" fill="#111" />

            {/* Articulation Joint */}
            <circle cx="260" cy="205" r="16" fill="#333" stroke="#555" strokeWidth="3" />
            <circle cx="260" cy="205" r="7" fill="#F5C400" />

            {/* Front Boom Lift Arms */}
            <path
              d="M260 190 L440 180 L420 160 L270 170 Z"
              fill="#F5C400"
              stroke="#B38A00"
              strokeWidth="3"
            />
            {/* Secondary Hydraulic Tilt Ram */}
            <path
              d="M310 150 L420 110 L410 100 L300 140 Z"
              fill="#222"
              stroke="#444"
              strokeWidth="2"
            />
            {/* Hydraulic Cylinder */}
            <rect
              x="320"
              y="130"
              width="60"
              height="14"
              rx="4"
              fill="#Silver"
              stroke="#999"
              strokeWidth="1.5"
            />

            {/* Heavy Front Bucket (Scoop) */}
            <path
              d="M430 180 L520 150 L560 210 L500 245 L415 220 Z"
              fill="#D9A300"
              stroke="#997300"
              strokeWidth="4"
            />
            {/* Bucket Teeth (High-tensile steel cutting edge) */}
            <polygon points="560,210 575,215 565,225" fill="#333" stroke="#222" />
            <polygon points="545,220 560,225 550,235" fill="#333" stroke="#222" />
            <polygon points="530,230 545,235 535,245" fill="#333" stroke="#222" />
            <polygon points="515,240 530,245 520,255" fill="#333" stroke="#222" />

            {/* Massive Deep-Tread Wheels & Hubs */}
            {/* Rear Wheel */}
            <g>
              <circle cx="150" cy="235" r="50" fill="#1C1C1C" stroke="#111" strokeWidth="5" />
              <circle cx="150" cy="235" r="32" fill="#E5B200" stroke="#B38A00" strokeWidth="3" />
              {/* Rim Bolt circle */}
              <circle cx="150" cy="235" r="14" fill="#333" />
              <circle cx="150" cy="225" r="3" fill="#FFF" />
              <circle cx="150" cy="245" r="3" fill="#FFF" />
              <circle cx="140" cy="235" r="3" fill="#FFF" />
              <circle cx="160" cy="235" r="3" fill="#FFF" />
            </g>

            {/* Front Wheel */}
            <g>
              <circle cx="370" cy="235" r="50" fill="#1C1C1C" stroke="#111" strokeWidth="5" />
              <circle cx="370" cy="235" r="32" fill="#E5B200" stroke="#B38A00" strokeWidth="3" />
              {/* Rim Bolt circle */}
              <circle cx="370" cy="235" r="14" fill="#333" />
              <circle cx="370" cy="225" r="3" fill="#FFF" />
              <circle cx="370" cy="245" r="3" fill="#FFF" />
              <circle cx="360" cy="235" r="3" fill="#FFF" />
              <circle cx="380" cy="235" r="3" fill="#FFF" />
            </g>

            {/* Working Headlights Beam */}
            <polygon
              points="440,150 590,130 590,260 440,170"
              fill="url(#headlightGlow)"
              opacity="0.35"
            />

            <defs>
              <linearGradient id="headlightGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFF" stopOpacity="0.8" />
                <stop offset="30%" stopColor="#F5C400" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F5C400" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Ground Line / Dark Terrain Edge */}
      <div className="absolute bottom-0 inset-x-0 h-[10%] bg-gradient-to-t from-black via-[#0D0D0D] to-transparent border-t border-[#222]"></div>
    </div>
  );
}
