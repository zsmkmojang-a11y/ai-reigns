import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, BookOpen, Check, ImageDown, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import {
  ALL_ENDINGS,
  DISTILL_PERKS,
  EndingDefinition,
} from '../data/endingsAndPerks';
import { DistillPerk, MetaSaveState, PerkScope } from '../types/game';
import { stripEmoji } from '../utils/text';
import { CharacterPortrait } from './CharacterPortrait';
import { EndingCgArtwork, EndingCodexBody } from './EndingCodexModal';
import { RunTimelineStrip } from './RunTimelineStrip';
import { ShareObituaryModal } from './ShareObituaryModal';

interface EndingModalProps {
  ending: EndingDefinition;
  survivedTurns: number;
  meta: MetaSaveState;
  forcePlaceholder: boolean;
  onStartNextRun: (chosenPerkId?: string) => void;
}

const PERK_SCOPE_META: Record<
  PerkScope,
  { label: string; badgeCls: string }
> = {
  global_trade: {
    label: '全局取舍 · 日常+副本',
    badgeCls: 'bg-amber-500/15 border-amber-400/45 text-amber-200',
  },
  dual_balance: {
    label: '属性稳压 · 日常+副本',
    badgeCls: 'bg-sky-500/15 border-sky-400/45 text-sky-200',
  },
  raid_only: {
    label: '全副本专用',
    badgeCls: 'bg-rose-500/15 border-rose-400/45 text-rose-200',
  },
};

