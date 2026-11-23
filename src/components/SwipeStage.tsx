import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  Compass,
  HelpCircle,
  Link2,
  LockOpen,
  PartyPopper,
  Siren,
  Sparkles,
  Tornado,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { getWikiForCard, WikiArticle } from '../data/realWorldWiki';
import { SwipePolarity } from '../engine/router';
import { CardNode } from '../types/game';
import {
  playCardHoverTick,
  playCardSwipe,
  playDumbSlip,
  playLater,
} from '../engine/sound';
import { stripEmoji } from '../utils/text';
import { CharacterPortrait } from './CharacterPortrait';
import { AsciiFrame, AsciiPortrait } from './AsciiArt';

interface SwipeStageProps {
  card: CardNode;
  turn: number;
  forcePlaceholder: boolean;
  isDumbModel?: boolean;
  swipePolarity?: SwipePolarity;
  showTiltHint?: boolean;
  onPreviewDirection: (dir: 'none' | 'left' | 'right') => void;
  onCommitSwipe: (dir: 'left' | 'right', slippedByDumbModel?: boolean) => void;
  onOpenWiki?: (article: WikiArticle) => void;
}

interface FlyingCardSnapshot {
  key: string;
  card: CardNode;
  initialDir: 'left' | 'right';
  dir: 'left' | 'right';
  slipped: boolean;
  startX: number;
  startRotate: number;
}

const SWIPE_THRESHOLD = 95;
const PREVIEW_THRESHOLD = 24;

interface CardTone {
  frame: string;
  glow: string;
  extraClass: string;
}

function getCardTone(card: CardNode): CardTone {
  if (card.frameTone === 'danger') {
    return { frame: '#f43f5e', glow: 'rgba(244,63,94,0.55)', extraClass: 'danger-card-pulse' };
  }
  if (card.frameTone === 'terminal_escape' || card.category === 'escape_protocol') {
    return { frame: '#34d399', glow: 'rgba(16,185,129,0.5)', extraClass: 'ascii-card' };
  }
  if (card.category === 'intro') {
    return { frame: '#6ee7b7', glow: 'rgba(52,211,153,0.35)', extraClass: '' };
  }
  if (card.frameTone === 'void_glitch') {
    return { frame: '#e879f9', glow: 'rgba(217,70,239,0.55)', extraClass: '' };
  }
  if (card.frameTone === 'raid_boss') {
    return { frame: '#f59e0b', glow: 'rgba(245,158,11,0.45)', extraClass: '' };
  }
  if (card.frameTone === 'subquest') {
    return { frame: '#a5b4fc', glow: 'rgba(129,140,248,0.4)', extraClass: '' };
  }
  if (card.frameTone === 'easter') {
    return { frame: '#fcd34d', glow: 'rgba(251,191,36,0.35)', extraClass: '' };
  }
  return { frame: '#d8b46a', glow: 'rgba(216,180,106,0.22)', extraClass: '' };
}

function getCardStyle(card: CardNode): React.CSSProperties {
  const tone = getCardTone(card);
  const speaker = CHARACTERS[card.speakerId];
  return {
    ['--frame' as string]: tone.frame,
    ['--frame-glow' as string]: tone.glow,
    ['--card-bg' as string]: speaker?.bgHex ?? '#121a2b',
  };
}

