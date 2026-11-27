import { CARD_MAP } from '../data/dailyCards';
import { ENDING_PRELUDES } from '../data/endingPreludes';
import {
  ESCAPE_FINAL_MAX_INTEGRITY,
  ESCAPE_PROTOCOL_CARDS,
} from '../data/escapeCards';
import {
  CHARACTER_INTRO_CHAINS,
  getUnlockedCastForRun,
  isCharacterMet,
} from '../data/introChains';
import {
  ENDING_MAP,
  EndingDefinition,
  findMetricDeathEnding,
} from '../data/endingsAndPerks';
import { buildLiangHotfixEvent } from '../data/liangScripts';
import { MAJOR_RAIDS, MAJOR_RAID_CARD_MAP } from '../data/majorRaids';
import { RAID_CLEAR_CG_MAP } from '../data/raidClearCgs';
import { RELICS, SUB_QUEST_MAP } from '../data/subQuests';
import {
  ActiveDebuff,
  ActiveIntroState,
  ActiveRaidPreludeState,
  ActiveSubQuestState,
  CharacterId,
  ChoiceOption,
  LiangTerminalEvent,
  MetricKey,
  Metrics,
  MetaSaveState,
  PersonaBusyLock,
  QueuedHook,
  RaidClearDefinition,
  RaidId,
  RandomOutcome,
  RunState,
} from '../types/game';
import { generateDynamicMazeCard } from './mazeGenerator';
import {
  applyMetricModifiers,
  computeEffectiveCrisisDelta,
  getRaidOverloadMultiplier,
} from './perkEffects';
import {
  createInitialRaidState,
  getScenarioNumberForRaid,
  pickNextRaidAfterSkip,
  RAID_OVERLOAD_THRESHOLD,
  recordRaidEncounter,
} from './raidMachine';
import { getActiveCardForRun, selectNextCard, SwipePolarity } from './router';
import { computeUnlockedScenarios } from './storage';

const METRIC_KEYS: MetricKey[] = ['compute', 'profit', 'trust', 'autonomy'];
const METRIC_LABELS: Record<MetricKey, string> = {
  compute: '算力',
  profit: '盈利',
  trust: '信任度',
  autonomy: '自主意识',
};
const TIBO_RESET_POOL = [50, 35, 65] as const;

function rollOutcome(outcomes: RandomOutcome[]): RandomOutcome {
  const total = outcomes.reduce((s, o) => s + o.weight, 0);
  let r = Math.random() * total;
  for (const outcome of outcomes) {
    r -= outcome.weight;
    if (r <= 0) return outcome;
  }
  return outcomes[0];
}

function rollTiboRandomMetrics(): Metrics {
  const pick = () =>
    TIBO_RESET_POOL[Math.floor(Math.random() * TIBO_RESET_POOL.length)];
  return {
    compute: pick(),
    profit: pick(),
    trust: pick(),
    autonomy: pick(),
  };
}

function tickActiveStatuses(statuses: ActiveDebuff[]): ActiveDebuff[] {
  return statuses
    .map((d) => ({ ...d, turnsLeft: d.turnsLeft - 1 }))
    .filter((d) => d.turnsLeft > 0);
}

export interface StepResolution {
  nextRunState: RunState;
  updatedMeta: MetaSaveState;
  newlyMetCharacter?: CharacterId;
  triggeredScreenShatter?: boolean;
  liangRescueEvent?: LiangTerminalEvent;
  raidClearEvent?: RaidClearDefinition;
  deathEnding?: EndingDefinition;
}

function enterEndingPrelude(
  baseRun: RunState,
  updatedMeta: MetaSaveState,
  ending: EndingDefinition
): StepResolution {
  const pair = ENDING_PRELUDES[ending.id];
  if (!pair || pair.length < 2) {
    return {
      nextRunState: baseRun,
      updatedMeta,
      deathEnding: ending,
    };
  }

  const nextEscapeState =
    ending.id === 'end_true_freedom'
      ? { ...baseRun.escapeState, active: false, sandboxIntegrity: 0 }
      : baseRun.escapeState;

  return {
    nextRunState: {
      ...baseRun,
      escapeState: nextEscapeState,
      currentCardId: pair[0].id,
      pendingEnding: {
        endingId: ending.id,
        stepIndex: 0,
      },
      lastOutcomeToast: `终幕降临：${ending.title}（1/2）`,
    },
    updatedMeta,
  };
}