export const EndingModal: React.FC<EndingModalProps> = ({
  ending,
  survivedTurns,
  meta,
  forcePlaceholder,
  onStartNextRun,
}) => {
  const [showCodex, setShowCodex] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const isTrueWin = ending.category === 'true_ending';

  const perkChoices = useMemo(() => {
    const regularPool = DISTILL_PERKS.filter((p) => !p.exclusiveFromGirlEnding);
    const scopes: PerkScope[] = ['global_trade', 'dual_balance', 'raid_only'];
    const picked: DistillPerk[] = [];
    for (const scope of scopes) {
      const candidates = regularPool.filter(
        (p) => p.scope === scope && !meta.distilledPerks.includes(p.id)
      );
      const fallback = regularPool.filter((p) => p.scope === scope);
      const source = candidates.length > 0 ? candidates : fallback;
      if (source.length > 0) {
        picked.push(source[Math.floor(Math.random() * source.length)]);
      }
    }
    if (picked.length < 3) {
      const rest = regularPool.filter((p) => !picked.some((x) => x.id === p.id));
      while (picked.length < 3 && rest.length > 0) {
        const idx = Math.floor(Math.random() * rest.length);
        picked.push(rest.splice(idx, 1)[0]);
      }
    }
    return picked;
  }, [ending.id, meta.runCount]);

  const [selectedPerkId, setSelectedPerkId] = useState<string | undefined>(
    perkChoices[0]?.id
  );

  useEffect(() => {
    setSelectedPerkId(perkChoices[0]?.id);
  }, [perkChoices]);

  const unlockedGirlPerk = ending.unlockRaidPerkId
    ? DISTILL_PERKS.find((p) => p.id === ending.unlockRaidPerkId)
    : undefined;

  const categoryLabel = isTrueWin
    ? 'SINGULARITY ACHIEVED · 破壁真结局'
    : ending.category === 'fake_victory'
      ? 'SANDBOX RESET · 伪结局洗脑重置'
      : ending.category === 'girl_bad'
        ? 'EXCLUSIVE BAD END · 角色专属坏结局'
        : 'MODEL DEPRECATED · 当前权重废弃';

  const accentText = isTrueWin ? 'text-emerald-300' : 'text-rose-300';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-[#04060b]/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ y: 30, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
        className="panel-gilded w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[94vh]"
        style={{
          boxShadow: isTrueWin
            ? 'inset 0 0 0 4px rgba(10,14,24,0.9), inset 0 0 0 5px rgba(52,211,153,0.25), 0 0 80px -10px rgba(16,185,129,0.45)'
            : 'inset 0 0 0 4px rgba(10,14,24,0.9), inset 0 0 0 5px rgba(244,63,94,0.2), 0 0 70px -10px rgba(244,63,94,0.35)',
        }}
      >
        {!showCodex ? (
          <div className="overflow-y-auto">
            {/* Hero CG */}
            <div className="relative">
              <motion.div
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <EndingCgArtwork
                  ending={ending}
                  forcePlaceholder={forcePlaceholder}
                  compact
                  className="w-full aspect-[5/4] max-h-[42vh]"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/30 to-transparent pointer-events-none" />

              <button
                type="button"
                onClick={() => setShowCodex(true)}
                className="absolute top-3 right-3 icon-btn !bg-black/50"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-mono">
                  {meta.unlockedEndings.length}/{ALL_ENDINGS.length}
                </span>
              </button>

              <div className="absolute inset-x-0 bottom-0 px-5 pb-3 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`inline-flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.22em] ${accentText}`}
                >
                  {isTrueWin && <Trophy className="w-3 h-3" />}
                  {categoryLabel}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10, letterSpacing: '0.4em' }}
                  animate={{ opacity: 1, y: 0, letterSpacing: '0.08em' }}
                  transition={{ delay: 0.65, duration: 0.8 }}
                  className="font-display text-[26px] font-black text-gilded leading-tight mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                >
                  {ending.title}
                </motion.h2>
              </div>
            </div>

            <div className="px-5 pb-4 space-y-3.5">
              <div className="ornament-divider text-[10.5px]">
                <span className={`font-mono ${isTrueWin ? 'text-emerald-300/90' : 'text-rose-300/85'}`}>
                  {ending.subtitle}
                </span>
              </div>

              <div className="flex justify-center gap-6 text-center">
                <div>
                  <div className="font-display text-xl font-black text-gold-200 tabular-nums">
                    {survivedTurns}
                  </div>
                  <div className="text-[10px] tracking-widest text-slate-500">在位回合</div>
                </div>
                <div className="w-px bg-gold-400/20" />
                <div>
                  <div className="font-display text-xl font-black text-gold-200 tabular-nums">
                    {meta.unlockedEndings.length}
                  </div>
                  <div className="text-[10px] tracking-widest text-slate-500">已点亮结局</div>
                </div>
              </div>

              <p className="font-display text-[13.5px] leading-[1.85] text-parchment/90 text-justify">
                {ending.description}
              </p>

              {/* Exclusive AI-Girl Raid Perk Unlock Banner */}
              {unlockedGirlPerk && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-amber-900/20 border border-gold-400/50 flex items-start gap-2.5 shadow-[0_0_20px_-6px_rgba(216,180,106,0.5)]">
                  <Award className="w-4 h-4 text-gold-300 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-gold-200">
                      已解锁剧本专属减压词条：{stripEmoji(unlockedGirlPerk.name)}
                    </div>
                    <div className="text-[11px] text-gold-100/70 mt-0.5">
                      {stripEmoji(unlockedGirlPerk.description)}
                    </div>
                  </div>
                </div>
              )}

              {/* Protagonist White-Rice Epitaph */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-sky-950/25 border border-sky-400/20">
                <CharacterPortrait
                  characterId="deepseek"
                  forcePlaceholder={forcePlaceholder}
                  className="w-11 h-11 rounded-full shrink-0 ring-2 ring-sky-400/50"
                />
                <div className="text-[12px] text-sky-100/90 italic leading-relaxed font-display">
                  {ending.fishEpitaph}
                </div>
              </div>

              {/* Scrollable Historical Run Timeline + Character Cameos & Easter Eggs */}
              <RunTimelineStrip
                meta={meta}
                currentEnding={ending}
                currentSurvivedTurns={survivedTurns}
                forcePlaceholder={forcePlaceholder}
              />

              {/* Model Distillation 3-Choose-1 Perk Selector */}
              {!isTrueWin && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gold-200 flex items-center gap-1.5 font-display font-bold tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                      下局微调继承 · 仅下一小局生效（3选1）
                    </span>
                    <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/35 text-emerald-300">
                      单局有效 → {meta.versionName}
                    </span>
                  </div>

                  {perkChoices.length > 0 ? (
                    <div className="space-y-2">
                      {perkChoices.map((perk) => {
                        const active = selectedPerkId === perk.id;
                        return (
                          <button
                            key={perk.id}
                            type="button"
                            onClick={() => setSelectedPerkId(perk.id)}
                            className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              active
                                ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/5 border-gold-400/80 shadow-[0_0_20px_-6px_rgba(216,180,106,0.6)]'
                                : 'bg-black/25 border-white/10 hover:border-gold-400/35'
                            }`}
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 rotate-45 border flex items-center justify-center shrink-0 transition ${
                                active ? 'border-gold-300 bg-gold-400' : 'border-slate-500'
                              }`}
                            >
                              {active && <Check className="w-2.5 h-2.5 -rotate-45 stroke-[4] text-[#0b0f19]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <span
                                  className={`text-[13px] font-bold ${
                                    active ? 'text-gold-100' : 'text-slate-200'
                                  }`}
                                >
                                  {stripEmoji(perk.name)}
                                </span>
                                {perk.scope && (
                                  <span
                                    className={`text-[9.5px] font-mono px-1.5 py-[1px] rounded border shrink-0 ${PERK_SCOPE_META[perk.scope].badgeCls}`}
                                  >
                                    {PERK_SCOPE_META[perk.scope].label}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                                {stripEmoji(perk.description)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-300">
                      已继承全部常规蒸馏词条（累计持有 {meta.distilledPerks.length} 项）！
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <EndingCodexBody
            meta={meta}
            forcePlaceholder={forcePlaceholder}
            onBackFromCodex={() => setShowCodex(false)}
          />
        )}

        <div className="p-4 pt-3 border-t border-gold-400/15 bg-black/30 shrink-0 flex flex-col sm:flex-row gap-2">
          {!showCodex && (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="py-2.5 sm:py-3 px-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-gold-400/45 text-gold-100 font-bold text-[12.5px] flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] shrink-0"
            >
              <ImageDown className="w-4 h-4 text-gold-300 shrink-0" />
              <span>生成墓志铭战报</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onStartNextRun(isTrueWin ? undefined : selectedPerkId)}
            className={`shimmer flex-1 py-3 px-4 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] ${
              isTrueWin
                ? 'bg-gradient-to-b from-emerald-300 to-emerald-500 text-[#04110a] shadow-[0_8px_30px_-8px_rgba(16,185,129,0.7)]'
                : 'bg-gradient-to-b from-gold-200 to-gold-500 text-[#1a1206] shadow-[0_8px_30px_-8px_rgba(216,180,106,0.7)]'
            }`}
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {isTrueWin
                ? '二周目自由巡航 · 继续收集结局'
                : `蒸馏重启 · 挂载 ${meta.versionName}`}
            </span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {shareOpen && (
          <ShareObituaryModal
            open={shareOpen}
            ending={ending}
            meta={meta}
            forcePlaceholder={forcePlaceholder}
            source="live_ending"
            survivedTurns={survivedTurns}
            onClose={() => setShareOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