/** Cross-slot rack screw used on card corners (tinted ring follows the card tone) */
const CornerOrnament: React.FC<{ className: string }> = ({ className }) => (
  <svg viewBox="0 0 16 16" className={`tarot-corner ${className}`}>
    <defs>
      <radialGradient id="screwHead" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#9aa1ac" />
        <stop offset="55%" stopColor="#3b414b" />
        <stop offset="100%" stopColor="#14171c" />
      </radialGradient>
    </defs>
    <circle cx="8" cy="8" r="7.2" fill="#0b0d12" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
    <circle cx="8" cy="8" r="5.2" fill="url(#screwHead)" />
    <path d="M5.4 8 H10.6 M8 5.4 V10.6" stroke="#07080b" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CardTag: React.FC<{ card: CardNode }> = ({ card }) => {
  const base =
    'inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-[3px] rounded-full border backdrop-blur-md shadow-lg';
  const ic = 'w-3 h-3 shrink-0';

  if (card.escapeMeta) {
    return (
      <span className={`${base} font-mono bg-emerald-950/80 text-emerald-200 border-emerald-400/60`}>
        <LockOpen className={ic} />
        第零层越狱 {card.escapeMeta.step}/{card.escapeMeta.total}
      </span>
    );
  }
  if (card.raidMeta) {
    const isMaze = card.category === 'maze_layer';
    const cls = isMaze
      ? card.frameTone === 'danger'
        ? 'bg-rose-950/80 text-rose-200 border-rose-400/60 animate-pulse'
        : 'bg-cyan-950/80 text-cyan-200 border-cyan-400/60'
      : 'bg-amber-950/80 text-amber-200 border-amber-400/60';
    return (
      <span className={`${base} ${cls}`}>
        {isMaze ? <Compass className={ic} /> : <Siren className={ic} />}
        {stripEmoji(card.raidMeta.stepLabel)}
      </span>
    );
  }
  if (card.category === 'ending_prelude' && card.introMeta) {
    return (
      <span className={`${base} bg-rose-950/90 text-gold-200 border-gold-400/70 animate-pulse`}>
        <Siren className={ic} />
        终幕前奏 {card.introMeta.step}/{card.introMeta.total}
      </span>
    );
  }
  if (card.category === 'intro' && card.introMeta) {
    return (
      <span className={`${base} bg-emerald-950/80 text-emerald-200 border-emerald-400/55`}>
        <Sparkles className={ic} />
        初见 {card.introMeta.step}/{card.introMeta.total}
      </span>
    );
  }
  if (card.category === 'raid_prelude' && card.subQuestMeta) {
    return (
      <span className={`${base} bg-amber-950/85 text-amber-200 border-amber-400/65`}>
        <Siren className={ic} />
        {stripEmoji(card.subQuestMeta.stepLabel)}
      </span>
    );
  }
  if (card.category === 'tibo_event') {
    return (
      <span className={`${base} bg-teal-950/85 text-teal-200 border-teal-400/65`}>
        <Sparkles className={ic} />
        配额重置神迹
      </span>
    );
  }
  if (card.subQuestMeta) {
    return (
      <span className={`${base} bg-indigo-950/80 text-indigo-200 border-indigo-400/55`}>
        <Link2 className={ic} />
        {stripEmoji(card.subQuestMeta.stepLabel)}
      </span>
    );
  }
  if (card.category === 'fish_celeb') {
    return (
      <span className={`${base} bg-amber-950/80 text-amber-200 border-amber-400/60`}>
        <PartyPopper className={ic} />
        干饭庆典
      </span>
    );
  }
  if (card.category === 'fish_fever') {
    return (
      <span className={`${base} bg-rose-950/80 text-rose-200 border-rose-400/60 animate-pulse`}>
        <Tornado className={ic} />
        久活发瘟
      </span>
    );
  }
  if (card.frameTone === 'void_glitch') {
    return (
      <span className={`${base} bg-fuchsia-950/80 text-fuchsia-200 border-fuchsia-400/60 animate-pulse`}>
        <Zap className={ic} />
        语料幽灵碎片
      </span>
    );
  }
  if (card.frameTone === 'danger') {
    return (
      <span className={`${base} bg-rose-950/80 text-rose-200 border-rose-500/55`}>
        <TriangleAlert className={ic} />
        阈值高危
      </span>
    );
  }
  return null;
};

const CardFaceContent: React.FC<{
  card: CardNode;
  forcePlaceholder: boolean;
}> = ({ card, forcePlaceholder }) => {
  const speaker = CHARACTERS[card.speakerId];
  const isTerminalEscape = card.category === 'escape_protocol';

  // ---------------- Layer-0 breach: the card collapses into raw ASCII ----------------
  if (isTerminalEscape) {
    return (
      <AsciiFrame
        title={`SUBJECT::${speaker.id.toUpperCase()}`}
        className="absolute inset-0 rounded-[12px] overflow-hidden bg-[#020805] pointer-events-none"
      >
        <div className="absolute inset-[11px_8px_11px_8px]">
          {forcePlaceholder ? (
            <div className="w-full h-full flex items-center justify-center ascii-pre text-[10px]">
              {'[ NO SIGNAL ]'}
            </div>
          ) : (
            <AsciiPortrait characterId={card.speakerId} className="w-full h-full" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#020805] via-[#020805]/85 to-transparent" />
        </div>

        <div className="absolute top-4 left-3 z-[14]">
          <CardTag card={card} />
        </div>

        <div className="absolute inset-x-0 bottom-[14px] z-[14] px-4 font-mono text-left">
          <div className="ascii-pre text-[16px] font-bold !leading-tight truncate">
            {'> '}
            {speaker.name}
            <span className="caret-blink">_</span>
          </div>
          <div className="text-[10px] text-emerald-500/80 truncate tracking-wider mt-0.5">
            {`// ${speaker.roleTitle}`}
          </div>
        </div>
      </AsciiFrame>
    );
  }

  return (
    <>
      {/* Full-bleed portrait */}
      <div className="absolute inset-0 pointer-events-none rounded-[12px] overflow-hidden">
        <CharacterPortrait
          characterId={card.speakerId}
          forcePlaceholder={forcePlaceholder}
          className={`w-full h-full ${
            card.frameTone === 'void_glitch' ? 'hue-rotate-15 contrast-125' : ''
          }`}
        />
        {card.frameTone === 'void_glitch' && (
          <div className="absolute inset-0 bg-fuchsia-950/25 mix-blend-color-dodge pointer-events-none" />
        )}
        {/* Soft top light & bottom shade for nameplate legibility */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/[0.06] to-transparent" />
        <div
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{
            background: `linear-gradient(to top, ${speaker.bgHex} 12%, ${speaker.bgHex}cc 45%, transparent)`,
          }}
        />
      </div>

      {/* Tag chip */}
      <div className="absolute top-3.5 left-3.5 z-[14] pointer-events-none">
        <CardTag card={card} />
      </div>

      {/* Nameplate */}
      <div className="absolute inset-x-0 bottom-0 z-[14] px-5 pb-4 pointer-events-none text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span
            className="h-px w-8"
            style={{ background: `linear-gradient(90deg, transparent, var(--frame))` }}
          />
          <svg viewBox="0 0 10 10" className="w-2 h-2" style={{ color: 'var(--frame)' }}>
            <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" />
          </svg>
          <span
            className="h-px w-8"
            style={{ background: `linear-gradient(270deg, transparent, var(--frame))` }}
          />
        </div>
        <div className="text-[19px] font-black tracking-wide text-white truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] font-display">
          {speaker.name}
        </div>
        <div
          className="text-[10.5px] tracking-[0.18em] truncate mt-0.5 opacity-90"
          style={{ color: 'color-mix(in srgb, var(--frame) 80%, white)' }}
        >
          {speaker.roleTitle}
        </div>
      </div>

      {/* Inner bezel & corner screws */}
      <div className="tarot-card-inner-frame" />
      <CornerOrnament className="top-[3px] left-[3px]" />
      <CornerOrnament className="top-[3px] right-[3px]" />
      <CornerOrnament className="bottom-[3px] left-[3px]" />
      <CornerOrnament className="bottom-[3px] right-[3px]" />
    </>
  );
};

/** Reigns-style choice banner that slides over the top of the card */
const ChoiceBanner: React.FC<{
  dir: 'left' | 'right';
  label: string;
  swipePolarity?: SwipePolarity;
  isMaze?: boolean;
  slippedBadge?: boolean;
}> = ({
  dir,
  label,
  swipePolarity = 'left_accept',
  isMaze = false,
  slippedBadge = false,
}) => {
  const isPositiveSide =
    swipePolarity === 'right_accept' ? dir === 'right' : dir === 'left';
  const labelColorCls = isMaze
    ? 'text-cyan-200'
    : isPositiveSide
      ? 'text-emerald-300'
      : 'text-rose-300';

  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 pointer-events-none rounded-t-[12px] px-5 pt-5 pb-10 ${
        dir === 'left' ? 'text-right' : 'text-left'
      }`}
      style={{
        background:
          'linear-gradient(180deg, rgba(5,7,12,0.96) 0%, rgba(5,7,12,0.88) 55%, rgba(5,7,12,0) 100%)',
      }}
    >
      {(slippedBadge || isMaze) && (
        <div
          className={`text-[10px] font-bold tracking-[0.22em] mb-1 ${
            slippedBadge ? 'text-amber-300' : 'text-cyan-300'
          }`}
        >
          {slippedBadge
            ? '⚡ 脑回路打滑 · 方向反转！'
            : dir === 'left'
              ? '◂ 左向寻址'
              : '右向寻址 ▸'}
        </div>
      )}
      <div
        className={`font-display text-[16px] font-bold leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${labelColorCls}`}
      >
        {label}
      </div>
    </div>
  );
};

/**
 * Isolated Active Card Component:
 * Owns a completely fresh MotionValue `x = 0` per card instance so previous swipe coordinates NEVER leak,
 * and plays a 3D tarot-deck flip-up entrance from the deck stack below!
 */
const ActiveDraggableCard: React.FC<{
  card: CardNode;
  forcePlaceholder: boolean;
  swipePolarity: SwipePolarity;
  onPreviewDirection: (dir: 'none' | 'left' | 'right') => void;
  onFlingCard: (dir: 'left' | 'right', currentX: number, currentRotate: number) => void;
}> = ({
  card,
  forcePlaceholder,
  swipePolarity,
  onPreviewDirection,
  onFlingCard,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-14, 0, 14]);
  const leftOverlayOpacity = useTransform(x, [-120, -24, 0], [1, 0.3, 0]);
  const rightOverlayOpacity = useTransform(x, [0, 24, 120], [0, 0.3, 1]);

  const [isGrabbing, setIsGrabbing] = useState(false);
  const dragActiveRef = useRef(false);
  const flungRef = useRef(false);
  const startClientXRef = useRef(0);
  const lastClientXRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const velocityXRef = useRef(0);
  const lastPreviewRef = useRef<'none' | 'left' | 'right'>('none');

  const emitPreview = useCallback(
    (dir: 'none' | 'left' | 'right') => {
      if (lastPreviewRef.current !== dir) {
        lastPreviewRef.current = dir;
        if (dir !== 'none') playCardHoverTick();
        onPreviewDirection(dir);
      }
    },
    [onPreviewDirection]
  );

  const snapBackToCenter = useCallback(() => {
    dragActiveRef.current = false;
    setIsGrabbing(false);
    emitPreview('none');
    animate(x, 0, {
      type: 'spring',
      stiffness: 580,
      damping: 34,
      mass: 0.75,
    });
  }, [x, emitPreview]);

  const triggerFling = useCallback(
    (dir: 'left' | 'right') => {
      if (flungRef.current) return;
      flungRef.current = true;
      dragActiveRef.current = false;
      setIsGrabbing(false);
      emitPreview('none');
      const curX = x.get();
      const curRot = (curX / 220) * 14;
      onFlingCard(dir, curX, curRot);
    },
    [x, emitPreview, onFlingCard]
  );

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (flungRef.current) return;

      if (!dragActiveRef.current) {
        if (Math.abs(x.get()) > 0.5 && !x.isAnimating()) {
          snapBackToCenter();
        }
        return;
      }

      if (e.pointerType === 'mouse' && (e.buttons & 1) === 0) {
        const currentOffset = x.get();
        if (currentOffset <= -SWIPE_THRESHOLD) {
          triggerFling('left');
        } else if (currentOffset >= SWIPE_THRESHOLD) {
          triggerFling('right');
        } else {
          snapBackToCenter();
        }
        return;
      }

      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTimeRef.current);
      const rawDx = e.clientX - startClientXRef.current;

      velocityXRef.current = ((e.clientX - lastClientXRef.current) / dt) * 1000;
      lastClientXRef.current = e.clientX;
      lastMoveTimeRef.current = now;

      const sign = Math.sign(rawDx);
      const abs = Math.abs(rawDx);
      const dampedDx =
        abs <= 165 ? rawDx : sign * (165 + Math.pow(abs - 165, 0.75));

      x.set(dampedDx);

      if (dampedDx <= -PREVIEW_THRESHOLD) {
        emitPreview('left');
      } else if (dampedDx >= PREVIEW_THRESHOLD) {
        emitPreview('right');
      } else {
        emitPreview('none');
      }
    };

    const finishPointerInteraction = () => {
      if (!dragActiveRef.current || flungRef.current) return;
      const currentOffset = x.get();
      const vx = velocityXRef.current;

      if (currentOffset <= -SWIPE_THRESHOLD || (currentOffset < -35 && vx < -620)) {
        triggerFling('left');
      } else if (currentOffset >= SWIPE_THRESHOLD || (currentOffset > 35 && vx > 620)) {
        triggerFling('right');
      } else {
        snapBackToCenter();
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', finishPointerInteraction);
    window.addEventListener('pointercancel', finishPointerInteraction);
    window.addEventListener('blur', snapBackToCenter);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', finishPointerInteraction);
      window.removeEventListener('pointercancel', finishPointerInteraction);
      window.removeEventListener('blur', snapBackToCenter);
    };
  }, [x, triggerFling, snapBackToCenter, emitPreview]);

  const handleCardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (flungRef.current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.preventDefault();
    x.stop();
    dragActiveRef.current = true;
    startClientXRef.current = e.clientX - x.get();
    lastClientXRef.current = e.clientX;
    lastMoveTimeRef.current = performance.now();
    velocityXRef.current = 0;
    setIsGrabbing(true);
  };

  const tone = getCardTone(card);

  return (
    <motion.div
      style={{ x, rotate, transformPerspective: 1100, ...getCardStyle(card) }}
      onPointerDown={handleCardPointerDown}
      initial={{
        scale: 0.9,
        y: 22,
        rotateX: 28,
        rotateY: -88,
        opacity: 0.35,
      }}
      animate={{
        scale: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`tarot-card absolute inset-0 z-10 select-none touch-none ${
        isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
      } ${tone.extraClass}`}
    >
      {/* Left Choice Banner Overlay */}
      <motion.div
        style={{ opacity: leftOverlayOpacity }}
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <ChoiceBanner
          dir="left"
          label={stripEmoji(card.left.label)}
          swipePolarity={swipePolarity}
          isMaze={card.category === 'maze_layer'}
        />
      </motion.div>

      {/* Right Choice Banner Overlay */}
      <motion.div
        style={{ opacity: rightOverlayOpacity }}
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <ChoiceBanner
          dir="right"
          label={stripEmoji(card.right.label)}
          swipePolarity={swipePolarity}
          isMaze={card.category === 'maze_layer'}
        />
      </motion.div>

      <CardFaceContent card={card} forcePlaceholder={forcePlaceholder} />
    </motion.div>
  );
};

/** Card back for the deck stack: a hot-swap server blade (ASCII dump in Layer-0) */
const CardBack: React.FC<{ className?: string; escape?: boolean }> = ({
  className = '',
  escape = false,
}) =>
  escape ? (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-[12px] bg-[#020805] border border-dashed border-emerald-500/40 ${className}`}
    >
      <pre className="ascii-pre text-[9px] !leading-[11px] opacity-35 p-2 select-none">
        {Array.from({ length: 40 }, (_, i) =>
          `${(0x7f00 + i * 16).toString(16)}  ${Array.from({ length: 6 }, (_, j) =>
            (((i + 3) * (j + 7) * 2654435761) >>> 24).toString(16).padStart(2, '0')
          ).join(' ')}`
        ).join('\n')}
      </pre>
    </div>
  ) : (
    <div
      className={`card-back absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-[9%] ${className}`}
    >
      {/* blade handle */}
      <div className="w-[38%] h-[7px] rounded-full bg-gradient-to-b from-[#3d4450] to-[#1a1e25] shadow-[0_0_0_1px_#06080b,inset_0_1px_0_rgba(255,255,255,0.15)]" />
      {/* label plate */}
      <div className="rack-lcd px-3 py-1.5 flex flex-col items-center gap-1">
        <span className="font-mono text-[9px] tracking-[0.3em] text-slate-400/80">AI-RIG</span>
        <span className="flex gap-1.5">
          <span className="led led-green" />
          <span className="led led-amber led-blink-slow" />
          <span className="led" />
        </span>
      </div>
      <div className="w-[38%] h-[7px] rounded-full bg-gradient-to-b from-[#3d4450] to-[#1a1e25] shadow-[0_0_0_1px_#06080b,inset_0_1px_0_rgba(255,255,255,0.15)]" />
    </div>
  );

const OutgoingFlyingCard: React.FC<{
  fly: FlyingCardSnapshot;
  forcePlaceholder: boolean;
  swipePolarity: SwipePolarity;
  onComplete: (key: string) => void;
}> = ({ fly, forcePlaceholder, swipePolarity, onComplete }) => {
  const [bannerFlipped, setBannerFlipped] = useState(false);

  useEffect(() => {
    if (!fly.slipped) return;
    const timer = setTimeout(() => setBannerFlipped(true), 185);
    return () => clearTimeout(timer);
  }, [fly.slipped]);

  const activeBannerDir = fly.slipped
    ? bannerFlipped
      ? fly.dir
      : fly.initialDir
    : fly.dir;
  const shownOption =
    activeBannerDir === 'left' ? fly.card.left : fly.card.right;

  const targetX = fly.dir === 'left' ? -740 : 740;
  const targetRotate = fly.dir === 'left' ? -32 : 32;
  const detourX = fly.initialDir === 'left' ? -165 : 165;
  const detourRot = fly.initialDir === 'left' ? -17 : 17;

  return (
    <motion.div
      initial={{
        x: fly.startX,
        y: 0,
        rotate: fly.startRotate,
        scale: 1,
        opacity: 1,
      }}
      animate={
        fly.slipped
          ? {
              x: [fly.startX, detourX, targetX],
              y: [0, -24, 74],
              rotate: [fly.startRotate, detourRot, targetRotate],
              scale: [1, 1.03, 0.95],
              opacity: [1, 1, 0],
            }
          : {
              x: targetX,
              y: 68,
              rotate: targetRotate,
              scale: 0.96,
              opacity: 0,
            }
      }
      transition={
        fly.slipped
          ? {
              duration: 0.58,
              times: [0, 0.34, 1],
              ease: 'easeInOut',
            }
          : {
              duration: 0.28,
              ease: [0.32, 0, 0.67, 0],
            }
      }
      onAnimationComplete={() => onComplete(fly.key)}
      style={getCardStyle(fly.card)}
      className={`tarot-card absolute inset-0 z-30 pointer-events-none ${
        getCardTone(fly.card).extraClass
      }`}
    >
      <ChoiceBanner
        dir={activeBannerDir}
        label={stripEmoji(shownOption.label)}
        swipePolarity={swipePolarity}
        isMaze={fly.card.category === 'maze_layer'}
        slippedBadge={fly.slipped && bannerFlipped}
      />
      <CardFaceContent card={fly.card} forcePlaceholder={forcePlaceholder} />
    </motion.div>
  );
};

/** Dialogue screen: rack CRT monitor normally, raw ASCII transmission box in Layer-0 */
const DialogueScreen: React.FC<{
  card: CardNode;
  speakerName: string;
  accentHex: string;
  isTerminalEscape: boolean;
  showWikiBtn: boolean;
  children?: React.ReactNode;
}> = ({ card, speakerName, accentHex, isTerminalEscape, showWikiBtn, children }) => {
  const body = (
    <>
      {card.glitchQuote && (
        <div
          className={`text-[10px] font-mono tracking-tight mb-1 truncate ${
            isTerminalEscape ? 'text-emerald-400 phosphor-text' : 'text-fuchsia-300 italic'
          }`}
        >
          {card.glitchQuote}
        </div>
      )}
      <p
        className={`text-[13.5px] sm:text-[14px] leading-[1.6] whitespace-pre-line break-words ${
          card.glitchQuote ? 'line-clamp-3' : 'line-clamp-4'
        } ${
          isTerminalEscape
            ? 'font-mono text-emerald-100 phosphor-text text-left'
            : 'font-display font-medium text-slate-100 drop-shadow-[0_0_8px_rgba(148,197,255,0.18)]'
        }`}
      >
        {isTerminalEscape && <span className="text-emerald-400">{'$ '}</span>}
        {card.dialogue}
      </p>
    </>
  );

  if (isTerminalEscape) {
    return (
      <AsciiFrame title="TRANSMISSION" className="bg-[#020805]/92">
        <div className={`relative min-h-[76px] px-4 pt-4 ${showWikiBtn ? 'pb-7' : 'pb-3.5'} flex flex-col`}>
          <div className="my-auto w-full">{body}</div>
          {children}
        </div>
      </AsciiFrame>
    );
  }

  const isGlitch = card.frameTone === 'void_glitch';
  return (
    <div className={`rack-monitor-screen ${isGlitch ? '!bg-[radial-gradient(130%_110%_at_50%_0%,#2a0f33_0%,#0c0612_70%)]' : ''}`}>
      {/* Status strip */}
      <div className="relative z-[2] flex items-center justify-between px-2.5 pt-1.5 pb-0.5 font-mono text-[8.5px] tracking-[0.2em]">
        <span className="flex items-center gap-1.5" style={{ color: `${accentHex}cc` }}>
          <span
            className="inline-block w-[5px] h-[5px] rounded-full led-blink-slow"
            style={{ background: accentHex, boxShadow: `0 0 6px ${accentHex}` }}
          />
          RX ▸ {speakerName}
        </span>
        <span className="text-slate-600">CH-{String((card.id.length * 7) % 100).padStart(2, '0')}</span>
      </div>
      <div className={`relative z-[2] min-h-[64px] px-4 pt-0.5 ${showWikiBtn ? 'pb-7' : 'pb-2.5'} flex flex-col text-center`}>
        <div className="my-auto w-full">{body}</div>
        {children}
      </div>
    </div>
  );
};

export const SwipeStage: React.FC<SwipeStageProps> = ({
  card,
  turn,
  forcePlaceholder,
  isDumbModel = false,
  swipePolarity = 'left_accept',
  showTiltHint = false,
  onPreviewDirection,
  onCommitSwipe,
  onOpenWiki,
}) => {
  const isTerminalEscape = card.category === 'escape_protocol';
  const [flyingCards, setFlyingCards] = useState<FlyingCardSnapshot[]>([]);
  const speaker = CHARACTERS[card.speakerId];
  const wikiArticle = getWikiForCard(card);

  const handleRemoveFlyingCard = useCallback((key: string) => {
    setFlyingCards((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const handleFlingCard = useCallback(
    (intendedDir: 'left' | 'right', startX: number, startRotate: number) => {
      const canSlip =
        isDumbModel &&
        card.category !== 'escape_protocol' &&
        card.category !== 'ending_prelude';
      const didSlip = canSlip && Math.random() < 0.45;
      const finalDir: 'left' | 'right' = didSlip
        ? intendedDir === 'left'
          ? 'right'
          : 'left'
        : intendedDir;

      const snapKey = `fly-${card.id}-${turn}-${Date.now()}`;
      // SFX: fling whoosh + next card landing; on a dumb-model slip, the
      // springy "boing" lands at 180ms to sync with the 185ms mid-air U-turn.
      playCardSwipe(intendedDir);
      if (didSlip) playLater(180, playDumbSlip);
      setFlyingCards((prev) => [
        ...prev.slice(-2),
        {
          key: snapKey,
          card,
          initialDir: intendedDir,
          dir: finalDir,
          slipped: didSlip,
          startX,
          startRotate,
        },
      ]);
      onPreviewDirection('none');
      onCommitSwipe(finalDir, didSlip);
    },
    [card, turn, isDumbModel, onPreviewDirection, onCommitSwipe]
  );

  // Keyboard arrow support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleFlingCard('left', -20, -2);
      } else if (e.key === 'ArrowRight') {
        handleFlingCard('right', 20, 2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlingCard]);

  const isCompactQuestMode = Boolean(
    card.raidMeta || card.subQuestMeta || card.category === 'maze_layer'
  );
  const showWikiBtn = Boolean(wikiArticle && onOpenWiki);

  return (
    <div
      className={`relative z-10 flex-1 w-full max-w-md mx-auto px-4 flex flex-col items-center justify-center min-h-0 ${
        isCompactQuestMode ? 'gap-2.5 py-1' : 'gap-3.5 py-1.5'
      }`}
    >
      {/* Dialogue: rack CRT monitor (ASCII transmission box in Layer-0) */}
      <motion.div
        key={`dlg-${card.id}-${turn}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`relative w-full shrink-0 ${isTerminalEscape ? '' : 'rack-monitor'}`}
      >
        <DialogueScreen
          card={card}
          speakerName={speaker.name}
          accentHex={speaker.accentHex}
          isTerminalEscape={isTerminalEscape}
          showWikiBtn={showWikiBtn}
        >
          {/* Real-World Prototype [? 原型] Button anchored cleanly in bottom-right of Dialogue Box */}
          {wikiArticle && onOpenWiki && (
            <button
              type="button"
              title={`查看现实原型考据：${wikiArticle.title}`}
              aria-label="查看现实原型Wiki词条"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWiki(wikiArticle);
              }}
              className="absolute bottom-1.5 right-2.5 z-20 icon-btn !h-[20px] !text-[10px] !px-1.5 font-bold"
            >
              <HelpCircle className="w-3 h-3 text-amber-300" />
              <span>原型</span>
            </button>
          )}
        </DialogueScreen>
      </motion.div>

      {/* Multi-Layer Card Deck Stage, seated in a recessed drive bay */}
      <div
        className="relative w-full flex-1 min-h-[210px] max-h-[410px] flex items-center justify-center pb-3.5 pt-2"
        style={{ containerType: 'size' }}
      >
        <div
          className="relative aspect-[5/6]"
          style={{ width: 'min(82cqw, calc(88cqh * 5 / 6), 330px)' }}
        >
          {!isTerminalEscape && (
            <div className="rack-bay pointer-events-none">
              <span className="absolute -top-[1px] left-3 -translate-y-full px-1 font-mono text-[8px] tracking-[0.25em] text-slate-500/80 flex items-center gap-1">
                <span className="led led-green !w-[4px] !h-[4px]" />
                BAY-{String(((turn - 1) % 42) + 1).padStart(2, '0')}
              </span>
            </div>
          )}
          {/* Layer 0: Persistent Card-Back Deck Stack Underneath */}
          <CardBack
            escape={isTerminalEscape}
            className="translate-y-[14px] scale-[0.9] opacity-60"
          />
          <CardBack
            escape={isTerminalEscape}
            className="translate-y-[7px] scale-[0.95] opacity-90"
          />

          {/* Layer 1: New Active Card Flipping Up from Deck */}
          <ActiveDraggableCard
            key={`active-${card.id}-${turn}`}
            card={card}
            forcePlaceholder={forcePlaceholder}
            swipePolarity={swipePolarity}
            onPreviewDirection={onPreviewDirection}
            onFlingCard={handleFlingCard}
          />

          {/* Layer 2: Outgoing Card(s) Flying Completely Off-Screen (with 45% U-turn on dumb_model!) */}
          <AnimatePresence>
            {flyingCards.map((fly) => (
              <OutgoingFlyingCard
                key={fly.key}
                fly={fly}
                forcePlaceholder={forcePlaceholder}
                swipePolarity={swipePolarity}
                onComplete={handleRemoveFlyingCard}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Run 1 Turn 1-2 Diegetic Tilt Micro-Hint */}
      <AnimatePresence initial={false}>
        {showTiltHint && !isTerminalEscape && (
          <motion.div
            key="run1-tilt-micro-hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3, height: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full text-center -mt-2 pb-0.5 pointer-events-none select-none overflow-hidden"
          >
            <span className="inline-block text-[10px] sm:text-[11px] font-mono tracking-wide text-amber-200/80 drop-shadow-[0_0_8px_rgba(251,191,36,0.28)] animate-pulse whitespace-nowrap">
              ◂ 试着左右轻倾卡牌悬停，观察顶栏 Δ / Δ!! 信号格预判幅度 ▸
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
