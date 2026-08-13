'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

type Layer = {
  /** file in /public/hero/layers */
  src: string;
  alt: string;
  /** intrinsic size of the layer file */
  iw: number;
  ih: number;
  /** 0 = far away, 1 = closest to viewer. Drives parallax, blur and scale. */
  depth: number;
  /** center position + width, desktop */
  d: { x: number; y: number; w: string };
  /** center position + width, mobile */
  m: { x: number; y: number; w: string };
  /** seconds, idle float cycle */
  float: number;
  delay: number;
};

// arranged around the centred copy: a left column (tubing behind the PLC, cylinder
// under it) balanced by the HMI and the macro lens on the right
const LAYERS: Layer[] = [
  {
    src: 'pneumatic-tubing-sweep.webp',
    alt: 'Pneumatic tubing with push-in connectors',
    iw: 1200,
    ih: 815,
    depth: 0.14,
    // sits behind the PLC and runs off the left edge of the screen
    d: { x: 10, y: 35, w: 'clamp(300px, 34vw, 620px)' },
    m: { x: 12, y: 12, w: 'clamp(200px, 62vw, 340px)' },
    float: 16,
    delay: -7,
  },
  {
    src: 'plc-din-rail.webp',
    alt: 'PLC control modules on DIN rail',
    iw: 1200,
    ih: 998,
    depth: 0.25,
    d: { x: 15, y: 22, w: 'clamp(170px, 21vw, 400px)' },
    m: { x: 26, y: 13, w: 'clamp(140px, 40vw, 240px)' },
    float: 11,
    delay: 0,
  },
  {
    src: 'industrial-hmi.webp',
    alt: 'Industrial HMI touch panel',
    iw: 1200,
    ih: 1148,
    depth: 0.34,
    d: { x: 86, y: 21, w: 'clamp(160px, 18vw, 340px)' },
    m: { x: 76, y: 15, w: 'clamp(130px, 36vw, 220px)' },
    float: 13,
    delay: -2,
  },
  {
    src: 'pneumatic-cylinder-valve.webp',
    alt: 'Pneumatic cylinder with solenoid valve',
    iw: 1200,
    ih: 901,
    depth: 0.5,
    d: { x: 14, y: 74, w: 'clamp(200px, 24vw, 460px)' },
    m: { x: 18, y: 88, w: 'clamp(140px, 40vw, 240px)' },
    float: 10,
    delay: -5,
  },
  {
    src: 'macro-lens.webp',
    alt: 'Machine vision camera macro lens with laser inspection beam',
    iw: 1500,
    ih: 1141,
    depth: 1,
    d: { x: 85, y: 74, w: 'clamp(340px, 36vw, 700px)' },
    m: { x: 66, y: 84, w: 'clamp(240px, 70vw, 400px)' },
    float: 15,
    delay: -3,
  },
];

const BRANDS = ['NORGREN', 'SMC', 'HIKROBOT', 'HIKVISION', 'CONTINENTAL', 'CONTITECH', 'VIBCO'];

/** iOS 13+ gates the gyro behind an explicit user gesture. */
type OrientationCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const MOBILE_QUERY = '(max-width: 767px)';

function subscribeMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** gyro support never changes at runtime, so there is nothing to subscribe to */
const noopSubscribe = () => () => {};

/** iOS gates the gyro behind a gesture; every other platform just delivers it. */
function gyroNeedsPermission() {
  return (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as OrientationCtor).requestPermission === 'function'
  );
}

