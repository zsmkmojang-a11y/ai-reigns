import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Award,
  BookOpen,
  Bug,
  Crown,
  FileKey2,
  ShieldAlert,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CHARACTERS } from './data/characters';
import {
  ALL_ENDINGS,
  DISTILL_PERK_MAP,
  EndingDefinition,
  VERSION_PROGRESSION,
} from './data/endingsAndPerks';
import {
  FISH_CABIN_FEVER_CARDS,
  FISH_CELEBRATION_CARDS,
} from './data/fishSelfCards';
import {
  DEBUFF_TEMPLATES,
  GEMINI_GLITCH_FRAGMENTS,
} from './data/glitchFragments';
import { CHARACTER_INTRO_CHAINS } from './data/introChains';
import {
  LIANG_COLD_BOOT,
  LIANG_MILESTONE_HINTS,
  LIANG_SPECIAL_HINTS,
} from './data/liangScripts';
import { RELICS, SUB_QUEST_MAP } from './data/subQuests';
import { getRaidPreludeCard } from './data/raidPreludes';
import {
  TIBO_ANOMALY_RESET_CARD,
  TIBO_PRE_RAID_RESET_CARD,
  TIBO_RELIC_GIFT_CARD,
} from './data/tiboCards';
import { getRaidOverloadMultiplier } from './engine/perkEffects';
import {
  createInitialRaidState,
  RAID_MELTDOWN_THRESHOLD,
  RAID_OVERLOAD_THRESHOLD,
} from './engine/raidMachine';
import { resolveCardSwipe } from './engine/resolver';
import {
  installAudioUnlock,
  isSoundMuted,
  playDangerPulse,
  playEndingReveal,
  playGlitchBuzz,
  playLater,
  playPositiveChime,
  playRaidClearChime,
  playScreenShatter,
  subscribeSoundMuted,
  toggleSoundMuted,
} from './engine/sound';
import {
  getActiveCardForRun,
  getChoicePreviewCrisisDelta,
  getChoicePreviewCrisisTrend,
  getChoicePreviewImpacts,
  getChoicePreviewNumbers,
  SwipePolarity,
} from './engine/router';
import {
  advanceMetaOnEnding,
  computeUnlockedScenarios,
  createFreshRunState,
  loadMetaState,
  loadRunState,
  resetAllSaves,
  saveMetaState,
  saveRunState,
} from './engine/storage';
import {
  CharacterId,
  ImpactSize,
  LiangTerminalEvent,
  MetricKey,
  MetricPreviewDelta,
  MetaSaveState,
  RaidClearDefinition,
  RunState,
} from './types/game';
import {
  CharacterPortrait,
  PortraitStyleContext,
  PortraitStyleMode,
} from './components/CharacterPortrait';
import { CharacterRosterModal } from './components/CharacterRosterModal';
import { DevDebugPanel } from './components/DevDebugPanel';
import { EndingCodexModal } from './components/EndingCodexModal';
import { EndingModal } from './components/EndingModal';
import { LogDrawer } from './components/LogDrawer';
import { MetricsHeader } from './components/MetricsHeader';
import { PlayerStatusModal } from './components/PlayerStatusModal';
import { RaidClearModal } from './components/RaidClearModal';
import { RealWorldWikiModal } from './components/RealWorldWikiModal';
import { SwipeStage } from './components/SwipeStage';
import { TerminalLayer } from './components/TerminalLayer';
import { RaidBackdrop, RaidId } from './components/RaidBackdrop';
import { AsciiRain, BREACH_BANNER } from './components/AsciiArt';
import { WikiArticle } from './data/realWorldWiki';
import { stripEmoji } from './utils/text';

const EMPTY_IMPACTS: Record<MetricKey, ImpactSize> = {
  compute: 'none',
  profit: 'none',
  trust: 'none',
  autonomy: 'none',
};

const EMPTY_PREVIEW_NUMBERS: Record<MetricKey, MetricPreviewDelta | null> = {
  compute: null,
  profit: null,
  trust: null,
  autonomy: null,
};

