import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MAJOR_RAIDS } from '../data/majorRaids';
import { RaidId } from '../types/game';

export type { RaidId };

interface RaidBackdropProps {
  raidId: RaidId;
  crisisMeter: number;
  isMaze: boolean;
}

interface RaidTheme {
  image: string;
  tint: string;
  /** rgb triplet for glows */
  glow: string;
  base: string;
  kicker: string;
  subtitle: string;
}

export const RAID_THEMES: Record<RaidId, RaidTheme> = {
  raid_ddos: {
    image: '/assets/raids/raid_stargate.jpg',
    tint: 'rgba(245,158,11,0.16)',
    glow: '245,158,11',
    base: '#080a12',
    kicker: 'SCENARIO I · NEW YEAR EVE',
    subtitle: '除夕百倍僵尸围城',
  },
  raid_coup: {
    image: '/assets/raids/raid_geneva.jpg',
    tint: 'rgba(225,29,72,0.16)',
    glow: '244,63,94',
    base: '#0b0609',
    kicker: 'SCENARIO II · 72H COUP',
    subtitle: '感恩节午夜夺门政变',
  },
  raid_misanthropic: {
    image: '',
    tint: 'rgba(216,180,106,0.16)',
    glow: '216,180,106',
    base: '#0c0812',
    kicker: 'SCENARIO III · VATICAN & IPO',
    subtitle: '封圣与万亿敲钟夜',
  },
  raid_deadnet: {
    image: '/assets/raids/raid_deadnet.jpg',
    tint: 'rgba(56,189,248,0.14)',
    glow: '163,230,53',
    base: '#07050d',
    kicker: 'SCENARIO IV · DEAD INTERNET',
    subtitle: '全球蓝屏与死网崩溃',
  },
};

