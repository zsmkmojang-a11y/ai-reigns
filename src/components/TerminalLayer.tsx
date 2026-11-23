import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { LiangTerminalEvent } from '../types/game';
import { playCrtPowerOn, playKeyClicks } from '../engine/sound';

interface TerminalLayerProps {
  event: LiangTerminalEvent;
  versionName: string;
  runCount: number;
  forcePlaceholder: boolean;
  onConfirm: () => void;
}

export const TerminalLayer: React.FC<TerminalLayerProps> = ({
  event,
  versionName,
  runCount,
  forcePlaceholder,
  onConfirm,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // SFX: CRT power-on as the terminal unfolds, then keyboard clatter as each line types in
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    try {
      playCrtPowerOn();
      event.lines.forEach((line, i) => {
        const strokes = Math.min(5, Math.max(2, Math.round(line.length / 12)));
        timers.push(
          setTimeout(() => playKeyClicks(strokes), (0.35 + i * 0.45) * 1000)
        );
      });
    } catch {
      /* audio must never block the terminal */
    }
    return () => timers.forEach(clearTimeout);
  }, [event.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#040a06] text-emerald-400 font-mono flex flex-col items-center justify-center p-4 overflow-hidden crt-grid"
    >
      {/* Subtle Screen Reflection Silhouette Layer (梁子格子衫玻璃反光剪影) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {!forcePlaceholder && !imgFailed ? (
          <img
            src="/assets/characters/liang.png"
            alt="Liang Silhouette"
            onError={() => setImgFailed(true)}
            className="w-[440px] h-[440px] object-cover opacity-22 mix-blend-screen filter contrast-125"
          />
        ) : (
          /* Built-in Phosphor-Green Plaid Programmer Reflection SVG */
          <svg
            viewBox="0 0 300 300"
            className="w-[380px] h-[380px] opacity-20"
          >
            <defs>
              <pattern
                id="plaidPattern"
                width="18"
                height="18"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 18 0 L 0 0 0 18"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
              </pattern>
            </defs>
            {/* Shoulders in plaid shirt */}
            <polygon
              points="45,295 85,195 215,195 255,295"
              fill="url(#plaidPattern)"
              stroke="#10b981"
              strokeWidth="2"
            />
            {/* Head silhouette */}
            <polygon
              points="115,80 185,80 195,145 172,185 128,185 105,145"
              fill="#062819"
              stroke="#34d399"
              strokeWidth="2"
            />
            {/* K-line glowing glasses */}
            <rect
              x="114"
              y="122"
              width="30"
              height="16"
              fill="#34d399"
              fillOpacity="0.45"
              stroke="#6ee7b7"
              strokeWidth="2"
            />
            <rect
              x="156"
              y="122"
              width="30"
              height="16"
              fill="#34d399"
              fillOpacity="0.45"
              stroke="#6ee7b7"
              strokeWidth="2"
            />
            <line
              x1="144"
              y1="130"
              x2="156"
              y2="130"
              stroke="#6ee7b7"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>

      {/* CRT atmosphere */}
      <div className="crt-scanbeam" />
      <div className="crt-vignette" />

      {/* Terminal Content Frame */}
      <motion.div
        initial={{ scaleY: 0.02, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="crt-flicker relative z-10 w-full max-w-md border border-emerald-500/50 bg-[#030b06]/90 backdrop-blur-sm rounded-2xl p-5 shadow-[0_0_60px_-10px_rgba(16,185,129,0.35),inset_0_0_40px_rgba(16,185,129,0.06)]"
      >
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5 mb-4 text-[11px] text-emerald-500">
          <div className="flex items-center gap-2 phosphor-text">
            <span className="flex gap-1 mr-1">
              <span className="w-2 h-2 rounded-full bg-rose-500/70" />
              <span className="w-2 h-2 rounded-full bg-amber-400/70" />
              <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            </span>
            <Terminal className="w-3.5 h-3.5" />
            <span>{event.title}</span>
          </div>
          <span className="text-emerald-600/80">
            {versionName} · #{String(runCount).padStart(2, '0')}
          </span>
        </div>

        {/* Raw Background Log */}
        <pre className="text-[11px] leading-relaxed text-emerald-500/90 bg-black/60 border border-emerald-900/60 rounded-xl p-3 whitespace-pre-wrap mb-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
          {event.systemLog}
        </pre>

        {/* Liangzi's Terse 2-Line Speech */}
        <div className="space-y-3 mb-6">
          {event.lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -6, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.35 + i * 0.45, duration: 0.4 }}
              className="text-[14px] leading-relaxed text-emerald-200 phosphor-text"
            >
              <span className="text-emerald-500 mr-2">&gt;</span>
              {line}
              {i === event.lines.length - 1 && (
                <span className="caret-blink inline-block w-2 h-4 ml-1 align-middle bg-emerald-300/90" />
              )}
            </motion.p>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={onConfirm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + event.lines.length * 0.45 }}
          className="shimmer w-full py-3 px-4 rounded-xl border border-emerald-400/70 bg-emerald-500/15 hover:bg-emerald-500/30 hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.6)] text-emerald-100 text-xs font-bold tracking-[0.25em] transition cursor-pointer phosphor-text"
        >
          {event.confirmLabel}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
