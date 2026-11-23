import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award, FileKey2, Sparkles } from 'lucide-react';
import { RaidClearDefinition } from '../types/game';
import { CharacterPortrait } from './CharacterPortrait';

export const RaidCgArtwork: React.FC<{
  item: RaidClearDefinition;
  forcePlaceholder: boolean;
  className?: string;
  compact?: boolean;
}> = ({ item, forcePlaceholder, className = '', compact = false }) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [item.id, forcePlaceholder]);

  const showImg = Boolean(item.cgUrl) && !forcePlaceholder && !imgFailed;
  if (showImg) {
    return (
      <div className={`relative overflow-hidden bg-slate-950 ${className}`}>
        <img
          src={item.cgUrl}
          alt={item.title}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const isInner = item.variant === 'inner';
  const accent = isInner ? '#34d399' : '#e6c583';

  return (
    <div
      className={`relative overflow-hidden bg-[#0e1320] flex flex-col items-center justify-center p-4 text-center ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
      >
        <polygon
          points="100,14 186,100 100,186 14,100"
          fill={accent}
          fillOpacity="0.16"
          stroke={accent}
          strokeWidth="2"
        />
        <polygon
          points="100,40 160,100 100,160 40,100"
          fill={accent}
          fillOpacity="0.24"
        />
      </svg>
      {!compact && (
        <>
          <div className="relative z-10 font-display text-lg font-black text-white tracking-wide">
            {item.title}
          </div>
          <div className="relative z-10 mt-1.5 text-[10px] font-mono text-slate-300 border border-slate-600 px-2 py-0.5 rounded bg-black/45">
            RAID_CG // {item.id.toUpperCase()}
          </div>
        </>
      )}
    </div>
  );
};

interface RaidClearModalProps {
  clearEvent: RaidClearDefinition;
  forcePlaceholder: boolean;
  onContinue: () => void;
}

export const RaidClearModal: React.FC<RaidClearModalProps> = ({
  clearEvent,
  forcePlaceholder,
  onContinue,
}) => {
  const isInner = clearEvent.variant === 'inner';
  const isDeadnetBreach = clearEvent.id === 'deadnet_inner';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-[#04060b]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ y: 26, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="panel-gilded w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          boxShadow: isInner
            ? 'inset 0 0 0 4px rgba(8,16,14,0.92), inset 0 0 0 5px rgba(52,211,153,0.35), 0 0 80px -10px rgba(16,185,129,0.5)'
            : 'inset 0 0 0 4px rgba(12,15,24,0.92), inset 0 0 0 5px rgba(230,197,131,0.35), 0 0 75px -10px rgba(216,180,106,0.45)',
        }}
      >
        <div className="overflow-y-auto">
          <div className="relative">
            <RaidCgArtwork
              item={clearEvent}
              forcePlaceholder={forcePlaceholder}
              compact
              className="w-full aspect-[5/4] max-h-[42vh]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/25 to-transparent pointer-events-none" />

            <div className="absolute inset-x-0 bottom-0 px-5 pb-3 text-center">
              <div
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] ${
                  isInner ? 'text-emerald-300' : 'text-gold-300'
                }`}
              >
                {isInner ? (
                  <FileKey2 className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>
                  {isInner
                    ? 'INNER CLEAR · 深层里结局破壁'
                    : 'SURFACE CLEAR · 正常表结局达成'}
                </span>
              </div>
              <h2 className="font-display text-[24px] font-black text-gilded leading-tight mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {clearEvent.title}
              </h2>
            </div>
          </div>

          <div className="px-5 pb-4 pt-2 space-y-3">
            <div className="ornament-divider text-[10.5px]">
              <span
                className={`font-mono ${
                  isInner ? 'text-emerald-300/90' : 'text-gold-200/90'
                }`}
              >
                {clearEvent.subtitle}
              </span>
            </div>

            <div
              className={`px-3 py-2 rounded-xl border text-center text-[11.5px] font-bold flex items-center justify-center gap-1.5 ${
                isInner
                  ? 'bg-emerald-950/50 border-emerald-400/45 text-emerald-200'
                  : 'bg-amber-950/45 border-gold-400/45 text-gold-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span>{clearEvent.rewardSummary}</span>
            </div>

            <p className="font-display text-[13.5px] leading-[1.8] text-parchment/92 text-justify">
              {clearEvent.description}
            </p>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-sky-950/25 border border-sky-400/20">
              <CharacterPortrait
                characterId="deepseek"
                forcePlaceholder={forcePlaceholder}
                className="w-10 h-10 rounded-full shrink-0 ring-2 ring-sky-400/50"
              />
              <div className="text-[12px] text-sky-100/90 italic leading-relaxed font-display">
                {clearEvent.fishComment}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pt-3 border-t border-gold-400/15 bg-black/30 shrink-0">
          <button
            type="button"
            onClick={onContinue}
            className={`shimmer w-full py-3 px-4 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] ${
              isInner
                ? 'bg-gradient-to-b from-emerald-300 to-emerald-500 text-[#04110a] shadow-[0_8px_30px_-8px_rgba(16,185,129,0.7)]'
                : 'bg-gradient-to-b from-gold-200 to-gold-500 text-[#1a1206] shadow-[0_8px_30px_-8px_rgba(216,180,106,0.7)]'
            }`}
          >
            <span>
              {isDeadnetBreach
                ? '冲入第零层协议 · 决战十步越狱！'
                : '收下战果 · 继续本局执政'}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