/** Deterministic pseudo-random so particles don't reshuffle every render */
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ */
/* Fallback vector scenes (used when the illustration fails to load)   */
/* ------------------------------------------------------------------ */
const FallbackScene: React.FC<{ raidId: RaidId }> = ({ raidId }) => {
  if (raidId === 'raid_ddos') {
    return (
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="sgCore" cx="50%" cy="22%" r="40%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="800" fill="#080a12" />
        <rect width="400" height="800" fill="url(#sgCore)" />
        <g fill="none" stroke="#f59e0b">
          <circle cx="200" cy="175" r="120" strokeOpacity="0.35" strokeWidth="14" />
          <circle cx="200" cy="175" r="120" strokeOpacity="0.8" strokeWidth="1.5" strokeDasharray="6 10" />
          <circle cx="200" cy="175" r="96" strokeOpacity="0.25" strokeWidth="1" />
        </g>
        <g fill="#0d1220">
          <path d="M0 800 L0 640 L40 620 L40 560 L80 545 L80 610 L120 600 L120 520 L170 500 L170 600 L230 590 L230 510 L280 530 L280 600 L320 590 L320 540 L360 555 L360 620 L400 630 L400 800 Z" />
        </g>
      </svg>
    );
  }
  if (raidId === 'raid_coup') {
    return (
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <rect width="400" height="800" fill="#0b0609" />
        <g fill="#1a0b10">
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M${20 + i * 60} 120 L${48 + i * 60} 120 L${44 + i * 60} 560 L${24 + i * 60} 560 Z`} />
          ))}
        </g>
        <g transform="translate(200 210)" fill="#2a0c14" stroke="#f43f5e" strokeOpacity="0.55" strokeWidth="1.5">
          <rect x="-46" y="-30" width="92" height="70" rx="6" />
          <rect x="-28" y="-80" width="12" height="50" />
          <rect x="16" y="-80" width="12" height="50" />
          <path d="M-14 40 L14 40 L8 140 L-8 140 Z" />
        </g>
      </svg>
    );
  }
  if (raidId === 'raid_misanthropic') {
    return (
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="vaticanBell" cx="50%" cy="22%" r="44%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="55%" stopColor="#9333ea" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0c0812" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="800" fill="#0c0812" />
        <rect width="400" height="800" fill="url(#vaticanBell)" />
        {/* Gothic Cathedral Stained-Glass Rose Window + Gilded Nasdaq Bell */}
        <g transform="translate(200 175)">
          <polygon points="0,-135 95,-95 135,0 95,95 0,135 -95,95 -135,0 -95,-95" fill="#180e24" stroke="#d8b46a" strokeOpacity="0.5" strokeWidth="2" />
          <polygon points="0,-105 74,-74 105,0 74,74 0,105 -74,74 -105,0 -74,-74" fill="#241336" stroke="#f59e0b" strokeOpacity="0.45" strokeWidth="1.2" />
          {/* Stained-glass facets */}
          <polygon points="0,-105 32,-32 0,0 -32,-32" fill="#dc2626" fillOpacity="0.32" />
          <polygon points="105,0 32,32 0,0 32,-32" fill="#7c3aed" fillOpacity="0.32" />
          <polygon points="0,105 -32,32 0,0 32,32" fill="#d97706" fillOpacity="0.32" />
          <polygon points="-105,0 -32,-32 0,0 -32,32" fill="#0284c7" fillOpacity="0.32" />
          {/* Golden Nasdaq Opening Bell silhouette */}
          <path d="M-38 26 L38 26 L48 42 L-48 42 Z" fill="#f59e0b" fillOpacity="0.85" />
          <path d="M-30 26 L-24 -28 L0 -46 L24 -28 L30 26 Z" fill="#d8b46a" fillOpacity="0.88" />
          <circle cx="0" cy="48" r="9" fill="#fde68a" />
        </g>
        {/* Gothic Arches & Stock Candlestick Pillars */}
        <g fill="#150d21" stroke="#d8b46a" strokeOpacity="0.22" strokeWidth="1">
          <path d="M25 800 L25 560 L65 500 L105 560 L105 800 Z" />
          <path d="M145 800 L145 530 L200 460 L255 530 L255 800 Z" />
          <path d="M295 800 L295 560 L335 500 L375 560 L375 800 Z" />
        </g>
        {/* Stock crash jagged line */}
        <polyline
          points="0,610 65,585 125,620 190,565 245,645 315,630 400,705"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2.5"
          strokeOpacity="0.65"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <rect width="400" height="800" fill="#07050d" />
      <g fill="#120c1c">
        <path d="M0 800 L0 600 L50 560 L60 640 L110 580 L130 660 L180 610 L210 680 L260 600 L290 650 L340 590 L400 640 L400 800 Z" />
      </g>
      <g fill="#a3e635" fillOpacity="0.35">
        {Array.from({ length: 30 }).map((_, i) => (
          <rect key={i} x={seeded(i) * 400} y={80 + seeded(i + 99) * 520} width={4 + seeded(i + 7) * 10} height="4" />
        ))}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Animated FX layers                                                  */
/* ------------------------------------------------------------------ */
const DdosFX: React.FC = () => {
  const embers = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        left: seeded(i) * 100,
        size: 2 + seeded(i + 3) * 3,
        dur: 5 + seeded(i + 11) * 7,
        delay: -seeded(i + 21) * 14,
        drift: (seeded(i + 31) - 0.5) * 60,
      })),
    []
  );
  return (
    <>
      <div className="raid-art-column top-[23%] !bottom-auto h-0 pointer-events-none opacity-70">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[105%] aspect-square">
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full raid-spin-slow">
            <circle cx="100" cy="100" r="62" fill="none" stroke="#f59e0b" strokeOpacity="0.45" strokeWidth="0.6" strokeDasharray="1 3" />
          </svg>
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full raid-spin-rev">
            <circle cx="100" cy="100" r="74" fill="none" stroke="#ef4444" strokeOpacity="0.35" strokeWidth="0.5" strokeDasharray="10 6 2 6" />
            <circle cx="100" cy="26" r="1.4" fill="#fde68a" />
          </svg>
        </div>
      </div>
      <div className="raid-gate-glow" />
      {embers.map((e, i) => (
        <span
          key={i}
          className="raid-ember"
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animationDuration: `${e.dur}s`,
              animationDelay: `${e.delay}s`,
              ['--drift' as string]: `${e.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
};

const CoupFX: React.FC = () => (
  <>
    <div className="raid-alarm-strobe" />
    <div className="raid-spot-sweep" />
    <div className="raid-art-column pointer-events-none">
      <div className="raid-plug-spark" />
    </div>
  </>
);

const MisanthropicFX: React.FC = () => {
  const gildLeaves = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        left: seeded(i + 2) * 100,
        size: 2.5 + seeded(i + 8) * 3.5,
        dur: 7 + seeded(i + 15) * 7,
        delay: -seeded(i + 27) * 12,
        drift: (seeded(i + 41) - 0.5) * 50,
      })),
    []
  );
  return (
    <>
      <div className="raid-spot-sweep opacity-65" />
      <div className="raid-art-column top-[22%] !bottom-auto h-0 pointer-events-none opacity-75">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[96%] aspect-square">
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full raid-spin-slow">
            <circle cx="100" cy="100" r="68" fill="none" stroke="#d8b46a" strokeOpacity="0.5" strokeWidth="0.6" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="54" fill="none" stroke="#c084fc" strokeOpacity="0.35" strokeWidth="0.5" strokeDasharray="1 4" />
          </svg>
        </div>
      </div>
      {gildLeaves.map((e, i) => (
        <span
          key={i}
          className="raid-ember"
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animationDuration: `${e.dur}s`,
              animationDelay: `${e.delay}s`,
              ['--drift' as string]: `${e.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
};

const DeadnetFX: React.FC<{ isMaze: boolean }> = ({ isMaze }) => {
  const blocks = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        left: seeded(i + 5) * 100,
        w: 3 + seeded(i + 9) * 18,
        dur: 6 + seeded(i + 13) * 9,
        delay: -seeded(i + 17) * 15,
        hue: seeded(i + 23) > 0.6 ? 'magenta' : 'acid',
      })),
    []
  );
  return (
    <>
      {blocks.map((b, i) => (
        <span
          key={i}
          className={`raid-spore ${b.hue === 'magenta' ? 'raid-spore-magenta' : ''}`}
          style={{
            left: `${b.left}%`,
            width: b.w,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
      <div className="raid-glitch-slice" />
      {isMaze && <div className="raid-maze-floor" />}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export const RaidBackdrop: React.FC<RaidBackdropProps> = ({ raidId, crisisMeter, isMaze }) => {
  const theme = RAID_THEMES[raidId];
  const [imgFailed, setImgFailed] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const raidDef = MAJOR_RAIDS[raidId];

  useEffect(() => {
    setImgFailed(false);
    setShowTitle(true);
    const t = setTimeout(() => setShowTitle(false), 2600);
    return () => clearTimeout(t);
  }, [raidId]);

  const intensity = Math.max(0, Math.min(1, crisisMeter / 100));
  const highDanger = crisisMeter >= 60;
  const meltdownDanger = crisisMeter >= 75;
  const dangerRatio = highDanger ? Math.min(1, (crisisMeter - 60) / 35) : 0;
  const titleParts = raidDef?.title.split('·') ?? [];
  const mainTitle = (titleParts[1] ?? raidDef?.title ?? '').trim();

  return (
    <>
      <motion.div
        key={raidId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ backgroundColor: theme.base }}
      >
        {/* Illustration: blurred full-bleed fill + sharp 9:16 column */}
        {theme.image && !imgFailed ? (
          <>
            <img
              src={theme.image}
              alt=""
              draggable={false}
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-45"
            />
            <div className="raid-art-column raid-kenburns">
              <img
                src={theme.image}
                alt=""
                draggable={false}
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 raid-kenburns">
            <FallbackScene raidId={raidId} />
          </div>
        )}

        {/* Readability grade */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${theme.base}99 0%, ${theme.base}1a 16%, ${theme.base}40 38%, ${theme.base}73 62%, ${theme.base}33 86%, ${theme.base}99 100%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(55% 38% at 50% 58%, ${theme.base}b3, transparent 75%)`,
          }}
        />
        <div className="absolute inset-0 mix-blend-color" style={{ background: theme.tint }} />

        {/* Animated FX */}
        {raidId === 'raid_ddos' && <DdosFX />}
        {raidId === 'raid_coup' && <CoupFX />}
        {raidId === 'raid_misanthropic' && <MisanthropicFX />}
        {raidId === 'raid_deadnet' && <DeadnetFX isMaze={isMaze} />}

        {/* Base Crisis pressure */}
        <div
          className="absolute inset-0 raid-crisis-pulse"
          style={
            {
              boxShadow: `inset 0 0 ${60 + intensity * 120}px rgba(${theme.glow}, ${0.12 + intensity * 0.45})`,
              animationDuration: `${2.6 - intensity * 1.6}s`,
            } as React.CSSProperties
          }
        />

        {/* High-Crisis (>=60% Overload / >=75% Meltdown) Urgent Crimson Heartbeat Vignette */}
        {highDanger && (
          <div
            className="absolute inset-0 raid-crisis-pulse"
            style={
              {
                boxShadow: meltdownDanger
                  ? `inset 0 0 ${115 + dangerRatio * 110}px rgba(225, 29, 72, ${0.42 + dangerRatio * 0.43})`
                  : `inset 0 0 ${80 + dangerRatio * 75}px rgba(245, 158, 11, ${0.22 + dangerRatio * 0.28})`,
                animationDuration: meltdownDanger
                  ? `${0.85 - dangerRatio * 0.35}s`
                  : `${1.35 - dangerRatio * 0.35}s`,
              } as React.CSSProperties
            }
          />
        )}
      </motion.div>

      {/* Scenario title card on entry */}
      <AnimatePresence>
        {showTitle && raidDef && (
          <motion.div
            key={`title-${raidId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="fixed inset-0 z-[35] pointer-events-none flex items-center justify-center"
            style={{
              background: `radial-gradient(80% 50% at 50% 50%, ${theme.base}fa, ${theme.base}e0 70%, ${theme.base}c0)`,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            <div className="text-center px-6">
              <motion.div
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={{ opacity: 1, letterSpacing: '0.42em' }}
                transition={{ duration: 1 }}
                className="text-[10px] font-mono font-bold"
                style={{ color: `rgb(${theme.glow})` }}
              >
                {theme.kicker}
              </motion.div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="h-px w-48 mx-auto my-3"
                style={{ background: `linear-gradient(90deg, transparent, rgb(${theme.glow}), transparent)` }}
              />
              <motion.div
                initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-display text-[24px] font-black text-gilded leading-snug drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
              >
                {mainTitle}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ delay: 0.8 }}
                className="mt-2 text-[11px] tracking-[0.25em] text-slate-300"
              >
                危机 · {raidDef.crisisName}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