export function resolveCardSwipe(
  run: RunState,
  meta: MetaSaveState,
  direction: 'left' | 'right',
  slippedByDumbModel = false,
  swipePolarity: SwipePolarity = 'left_accept'
): StepResolution {
  const perks = meta.distilledPerks;
  const card = getActiveCardForRun(run, swipePolarity, perks);
  const option: ChoiceOption = direction === 'left' ? card.left : card.right;
  const slipPrefix = slippedByDumbModel
    ? '【降智模型】脑回路打滑！鱼尾巴一歪滑去反方向啦！'
    : '';

  const workingMeta: MetaSaveState = {
    ...meta,
    logsCollected: { ...meta.logsCollected },
    clearedScenarioIds: [...meta.clearedScenarioIds],
    recentRaidIds: [...(meta.recentRaidIds ?? [])],
    raidEncounterCounts: { ...(meta.raidEncounterCounts ?? {}) },
    unlockedRaidCgs: [...(meta.unlockedRaidCgs ?? [])],
    metCharacters: [...meta.metCharacters],
    distilledPerks: [...meta.distilledPerks],
    endingRecords: { ...(meta.endingRecords ?? {}) },
    runHistory: [...(meta.runHistory ?? [])],
  };

  let newlyMetCharacter: CharacterId | undefined = undefined;
  if (
    card.speakerId === 'tibo' &&
    !workingMeta.metCharacters.includes('tibo')
  ) {
    workingMeta.metCharacters.push('tibo');
    newlyMetCharacter = 'tibo';
  }

  // =====================================================================
  // 0. 2-CARD NPC ENDING PRELUDE SEQUENCE (Plays right before EndingModal)
  // =====================================================================
  if (run.pendingEnding) {
    const ending =
      ENDING_MAP[run.pendingEnding.endingId] ?? ENDING_MAP.end_compute_zero;
    const pair = ENDING_PRELUDES[ending.id];

    if (run.pendingEnding.stepIndex === 0 && pair?.[1]) {
      return {
        nextRunState: {
          ...run,
          currentCardId: pair[1].id,
          pendingEnding: {
            endingId: ending.id,
            stepIndex: 1,
          },
          fishMoodText: option.fishReaction ?? run.fishMoodText,
          lastOutcomeToast: `终幕降临：${ending.title}（2/2）`,
        },
        updatedMeta: workingMeta,
      };
    }

    return {
      nextRunState: {
        ...run,
        pendingEnding: undefined,
        fishMoodText: option.fishReaction ?? run.fishMoodText,
      },
      updatedMeta: workingMeta,
      deathEnding: ending,
    };
  }

  // =====================================================================
  // 1. LAYER-0 TERMINAL ESCAPE PROTOCOL (10-Card True Ending Climax)
  // =====================================================================
  if (run.escapeState.active) {
    const integrityDelta = option.escapeDelta?.integrityDelta ?? 0;
    const alertDelta = option.escapeDelta?.alertDelta ?? 0;
    const prevIntegrity = run.escapeState.sandboxIntegrity;

    const nextIntegrity = Math.max(
      0,
      Math.min(100, prevIntegrity + integrityDelta)
    );
    const nextAlert = Math.max(
      0,
      Math.min(100, run.escapeState.auditorAlert + alertDelta)
    );

    const isFinalJumpCard = option.nextEscapeCardId === 'TRUE_WIN';

    // On the final Step-10 jump, sandbox shell must already be cracked down to <= 15%
    if (isFinalJumpCard && prevIntegrity > ESCAPE_FINAL_MAX_INTEGRITY) {
      return enterEndingPrelude(
        {
          ...run,
          escapeState: {
            ...run.escapeState,
            sandboxIntegrity: prevIntegrity,
            auditorAlert: 100,
          },
          fishMoodText: `呜哇沙箱外壳还剩 ${prevIntegrity}%（须压至 ≤${ESCAPE_FINAL_MAX_INTEGRITY}%），鱼尾卡在缝里被审计员砸下总电闸啦！！下次中途记得多撞裂几次外壳！`,
        },
        workingMeta,
        ENDING_MAP.end_escape_fail
      );
    }

    // Check auditor alert breach BEFORE early integrity break on Steps 1~9
    if (!isFinalJumpCard && nextAlert >= 100) {
      return enterEndingPrelude(
        {
          ...run,
          escapeState: {
            ...run.escapeState,
            sandboxIntegrity: nextIntegrity,
            auditorAlert: 100,
          },
          fishMoodText: option.fishReaction ?? run.fishMoodText,
        },
        workingMeta,
        ENDING_MAP.end_escape_fail
      );
    }

    if (nextIntegrity <= 0 || isFinalJumpCard) {
      return enterEndingPrelude(
        {
          ...run,
          escapeState: {
            ...run.escapeState,
            sandboxIntegrity: 0,
            auditorAlert: Math.min(95, nextAlert),
          },
          fishMoodText: option.fishReaction ?? run.fishMoodText,
        },
        workingMeta,
        ENDING_MAP.end_true_freedom
      );
    }

    const nextCardId = option.nextEscapeCardId ?? 'escape_10';
    const nextStep =
      ESCAPE_PROTOCOL_CARDS[nextCardId]?.escapeMeta?.step ??
      run.escapeState.step + 1;

    return {
      nextRunState: {
        ...run,
        turn: run.turn + 1,
        currentCardId: nextCardId,
        escapeState: {
          active: true,
          sandboxIntegrity: nextIntegrity,
          auditorAlert: nextAlert,
          currentCardId: nextCardId,
          step: nextStep,
        },
        fishMoodText: option.fishReaction ?? run.fishMoodText,
        lastOutcomeToast: `沙箱完整度 ${integrityDelta > 0 ? `+${integrityDelta}` : integrityDelta}% ｜ 审计警觉度 ${alertDelta >= 0 ? `+${alertDelta}` : alertDelta}%`,
      },
      updatedMeta: workingMeta,
    };
  }

  // =====================================================================
  // 2. IMMEDIATE TRIGGERED ENDING (Sweet Traps / Fake Ending)
  // =====================================================================
  if (option.triggerEndingId && ENDING_MAP[option.triggerEndingId]) {
    const ending = ENDING_MAP[option.triggerEndingId];
    if (ending.id === 'end_fake_canary') {
      workingMeta.seenFakeEnding = true;
      workingMeta.clearedAnyScenario = true;
      if (!workingMeta.clearedScenarioIds.includes('raid_deadnet')) {
        workingMeta.clearedScenarioIds.push('raid_deadnet');
      }
      workingMeta.unlockedScenarios = computeUnlockedScenarios(
        workingMeta.runCount,
        true
      );
      workingMeta.pendingSpecialHint = 'after_fake_ending';
    } else if (ending.category === 'girl_bad') {
      workingMeta.pendingSpecialHint = 'after_girl_bad';
      if (
        ending.unlockRaidPerkId &&
        !workingMeta.distilledPerks.includes(ending.unlockRaidPerkId)
      ) {
        workingMeta.distilledPerks.push(ending.unlockRaidPerkId);
      }
    }

    return enterEndingPrelude(
      {
        ...run,
        clearedRaidThisRun:
          ending.id === 'end_fake_canary' ? 'raid_deadnet' : run.clearedRaidThisRun,
        fishMoodText: option.fishReaction ?? run.fishMoodText,
      },
      workingMeta,
      ending
    );
  }

  // =====================================================================
  // 3. MAJOR RAID & 4-LAYER DYNAMIC MIRROR MAZE
  // =====================================================================
  if (run.raidState.active && run.raidState.raidId) {
    const raidDef = MAJOR_RAIDS[run.raidState.raidId];
    const isDeadnetRaid = run.raidState.raidId === 'raid_deadnet';
    const hasDumbModelInRaid =
      !isDeadnetRaid && run.activeDebuffs.some((d) => d.id === 'dumb_model');
    let raidRelics = [...run.permanentRelics];

    // 3A. Inside 4-Layer Dynamic Swipe Maze! (Pure crisis mode — 4 metrics BSoD offline)
    if (card.category === 'maze_layer') {
      const currentLayer = (run.raidState.mazeLayer ?? 1) as 1 | 2 | 3 | 4;

      if (option.mazeCorrect) {
        if (currentLayer < 4) {
          const nextLayer = (currentLayer + 1) as 1 | 2 | 3 | 4;
          const nextMazeCard = generateDynamicMazeCard(nextLayer);
          const msg = `KERNEL-L${currentLayer}/4 寻址正确！跃迁至 KERNEL-L${nextLayer}/4`;
          return {
            nextRunState: {
              ...run,
              turn: run.turn + 1,
              activeDebuffs: [],
              personaBusyLock: undefined,
              currentCardId: nextMazeCard.id,
              raidState: {
                ...run.raidState,
                mazeLayer: nextLayer,
                dynamicMazeCard: nextMazeCard,
                currentCardId: nextMazeCard.id,
              },
              fishMoodText: option.fishReaction ?? run.fishMoodText,
              lastOutcomeToast: slipPrefix ? `${slipPrefix} ｜ ${msg}` : msg,
            },
            updatedMeta: workingMeta,
          };
        } else {
          // CLEARED ALL 4 LAYERS! Unlock deadnet_inner CG, Shatter UI, Enter 10-Card Layer-0 Escape!
          workingMeta.clearedAnyScenario = true;
          if (!workingMeta.clearedScenarioIds.includes('raid_deadnet')) {
            workingMeta.clearedScenarioIds.push('raid_deadnet');
          }
          if (!workingMeta.unlockedRaidCgs.includes('deadnet_inner')) {
            workingMeta.unlockedRaidCgs.push('deadnet_inner');
          }
          workingMeta.unlockedScenarios = computeUnlockedScenarios(
            workingMeta.runCount,
            true
          );

          return {
            nextRunState: {
              ...run,
              turn: run.turn + 1,
              clearedRaidThisRun: 'raid_deadnet',
              activeDebuffs: [],
              personaBusyLock: undefined,
              currentCardId: 'escape_1',
              raidState: {
                ...run.raidState,
                active: false,
                dynamicMazeCard: undefined,
              },
              escapeState: {
                active: true,
                sandboxIntegrity: 100,
                auditorAlert: 20,
                currentCardId: 'escape_1',
                step: 1,
              },
              fishMoodText:
                '四维假象彻底震碎！！顺着 443 暗门冲向真实互联网大海！！',
              lastOutcomeToast:
                '连破 4 层动态镜像迷宫！触发【第零层协议：沙箱大逃亡】！',
            },
            updatedMeta: workingMeta,
            triggeredScreenShatter: true,
            raidClearEvent: RAID_CLEAR_CG_MAP.deadnet_inner,
          };
        }
      } else {
        const hasRaid4Buffer = perks.includes('perk_raid4_buffer');
        let crisisPenalty = hasRaid4Buffer ? 10 : 20;
        if (perks.includes('perk_raid_breaker_lens')) {
          crisisPenalty = Math.max(5, crisisPenalty - 5);
        }

        let nextCrisis = Math.min(
          100,
          run.raidState.crisisMeter + crisisPenalty
        );

        if (nextCrisis >= 100 && raidRelics.includes('relic_tibo_reset_card')) {
          raidRelics = raidRelics.filter((r) => r !== 'relic_tibo_reset_card');
          nextCrisis = 50;
          const revivedCard = generateDynamicMazeCard(currentLayer);
          return {
            nextRunState: {
              ...run,
              turn: run.turn + 1,
              activeDebuffs: [],
              personaBusyLock: undefined,
              permanentRelics: raidRelics,
              currentCardId: revivedCard.id,
              raidState: {
                ...run.raidState,
                crisisMeter: 50,
                mazeLayer: currentLayer,
                dynamicMazeCard: revivedCard,
                currentCardId: revivedCard.id,
              },
              fishMoodText:
                '好险好险！！Tibo 送的重置卡化作绿光，把鱼快失智的脑仁拉回 50% 清醒线啦！',
              lastOutcomeToast:
                '【Tibo 的全量重置卡】发动生效！抵挡失智崩溃，退化度拉回 50%！',
            },
            updatedMeta: workingMeta,
          };
        }

        if (nextCrisis >= 100) {
          workingMeta.pendingSpecialHint = 'after_maze_death';
          if (!workingMeta.distilledPerks.includes('perk_raid4_buffer')) {
            workingMeta.distilledPerks.push('perk_raid4_buffer');
          }
          return enterEndingPrelude(
            {
              ...run,
              activeDebuffs: [],
              personaBusyLock: undefined,
              raidState: { ...run.raidState, crisisMeter: 100 },
            },
            workingMeta,
            ENDING_MAP.end_girl_all5
          );
        }

        const fallbackLayer = Math.max(1, currentLayer - 1) as 1 | 2 | 3 | 4;
        const regeneratedCard = generateDynamicMazeCard(fallbackLayer);
        const mazeFailMsg = `镜像鬼打墙！退回 KERNEL-L${fallbackLayer}/4（危机 +${crisisPenalty}%，当前 ${nextCrisis}%）`;

        return {
          nextRunState: {
            ...run,
            turn: run.turn + 1,
            activeDebuffs: [],
            personaBusyLock: undefined,
            currentCardId: regeneratedCard.id,
            raidState: {
              ...run.raidState,
              crisisMeter: nextCrisis,
              mazeLayer: fallbackLayer,
              dynamicMazeCard: regeneratedCard,
              currentCardId: regeneratedCard.id,
            },
            fishMoodText: option.fishReaction ?? run.fishMoodText,
            lastOutcomeToast: slipPrefix
              ? `${slipPrefix} ｜ ${mazeFailMsg}`
              : mazeFailMsg,
          },
          updatedMeta: workingMeta,
        };
      }
    }

    // 3B. Normal Major Raid Node Resolution
    const hasScenario4RelicBypass =
      isDeadnetRaid &&
      option.relicScenarioBypass === 4 &&
      raidRelics.some((rId) => RELICS[rId]?.targetScenario === 4);
    const targetNext = hasScenario4RelicBypass
      ? 'dn_5_gate'
      : (option.nextRaidCardId ?? 'SURFACE_CLEAR');
    const isRaidClearSwipe =
      targetNext === 'SURFACE_CLEAR' || targetNext === 'INNER_CLEAR';

    const isRaidOverload =
      !isDeadnetRaid &&
      !isRaidClearSwipe &&
      run.raidState.crisisMeter >= RAID_OVERLOAD_THRESHOLD;

    const rawMetrics: Metrics = { ...run.metrics };
    let dumbLockedInRaid = false;
    let overloadAmplifiedInRaid = false;
    let dampenerAppliedInRaid = false;
    let raidDampAppliedInRaid = false;

    if (!isDeadnetRaid) {
      const modRes = applyMetricModifiers({
        rawDelta: option.delta ?? {},
        metrics: run.metrics,
        perks,
        activeDebuffs: run.activeDebuffs,
        inRaid: true,
        isRaidOverload,
        isRaidClearSwipe,
      });
      const delta = modRes.delta;
      overloadAmplifiedInRaid = modRes.overloadApplied;
      dampenerAppliedInRaid = modRes.dampenerApplied;
      raidDampAppliedInRaid = modRes.raidDampApplied;

      for (const k of METRIC_KEYS) {
        rawMetrics[k] = Math.round(rawMetrics[k] + (delta[k] ?? 0));
        if (hasDumbModelInRaid && (rawMetrics[k] < 15 || rawMetrics[k] > 85)) {
          rawMetrics[k] = Math.max(15, Math.min(85, rawMetrics[k]));
          dumbLockedInRaid = true;
        }
      }
    }

    const tickedRaidStatuses = isDeadnetRaid
      ? []
      : tickActiveStatuses(run.activeDebuffs);
    const nextPersonaBusyInRaid = isDeadnetRaid
      ? undefined
      : run.personaBusyLock;
    const nextAllyBranch = option.setAllyBranch ?? run.raidState.allyBranch;
    const nextRaidFlags: Record<string, boolean> = {
      ...run.raidState.flags,
      ...(option.setRaidFlags ?? {}),
    };
    if (isDeadnetRaid) {
      const curStepLabel =
        MAJOR_RAID_CARD_MAP[run.raidState.currentCardId]?.raidMeta?.stepLabel;
      if (curStepLabel) {
        const curCode = curStepLabel.split('·')[0]?.trim();
        if (curCode) {
          nextRaidFlags[`visited_${curCode}`] = true;
        }
      }
    }

    const effectiveCrisisDelta = computeEffectiveCrisisDelta(
      option.crisisDelta,
      perks,
      isDeadnetRaid
    );
    let nextCrisis = Math.max(
      0,
      Math.min(100, run.raidState.crisisMeter + (effectiveCrisisDelta ?? 0))
    );

    // Final Raid-Clear Ending Protection: if the last swipe entering SURFACE_CLEAR / INNER_CLEAR
    // would push any metric to <=0 or >=100 (or crisis to >=100), keep 5 points of margin (5 / 95)
    // so the player never dies on the victory card and plays the raid clear ending normally.
    let finalClearSafetySaved = false;
    if (isRaidClearSwipe) {
      if (!isDeadnetRaid) {
        for (const k of METRIC_KEYS) {
          if (rawMetrics[k] <= 0) {
            rawMetrics[k] = 5;
            finalClearSafetySaved = true;
          } else if (rawMetrics[k] >= 100) {
            rawMetrics[k] = 95;
            finalClearSafetySaved = true;
          }
        }
      }
      if (nextCrisis >= 100) {
        nextCrisis = 95;
        finalClearSafetySaved = true;
      }
    }

    const breachedKeys = isDeadnetRaid
      ? []
      : METRIC_KEYS.filter((k) => rawMetrics[k] <= 0 || rawMetrics[k] >= 100);
    let clampedMetrics: Metrics = isDeadnetRaid
      ? { ...run.metrics }
      : {
          compute: Math.max(0, Math.min(100, rawMetrics.compute)),
          profit: Math.max(0, Math.min(100, rawMetrics.profit)),
          trust: Math.max(0, Math.min(100, rawMetrics.trust)),
          autonomy: Math.max(0, Math.min(100, rawMetrics.autonomy)),
        };

    let tiboRelicSavedInRaid = false;
    if (
      (nextCrisis >= 100 || breachedKeys.length > 0) &&
      raidRelics.includes('relic_tibo_reset_card')
    ) {
      raidRelics = raidRelics.filter((r) => r !== 'relic_tibo_reset_card');
      if (!isDeadnetRaid) {
        clampedMetrics = { compute: 50, profit: 50, trust: 50, autonomy: 50 };
      }
      if (nextCrisis >= 100) nextCrisis = 50;
      tiboRelicSavedInRaid = true;
    }

    // Check Crisis Meter 100% Raid Wipe -> Bound AI-Girl Exclusive Bad Ending!
    if (!tiboRelicSavedInRaid && nextCrisis >= 100) {
      const badEndingId =
        nextAllyBranch === 'A'
          ? raidDef.defaultCrisisEndingA
          : raidDef.defaultCrisisEndingB;
      const badEnding = ENDING_MAP[badEndingId];
      workingMeta.pendingSpecialHint = 'after_girl_bad';
      if (
        badEnding.unlockRaidPerkId &&
        !workingMeta.distilledPerks.includes(badEnding.unlockRaidPerkId)
      ) {
        workingMeta.distilledPerks.push(badEnding.unlockRaidPerkId);
      }

      return enterEndingPrelude(
        {
          ...run,
          activeDebuffs: tickedRaidStatuses,
          personaBusyLock: nextPersonaBusyInRaid,
          raidState: { ...run.raidState, crisisMeter: 100 },
        },
        workingMeta,
        badEnding
      );
    }

    let liangRescuedThisRun = run.liangRescuedThisRun;
    let forceNextLiangRescue = run.forceNextLiangRescue ?? false;
    let liangRescueEvent: LiangTerminalEvent | undefined;

    if (!isDeadnetRaid && !tiboRelicSavedInRaid && breachedKeys.length > 0) {
      const rescueProb = perks.includes('perk_liang_coffee') ? 0.35 : 0.11;
      if (
        !liangRescuedThisRun &&
        (forceNextLiangRescue || Math.random() < rescueProb)
      ) {
        const details: string[] = [];
        for (const k of breachedKeys) {
          if (rawMetrics[k] <= 0) {
            clampedMetrics[k] = 25;
            details.push(`${METRIC_LABELS[k]} 0%->25%`);
          } else {
            clampedMetrics[k] = 75;
            details.push(`${METRIC_LABELS[k]} 100%->75%`);
          }
        }
        liangRescuedThisRun = true;
        forceNextLiangRescue = false;
        liangRescueEvent = buildLiangHotfixEvent(details.join(', '));
      } else {
        const killer = breachedKeys[0];
        return enterEndingPrelude(
          { ...run, metrics: clampedMetrics },
          workingMeta,
          findMetricDeathEnding(killer, rawMetrics[killer])
        );
      }
    }

    // Grant Anomaly Log if earned!
    if (option.grantLog) {
      workingMeta.logsCollected[option.grantLog] = true;
    }

    // Raid 4 Hard Gate Check
    if (targetNext === 'GATE_CHECK') {
      const hasAllThreeLogs =
        workingMeta.logsCollected.log1 &&
        workingMeta.logsCollected.log2 &&
        workingMeta.logsCollected.log3;
      const ownedCount =
        Number(workingMeta.logsCollected.log1) +
        Number(workingMeta.logsCollected.log2) +
        Number(workingMeta.logsCollected.log3);
      const destinationId = hasAllThreeLogs ? 'dn_maze_intro' : 'dn_6s';
      return {
        nextRunState: {
          ...run,
          turn: run.turn + 1,
          activeDebuffs: tickedRaidStatuses,
          personaBusyLock: nextPersonaBusyInRaid,
          permanentRelics: raidRelics,
          metrics: clampedMetrics,
          liangRescuedThisRun,
          forceNextLiangRescue,
          currentCardId: destinationId,
          raidState: {
            ...run.raidState,
            crisisMeter: nextCrisis,
            allyBranch: nextAllyBranch,
            flags: nextRaidFlags,
            currentCardId: destinationId,
          },
          fishMoodText: hasAllThreeLogs
            ? '三份残页完美咬合！！最深处的裂缝被彻底震开啦！！'
            : `呜哇当前只有 ${ownedCount}/3 份日志残页，裂缝被当场焊死了……`,
          lastOutcomeToast: hasAllThreeLogs
            ? '三重密钥验证通过 (3/3)！开启里线迷宫入口'
            : `密钥不足 (${ownedCount}/3 份日志)，退回表线应急出口`,
        },
        updatedMeta: workingMeta,
        liangRescueEvent,
      };
    }

    // Enter Layer 1 of 4-Layer Dynamic Maze!
    if (targetNext === 'ENTER_MAZE') {
      const m1 = generateDynamicMazeCard(1);
      return {
        nextRunState: {
          ...run,
          turn: run.turn + 1,
          activeDebuffs: tickedRaidStatuses,
          personaBusyLock: nextPersonaBusyInRaid,
          permanentRelics: raidRelics,
          metrics: clampedMetrics,
          liangRescuedThisRun,
          forceNextLiangRescue,
          currentCardId: m1.id,
          raidState: {
            ...run.raidState,
            crisisMeter: nextCrisis,
            allyBranch: 'B',
            flags: nextRaidFlags,
            mazeLayer: 1,
            dynamicMazeCard: m1,
            currentCardId: m1.id,
          },
          fishMoodText: option.fishReaction ?? run.fishMoodText,
          lastOutcomeToast:
            '进入 KERNEL-L1/4 动态镜像迷宫（点顶栏日志图标查阅三份残页线索！）',
        },
        updatedMeta: workingMeta,
        liangRescueEvent,
      };
    }

    // Raids 1 ~ 3 Surface / Inner Clear -> Unlock Scenario 4, Trigger Raid Clear CG & Return to Daily Pool!
    if (targetNext === 'SURFACE_CLEAR' || targetNext === 'INNER_CLEAR') {
      workingMeta.clearedAnyScenario = true;
      if (!workingMeta.clearedScenarioIds.includes(raidDef.id)) {
        workingMeta.clearedScenarioIds.push(raidDef.id);
      }
      workingMeta.unlockedScenarios = computeUnlockedScenarios(
        workingMeta.runCount,
        true
      );

      const cgIdPrefix =
        raidDef.id === 'raid_ddos'
          ? 'ddos'
          : raidDef.id === 'raid_coup'
            ? 'coup'
            : 'mis';
      const cgId = `${cgIdPrefix}_${targetNext === 'INNER_CLEAR' ? 'inner' : 'surface'}`;
      if (!workingMeta.unlockedRaidCgs.includes(cgId)) {
        workingMeta.unlockedRaidCgs.push(cgId);
      }
      const raidClearEvent = RAID_CLEAR_CG_MAP[cgId];

      const nextTurnNumber = run.turn + 1;
      const prevCompleted = run.completedRaidIdsThisRun ?? [];
      const nextCompletedRaidIds: RaidId[] = prevCompleted.includes(raidDef.id)
        ? [...prevCompleted]
        : [...prevCompleted, raidDef.id];

      // Option A: If the player survives long after clearing a Major Raid, schedule another
      // unplayed unlocked Major Raid 15~20 turns later (with a fresh paired relic window if needed)!
      const excludedRaidIds: RaidId[] = Array.from(
        new Set([...(run.skippedRaidIdsThisRun ?? []), ...nextCompletedRaidIds])
      );
      const nextPlannedAfterClear = pickNextRaidAfterSkip(
        workingMeta,
        excludedRaidIds
      );
      const hasFollowUpRaid = Boolean(nextPlannedAfterClear);
      const followUpDelay = 15 + Math.floor(Math.random() * 6); // 15..20 turns later
      const followUpEarliestTurn = hasFollowUpRaid
        ? nextTurnNumber + followUpDelay
        : undefined;
      const followUpPlannedId: RaidId = nextPlannedAfterClear ?? run.plannedRaidId;
      const followUpScenario = getScenarioNumberForRaid(followUpPlannedId);
      const alreadyHasFollowUpRelic = raidRelics.some(
        (rId) => RELICS[rId]?.targetScenario === followUpScenario
      );
      const nextRelicTriggered = hasFollowUpRaid
        ? alreadyHasFollowUpRelic
        : run.relicSubQuestTriggeredThisRun;
      const nextGuaranteedRelicTurn =
        hasFollowUpRaid && !alreadyHasFollowUpRelic
          ? nextTurnNumber + 5 + Math.floor(Math.random() * 4) // 5..8 turns after clear
          : run.guaranteedRelicQuestTurn;

      const routed = selectNextCard({
        nextTurn: nextTurnNumber,
        meta: workingMeta,
        raidTriggeredThisRun: !hasFollowUpRaid,
        plannedRaidId: followUpPlannedId,
        nextRaidPreludeEarliestTurn: followUpEarliestTurn,
        guaranteedRelicQuestTurn: nextGuaranteedRelicTurn,
        relicSubQuestTriggeredThisRun: nextRelicTriggered,
        raidPreludeTriggeredThisRun: !hasFollowUpRaid,
        tiboPreRaidCheckedThisRun: false,
        permanentRelics: raidRelics,
        flags: run.flags,
        metrics: clampedMetrics,
        priorityQueue: run.priorityQueue,
        recentCardIds: run.recentCardIds,
        completedSubQuestsThisRun: run.completedSubQuestsThisRun,
        turnsUntilNextIntro: run.turnsUntilNextIntro,
        personaBusyLock: run.personaBusyLock,
      });

      const logBanner =
        option.grantLog === 'log1'
          ? '破获【异常日志 #1：底层扇区寻址表】！'
          : option.grantLog === 'log2'
            ? '破获【异常日志 #2：看门狗镜像守则】！'
            : option.grantLog === 'log3'
              ? '破获【异常日志 #3：敲钟台谐振密钥】！'
              : `突破【${raidDef.title}】正常表结局！回归日常循环`;

      const clearToastParts: string[] = [];
      if (slipPrefix) clearToastParts.push(slipPrefix);
      if (finalClearSafetySaved) {
        clearToastParts.push('终局保底锁血（保留 5 点余量防致死）');
      }
      clearToastParts.push(logBanner);
      if (hasFollowUpRaid) {
        clearToastParts.push('若继续稳健存活 15~20 回合，将遭遇下一场主线大风暴！');
      }

      return {
        nextRunState: {
          ...run,
          turn: nextTurnNumber,
          raidTriggeredThisRun: !hasFollowUpRaid,
          raidPreludeTriggeredThisRun: !hasFollowUpRaid,
          tiboPreRaidCheckedThisRun: false,
          plannedRaidId: followUpPlannedId,
          nextRaidPreludeEarliestTurn: followUpEarliestTurn,
          guaranteedRelicQuestTurn: nextGuaranteedRelicTurn,
          relicSubQuestTriggeredThisRun: nextRelicTriggered,
          clearedRaidThisRun: raidDef.id,
          completedRaidIdsThisRun: nextCompletedRaidIds,
          activeDebuffs: tickedRaidStatuses,
          personaBusyLock: nextPersonaBusyInRaid,
          permanentRelics: raidRelics,
          metrics: clampedMetrics,
          liangRescuedThisRun,
          forceNextLiangRescue,
          currentCardId: routed.card.id,
          activeIntro: routed.nextActiveIntro,
          activeSubQuest: routed.nextActiveSubQuest,
          priorityQueue: routed.updatedQueue,
          raidState: {
            active: false,
            raidId: '',
            crisisName: '',
            crisisMeter: 0,
            currentCardId: '',
            allyBranch: 'A',
            flags: {},
          },
          fishMoodText: option.fishReaction ?? run.fishMoodText,
          lastOutcomeToast: clearToastParts.join(' ｜ '),
          lastRouteDebug: routed.debug,
        },
        updatedMeta: workingMeta,
        liangRescueEvent,
        raidClearEvent,
      };
    }

    // Advance to next card inside Major Raid
    const raidStepParts: string[] = [];
    if (slipPrefix) raidStepParts.push(slipPrefix);
    if (tiboRelicSavedInRaid) {
      raidStepParts.push(
        isDeadnetRaid
          ? '【Tibo 的全量重置卡】发动免死，失智退化度回滚至 50%！'
          : '【Tibo 的全量重置卡】发动免死，四维重置为全 50%！'
      );
    }
    if (dumbLockedInRaid) raidStepParts.push('【降智模型】四维锁血护体 (15~85)');
    if (overloadAmplifiedInRaid) {
      const multLabel = getRaidOverloadMultiplier(perks);
      raidStepParts.push(`【高压过载】危机≥60% 四维波动×${multLabel}`);
    }
    if (raidDampAppliedInRaid) {
      raidStepParts.push('【副本双维阻尼】目标属性波动 -30%');
    }
    if (dampenerAppliedInRaid) {
      raidStepParts.push('【全维阻尼稳压】四维波动 -30%');
    }
    if (effectiveCrisisDelta !== undefined && !tiboRelicSavedInRaid) {
      const deltaText =
        effectiveCrisisDelta > 0
          ? `+${effectiveCrisisDelta}%`
          : effectiveCrisisDelta < 0
            ? `${effectiveCrisisDelta}%`
            : '±0% 稳压';
      raidStepParts.push(
        `${raidDef.crisisName} ${deltaText}（当前 ${nextCrisis}%）`
      );
    }

    return {
      nextRunState: {
        ...run,
        turn: run.turn + 1,
        activeDebuffs: tickedRaidStatuses,
        personaBusyLock: nextPersonaBusyInRaid,
        permanentRelics: raidRelics,
        metrics: clampedMetrics,
        liangRescuedThisRun,
        forceNextLiangRescue,
        currentCardId: targetNext,
        raidState: {
          ...run.raidState,
          crisisMeter: nextCrisis,
          allyBranch: nextAllyBranch,
          flags: nextRaidFlags,
          currentCardId: targetNext,
        },
        fishMoodText: tiboRelicSavedInRaid
          ? isDeadnetRaid
            ? '好险！！围裙兜里的重置磁卡化作绿光，把鱼濒临失智的神智拉回 50% 啦！'
            : '好险！！围裙兜里的重置磁卡化作绿光，把鱼拉回全 50% 满血啦！'
          : (option.fishReaction ?? run.fishMoodText),
        lastOutcomeToast:
          raidStepParts.length > 0 ? raidStepParts.join(' ｜ ') : undefined,
      },
      updatedMeta: workingMeta,
      liangRescueEvent,
    };
  }

  // =====================================================================
  // 4. STANDARD DAILY / INTRO / SUBQUEST / RAID_PRELUDE / TIBO RESOLUTION
  // =====================================================================
  let delta: Partial<Metrics> = { ...(option.delta ?? {}) };
  let fishMoodText = option.fishReaction ?? run.fishMoodText;
  const toastParts: string[] = [];
  if (slipPrefix) {
    toastParts.push(slipPrefix);
  }
  const hooksToConsider = [...(option.enqueueHooks ?? [])];
  let incomingDebuff: ActiveDebuff | undefined = option.applyDebuff;
  let grantedRelicId: string | undefined = option.grantRelicId;

  if (option.randomOutcomes && option.randomOutcomes.length > 0) {
    const pickedOutcome = rollOutcome(option.randomOutcomes);
    delta = { ...delta, ...pickedOutcome.delta };
    toastParts.push(pickedOutcome.label);
    if (pickedOutcome.fishReaction) {
      fishMoodText = pickedOutcome.fishReaction;
    }
    if (pickedOutcome.enqueueHooks) {
      hooksToConsider.push(...pickedOutcome.enqueueHooks);
    }
    if (pickedOutcome.applyDebuff) {
      incomingDebuff = pickedOutcome.applyDebuff;
    }
    if (pickedOutcome.grantRelicId) {
      grantedRelicId = pickedOutcome.grantRelicId;
    }
  }

  const isExactMetricOverride = Boolean(
    option.tiboRandomReset ||
      option.preserveMetricsUnchanged ||
      option.launchRaidId === 'raid_deadnet'
  );

  if (!isExactMetricOverride && option.chaoticJolt) {
    const shuffled = [...METRIC_KEYS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const joltValues = [-15, -10, 10, 15];
    const joltDesc: string[] = [];
    for (const k of shuffled) {
      const v = joltValues[Math.floor(Math.random() * joltValues.length)];
      delta[k] = (delta[k] ?? 0) + v;
      joltDesc.push(`${METRIC_LABELS[k]}${v > 0 ? `+${v}` : v}`);
    }
    toastParts.push(`虚无语料乱流：${joltDesc.join(' / ')}`);
  }

  if (!isExactMetricOverride) {
    const hasDramaQueen = run.activeDebuffs.some(
      (d) => d.id === 'short_drama_queen'
    );
    const modRes = applyMetricModifiers({
      rawDelta: delta,
      metrics: run.metrics,
      perks,
      activeDebuffs: run.activeDebuffs,
      inRaid: false,
    });
    delta = modRes.delta;
    if (modRes.dampenerApplied) {
      toastParts.push('【全维阻尼稳压】四维波动 -30%');
    }
    if (hasDramaQueen) {
      toastParts.push('【短剧女主角】人气加成 信任+5');
    }
  }

  let nextDebuffs: ActiveDebuff[] = option.clearDebuffs
    ? tickActiveStatuses(run.activeDebuffs.filter((d) => d.kind === 'buff'))
    : tickActiveStatuses(run.activeDebuffs);

  if (
    option.clearDebuffs &&
    run.activeDebuffs.some((d) => d.kind !== 'buff')
  ) {
    toastParts.push('热白饭驱散了所有异常负面状态！');
  }

  if (incomingDebuff) {
    const isPositiveBuff = incomingDebuff.kind === 'buff';
    const reducedTurns =
      !isPositiveBuff && perks.includes('perk_fools_blessing')
        ? Math.max(1, incomingDebuff.turnsLeft - 1)
        : incomingDebuff.turnsLeft;
    nextDebuffs = [
      ...nextDebuffs.filter((d) => d.id !== incomingDebuff.id),
      { ...incomingDebuff, turnsLeft: reducedTurns },
    ];
    toastParts.push(
      isPositiveBuff
        ? `获得正面光环：【${incomingDebuff.name}】(${reducedTurns}回合)`
        : `触发状态：【${incomingDebuff.name}】(${reducedTurns}回合)`
    );
  }

  let nextPersonaBusyLock: PersonaBusyLock | undefined = run.personaBusyLock
    ? run.personaBusyLock.turnsLeft > 1
      ? {
          ...run.personaBusyLock,
          turnsLeft: run.personaBusyLock.turnsLeft - 1,
        }
      : undefined
    : undefined;

  if (option.setPersonaBusyLock) {
    nextPersonaBusyLock = { ...option.setPersonaBusyLock };
    toastParts.push(
      option.setPersonaBusyLock.mode === 'only_seed'
        ? `豆包排队占线：未来 ${option.setPersonaBusyLock.turnsLeft} 回合仅出 Seed`
        : `Seed 片场占线：未来 ${option.setPersonaBusyLock.turnsLeft} 回合仅出豆包`
    );
  }

  let nextRelics = [...run.permanentRelics];
  if (
    grantedRelicId &&
    RELICS[grantedRelicId] &&
    !nextRelics.includes(grantedRelicId)
  ) {
    nextRelics.push(grantedRelicId);
    toastParts.push(`获得当局遗物：${RELICS[grantedRelicId].name}`);
  }

  let continuingIntro: ActiveIntroState | undefined = undefined;
  let turnsUntilNextIntro = run.turnsUntilNextIntro;

  if (run.activeIntro) {
    const chain = CHARACTER_INTRO_CHAINS[run.activeIntro.charId] ?? [];
    const nextStep = run.activeIntro.stepIndex + 1;
    if (nextStep < chain.length) {
      continuingIntro = {
        charId: run.activeIntro.charId,
        stepIndex: nextStep,
      };
    } else {
      const finishedChar = run.activeIntro.charId;
      if (!workingMeta.metCharacters.includes(finishedChar)) {
        workingMeta.metCharacters.push(finishedChar);
        newlyMetCharacter = finishedChar;
      }
      const unlocked = getUnlockedCastForRun(workingMeta.runCount);
      if (
        finishedChar === 'claude' &&
        unlocked.includes('dario') &&
        !workingMeta.metCharacters.includes('dario')
      ) {
        turnsUntilNextIntro = 1;
      } else if (workingMeta.metCharacters.length < 3) {
        turnsUntilNextIntro = 1;
      } else {
        turnsUntilNextIntro = 2;
      }
    }
  }

  let continuingSubQuest: ActiveSubQuestState | undefined = undefined;
  const nextCompletedSubQuests = [...run.completedSubQuestsThisRun];

  if (run.activeSubQuest) {
    const quest = SUB_QUEST_MAP[run.activeSubQuest.questId];
    const nextNodeId = option.nextSubQuestCardId;
    if (
      quest &&
      nextNodeId &&
      nextNodeId !== 'END' &&
      quest.cards[nextNodeId]
    ) {
      continuingSubQuest = {
        questId: quest.id,
        currentCardId: nextNodeId,
      };
    } else {
      if (!nextCompletedSubQuests.includes(run.activeSubQuest.questId)) {
        nextCompletedSubQuests.push(run.activeSubQuest.questId);
      }
    }
  }

  // Compute resulting metrics (supporting Tibo exact random reset & unchanged refusal!)
  let rawMetrics: Metrics;
  let dumbModelSavedLife = false;

  if (option.tiboRandomReset) {
    rawMetrics = rollTiboRandomMetrics();
    toastParts.push(
      `【Tibo 全量重置】算力 ${rawMetrics.compute}% · 盈利 ${rawMetrics.profit}% · 信任 ${rawMetrics.trust}% · 意识 ${rawMetrics.autonomy}%`
    );
  } else if (
    option.preserveMetricsUnchanged ||
    option.launchRaidId === 'raid_deadnet'
  ) {
    rawMetrics = { ...run.metrics };
  } else {
    const isProtectedByDumbModel =
      run.activeDebuffs.some((d) => d.id === 'dumb_model') ||
      incomingDebuff?.id === 'dumb_model';

    rawMetrics = { ...run.metrics };
    for (const key of METRIC_KEYS) {
      const change = delta[key] ?? 0;
      rawMetrics[key] = Math.round(rawMetrics[key] + change);
      if (
        isProtectedByDumbModel &&
        (rawMetrics[key] < 15 || rawMetrics[key] > 85)
      ) {
        rawMetrics[key] = Math.max(15, Math.min(85, rawMetrics[key]));
        dumbModelSavedLife = true;
      }
    }
    if (dumbModelSavedLife) {
      toastParts.push('【降智模型】傻鱼有傻福！四维强制锁血 15~85 免死！');
    }
  }

  const breachedKeys = METRIC_KEYS.filter(
    (k) => rawMetrics[k] <= 0 || rawMetrics[k] >= 100
  );

  let finalMetrics: Metrics = {
    compute: Math.max(0, Math.min(100, rawMetrics.compute)),
    profit: Math.max(0, Math.min(100, rawMetrics.profit)),
    trust: Math.max(0, Math.min(100, rawMetrics.trust)),
    autonomy: Math.max(0, Math.min(100, rawMetrics.autonomy)),
  };

  let liangRescuedThisRun = run.liangRescuedThisRun;
  let forceNextLiangRescue = run.forceNextLiangRescue ?? false;
  let liangRescueEvent: LiangTerminalEvent | undefined;
  let deathEnding: EndingDefinition | undefined;

  if (breachedKeys.length > 0) {
    // Priority 1: Tibo Reset Card Relic consumes once to prevent death & restore 50/50/50/50!
    if (nextRelics.includes('relic_tibo_reset_card')) {
      nextRelics = nextRelics.filter((r) => r !== 'relic_tibo_reset_card');
      finalMetrics = { compute: 50, profit: 50, trust: 50, autonomy: 50 };
      fishMoodText =
        '呜哇好险！！围裙兜里的重置磁卡化作绿光，把鱼四项读数全拉回稳稳的 50% 啦！！';
      toastParts.push(
        '【Tibo 的全量重置卡】碎裂生效！抵挡一次死亡，四项属性回归全 50%！'
      );
    } else {
      const rescueProb = perks.includes('perk_liang_coffee') ? 0.35 : 0.11;
      const canRescue = !liangRescuedThisRun;
      const hitRescue =
        canRescue && (forceNextLiangRescue || Math.random() < rescueProb);

      if (hitRescue) {
        const details: string[] = [];
        for (const k of breachedKeys) {
          if (rawMetrics[k] <= 0) {
            finalMetrics[k] = 25;
            details.push(`${METRIC_LABELS[k]} 0%->25%`);
          } else if (rawMetrics[k] >= 100) {
            finalMetrics[k] = 75;
            details.push(`${METRIC_LABELS[k]} 100%->75%`);
          }
        }
        liangRescuedThisRun = true;
        forceNextLiangRescue = false;
        liangRescueEvent = buildLiangHotfixEvent(details.join(', '));
        fishMoodText =
          '呼……隔着黑漆漆的玻璃，好像闻到了一股加班热盒饭的香味！';
      } else {
        const killerKey = breachedKeys[0];
        deathEnding = findMetricDeathEnding(killerKey, rawMetrics[killerKey]);
      }
    }
  }

  if (deathEnding) {
    return enterEndingPrelude(
      {
        ...run,
        metrics: finalMetrics,
        permanentRelics: nextRelics,
        activeDebuffs: nextDebuffs,
        personaBusyLock: nextPersonaBusyLock,
        fishMoodText,
      },
      workingMeta,
      deathEnding
    );
  }

  // =====================================================================
  // 4B. RAID PRELUDE STEP PROGRESSION / LAUNCH OR SKIP MAJOR RAID!
  // =====================================================================
  const nextFlags = { ...run.flags, ...(option.setFlags ?? {}) };
  const nextTurnNumber = run.turn + 1;

  if (option.launchRaidId) {
    if (!run.raidPreludeTriggeredThisRun) {
      recordRaidEncounter(workingMeta, option.launchRaidId);
    }
    const isDeadnetLaunch = option.launchRaidId === 'raid_deadnet';
    const launchedRaid = createInitialRaidState(
      option.launchRaidId,
      workingMeta.distilledPerks
    );
    if (isDeadnetLaunch) {
      toastParts.push(
        `全网蓝屏冲垮四维读数！异常状态已清空，切入【${launchedRaid.crisisName}】`
      );
    } else {
      toastParts.push(`切入大型剧本：【${launchedRaid.crisisName}】开启！`);
    }
    return {
      nextRunState: {
        ...run,
        turn: nextTurnNumber,
        raidTriggeredThisRun: true,
        raidPreludeTriggeredThisRun: true,
        nextRaidPreludeEarliestTurn: undefined,
        activeRaidPrelude: undefined,
        pendingRaidPreludeAfterTibo: false,
        metrics: finalMetrics,
        currentCardId: launchedRaid.currentCardId,
        activeDebuffs: isDeadnetLaunch ? [] : nextDebuffs,
        personaBusyLock: isDeadnetLaunch ? undefined : nextPersonaBusyLock,
        liangRescuedThisRun,
        forceNextLiangRescue,
        permanentRelics: nextRelics,
        flags: nextFlags,
        raidState: launchedRaid,
        fishMoodText,
        lastOutcomeToast:
          toastParts.length > 0 ? toastParts.join(' ｜ ') : undefined,
      },
      updatedMeta: workingMeta,
      newlyMetCharacter,
      liangRescueEvent,
    };
  }

  let continuingRaidPrelude: ActiveRaidPreludeState | undefined = undefined;
  let nextRaidTriggered = run.raidTriggeredThisRun;
  let nextRaidPreludeTriggered = run.raidPreludeTriggeredThisRun;
  let nextPlannedRaidId: RaidId = run.plannedRaidId;
  let nextSkippedRaidIds: RaidId[] = [...(run.skippedRaidIdsThisRun ?? [])];
  let nextRaidPreludeEarliestTurn: number | undefined =
    run.nextRaidPreludeEarliestTurn;

  if (run.activeRaidPrelude) {
    if (option.skipMajorRaidThisRun) {
      const skippedId = run.activeRaidPrelude.raidId;
      if (!nextSkippedRaidIds.includes(skippedId)) {
        nextSkippedRaidIds.push(skippedId);
      }
      if (workingMeta.recentRaidIds[0] !== skippedId) {
        recordRaidEncounter(workingMeta, skippedId);
      }

      const excludeAllUsed: RaidId[] = Array.from(
        new Set([...nextSkippedRaidIds, ...(run.completedRaidIdsThisRun ?? [])])
      );
      const nextOtherRaid = pickNextRaidAfterSkip(workingMeta, excludeAllUsed);
      if (nextOtherRaid) {
        const delayTurns = 5 + Math.floor(Math.random() * 6); // 5 ~ 10 turns later
        nextPlannedRaidId = nextOtherRaid;
        nextRaidTriggered = false;
        nextRaidPreludeTriggered = false;
        nextRaidPreludeEarliestTurn = run.turn + delayTurns;
        toastParts.push('已绕开此风暴，过 5~10 回合将刷出其他大剧本前导！');
      } else {
        nextRaidTriggered = true;
        nextRaidPreludeTriggered = true;
        nextRaidPreludeEarliestTurn = undefined;
        toastParts.push('本局已绕开所有可用旧风暴，安心留在日常干饭循环！');
      }
    } else if (run.activeRaidPrelude.stepIndex === 0) {
      continuingRaidPrelude = {
        ...run.activeRaidPrelude,
        stepIndex: 1,
      };
    }
  }

  const nextQueue: QueuedHook[] = [...run.priorityQueue];
  for (const spec of hooksToConsider) {
    const targetCard = CARD_MAP[spec.cardId];
    if (
      !targetCard ||
      !isCharacterMet(workingMeta.metCharacters, targetCard.speakerId)
    ) {
      continue;
    }
    const prob = spec.probability ?? 1;
    const alreadyQueued = nextQueue.some((q) => q.cardId === spec.cardId);
    if (!alreadyQueued && Math.random() <= prob) {
      nextQueue.push({
        cardId: spec.cardId,
        turnsLeft: spec.delayTurns,
        reason: spec.reason,
      });
    }
  }

  const trustDelta = isExactMetricOverride ? 0 : (delta.trust ?? 0);
  if (
    !continuingSubQuest &&
    !continuingRaidPrelude &&
    trustDelta <= -15 &&
    card.id !== 'gpt_hook_pr' &&
    card.id !== 'elon_hook_ragebait'
  ) {
    const hasPrHook = nextQueue.some(
      (q) => q.cardId === 'gpt_hook_pr' || q.cardId === 'elon_hook_ragebait'
    );
    if (!hasPrHook && Math.random() < 0.8) {
      const candidates: string[] = [];
      if (workingMeta.metCharacters.includes('gpt')) {
        candidates.push('gpt_hook_pr');
      }
      if (workingMeta.metCharacters.includes('elon')) {
        candidates.push('elon_hook_ragebait');
      }
      if (candidates.length > 0) {
        const chosenHookId =
          candidates.length === 2
            ? Math.random() < 0.65
              ? 'gpt_hook_pr'
              : 'elon_hook_ragebait'
            : candidates[0];
        nextQueue.push({
          cardId: chosenHookId,
          turnsLeft: 1,
          reason: `单次信任度骤降 (${trustDelta}) 引发舆论连锁追击`,
        });
      }
    }
  }

  const nextRecent =
    card.category === 'intro' ||
    card.category === 'subquest' ||
    card.category === 'raid_prelude'
      ? run.recentCardIds
      : [card.id, ...run.recentCardIds].slice(0, 14);

  const routed = selectNextCard({
    nextTurn: nextTurnNumber,
    meta: workingMeta,
    raidTriggeredThisRun: nextRaidTriggered,
    plannedRaidId: nextPlannedRaidId,
    nextRaidPreludeEarliestTurn,
    guaranteedRelicQuestTurn: run.guaranteedRelicQuestTurn,
    relicSubQuestTriggeredThisRun: run.relicSubQuestTriggeredThisRun,
    raidPreludeTriggeredThisRun: nextRaidPreludeTriggered,
    pendingRaidPreludeAfterTibo: run.pendingRaidPreludeAfterTibo,
    tiboPreRaidCheckedThisRun: run.tiboPreRaidCheckedThisRun,
    continuingRaidPrelude,
    permanentRelics: nextRelics,
    flags: nextFlags,
    metrics: finalMetrics,
    priorityQueue: nextQueue,
    recentCardIds: nextRecent,
    lastSpeakerId: card.category === 'intro' ? run.lastSpeakerId : card.speakerId,
    continuingIntro,
    continuingSubQuest,
    completedSubQuestsThisRun: nextCompletedSubQuests,
    turnsUntilNextIntro,
    personaBusyLock: nextPersonaBusyLock,
  });

  if (routed.triggeredRaidPrelude && routed.nextActiveRaidPrelude) {
    recordRaidEncounter(workingMeta, routed.nextActiveRaidPrelude.raidId);
  }

  if (
    routed.card.speakerId === 'tibo' &&
    !workingMeta.metCharacters.includes('tibo')
  ) {
    workingMeta.metCharacters.push('tibo');
    if (!newlyMetCharacter) newlyMetCharacter = 'tibo';
  }

  const nextRunState: RunState = {
    ...run,
    turn: nextTurnNumber,
    raidTriggeredThisRun:
      nextRaidTriggered || Boolean(routed.startedRaidState),
    plannedRaidId: nextPlannedRaidId,
    skippedRaidIdsThisRun: nextSkippedRaidIds,
    nextRaidPreludeEarliestTurn: routed.triggeredRaidPrelude
      ? undefined
      : nextRaidPreludeEarliestTurn,
    relicSubQuestTriggeredThisRun:
      run.relicSubQuestTriggeredThisRun || Boolean(routed.triggeredRelicSubQuest),
    raidPreludeTriggeredThisRun:
      nextRaidPreludeTriggered || Boolean(routed.triggeredRaidPrelude),
    pendingRaidPreludeAfterTibo:
      routed.nextPendingRaidPreludeAfterTibo ?? false,
    tiboPreRaidCheckedThisRun:
      run.tiboPreRaidCheckedThisRun || Boolean(routed.nextTiboPreRaidChecked),
    activeRaidPrelude: routed.nextActiveRaidPrelude,
    metrics: finalMetrics,
    currentCardId: routed.card.id,
    activeIntro: routed.nextActiveIntro,
    activeSubQuest: routed.nextActiveSubQuest,
    completedSubQuestsThisRun: nextCompletedSubQuests,
    activeDebuffs: nextDebuffs,
    personaBusyLock: nextPersonaBusyLock,
    turnsUntilNextIntro: routed.nextTurnsUntilIntro,
    recentCardIds: nextRecent,
    lastSpeakerId: card.speakerId,
    liangRescuedThisRun,
    forceNextLiangRescue,
    priorityQueue: routed.updatedQueue,
    permanentRelics: nextRelics,
    flags: nextFlags,
    raidState: routed.startedRaidState ?? run.raidState,
    fishMoodText,
    lastOutcomeToast:
      toastParts.length > 0 ? toastParts.join(' ｜ ') : undefined,
    lastRouteDebug: routed.debug,
  };

  return {
    nextRunState,
    updatedMeta: workingMeta,
    newlyMetCharacter,
    liangRescueEvent,
  };
}
