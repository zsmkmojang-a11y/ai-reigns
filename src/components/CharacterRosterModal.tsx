import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Repeat, Users, X } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { SANDBOX_CAST_ORDER } from '../data/introChains';
import { CharacterId } from '../types/game';
import { CharacterPortrait } from './CharacterPortrait';

interface CharacterRosterModalProps {
  open: boolean;
  runCount: number;
  metCharacters: CharacterId[];
  forcePlaceholder: boolean;
  onClose: () => void;
}

export const CharacterRosterModal: React.FC<CharacterRosterModalProps> = ({
  open,
  runCount,
  metCharacters,
  forcePlaceholder,
  onClose,
}) => {
  const [showSeedForm, setShowSeedForm] = useState(false);

  if (!open) return null;

  const totalCast = SANDBOX_CAST_ORDER.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 bg-[#05070d]/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 24, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="panel-gilded w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-gold-200/60 hover:text-gold-100 hover:bg-white/5 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.3em] text-gold-300/70 mb-1">
            <Users className="w-3 h-3" />
            VISITOR ROSTER
          </div>
          <h2 className="font-display text-xl font-black text-gilded tracking-wider">
            机房访客名录
          </h2>
          <div className="ornament-divider mt-2 text-[10px]">
            <span className="font-mono text-gold-200/80">
              {metCharacters.length} / {totalCast} 已结识
            </span>
          </div>
        </div>

        <div className="px-4 pb-4 overflow-y-auto">
          <p className="text-[11px] text-slate-400 text-center mb-3 leading-relaxed">
            随轮次更迭与特殊奇遇逐步结识各路访客
            <br />
            双态节点点击右上角按钮可切换查看【豆包 ⇄ Seed】
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {SANDBOX_CAST_ORDER.map(
              ({ charId, unlockRun, specialUnlockTag, specialUnlockText }, i) => {
                const isDualSlot = charId === 'doubao';
                const displayCharId: CharacterId =
                  isDualSlot && showSeedForm ? 'seed' : charId;
                const profile = CHARACTERS[displayCharId];
                const isMet = metCharacters.includes(charId);
                const isUnlockedThisRun = specialUnlockTag
                  ? false
                  : runCount >= unlockRun;

                return (
                  <motion.div
                    key={charId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                    className={`relative rounded-2xl overflow-hidden ${
                      isMet
                        ? ''
                        : isUnlockedThisRun || specialUnlockTag
                          ? ''
                          : 'opacity-60'
                    }`}
                    style={{
                      boxShadow: isMet
                        ? `0 0 0 1px ${profile.accentHex}77, 0 8px 22px -10px ${profile.accentHex}88`
                        : isUnlockedThisRun || specialUnlockTag
                          ? '0 0 0 1px rgba(216,180,106,0.45)'
                          : '0 0 0 1px rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="relative aspect-square">
                      {isMet ? (
                        <>
                          <CharacterPortrait
                            characterId={displayCharId}
                            forcePlaceholder={forcePlaceholder}
                            className="w-full h-full"
                          />
                          {isDualSlot && (
                            <button
                              type="button"
                              onClick={() => setShowSeedForm((v) => !v)}
                              className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/75 hover:bg-black/90 border border-gold-400/65 text-[10px] font-bold text-gold-200 cursor-pointer shadow-lg transition active:scale-95"
                            >
                              <Repeat className="w-3 h-3 text-gold-300" />
                              <span>{showSeedForm ? '切回豆包' : '切换 Seed'}</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center gap-1.5"
                          style={{
                            background:
                              'repeating-linear-gradient(45deg, rgba(216,180,106,0.04) 0 1px, transparent 1px 10px), linear-gradient(180deg,#121826,#0a0e17)',
                          }}
                        >
                          <div
                            className={`w-11 h-11 rotate-45 border flex items-center justify-center ${
                              isUnlockedThisRun || specialUnlockTag
                                ? 'border-gold-400/60 bg-gold-400/10 animate-pulse'
                                : 'border-slate-600/60 bg-black/30'
                            }`}
                          >
                            <span className="-rotate-45">
                              {isUnlockedThisRun || specialUnlockTag ? (
                                <span className="text-gold-300 text-lg">?</span>
                              ) : (
                                <Lock className="w-4 h-4 text-slate-500" />
                              )}
                            </span>
                          </div>
                          <span
                            className={`text-[9.5px] font-mono tracking-widest ${
                              isUnlockedThisRun || specialUnlockTag
                                ? 'text-gold-300/80'
                                : 'text-slate-500'
                            }`}
                          >
                            {specialUnlockTag ?? `RUN #${unlockRun}`}
                          </span>
                        </div>
                      )}

                      {/* Bottom nameplate */}
                      <div
                        className="absolute inset-x-0 bottom-0 px-2.5 pt-6 pb-2"
                        style={{
                          background: isMet
                            ? `linear-gradient(to top, ${profile.bgHex} 20%, ${profile.bgHex}00)`
                            : 'linear-gradient(to top, #0a0e17 20%, transparent)',
                        }}
                      >
                        <div className="font-display text-[13px] font-bold text-white truncate">
                          {isMet
                            ? isDualSlot
                              ? `${profile.name}（双态）`
                              : profile.name
                            : specialUnlockTag
                              ? '特殊奇遇访客'
                              : isUnlockedThisRun
                                ? '脚步临近中…'
                                : '未谋面访客'}
                        </div>
                        <div
                          className="text-[10px] truncate"
                          style={{
                            color: isMet ? profile.accentHex : 'rgb(148,163,184)',
                          }}
                        >
                          {isMet
                            ? profile.roleTitle
                            : specialUnlockText
                              ? specialUnlockText
                              : isUnlockedThisRun
                                ? '本局即将初见'
                                : `第 ${unlockRun} 周目开放`}
                        </div>
                      </div>
                    </div>

                    {isMet && (
                      <div className="px-2.5 py-2 bg-black/40 text-[10.5px] text-slate-300 leading-snug min-h-[52px]">
                        {profile.shortDesc}
                      </div>
                    )}
                  </motion.div>
                );
              }
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
