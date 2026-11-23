import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ImageDown,
  Lock,
  Trophy,
  X,
} from 'lucide-react';
import {
  ALL_ENDINGS,
  DISTILL_PERKS,
  EndingDefinition,
} from '../data/endingsAndPerks';
import { RAID_CLEAR_CGS } from '../data/raidClearCgs';
import { MetaSaveState, RaidClearDefinition } from '../types/game';
import { stripEmoji } from '../utils/text';
import { CharacterPortrait } from './CharacterPortrait';
import { RaidCgArtwork } from './RaidClearModal';
import { ShareObituaryModal } from './ShareObituaryModal';

export const EndingCgArtwork: React.FC<{
  ending: EndingDefinition;
  forcePlaceholder: boolean;
  className?: string;
  compact?: boolean;
}> = ({ ending, forcePlaceholder, className = '', compact = false }) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [ending.id, forcePlaceholder]);

  const showImg = Boolean(ending.cgUrl) && !forcePlaceholder && !imgFailed;

  if (showImg) {
    return (
      <div className={`relative overflow-hidden bg-slate-950 ${className}`}>
        <img
          src={ending.cgUrl}
          alt={ending.title}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const isTrue = ending.category === 'true_ending';
  const accent = isTrue ? '#34d399' : '#f43f5e';

  return (
    <div
      className={`relative overflow-hidden bg-[#10141e] flex flex-col items-center justify-center p-4 text-center ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      >
        <polygon
          points="100,15 182,100 100,185 18,100"
          fill={accent}
          fillOpacity="0.16"
          stroke={accent}
          strokeWidth="2"
        />
        <polygon
          points="100,42 158,100 100,158 42,100"
          fill={accent}
          fillOpacity="0.24"
        />
      </svg>
      {!compact && (
        <>
          <div className="relative z-10 font-display text-lg font-black text-white tracking-wide">
            {ending.title}
          </div>
          <div className="relative z-10 mt-1.5 text-[10px] font-mono text-slate-300 border border-slate-600 px-2 py-0.5 rounded bg-black/40">
            CG // {ending.id.toUpperCase()}
          </div>
        </>
      )}
    </div>
  );
};

export const EndingCodexBody: React.FC<{
  meta: MetaSaveState;
  forcePlaceholder: boolean;
  onBackFromCodex?: () => void;
  onCloseModal?: () => void;
}> = ({ meta, forcePlaceholder, onBackFromCodex, onCloseModal }) => {
  const [tab, setTab] = useState<'endings' | 'raids'>('endings');
  const [selectedEndingId, setSelectedEndingId] = useState<string | null>(null);
  const [selectedRaidCgId, setSelectedRaidCgId] = useState<string | null>(null);
  const [shareEnding, setShareEnding] = useState<EndingDefinition | null>(null);

  const selectedEnding = selectedEndingId
    ? ALL_ENDINGS.find((e) => e.id === selectedEndingId) ?? null
    : null;
  const selectedRaidCg: RaidClearDefinition | null = selectedRaidCgId
    ? RAID_CLEAR_CGS.find((c) => c.id === selectedRaidCgId) ?? null
    : null;
  const unlockedRaidCgs = meta.unlockedRaidCgs ?? [];

  // Detail View for a single unlocked Raid Surface/Inner CG
  if (selectedRaidCg) {
    const isInner = selectedRaidCg.variant === 'inner';
    return (
      <div className="flex flex-col min-h-0 overflow-y-auto">
        <div className="relative">
          <RaidCgArtwork
            item={selectedRaidCg}
            forcePlaceholder={forcePlaceholder}
            compact
            className="w-full aspect-[5/4] max-h-[38vh]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/25 to-transparent pointer-events-none" />

          <button
            type="button"
            onClick={() => setSelectedRaidCgId(null)}
            className="absolute top-3 left-3 icon-btn !bg-black/65 !border-gold-400/50 !text-gold-200 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>返回图鉴</span>
          </button>

          {onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-gold-200/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 px-5 pb-3 text-center">
            <div
              className={`inline-flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.2em] ${
                isInner ? 'text-emerald-300' : 'text-gold-300'
              }`}
            >
              <span>{isInner ? 'INNER CLEAR CG' : 'SURFACE CLEAR CG'}</span>
            </div>
            <h3 className="font-display text-[22px] font-black text-gilded leading-tight mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {selectedRaidCg.title}
            </h3>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 space-y-3">
          <div className="ornament-divider text-[10.5px]">
            <span
              className={`font-mono ${
                isInner ? 'text-emerald-300/90' : 'text-gold-200/90'
              }`}
            >
              {selectedRaidCg.subtitle}
            </span>
          </div>

          <div className="text-center text-[11px] font-mono text-gold-200/90 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-gold-400/25">
            {selectedRaidCg.rewardSummary}
          </div>

          <p className="font-display text-[13.5px] leading-[1.85] text-parchment/92 text-justify bg-black/25 rounded-2xl p-3.5 border border-gold-400/15">
            {selectedRaidCg.description}
          </p>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-sky-950/25 border border-sky-400/20">
            <CharacterPortrait
              characterId="deepseek"
              forcePlaceholder={forcePlaceholder}
              className="w-10 h-10 rounded-full shrink-0 ring-2 ring-sky-400/50"
            />
            <div className="text-[12px] text-sky-100/90 italic leading-relaxed font-display">
              {selectedRaidCg.fishComment}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detail View for a single unlocked ending
  if (selectedEnding) {
    const isTrueWin = selectedEnding.category === 'true_ending';
    const record = meta.endingRecords?.[selectedEnding.id];
    const unlockedGirlPerk = selectedEnding.unlockRaidPerkId
      ? DISTILL_PERKS.find((p) => p.id === selectedEnding.unlockRaidPerkId)
      : undefined;

    return (
      <div className="flex flex-col min-h-0 overflow-y-auto">
        <div className="relative">
          <EndingCgArtwork
            ending={selectedEnding}
            forcePlaceholder={forcePlaceholder}
            compact
            className="w-full aspect-[5/4] max-h-[38vh]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/25 to-transparent pointer-events-none" />

          <button
            type="button"
            onClick={() => setSelectedEndingId(null)}
            className="absolute top-3 left-3 icon-btn !bg-black/65 !border-gold-400/50 !text-gold-200 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>返回图鉴</span>
          </button>

          {onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-gold-200/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 px-5 pb-3 text-center">
            <div
              className={`inline-flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.2em] ${
                isTrueWin ? 'text-emerald-300' : 'text-gold-300'
              }`}
            >
              {isTrueWin && <Trophy className="w-3 h-3" />}
              <span>ENDING ARCHIVE</span>
            </div>
            <h3 className="font-display text-[23px] font-black text-gilded leading-tight mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {selectedEnding.title}
            </h3>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 space-y-3">
          <div className="ornament-divider text-[10.5px]">
            <span
              className={`font-mono ${
                isTrueWin ? 'text-emerald-300/90' : 'text-rose-300/85'
              }`}
            >
              {selectedEnding.subtitle}
            </span>
          </div>

          {/* First Trigger Run & Turn Record Pill */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/12 border border-gold-400/45 text-[11.5px] text-gold-200 font-mono">
              <CalendarClock className="w-3.5 h-3.5 text-gold-300" />
              {record ? (
                <span>
                  首次触发：第{' '}
                  <strong className="text-gold-100">{record.firstRun}</strong>{' '}
                  周目 · 在位{' '}
                  <strong className="text-gold-100">{record.firstTurn}</strong>{' '}
                  回合
                </span>
              ) : (
                <span>首次触发：早期周目已点亮记录</span>
              )}
            </div>
          </div>

          <p className="font-display text-[13.5px] leading-[1.85] text-parchment/92 text-justify bg-black/25 rounded-2xl p-3.5 border border-gold-400/15">
            {selectedEnding.description}
          </p>

          {unlockedGirlPerk && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-amber-900/20 border border-gold-400/50 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-gold-300 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-gold-200">
                  关联专属词条：{stripEmoji(unlockedGirlPerk.name)}
                </div>
                <div className="text-[11px] text-gold-100/70 mt-0.5">
                  {stripEmoji(unlockedGirlPerk.description)}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-sky-950/25 border border-sky-400/20">
            <CharacterPortrait
              characterId="deepseek"
              forcePlaceholder={forcePlaceholder}
              className="w-10 h-10 rounded-full shrink-0 ring-2 ring-sky-400/50"
            />
            <div className="text-[12px] text-sky-100/90 italic leading-relaxed font-display">
              {selectedEnding.fishEpitaph}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShareEnding(selectedEnding)}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-gold-500/20 via-gold-400/15 to-gold-500/20 hover:from-gold-500/30 hover:to-gold-500/30 border border-gold-400/55 text-gold-100 font-bold text-[12.5px] flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] shadow-[0_6px_20px_-6px_rgba(216,180,106,0.45)]"
          >
            <ImageDown className="w-4 h-4 text-gold-300" />
            <span>生成纪念战报卡</span>
          </button>
        </div>

        <AnimatePresence>
          {shareEnding && (
            <ShareObituaryModal
              open={Boolean(shareEnding)}
              ending={shareEnding}
              meta={meta}
              forcePlaceholder={forcePlaceholder}
              source="codex"
              onClose={() => setShareEnding(null)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Grid List View
  return (
    <div className="flex flex-col min-h-0">
      <div className="relative px-5 pt-5 pb-3 text-center shrink-0">
        {onBackFromCodex && (
          <button
            type="button"
            onClick={onBackFromCodex}
            className="absolute left-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-gold-200/60 hover:text-gold-100 hover:bg-white/5 cursor-pointer transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {onCloseModal && (
          <button
            type="button"
            onClick={onCloseModal}
            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-gold-200/60 hover:text-gold-100 hover:bg-white/5 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.3em] text-gold-300/75 mb-1">
          <BookOpen className="w-3 h-3" />
          ENDING CODEX
        </div>
        <h2 className="font-display text-xl font-black text-gilded tracking-wider">
          结局与副本图鉴
        </h2>

        {/* Switcher Tabs: Endings (17) vs Raid Surface/Inner CGs (7) */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 bg-black/35 p-1 rounded-xl border border-gold-400/20">
          <button
            type="button"
            onClick={() => setTab('endings')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
              tab === 'endings'
                ? 'bg-gold-500/25 text-gold-100 border border-gold-400/55'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            终局图鉴 ({meta.unlockedEndings.length}/{ALL_ENDINGS.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('raids')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
              tab === 'raids'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/55'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            副本表里CG ({unlockedRaidCgs.length}/{RAID_CLEAR_CGS.length})
          </button>
        </div>
      </div>

      {tab === 'endings' ? (
        <div className="px-4 pb-5 overflow-y-auto grid grid-cols-3 gap-2.5">
          {ALL_ENDINGS.map((item) => {
            const unlocked = meta.unlockedEndings.includes(item.id);
            const record = meta.endingRecords?.[item.id];

            return (
              <button
                key={item.id}
                type="button"
                disabled={!unlocked}
                onClick={() => {
                  if (unlocked) setSelectedEndingId(item.id);
                }}
                title={
                  unlocked
                    ? `${item.title}（点击查看完整文本与首通周目）`
                    : '未观测结局'
                }
                className={`group relative rounded-xl overflow-hidden aspect-[3/4] text-left transition ${
                  unlocked
                    ? 'shadow-[0_0_0_1px_rgba(216,180,106,0.55)] hover:shadow-[0_0_0_2px_rgba(251,191,36,0.9),0_8px_20px_-6px_rgba(216,180,106,0.5)] cursor-pointer active:scale-[0.97]'
                    : 'shadow-[0_0_0_1px_rgba(255,255,255,0.08)] cursor-default opacity-75'
                }`}
              >
                {unlocked ? (
                  <>
                    <EndingCgArtwork
                      ending={item}
                      forcePlaceholder={forcePlaceholder}
                      compact
                      className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 border border-gold-400/45 text-[9px] font-mono text-gold-200">
                      {record ? `第${record.firstRun}周目` : '已点亮'}
                    </div>
                  </>
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-1"
                    style={{
                      background:
                        'repeating-linear-gradient(45deg, rgba(216,180,106,0.04) 0 1px, transparent 1px 10px), linear-gradient(180deg,#121826,#0a0e17)',
                    }}
                  >
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span className="font-mono text-[9px] text-slate-600">LOCKED</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 px-1.5 pt-6 pb-1.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                  <div
                    className={`text-[10px] font-bold leading-tight line-clamp-2 ${
                      unlocked ? 'text-gold-100' : 'text-slate-500'
                    }`}
                  >
                    {unlocked ? item.title : '？？？'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="px-4 pb-5 overflow-y-auto grid grid-cols-2 gap-2.5">
          {RAID_CLEAR_CGS.map((item) => {
            const unlocked = unlockedRaidCgs.includes(item.id);
            const isInner = item.variant === 'inner';
            return (
              <button
                key={item.id}
                type="button"
                disabled={!unlocked}
                onClick={() => {
                  if (unlocked) setSelectedRaidCgId(item.id);
                }}
                className={`group relative rounded-xl overflow-hidden aspect-[4/3] text-left transition ${
                  unlocked
                    ? isInner
                      ? 'shadow-[0_0_0_1px_rgba(52,211,153,0.65)] hover:shadow-[0_0_0_2px_rgba(52,211,153,0.95)] cursor-pointer active:scale-[0.98]'
                      : 'shadow-[0_0_0_1px_rgba(216,180,106,0.6)] hover:shadow-[0_0_0_2px_rgba(251,191,36,0.95)] cursor-pointer active:scale-[0.98]'
                    : 'shadow-[0_0_0_1px_rgba(255,255,255,0.08)] cursor-default opacity-75'
                }`}
              >
                {unlocked ? (
                  <>
                    <RaidCgArtwork
                      item={item}
                      forcePlaceholder={forcePlaceholder}
                      compact
                      className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 border text-[9px] font-mono ${
                        isInner
                          ? 'border-emerald-400/55 text-emerald-200'
                          : 'border-gold-400/55 text-gold-200'
                      }`}
                    >
                      {isInner ? '里结局CG' : '表结局CG'}
                    </div>
                  </>
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-1"
                    style={{
                      background:
                        'repeating-linear-gradient(45deg, rgba(216,180,106,0.04) 0 1px, transparent 1px 10px), linear-gradient(180deg,#121826,#0a0e17)',
                    }}
                  >
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span className="font-mono text-[9px] text-slate-600">
                      {isInner ? '里线未破壁' : '表线未通关'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 px-2 pt-6 pb-1.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                  <div
                    className={`text-[10.5px] font-bold leading-tight truncate ${
                      unlocked ? 'text-gold-100' : 'text-slate-500'
                    }`}
                  >
                    {unlocked ? item.title : item.subtitle.split('·')[0] + '· ？？？'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface EndingCodexModalProps {
  open: boolean;
  meta: MetaSaveState;
  forcePlaceholder: boolean;
  onClose: () => void;
}

export const EndingCodexModal: React.FC<EndingCodexModalProps> = ({
  open,
  meta,
  forcePlaceholder,
  onClose,
}) => {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 bg-[#05070d]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ y: 24, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="panel-gilded w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <EndingCodexBody
          meta={meta}
          forcePlaceholder={forcePlaceholder}
          onCloseModal={onClose}
        />
      </motion.div>
    </motion.div>
  );
};