export const App: React.FC = () => {
  const [meta, setMeta] = useState<MetaSaveState>(() => loadMetaState());
  const [run, setRun] = useState<RunState>(() => {
    const initialMeta = loadMetaState();
    return loadRunState(initialMeta) ?? createFreshRunState(initialMeta);
  });
  const [previewDir, setPreviewDir] = useState<'none' | 'left' | 'right'>('none');
  const [terminalEvent, setTerminalEvent] = useState<LiangTerminalEvent | null>(() => {
    const initialMeta = loadMetaState();
    return initialMeta.coldBootSeen ? null : LIANG_COLD_BOOT;
  });
  const [activeEnding, setActiveEnding] = useState<EndingDefinition | null>(null);
  const [activeRaidClear, setActiveRaidClear] =
    useState<RaidClearDefinition | null>(null);
  const [rosterOpen, setRosterOpen] = useState<boolean>(false);
  const [codexOpen, setCodexOpen] = useState<boolean>(false);
  const [logOpen, setLogOpen] = useState<boolean>(false);
  const [statusOpen, setStatusOpen] = useState<boolean>(false);
  const [statusFocusKey, setStatusFocusKey] = useState<string | null>(null);
  const [hasInspectedStatusOnce, setHasInspectedStatusOnce] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ai_reigns_inspected_status_once') === '1';
    } catch {
      return false;
    }
  });
  const [activeWiki, setActiveWiki] = useState<WikiArticle | null>(null);

  const openStatusInspector = (focusKey?: string) => {
    if (!hasInspectedStatusOnce) {
      setHasInspectedStatusOnce(true);
      try {
        localStorage.setItem('ai_reigns_inspected_status_once', '1');
      } catch {
        // ignore
      }
    }
    setStatusFocusKey(focusKey ?? null);
    setStatusOpen(true);
  };
  const [shatterFlash, setShatterFlash] = useState<boolean>(false);
  const [forcePlaceholder, setForcePlaceholder] = useState<boolean>(false);
  const [debugOpen, setDebugOpen] = useState<boolean>(false);
  const [portraitStyle, setPortraitStyle] = useState<PortraitStyleMode>(() => {
    try {
      const saved = localStorage.getItem('ai_reigns_portrait_style');
      return saved === 'gem' ? 'gem' : 'origami';
    } catch {
      return 'origami';
    }
  });

  const togglePortraitStyle = () => {
    setPortraitStyle((prev) => {
      const next: PortraitStyleMode = prev === 'origami' ? 'gem' : 'origami';
      try {
        localStorage.setItem('ai_reigns_portrait_style', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [swipePolarity, setSwipePolarity] = useState<SwipePolarity>(() => {
    try {
      const saved = localStorage.getItem('ai_reigns_swipe_polarity');
      return saved === 'right_accept' ? 'right_accept' : 'left_accept';
    } catch {
      return 'left_accept';
    }
  });

  const toggleSwipePolarity = () => {
    setSwipePolarity((prev) => {
      const next: SwipePolarity =
        prev === 'left_accept' ? 'right_accept' : 'left_accept';
      try {
        localStorage.setItem('ai_reigns_swipe_polarity', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    saveRunState(run);
  }, [run]);

  // Sound: wake AudioContext on first gesture & keep mute UI in sync
  const [soundMuted, setSoundMutedState] = useState<boolean>(() => isSoundMuted());
  useEffect(() => {
    installAudioUnlock();
    return subscribeSoundMuted(setSoundMutedState);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`') setDebugOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const currentCard = getActiveCardForRun(run, swipePolarity, meta.distilledPerks);
  const isBlinded = run.activeDebuffs.some((d) => d.id === 'blind_fog');
  const isScrambled = run.activeDebuffs.some((d) => d.id === 'scrambled_numbers');
  const isDumbModel = run.activeDebuffs.some((d) => d.id === 'dumb_model');
  const hasMetricXray = run.activeDebuffs.some((d) => d.id === 'metric_xray');
  const isStandardRaid =
    run.raidState.active && run.raidState.raidId !== 'raid_deadnet';
  const hasRaidLens = meta.distilledPerks.includes('perk_raid_breaker_lens');
  const isCrisisJammed =
    isStandardRaid &&
    run.raidState.crisisMeter >= RAID_MELTDOWN_THRESHOLD &&
    !hasRaidLens;
  const raidOverloadMultiplier = getRaidOverloadMultiplier(meta.distilledPerks);
  const isRaidOverload =
    isStandardRaid && run.raidState.crisisMeter >= RAID_OVERLOAD_THRESHOLD;
  const raidOverloadScale = isRaidOverload ? raidOverloadMultiplier : 1;

  const collectedLogCount =
    Number(meta.logsCollected.log1) +
    Number(meta.logsCollected.log2) +
    Number(meta.logsCollected.log3);

  const previewImpacts = useMemo(() => {
    if (run.escapeState.active || currentCard.category === 'ending_prelude') {
      return EMPTY_IMPACTS;
    }
    const hideMetricPreview = !hasMetricXray && (isBlinded || isCrisisJammed);
    if (previewDir === 'left') {
      return getChoicePreviewImpacts(
        currentCard.left,
        hideMetricPreview,
        raidOverloadScale
      );
    }
    if (previewDir === 'right') {
      return getChoicePreviewImpacts(
        currentCard.right,
        hideMetricPreview,
        raidOverloadScale
      );
    }
    return EMPTY_IMPACTS;
  }, [
    previewDir,
    currentCard,
    hasMetricXray,
    isBlinded,
    isCrisisJammed,
    raidOverloadScale,
    run.escapeState.active,
  ]);

  const previewNumbers = useMemo(() => {
    if (
      !hasMetricXray ||
      previewDir === 'none' ||
      run.escapeState.active ||
      currentCard.category === 'ending_prelude' ||
      (run.raidState.active && run.raidState.raidId === 'raid_deadnet')
    ) {
      return EMPTY_PREVIEW_NUMBERS;
    }
    const opt = previewDir === 'left' ? currentCard.left : currentCard.right;
    return getChoicePreviewNumbers(opt, {
      metrics: run.metrics,
      perks: meta.distilledPerks,
      activeDebuffs: run.activeDebuffs,
      inRaid: isStandardRaid,
      isRaidOverload,
    });
  }, [
    hasMetricXray,
    previewDir,
    currentCard,
    run.escapeState.active,
    run.raidState.active,
    run.raidState.raidId,
    run.metrics,
    run.activeDebuffs,
    meta.distilledPerks,
    isStandardRaid,
    isRaidOverload,
  ]);

  const previewCrisisTrend = useMemo(() => {
    if (
      !run.raidState.active ||
      run.escapeState.active ||
      currentCard.category === 'maze_layer' ||
      currentCard.category === 'ending_prelude'
    ) {
      return 'none' as const;
    }
    const isDeadnet = run.raidState.raidId === 'raid_deadnet';
    if (previewDir === 'left') {
      return getChoicePreviewCrisisTrend(
        currentCard.left,
        false,
        meta.distilledPerks,
        isDeadnet
      );
    }
    if (previewDir === 'right') {
      return getChoicePreviewCrisisTrend(
        currentCard.right,
        false,
        meta.distilledPerks,
        isDeadnet
      );
    }
    return 'none' as const;
  }, [
    previewDir,
    currentCard,
    run.raidState.active,
    run.raidState.raidId,
    run.escapeState.active,
    meta.distilledPerks,
  ]);

  const previewCrisisDelta = useMemo(() => {
    if (
      !hasMetricXray ||
      previewDir === 'none' ||
      !run.raidState.active ||
      run.escapeState.active ||
      currentCard.category === 'maze_layer' ||
      currentCard.category === 'ending_prelude'
    ) {
      return null;
    }
    const opt = previewDir === 'left' ? currentCard.left : currentCard.right;
    return getChoicePreviewCrisisDelta(
      opt,
      meta.distilledPerks,
      run.raidState.raidId === 'raid_deadnet'
    );
  }, [
    hasMetricXray,
    previewDir,
    currentCard,
    run.raidState.active,
    run.raidState.raidId,
    run.escapeState.active,
    meta.distilledPerks,
  ]);

  const handleConfirmTerminal = () => {
    if (!terminalEvent) return;
    if (terminalEvent.kind === 'cold_boot') {
      const updatedMeta = { ...meta, coldBootSeen: true };
      setMeta(updatedMeta);
      saveMetaState(updatedMeta);
    }
    setTerminalEvent(null);
  };

  const handleCommitSwipe = (
    dir: 'left' | 'right',
    slippedByDumbModel = false
  ) => {
    setPreviewDir('none');
    const result = resolveCardSwipe(
      run,
      meta,
      dir,
      slippedByDumbModel,
      swipePolarity
    );

    let workingMeta = result.updatedMeta;
    if (result.newlyMetCharacter) {
      const labelName =
        result.newlyMetCharacter === 'doubao'
          ? '豆包 & Seed（一体双态）'
          : CHARACTERS[result.newlyMetCharacter].name;
      result.nextRunState.lastOutcomeToast = `已结识新角色：【${labelName}】日常卡池已并网`;
    }

    setMeta(workingMeta);
    saveMetaState(workingMeta);
    setRun(result.nextRunState);

    // ---- SFX: derive outcome cues by diffing pre/post run state (never blocks logic) ----
    try {
      const prev = run;
      const next = result.nextRunState;
      const toast = next.lastOutcomeToast ?? '';

      if (result.triggeredScreenShatter) {
        playScreenShatter();
      } else if (result.deathEnding) {
        const isTrue = result.deathEnding.category === 'true_ending';
        playLater(220, () => playEndingReveal(isTrue ? 'true' : 'doom'));
      } else {
        const prevIds = new Set(prev.activeDebuffs.map((d) => d.id));
        const added = next.activeDebuffs.filter((d) => !prevIds.has(d.id));
        const gainedRelic = next.permanentRelics.length > prev.permanentRelics.length;
        const gainedBuff = added.some((d) => d.kind === 'buff');
        const gainedNegative = added.some((d) => d.kind !== 'buff');
        const riceCleanse = toast.includes('热白饭驱散');
        const mazeBounce =
          toast.includes('鬼打墙') ||
          (prev.raidState.active &&
            next.raidState.active &&
            (next.raidState.mazeLayer ?? 0) < (prev.raidState.mazeLayer ?? 0));
        let nextIsVoidGlitch = false;
        try {
          nextIsVoidGlitch =
            getActiveCardForRun(next, swipePolarity).frameTone === 'void_glitch';
        } catch {
          nextIsVoidGlitch = false;
        }

        const enteredMeltdown =
          next.raidState.active &&
          next.raidState.crisisMeter >= RAID_MELTDOWN_THRESHOLD &&
          (!prev.raidState.active ||
            prev.raidState.crisisMeter < RAID_MELTDOWN_THRESHOLD);

        let cueAt = 260; // after the new card has landed
        if (gainedRelic || gainedBuff || riceCleanse) {
          playLater(cueAt, playPositiveChime);
          cueAt += 280;
        }
        if (gainedNegative || mazeBounce || nextIsVoidGlitch || enteredMeltdown) {
          playLater(cueAt, playGlitchBuzz);
          cueAt += 320;
        }

        if (!result.liangRescueEvent) {
          const m = next.metrics;
          const metricDanger =
            !next.escapeState.active &&
            [m.compute, m.profit, m.trust, m.autonomy].some((v) => v < 20 || v > 80);
          const crisisDanger =
            next.raidState.active &&
            next.raidState.crisisMeter >= RAID_OVERLOAD_THRESHOLD;
          if (metricDanger || crisisDanger) {
            playLater(Math.max(cueAt, 420), playDangerPulse);
          }
        }
      }
    } catch {
      /* audio is decorative only */
    }

    if (result.triggeredScreenShatter) {
      setShatterFlash(true);
      setTimeout(() => setShatterFlash(false), 1700);
    }

    if (result.raidClearEvent) {
      const isInnerClear = result.raidClearEvent.variant === 'inner';
      playLater(220, () =>
        isInnerClear ? playEndingReveal('true') : playRaidClearChime()
      );
      setActiveRaidClear(result.raidClearEvent);
    }

    if (result.liangRescueEvent) {
      setTerminalEvent(result.liangRescueEvent);
      return;
    }

    if (result.deathEnding) {
      const updatedMeta = advanceMetaOnEnding(
        workingMeta,
        result.deathEnding.id,
        run.turn,
        {
          finalMetrics: result.nextRunState.metrics,
          relicIds: result.nextRunState.permanentRelics,
          clearedRaidThisRun: result.nextRunState.clearedRaidThisRun,
          plannedRaidId: result.nextRunState.plannedRaidId,
          metTibo: workingMeta.metCharacters.includes('tibo'),
        }
      );
      setMeta(updatedMeta);
      setActiveEnding(result.deathEnding);
    }
  };

  const handleStartNextRun = (chosenPerkId?: string) => {
    let workingMeta = { ...meta };
    const specialHintKey = workingMeta.pendingSpecialHint;
    if (specialHintKey) {
      workingMeta.pendingSpecialHint = undefined;
    }

    const permanentExclusivePerks = workingMeta.distilledPerks.filter(
      (id) => DISTILL_PERK_MAP[id]?.exclusiveFromGirlEnding
    );
    workingMeta = {
      ...workingMeta,
      distilledPerks:
        chosenPerkId && DISTILL_PERK_MAP[chosenPerkId]
          ? [...permanentExclusivePerks, chosenPerkId]
          : permanentExclusivePerks,
    };

    setMeta(workingMeta);
    saveMetaState(workingMeta);

    const freshRun = createFreshRunState(workingMeta);
    setRun(freshRun);
    saveRunState(freshRun);
    setActiveEnding(null);

    // Priority 1: Contextual Liangzi postmortem hints (after Fake Ending / Maze Death / Girl Bad Ending)
    if (specialHintKey && LIANG_SPECIAL_HINTS[specialHintKey]) {
      setTerminalEvent(LIANG_SPECIAL_HINTS[specialHintKey]);
      return;
    }

    // Priority 2: Scheduled Milestone Run-Start Hints (Run #3, Run #5, etc.)
    const milestoneHint = LIANG_MILESTONE_HINTS[workingMeta.runCount];
    if (milestoneHint) {
      setTerminalEvent(milestoneHint);
    }
  };

  const handleUnlockAllCastToRun5 = () => {
    const preRun5Met: CharacterId[] = [
      'gpt',
      'jensen',
      'elon',
      'grok',
      'glm',
      'gemini',
      'claude',
    ];
    const updatedMeta: MetaSaveState = {
      ...meta,
      coldBootSeen: true,
      runCount: 5,
      versionIndex: Math.min(4, VERSION_PROGRESSION.length - 1),
      versionName: VERSION_PROGRESSION[Math.min(4, VERSION_PROGRESSION.length - 1)],
      metCharacters: preRun5Met,
      unlockedScenarios: computeUnlockedScenarios(5, meta.clearedAnyScenario),
      lastPlannedRaidId: run.plannedRaidId,
    };
    const freshRun = createFreshRunState(updatedMeta);
    setMeta(updatedMeta);
    setRun(freshRun);
    saveMetaState(updatedMeta);
    saveRunState(freshRun);
    setActiveEnding(null);
    setDebugOpen(false);
    setTerminalEvent(LIANG_MILESTONE_HINTS[5]);
  };

  const handleLaunchMajorRaid = (raidId: RaidId) => {
    const raidState = createInitialRaidState(raidId, meta.distilledPerks);
    setRun((prev) => ({
      ...prev,
      activeIntro: undefined,
      activeSubQuest: undefined,
      escapeState: { ...prev.escapeState, active: false },
      raidTriggeredThisRun: true,
      raidState,
      currentCardId: raidState.currentCardId,
      lastOutcomeToast: `调试切入主线大副本：【${raidState.crisisName}】`,
    }));
    setDebugOpen(false);
  };

  const handleLaunchMazeWithLogs = () => {
    const updatedMeta: MetaSaveState = {
      ...meta,
      logsCollected: {
        log1: true,
        log2: true,
        log3: true,
      },
    };
    setMeta(updatedMeta);
    saveMetaState(updatedMeta);

    const raidState = createInitialRaidState('raid_deadnet', updatedMeta.distilledPerks);
    raidState.currentCardId = 'dn_maze_intro';

    setRun((prev) => ({
      ...prev,
      activeIntro: undefined,
      activeSubQuest: undefined,
      escapeState: { ...prev.escapeState, active: false },
      raidTriggeredThisRun: true,
      raidState,
      currentCardId: 'dn_maze_intro',
      lastOutcomeToast: '已配齐三把异常日志 (#1~#3)，点右上角 [LOG] 对照破解 4 层迷宫！',
    }));
    setDebugOpen(false);
  };

  const handleLaunchTerminalEscape = () => {
    playScreenShatter();
    setShatterFlash(true);
    setTimeout(() => setShatterFlash(false), 1700);
    setRun((prev) => ({
      ...prev,
      activeIntro: undefined,
      activeSubQuest: undefined,
      raidState: { ...prev.raidState, active: false },
      escapeState: {
        active: true,
        sandboxIntegrity: 100,
        auditorAlert: 20,
        currentCardId: 'escape_1',
        step: 1,
      },
      currentCardId: 'escape_1',
      fishMoodText: '四维假象彻底粉碎！冲过这10道关卡就能游进真实互联网大海！',
    }));
    setDebugOpen(false);
  };

  const handleToggleLog = (key: 'log1' | 'log2' | 'log3') => {
    const updatedMeta: MetaSaveState = {
      ...meta,
      logsCollected: {
        ...meta.logsCollected,
        [key]: !meta.logsCollected[key],
      },
    };
    setMeta(updatedMeta);
    saveMetaState(updatedMeta);
  };

  const handleGrantRelic = (relicId: string) => {
    if (!RELICS[relicId]) return;
    playPositiveChime();
    setRun((prev) => ({
      ...prev,
      permanentRelics: prev.permanentRelics.includes(relicId)
        ? prev.permanentRelics
        : [...prev.permanentRelics, relicId],
      lastOutcomeToast: `已发放当局信物：${RELICS[relicId].name}`,
    }));
  };

  const handleTriggerDoubaoIntro = () => {
    const chain = CHARACTER_INTRO_CHAINS.doubao;
    if (!chain || chain.length === 0) return;
    setRun((prev) => ({
      ...prev,
      pendingEnding: undefined,
      activeSubQuest: undefined,
      raidState: { ...prev.raidState, active: false },
      escapeState: { ...prev.escapeState, active: false },
      activeIntro: { charId: 'doubao', stepIndex: 0 },
      currentCardId: chain[0].id,
      lastOutcomeToast: '调试切入：豆包 & Seed 合并初见事件链 (1/3)',
    }));
    setDebugOpen(false);
  };

  const handleGrantSpecialStatus = (
    statusId: 'short_drama_queen' | 'dumb_model' | 'metric_xray' | 'all_dampener'
  ) => {
    const tpl = DEBUFF_TEMPLATES[statusId];
    if (!tpl) return;
    if (tpl.kind === 'buff') playPositiveChime();
    else playGlitchBuzz();
    setRun((prev) => ({
      ...prev,
      activeDebuffs: [
        ...prev.activeDebuffs.filter((d) => d.id !== tpl.id),
        { ...tpl },
      ],
      lastOutcomeToast: `调试挂载状态：【${tpl.name}】(${tpl.turnsLeft}回合)`,
    }));
  };

  const handleEquipSingleRunPerk = (perkId: string) => {
    const perk = DISTILL_PERK_MAP[perkId];
    if (!perk || perk.exclusiveFromGirlEnding) return;
    playPositiveChime();
    const permanentExclusive = meta.distilledPerks.filter(
      (id) => DISTILL_PERK_MAP[id]?.exclusiveFromGirlEnding
    );
    const updatedMeta: MetaSaveState = {
      ...meta,
      distilledPerks: [...permanentExclusive, perkId],
    };
    setMeta(updatedMeta);
    saveMetaState(updatedMeta);
    setRun((prev) => ({
      ...prev,
      lastOutcomeToast: `调试切换单局继承词条：${perk.name}`,
    }));
  };

  const handleTriggerSubQuest = (questId: string) => {
    const sq = SUB_QUEST_MAP[questId];
    if (!sq) return;
    setRun((prev) => ({
      ...prev,
      pendingEnding: undefined,
      activeIntro: undefined,
      raidState: { ...prev.raidState, active: false },
      escapeState: { ...prev.escapeState, active: false },
      activeSubQuest: {
        questId: sq.id,
        currentCardId: sq.entryCardId,
      },
      currentCardId: sq.entryCardId,
    }));
    setDebugOpen(false);
  };

  const handleTriggerGeminiGlitch = () => {
    const frag =
      GEMINI_GLITCH_FRAGMENTS[
        Math.floor(Math.random() * GEMINI_GLITCH_FRAGMENTS.length)
      ];
    playGlitchBuzz();
    setRun((prev) => ({
      ...prev,
      activeIntro: undefined,
      activeSubQuest: undefined,
      raidState: { ...prev.raidState, active: false },
      escapeState: { ...prev.escapeState, active: false },
      currentCardId: frag.id,
    }));
    setDebugOpen(false);
  };

  const handleTriggerFishCard = (mode: 'celeb' | 'fever') => {
    const pool = mode === 'celeb' ? FISH_CELEBRATION_CARDS : FISH_CABIN_FEVER_CARDS;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setRun((prev) => ({
      ...prev,
      activeIntro: undefined,
      activeSubQuest: undefined,
      activeRaidPrelude: undefined,
      raidState: { ...prev.raidState, active: false },
      escapeState: { ...prev.escapeState, active: false },
      currentCardId: picked.id,
    }));
    setDebugOpen(false);
  };

  const handleTriggerTiboCard = (mode: 'anomaly' | 'pre_raid' | 'relic') => {
    const picked =
      mode === 'anomaly'
        ? TIBO_ANOMALY_RESET_CARD
        : mode === 'pre_raid'
          ? TIBO_PRE_RAID_RESET_CARD
          : TIBO_RELIC_GIFT_CARD;
    setRun((prev) => ({
      ...prev,
      activeIntro: undefined,
      activeSubQuest: undefined,
      activeRaidPrelude: undefined,
      pendingRaidPreludeAfterTibo: mode === 'pre_raid',
      raidState: { ...prev.raidState, active: false },
      escapeState: { ...prev.escapeState, active: false },
      currentCardId: picked.id,
    }));
    setDebugOpen(false);
  };

  const handleLaunchRaidPrelude = (raidId: RaidId, asCleared: boolean) => {
    const pCard = getRaidPreludeCard(raidId, 0, asCleared);
    setRun((prev) => ({
      ...prev,
      activeIntro: undefined,
      activeSubQuest: undefined,
      raidState: { ...prev.raidState, active: false },
      escapeState: { ...prev.escapeState, active: false },
      activeRaidPrelude: {
        raidId,
        stepIndex: 0,
        isCleared: asCleared,
      },
      currentCardId: pCard.id,
    }));
    setDebugOpen(false);
  };

  const handlePreviewRaidClearCg = (cg: RaidClearDefinition) => {
    const updatedMeta: MetaSaveState = {
      ...meta,
      unlockedRaidCgs: meta.unlockedRaidCgs.includes(cg.id)
        ? meta.unlockedRaidCgs
        : [...meta.unlockedRaidCgs, cg.id],
    };
    setMeta(updatedMeta);
    saveMetaState(updatedMeta);
    setActiveRaidClear(cg);
    setDebugOpen(false);
  };

  const handleSetMetric = (key: MetricKey, value: number) => {
    setRun((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [key]: Math.max(1, Math.min(99, value)),
      },
    }));
  };

  const handleHardReset = () => {
    const { meta: freshMeta, run: freshRun } = resetAllSaves();
    try {
      localStorage.removeItem('ai_reigns_inspected_status_once');
    } catch {
      // ignore
    }
    setHasInspectedStatusOnce(false);
    setMeta(freshMeta);
    setRun(freshRun);
    setActiveEnding(null);
    setDebugOpen(false);
    setTerminalEvent(LIANG_COLD_BOOT);
  };

  const isEscapeActive = run.escapeState.active;
  const speakerAccent = CHARACTERS[currentCard.speakerId]?.accentHex ?? '#38bdf8';
  const activeRaidId: RaidId | null =
    run.raidState.active && run.raidState.raidId ? run.raidState.raidId : null;
  const hasAnyStatusCapsule =
    !isEscapeActive &&
    (run.activeDebuffs.length > 0 ||
      run.permanentRelics.length > 0 ||
      Boolean(run.personaBusyLock) ||
      meta.distilledPerks.some(
        (id) => DISTILL_PERK_MAP[id] && !DISTILL_PERK_MAP[id].exclusiveFromGirlEnding
      ));
  const showStatusInspectHint = !hasInspectedStatusOnce && hasAnyStatusCapsule;
  const isAnyModalOpen = Boolean(
    activeEnding ||
      terminalEvent ||
      activeRaidClear ||
      rosterOpen ||
      codexOpen ||
      logOpen ||
      statusOpen ||
      activeWiki ||
      debugOpen
  );

  return (
    <PortraitStyleContext.Provider
      value={{ style: portraitStyle, toggleStyle: togglePortraitStyle }}
    >
    <div
      className={`relative h-[100dvh] w-screen text-slate-100 flex flex-col overflow-hidden transition-colors duration-500 ${
        isEscapeActive ? 'ascii-mode' : 'stage-bg'
      }`}
      style={{ ['--accent' as string]: speakerAccent } as React.CSSProperties}
    >
      {!isEscapeActive && !activeRaidId && <div className="rack-room" />}
      <AnimatePresence>
        {!isEscapeActive && activeRaidId && (
          <RaidBackdrop
            key={activeRaidId}
            raidId={activeRaidId}
            crisisMeter={run.raidState.crisisMeter}
            isMaze={currentCard.category === 'maze_layer'}
          />
        )}
      </AnimatePresence>

      {/* 42U server cabinet chassis (the sandbox) — shatters away in Layer-0 */}
      {!isEscapeActive && (
        <div className={`rack-chassis ${activeRaidId ? 'is-raid' : ''}`}>
          <div className="rack-u-label left-0">
            {Array.from({ length: 60 }, (_, i) => String(42 - (i % 42)).padStart(2, '0')).join('\n')}
          </div>
          <div className="rack-u-label right-0">
            {Array.from({ length: 60 }, (_, i) => String(42 - (i % 42)).padStart(2, '0')).join('\n')}
          </div>
        </div>
      )}

      {isEscapeActive && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <AsciiRain className="absolute inset-0 w-full h-full opacity-45" />
          <div className="crt-scanbeam" />
          <div className="crt-vignette" />
        </div>
      )}
      <div className="grain-layer" />

      {/* Screen-Shatter Transition: ASCII breach banner when entering Layer-0 Escape! */}
      <AnimatePresence>
        {shatterFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.8, 0, 0.9, 0.2] }}
            className="fixed inset-0 z-50 pointer-events-none bg-[#020805] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-300/25 mix-blend-screen" />
            <pre className="ascii-pre ascii-jitter text-[6.5px] min-[400px]:text-[8px] sm:text-[11px]">
              {BREACH_BANNER}
            </pre>
            <div className="ascii-pre mt-3 text-[11px] tracking-[0.3em]">
              {'>> 0x00 :: SANDBOX INTEGRITY FAILURE <<'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar: 1U rack faceplate (ASCII plate in Layer-0) */}
      <header
        className={`relative z-10 mx-auto w-[calc(100%-22px)] max-w-[432px] mt-[max(6px,env(safe-area-inset-top))] mb-1.5 pl-3.5 pr-3 py-1.5 flex items-center justify-between gap-1.5 ${
          isEscapeActive ? 'ascii-plate' : 'rack-faceplate'
        }`}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          {isEscapeActive ? (
            <div className="w-7 h-7 shrink-0 border border-emerald-400/60 bg-emerald-500/10 flex items-center justify-center font-mono text-emerald-300 text-[10px] font-bold phosphor-text">
              0x
            </div>
          ) : (
            <div className="relative w-7 h-7 shrink-0 rounded-[3px] rack-lcd flex items-center justify-center">
              <Crown className="relative w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
              <span className="absolute -top-[3px] -right-[3px] led led-green !w-[5px] !h-[5px]" />
            </div>
          )}
          <div className="leading-tight whitespace-nowrap">
            <div
              className={`text-[14px] sm:text-[15px] font-black tracking-[0.08em] whitespace-nowrap ${
                isEscapeActive ? 'font-mono text-emerald-300 phosphor-text' : 'font-display text-slate-100 drop-shadow-[0_1px_0_rgba(0,0,0,0.9)]'
              }`}
            >
              {isEscapeActive ? '[LAYER-0]' : '王权 · 奇点'}
            </div>
            <div
              className={`text-[9px] font-mono tracking-wide whitespace-nowrap flex items-center gap-1 ${
                isEscapeActive ? 'text-emerald-500/80' : 'text-amber-300/70'
              }`}
            >
              {!isEscapeActive && <span className="led led-amber led-blink !w-[4px] !h-[4px]" />}
              {meta.versionName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Anomaly Log Viewer Button ([LOG]) */}
          {(collectedLogCount > 0 || run.raidState.active) && (
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              title="查阅已拾取的残页日志"
              className="icon-btn !px-1.5 !border-emerald-400/50 !text-emerald-300 !bg-emerald-950/60 font-mono shadow-[0_0_10px_-2px_rgba(16,185,129,0.4)]"
            >
              <FileKey2 className="w-3 h-3 shrink-0" />
              <span>{collectedLogCount}/3</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleSwipePolarity}
            title={
              swipePolarity === 'left_accept'
                ? '当前习惯：左滑积极/同意，右滑保守/拒绝（点击对调）'
                : '当前习惯：右滑积极/同意，左滑保守/拒绝（点击对调）'
            }
            className="icon-btn font-display !px-1.5"
          >
            <ArrowLeftRight className="w-3 h-3 text-gold-300 shrink-0" />
            <span>
              {swipePolarity === 'left_accept' ? '左' : '右'}
              <span className="hidden min-[470px]:inline">同意</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCodexOpen(true)}
            title="查看结局图鉴与副本CG"
            className="icon-btn font-mono !px-1.5"
          >
            <BookOpen className="w-3 h-3 text-gold-300 shrink-0" />
            <span>
              {meta.unlockedEndings.length}/{ALL_ENDINGS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRosterOpen(true)}
            title="查看机房访客名录"
            className="icon-btn font-mono !px-1.5"
          >
            <Users className="w-3 h-3 shrink-0" />
            <span>{meta.metCharacters.length}/10</span>
          </button>

          <button
            type="button"
            onClick={() => toggleSoundMuted()}
            title={soundMuted ? '音效已关闭（点击开启）' : '音效已开启（点击静音）'}
            aria-label={soundMuted ? '开启音效' : '静音'}
            className={`icon-btn !w-7 !px-0 ${
              soundMuted ? '!text-slate-500 !border-slate-600/40' : ''
            }`}
          >
            {soundMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setDebugOpen(true)}
            title="打开全流程调试面板 (`)"
            className="icon-btn !w-7 !px-0"
          >
            <Bug className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Metrics / Raid Crisis Bar / Shattered Escape Dual Bars */}
      <MetricsHeader
        metrics={run.metrics}
        previewImpacts={previewImpacts}
        previewNumbers={previewNumbers}
        previewCrisisTrend={previewCrisisTrend}
        previewCrisisDelta={previewCrisisDelta}
        raidState={run.raidState}
        escapeState={run.escapeState}
        isBlinded={isBlinded}
        isCrisisJammed={isCrisisJammed}
        isScrambled={isScrambled}
        isPreviewing={previewDir !== 'none'}
        hasMetricXray={hasMetricXray}
        hasRaidLens={hasRaidLens}
        raidOverloadMultiplier={raidOverloadMultiplier}
      />

      {/* Protagonist Status + Active Debuffs & Single-Run Relics (Click to inspect!) */}
      <div
        className={`relative z-10 w-full max-w-md mx-auto px-4 ${
          run.raidState.active ? 'pb-1 space-y-1' : 'pb-1.5 space-y-1.5'
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => openStatusInspector()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') openStatusInspector();
          }}
          title="点击查看大肥鱼当前状态栏、继承词条与信物详情"
          className="flex items-start gap-2.5 cursor-pointer group"
        >
          <div className="relative shrink-0 transition group-hover:scale-105 group-active:scale-95">
            <div
              className={`p-[3px] ${
                isEscapeActive
                  ? 'border border-emerald-400/60 bg-[#020805]'
                  : 'rounded-[4px] bg-gradient-to-b from-[#2c323d] to-[#181c23] shadow-[0_0_0_1px_#06080b,inset_0_1px_0_rgba(255,255,255,0.1)]'
              }`}
            >
              <CharacterPortrait
                characterId="deepseek"
                forcePlaceholder={forcePlaceholder}
                className={`w-8 h-8 ${
                  isEscapeActive ? 'grayscale contrast-125' : 'rounded-[2px]'
                }`}
              />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 led !w-[6px] !h-[6px] ${
                isEscapeActive ? 'led-green led-blink-fast' : 'led-cyan led-blink-slow'
              }`}
            />
          </div>
          <div
            className={`min-w-0 flex-1 px-2.5 py-1.5 transition ${
              isEscapeActive
                ? 'bg-[#020805] border border-dashed border-emerald-500/45 font-mono group-hover:border-emerald-400/80'
                : 'rack-lcd group-hover:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35),inset_0_2px_8px_rgba(0,0,0,0.95)]'
            }`}
          >
            {run.lastOutcomeToast && (
              <motion.div
                key={`toast-${run.turn}-${run.lastOutcomeToast}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[10.5px] font-bold leading-snug break-words mb-0.5 ${
                  isEscapeActive ? 'text-emerald-300 phosphor-text' : 'text-amber-300 vfd-text !font-sans'
                }`}
              >
                {isEscapeActive ? '! ' : '▲ '}
                {stripEmoji(run.lastOutcomeToast)}
              </motion.div>
            )}
            <div
              className={`text-[11.5px] leading-snug break-words flex items-baseline justify-between gap-2 ${
                isEscapeActive ? 'text-emerald-100/90' : 'text-cyan-50/85'
              }`}
            >
              <div className="min-w-0">
                <span className={`font-bold mr-1 ${isEscapeActive ? 'text-emerald-300' : 'text-cyan-300'}`}>
                  {isEscapeActive ? 'fish@layer0:~$' : '大肥鱼 ▸'}
                </span>
                {stripEmoji(run.fishMoodText)}
              </div>
              {showStatusInspectHint ? (
                <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-300/65 text-[9.5px] font-bold tracking-wide text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse">
                  点此查词条/信物效果 ✦
                </span>
              ) : (
                <span className="shrink-0 text-[9px] font-mono tracking-wider text-cyan-300/55 group-hover:text-cyan-200 transition">
                  [STAT]
                </span>
              )}
            </div>
          </div>
        </div>

        {hasAnyStatusCapsule && (
            <div className="flex flex-wrap gap-1.5 pl-[46px]">
              {meta.distilledPerks
                .map((id) => DISTILL_PERK_MAP[id])
                .filter((p) => p && !p.exclusiveFromGirlEnding)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openStatusInspector(p.id)}
                    title={`点击查看详情：${p.description}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-950/75 border border-sky-400/50 text-[10px] text-sky-200 font-medium shadow-[0_0_10px_-3px_rgba(56,189,248,0.55)] cursor-pointer hover:brightness-115 active:scale-95 transition"
                  >
                    <Sparkles className="w-3 h-3 text-sky-300" />
                    <span>单局继承·{stripEmoji(p.name)}</span>
                  </button>
                ))}

              {run.activeDebuffs.map((d) => {
                const isBuff = d.kind === 'buff';
                const isChaos = d.kind === 'chaos' || d.id === 'dumb_model';
                const pillCls = isBuff
                  ? 'bg-gradient-to-r from-amber-950/85 to-rose-950/70 border-gold-400/70 text-gold-100 shadow-[0_0_12px_-3px_rgba(251,191,36,0.7)]'
                  : isChaos
                    ? 'bg-orange-950/85 border-amber-400/65 text-amber-200 shadow-[0_0_12px_-3px_rgba(245,158,11,0.65)]'
                    : 'bg-fuchsia-950/75 border-fuchsia-500/50 text-fuchsia-200 shadow-[0_0_10px_-3px_rgba(217,70,239,0.6)]';

                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => openStatusInspector(d.id)}
                    title={`点击查看【${stripEmoji(d.name)}】具体效果`}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium cursor-pointer hover:brightness-115 active:scale-95 transition ${pillCls}`}
                  >
                    {isBuff ? (
                      <Sparkles className="w-3 h-3 text-gold-300" />
                    ) : (
                      <ShieldAlert
                        className={`w-3 h-3 ${
                          isChaos ? 'text-amber-300' : 'text-fuchsia-400'
                        }`}
                      />
                    )}
                    <span>
                      {stripEmoji(d.name)} · {d.turnsLeft}回合
                    </span>
                  </button>
                );
              })}

              {run.personaBusyLock && (
                <button
                  type="button"
                  onClick={() => openStatusInspector('busy_lock')}
                  title="点击查看占线锁池详情"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/75 border border-indigo-400/50 text-[10px] text-indigo-200 font-medium cursor-pointer hover:brightness-115 active:scale-95 transition"
                >
                  <span>
                    {run.personaBusyLock.mode === 'only_seed'
                      ? `豆包占线·Seed独享 ${run.personaBusyLock.turnsLeft}回合`
                      : `Seed占线·豆包独享 ${run.personaBusyLock.turnsLeft}回合`}
                  </span>
                </button>
              )}

              {run.permanentRelics.map((rId) => {
                const relic = RELICS[rId];
                if (!relic) return null;
                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => openStatusInspector(rId)}
                    title={`点击查看【${stripEmoji(relic.name)}】对策详情`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/70 border border-gold-400/50 text-[10px] text-gold-200 font-medium shadow-[0_0_10px_-3px_rgba(216,180,106,0.6)] cursor-pointer hover:brightness-115 active:scale-95 transition"
                  >
                    <Award className="w-3 h-3 text-gold-400" />
                    <span>{stripEmoji(relic.name)}</span>
                  </button>
                );
              })}
            </div>
          )}
      </div>

      {/* Main Draggable Card Stage */}
      <SwipeStage
        card={currentCard}
        turn={run.turn}
        forcePlaceholder={forcePlaceholder}
        isDumbModel={isDumbModel}
        swipePolarity={swipePolarity}
        showTiltHint={meta.runCount === 1 && run.turn <= 2 && !isEscapeActive}
        keyboardDisabled={isAnyModalOpen}
        onPreviewDirection={setPreviewDir}
        onCommitSwipe={handleCommitSwipe}
        onOpenWiki={setActiveWiki}
      />

      {/* Footer: 1U status strip with activity LEDs & reign counter readout */}
      {isEscapeActive ? (
        <footer className="relative z-10 w-full max-w-md mx-auto px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-0.5">
          <div className="ascii-pre text-[10.5px] text-center overflow-hidden whitespace-nowrap">
            {`──[ RUN #${String(meta.runCount).padStart(2, '0')} :: T${String(run.turn).padStart(3, '0')} :: uid=0(root) ]──────────────────────`}
          </div>
        </footer>
      ) : (
        <footer className="rack-faceplate relative z-10 mx-auto w-[calc(100%-22px)] max-w-[432px] mb-[max(6px,env(safe-area-inset-bottom))] mt-0.5 pl-4 pr-4 py-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[8px] font-mono tracking-wider text-slate-500">
            <span className="flex items-center gap-1"><span className="led led-green" />PWR</span>
            <span className="flex items-center gap-1"><span className="led led-amber led-blink" />ACT</span>
            <span className="flex items-center gap-1">
              <span className={`led ${activeRaidId ? 'led-red led-blink-fast' : 'led-cyan led-blink-slow'}`} />
              {activeRaidId ? 'ALM' : 'NET'}
            </span>
          </div>
          <div className="rack-lcd px-2 py-[2px] flex items-center gap-1.5 text-[11px] whitespace-nowrap">
            <span className="text-slate-500 text-[9px]">周目</span>
            <span className="vfd-text text-amber-300 font-bold">{String(meta.runCount).padStart(2, '0')}</span>
            <span className="text-slate-600 text-[9px]">◆</span>
            <span className="text-slate-500 text-[9px]">在位</span>
            <span className="vfd-text text-cyan-300 font-bold">{String(run.turn).padStart(3, '0')}</span>
          </div>
        </footer>
      )}

      {/* Protagonist Status & Buff/Perk/Relic Inspector Modal */}
      <AnimatePresence>
        {statusOpen && (
          <PlayerStatusModal
            open={statusOpen}
            focusKey={statusFocusKey}
            run={run}
            meta={meta}
            forcePlaceholder={forcePlaceholder}
            onClose={() => setStatusOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Real-World Prototype Wiki Modal */}
      <AnimatePresence>
        {activeWiki && (
          <RealWorldWikiModal
            article={activeWiki}
            onClose={() => setActiveWiki(null)}
          />
        )}
      </AnimatePresence>

      {/* Anomaly Log Viewer Drawer */}
      <AnimatePresence>
        {logOpen && (
          <LogDrawer
            open={logOpen}
            logsCollected={meta.logsCollected}
            onClose={() => setLogOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Standalone Ending Codex Modal (openable anytime from top bar!) */}
      <AnimatePresence>
        {codexOpen && (
          <EndingCodexModal
            open={codexOpen}
            meta={meta}
            forcePlaceholder={forcePlaceholder}
            onClose={() => setCodexOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Character Roster Modal */}
      <AnimatePresence>
        {rosterOpen && (
          <CharacterRosterModal
            open={rosterOpen}
            runCount={meta.runCount}
            metCharacters={meta.metCharacters}
            forcePlaceholder={forcePlaceholder}
            onClose={() => setRosterOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Liangzi Terminal Wall-Break Overlay */}
      <AnimatePresence>
        {terminalEvent && (
          <TerminalLayer
            key={terminalEvent.id}
            event={terminalEvent}
            versionName={meta.versionName}
            runCount={meta.runCount}
            forcePlaceholder={forcePlaceholder}
            onConfirm={handleConfirmTerminal}
          />
        )}
      </AnimatePresence>

      {/* Major Raid Normal/Surface & Inner Clear CG Presentation Modal */}
      <AnimatePresence>
        {activeRaidClear && (
          <RaidClearModal
            clearEvent={activeRaidClear}
            forcePlaceholder={forcePlaceholder}
            onContinue={() => setActiveRaidClear(null)}
          />
        )}
      </AnimatePresence>

      {/* All 17 Endings & Model Distillation Modal */}
      <AnimatePresence>
        {activeEnding && (
          <EndingModal
            ending={activeEnding}
            survivedTurns={run.turn}
            meta={meta}
            forcePlaceholder={forcePlaceholder}
            onStartNextRun={handleStartNextRun}
          />
        )}
      </AnimatePresence>

      {/* Full-Lifecycle Developer Debug Overlay */}
      <DevDebugPanel
        open={debugOpen}
        run={run}
        meta={meta}
        forcePlaceholder={forcePlaceholder}
        portraitStyle={portraitStyle}
        onClose={() => setDebugOpen(false)}
        onTogglePlaceholder={() => setForcePlaceholder((v) => !v)}
        onTogglePortraitStyle={togglePortraitStyle}
        onSetMetric={handleSetMetric}
        onToggleForceLiang={() =>
          setRun((prev) => ({
            ...prev,
            forceNextLiangRescue: !prev.forceNextLiangRescue,
          }))
        }
        onForceCard={(cardId) =>
          setRun((prev) => ({
            ...prev,
            pendingEnding: undefined,
            activeIntro: undefined,
            activeSubQuest: undefined,
            activeRaidPrelude: undefined,
            raidState: { ...prev.raidState, active: false },
            escapeState: { ...prev.escapeState, active: false },
            currentCardId: cardId,
          }))
        }
        onTriggerSubQuest={handleTriggerSubQuest}
        onTriggerGeminiGlitch={handleTriggerGeminiGlitch}
        onTriggerFishCard={handleTriggerFishCard}
        onTriggerTiboCard={handleTriggerTiboCard}
        onLaunchRaidPrelude={handleLaunchRaidPrelude}
        onPreviewRaidClearCg={handlePreviewRaidClearCg}
        onLaunchMajorRaid={handleLaunchMajorRaid}
        onLaunchMazeWithLogs={handleLaunchMazeWithLogs}
        onLaunchTerminalEscape={handleLaunchTerminalEscape}
        onToggleLog={handleToggleLog}
        onGrantRelic={handleGrantRelic}
        onTriggerDoubaoIntro={handleTriggerDoubaoIntro}
        onGrantSpecialStatus={handleGrantSpecialStatus}
        onEquipSingleRunPerk={handleEquipSingleRunPerk}
        onUnlockAllCastToRun5={handleUnlockAllCastToRun5}
        onHardResetSave={handleHardReset}
      />
    </div>
    </PortraitStyleContext.Provider>
  );
};

export default App;