export default function Hero3D() {
  const stageRef = useRef<HTMLElement>(null);
  const [motionGranted, setMotionGranted] = useState(false);

  const isMobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
  const showMotionPrompt =
    useSyncExternalStore(noopSubscribe, gyroNeedsPermission, () => false) && !motionGranted;

  // Pointer / gyro -> two CSS variables on the stage. Written from a rAF loop so
  // React never re-renders while the scene moves.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.style.setProperty('--tx', '0');
      stage.style.setProperty('--ty', '0');
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;
    let idle = true;
    let t = 0;

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const onPointer = (e: PointerEvent) => {
      idle = false;
      targetX = clamp((e.clientX / window.innerWidth) * 2 - 1);
      targetY = clamp((e.clientY / window.innerHeight) * 2 - 1);
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      idle = false;
      // gamma: left/right tilt, beta: front/back tilt (45deg = comfortable hold)
      targetX = clamp(e.gamma / 28);
      targetY = clamp((e.beta - 45) / 28);
    };

    const tick = () => {
      t += 1 / 60;
      if (idle) {
        // gentle drift before the visitor touches anything
        targetX = Math.sin(t * 0.32) * 0.35;
        targetY = Math.cos(t * 0.24) * 0.22;
      }
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      stage.style.setProperty('--tx', curX.toFixed(4));
      stage.style.setProperty('--ty', curY.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onOrientation);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, []);

  const enableMotion = async () => {
    const ctor = DeviceOrientationEvent as OrientationCtor;
    try {
      const res = await ctor.requestPermission?.();
      if (res === 'granted') setMotionGranted(true);
    } catch {
      setMotionGranted(true);
    }
  };

  return (
    <section
      ref={stageRef}
      className="hero3d relative w-full min-h-[100svh] overflow-hidden bg-black select-none"
      style={{ '--tx': 0, '--ty': 0 } as React.CSSProperties}
    >
      {/* ---------- backdrop: tubing ribbon plate + glow + floor grid ---------- */}
      <div className="hero3d-far absolute inset-0">
        <div className="absolute inset-[-6%]">
          <Image
            src="/hero/layers/backdrop-tubing-ribbon.webp"
            alt="Pneumatic tubing sweeping toward a cylinder manifold"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[35%_center] md:object-center"
            style={{ filter: 'brightness(0.38) blur(3px)' }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 72% 42%, rgba(220,38,38,0.22) 0%, rgba(120,10,10,0.10) 32%, rgba(0,0,0,0) 65%)',
          }}
        />
        <div className="hero3d-grid absolute inset-x-[-30%] bottom-[-20%] h-[75%] opacity-35" />
        <div className="hero3d-scan absolute inset-0 opacity-[0.35]" />
      </div>

      {/* ---------- product layers ---------- */}
      {LAYERS.map((l) => {
        const pos = isMobile ? l.m : l.d;
        const shiftX = 46 * l.depth;
        const shiftY = 26 * l.depth;
        const rot = 5 * l.depth;
        return (
          <div
            key={l.src}
            className="hero3d-layer absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: pos.w,
              zIndex: 10 + Math.round(l.depth * 10),
              transform: `translate(-50%, -50%) perspective(1200px)
                translate3d(calc(var(--tx) * ${-shiftX}px), calc(var(--ty) * ${-shiftY}px), 0)
                rotateY(calc(var(--tx) * ${rot}deg))
                rotateX(calc(var(--ty) * ${-rot}deg))`,
            }}
          >
            <Image
              src={`/hero/layers/${l.src}`}
              alt={l.alt}
              width={l.iw}
              height={l.ih}
              sizes={l.depth === 1 ? '(max-width: 767px) 92vw, 46vw' : '(max-width: 767px) 62vw, 34vw'}
              priority={l.depth >= 0.6}
              loading={l.depth >= 0.6 ? undefined : 'eager'}
              draggable={false}
              className="hero3d-float w-full h-auto"
              style={{
                animationDuration: `${l.float}s`,
                animationDelay: `${l.delay}s`,
                filter:
                  `brightness(${(0.62 + l.depth * 0.38).toFixed(2)}) blur(${((1 - l.depth) * 1.4).toFixed(2)}px)` +
                  (l.depth >= 0.6
                    ? ` drop-shadow(0 ${Math.round(l.depth * 26)}px ${Math.round(l.depth * 40)}px rgba(0,0,0,0.8))`
                    : ''),
              }}
            />
          </div>
        );
      })}

      {/* ---------- scrims so copy stays readable over the render ---------- */}
      <div
        className="absolute inset-0 z-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(58% 52% at 50% 50%, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 48%, rgba(0,0,0,0) 78%)',
        }}
      />
      <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/50" />

      {/* ---------- copy ---------- */}
      <div className="relative z-40 min-h-[100svh] flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-24">
          {/* copy stays put — no parallax transform here */}
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-white">
              Indonesia
              <br />
              <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-300 bg-clip-text text-transparent">
                Market Leader
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
              Solusi lengkap untuk suku cadang premium dengan harga terjangkau.
              Pneumatic, automation, vision system, dan sealing dari brand kelas dunia.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_-8px_rgba(220,38,38,0.9)] transition-all duration-300 hover:bg-red-500 hover:scale-105"
              >
                Jelajahi Produk
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/5"
              >
                Hubungi Kami
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-gray-500">
              {BRANDS.map((b) => (
                <span key={b} className="transition-colors duration-300 hover:text-gray-300">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showMotionPrompt && (
        <button
          type="button"
          onClick={enableMotion}
          className="md:hidden absolute bottom-5 right-5 z-50 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm"
        >
          Aktifkan efek gerak
        </button>
      )}
    </section>
  );
}
