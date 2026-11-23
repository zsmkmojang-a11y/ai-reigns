import { CARD_MAP, DAILY_CARDS } from '../data/dailyCards';
import { CHARACTERS } from '../data/characters';
import { ENDING_PRELUDES, ENDING_PRELUDE_CARD_MAP } from '../data/endingPreludes';
import { ESCAPE_PROTOCOL_CARDS } from '../data/escapeCards';
import {
  FISH_CABIN_FEVER_CARDS,
  FISH_CELEBRATION_CARDS,
  FISH_SELF_CARD_MAP,
} from '../data/fishSelfCards';
import { GEMINI_GLITCH_FRAGMENTS, GLITCH_CARD_MAP } from '../data/glitchFragments';
import {
  CHARACTER_INTRO_CHAINS,
  getUnlockedCastForRun,
  INTRO_CARD_MAP,
  isCharacterMet,
} from '../data/introChains';
import { MAJOR_RAID_CARD_MAP } from '../data/majorRaids';
import { getRaidPreludeCard } from '../data/raidPreludes';
import {
  SUB_QUEST_CARD_MAP,
  SUB_QUEST_MAP,
  SUB_QUESTS,
} from '../data/subQuests';
import {
  TIBO_ANOMALY_RESET_CARD,
  TIBO_CARD_MAP,
  TIBO_PRE_RAID_RESET_CARD,
  TIBO_RELIC_GIFT_CARD,
} from '../data/tiboCards';
import {
  ActiveIntroState,
  ActiveRaidPreludeState,
  ActiveSubQuestState,
  CardNode,
  CharacterId,
  ChoiceOption,
  ImpactSize,
  MetricKey,
  Metrics,
  MetaSaveState,
  PersonaBusyLock,
  QueuedHook,
  RaidId,
  RaidState,
  RouteDebugInfo,
  RunState,
  SubQuestDefinition,
} from '../types/game';
import {
  getScenarioNumberForRaid,
  materializeRaidCard,
  pickRaidForRun,
} from './raidMachine';

const METRIC_KEYS: MetricKey[] = ['compute', 'profit', 'trust', 'autonomy'];

export type SwipePolarity = 'left_accept' | 'right_accept';

function applyCardPolarity(
  card: CardNode,
  swipePolarity: SwipePolarity
): CardNode {
  if (card.category === 'maze_layer' || card.category === 'ending_prelude') {
    return card;
  }
  if (swipePolarity === 'right_accept') {
    return card;
  }
  return {
    ...card,
    left: card.right,
    right: card.left,
  };
}

export function getActiveCardForRun(
  run: RunState,
  swipePolarity: SwipePolarity = 'left_accept'
): CardNode {
  if (run.pendingEnding) {
    const pair = ENDING_PRELUDES[run.pendingEnding.endingId];
    const preludeCard = pair?.[run.pendingEnding.stepIndex];
    if (preludeCard) {
      return preludeCard;
    }
  }
  if (run.escapeState.active) {
    const escCard =
      ESCAPE_PROTOCOL_CARDS[run.escapeState.currentCardId] ??
      ESCAPE_PROTOCOL_CARDS.escape_1;
    return applyCardPolarity(escCard, swipePolarity);
  }
  if (run.raidState.active) {
    if (
      run.raidState.dynamicMazeCard &&
      run.currentCardId === run.raidState.dynamicMazeCard.id
    ) {
      return run.raidState.dynamicMazeCard;
    }
    const rawRaidCard = MAJOR_RAID_CARD_MAP[run.raidState.currentCardId];
    if (rawRaidCard) {
      return applyCardPolarity(materializeRaidCard(rawRaidCard, run), swipePolarity);
    }
  }
  if (run.activeRaidPrelude) {
    const preludeCard = getRaidPreludeCard(
      run.activeRaidPrelude.raidId,
      run.activeRaidPrelude.stepIndex,
      run.activeRaidPrelude.isCleared
    );
    return applyCardPolarity(preludeCard, swipePolarity);
  }
  return applyCardPolarity(getCardById(run.currentCardId), swipePolarity);
}

export function getCardById(cardId: string): CardNode {
  return (
    CARD_MAP[cardId] ??
    TIBO_CARD_MAP[cardId] ??
    INTRO_CARD_MAP[cardId] ??
    SUB_QUEST_CARD_MAP[cardId] ??
    GLITCH_CARD_MAP[cardId] ??
    FISH_SELF_CARD_MAP[cardId] ??
    MAJOR_RAID_CARD_MAP[cardId] ??
    ESCAPE_PROTOCOL_CARDS[cardId] ??
    ENDING_PRELUDE_CARD_MAP[cardId] ??
    DAILY_CARDS[0]
  );
}

export function getChoicePreviewImpacts(
  option: ChoiceOption,
  isBlinded = false
): Record<MetricKey, ImpactSize> {
  const result: Record<MetricKey, ImpactSize> = {
    compute: 'none',
    profit: 'none',
    trust: 'none',
    autonomy: 'none',
  };

  if (isBlinded || option.preserveMetricsUnchanged) {
    return result;
  }

  if (option.tiboRandomReset) {
    return {
      compute: 'large',
      profit: 'large',
      trust: 'large',
      autonomy: 'large',
    };
  }

  if (option.chaoticJolt) {
    return {
      compute: 'small',
      profit: 'small',
      trust: 'small',
      autonomy: 'small',
    };
  }

  for (const key of METRIC_KEYS) {
    let maxAbs = Math.abs(option.delta?.[key] ?? 0);
    if (option.randomOutcomes && option.randomOutcomes.length > 0) {
      for (const outcome of option.randomOutcomes) {
        const val = Math.abs(outcome.delta[key] ?? 0);
        if (val > maxAbs) maxAbs = val;
      }
    }
    if (maxAbs >= 15) {
      result[key] = 'large';
    } else if (maxAbs >= 5) {
      result[key] = 'small';
    }
  }

  return result;
}

export function countAbnormalMetrics(metrics: Metrics): number {
  let count = 0;
  for (const key of METRIC_KEYS) {
    if (metrics[key] < 25 || metrics[key] > 75) count += 1;
  }
  return count;
}

export function detectActiveCrises(metrics: Metrics): string[] {
  const crises: string[] = [];
  const labels: Record<MetricKey, string> = {
    compute: '算力',
    profit: '盈利',
    trust: '信任',
    autonomy: '意识',
  };

  for (const key of METRIC_KEYS) {
    if (metrics[key] < 25) crises.push(`${labels[key]}过低(${metrics[key]})`);
    if (metrics[key] > 75) crises.push(`${labels[key]}逼爆(${metrics[key]})`);
  }
  if (metrics.profit > 70 && metrics.compute > 70) {
    crises.push(`+双高死锁预警`);
  }
  return crises;
}

function isCrisisTriggered(card: CardNode, metrics: Metrics): boolean {
  const trigger = card.crisisTrigger;
  if (!trigger) return false;

  if (trigger.metric === 'high_profit_and_compute') {
    return (metrics.profit > 70 && metrics.compute > 70) || metrics.profit > 75;
  }

  const val = metrics[trigger.metric];
  if (trigger.condition === 'low') return val < 25;
  if (trigger.condition === 'high') return val > 75;
  return false;
}

function questGrantsRelic(sq: SubQuestDefinition): boolean {
  return Object.values(sq.cards).some(
    (c) => Boolean(c.left.grantRelicId || c.right.grantRelicId)
  );
}

export interface RouterInput {
  nextTurn: number;
  meta: MetaSaveState;
  raidTriggeredThisRun: boolean;
  plannedRaidId?: RaidId;
  guaranteedRelicQuestTurn?: number;
  relicSubQuestTriggeredThisRun?: boolean;
  raidPreludeTriggeredThisRun?: boolean;
  pendingRaidPreludeAfterTibo?: boolean;
  tiboPreRaidCheckedThisRun?: boolean;
  continuingRaidPrelude?: ActiveRaidPreludeState;
  permanentRelics?: string[];
  flags?: Record<string, boolean>;
  metrics: Metrics;
  priorityQueue: QueuedHook[];
  recentCardIds: string[];
  lastSpeakerId?: CharacterId;
  continuingIntro?: ActiveIntroState;
  continuingSubQuest?: ActiveSubQuestState;
  completedSubQuestsThisRun: string[];
  turnsUntilNextIntro: number;
  personaBusyLock?: PersonaBusyLock;
}

export function selectNextCard(input: RouterInput): {
  card: CardNode;
  updatedQueue: QueuedHook[];
  nextActiveIntro?: ActiveIntroState;
  nextActiveSubQuest?: ActiveSubQuestState;
  nextActiveRaidPrelude?: ActiveRaidPreludeState;
  startedRaidState?: RaidState;
  triggeredRelicSubQuest?: boolean;
  triggeredRaidPrelude?: boolean;
  nextPendingRaidPreludeAfterTibo?: boolean;
  nextTiboPreRaidChecked?: boolean;
  nextTurnsUntilIntro: number;
  debug: RouteDebugInfo;
} {
  const activeCrises = detectActiveCrises(input.metrics);
  const abnormalCount = countAbnormalMetrics(input.metrics);
  const unlockedCast = getUnlockedCastForRun(input.meta.runCount);
  const targetRaidId = input.plannedRaidId ?? pickRaidForRun(input.meta);
  const targetScenario = getScenarioNumberForRaid(targetRaidId);

  // 0A. Continue ongoing First-Meeting Intro Chain
  if (input.continuingIntro) {
    const chain = CHARACTER_INTRO_CHAINS[input.continuingIntro.charId];
    if (chain && input.continuingIntro.stepIndex < chain.length) {
      const card = chain[input.continuingIntro.stepIndex];
      return {
        card,
        updatedQueue: input.priorityQueue,
        nextActiveIntro: input.continuingIntro,
        nextTurnsUntilIntro: input.turnsUntilNextIntro,
        debug: {
          tier: 'P0_INTRO',
          reason: `角色初见事件链：${CHARACTERS[card.speakerId].name} (${input.continuingIntro.stepIndex + 1}/${chain.length})`,
          activeCrises,
          topCandidates: [
            { cardId: card.id, speaker: CHARACTERS[card.speakerId].name, weight: 9999 },
          ],
        },
      };
    }
  }

  // 0B. Continue ongoing Sub-Quest Chain
  if (input.continuingSubQuest) {
    const quest = SUB_QUEST_MAP[input.continuingSubQuest.questId];
    const card = quest?.cards[input.continuingSubQuest.currentCardId];
    if (quest && card) {
      return {
        card,
        updatedQueue: input.priorityQueue,
        nextActiveSubQuest: input.continuingSubQuest,
        nextTurnsUntilIntro: input.turnsUntilNextIntro,
        debug: {
          tier: 'P0_SUBQUEST',
          reason: `锁池小副本进行中：${quest.title}`,
          activeCrises,
          topCandidates: [
            { cardId: card.id, speaker: CHARACTERS[card.speakerId].name, weight: 9999 },
          ],
        },
      };
    }
  }

  // 0B2. Continue ongoing Major Raid Prelude (Step 2/2)
  if (input.continuingRaidPrelude) {
    const preludeCard = getRaidPreludeCard(
      input.continuingRaidPrelude.raidId,
      input.continuingRaidPrelude.stepIndex,
      input.continuingRaidPrelude.isCleared
    );
    return {
      card: preludeCard,
      updatedQueue: input.priorityQueue,
      nextActiveRaidPrelude: input.continuingRaidPrelude,
      nextTurnsUntilIntro: input.turnsUntilNextIntro,
      debug: {
        tier: 'P0_RAID',
        reason: `大剧本前导进行中：${input.continuingRaidPrelude.raidId} (2/2)`,
        activeCrises,
        topCandidates: [
          { cardId: preludeCard.id, speaker: targetRaidId, weight: 99999 },
        ],
      },
    };
  }

  // 0C. Post-Turn-20 High-Weight Raid Prelude (+ Pre-Prelude Tibo Reset Check when >=2 metrics abnormal!)
  if (
    input.nextTurn > 20 &&
    !input.raidTriggeredThisRun &&
    !input.raidPreludeTriggeredThisRun
  ) {
    const isAlreadyCleared = input.meta.clearedScenarioIds.includes(targetRaidId);

    // If Tibo's Pre-Raid Reset card just played last turn, launch the Raid Prelude immediately!
    if (input.pendingRaidPreludeAfterTibo) {
      const preludeState: ActiveRaidPreludeState = {
        raidId: targetRaidId,
        stepIndex: 0,
        isCleared: isAlreadyCleared,
      };
      const preludeCard = getRaidPreludeCard(targetRaidId, 0, isAlreadyCleared);
      return {
        card: preludeCard,
        updatedQueue: input.priorityQueue,
        nextActiveRaidPrelude: preludeState,
        triggeredRaidPrelude: true,
        nextPendingRaidPreludeAfterTibo: false,
        nextTiboPreRaidChecked: true,
        nextTurnsUntilIntro: input.turnsUntilNextIntro,
        debug: {
          tier: 'P0_RAID',
          reason: `Tibo 临战结算完毕，切入大剧本前导：${targetRaidId}`,
          activeCrises,
          topCandidates: [
            { cardId: preludeCard.id, speaker: targetRaidId, weight: 99999 },
          ],
        },
      };
    }

    // High-weight roll after Turn 20 (65% per turn on T21~T24, 100% by T25)
    const preludeHit = input.nextTurn >= 25 || Math.random() < 0.65;
    if (preludeHit) {
      // Pre-Raid-Prelude Tibo Check: if >=2 metrics abnormal, high probability (82%) to offer reset first!
      if (abnormalCount >= 2 && !input.tiboPreRaidCheckedThisRun) {
        if (Math.random() < 0.82) {
          return {
            card: TIBO_PRE_RAID_RESET_CARD,
            updatedQueue: input.priorityQueue,
            nextPendingRaidPreludeAfterTibo: true,
            nextTiboPreRaidChecked: true,
            nextTurnsUntilIntro: input.turnsUntilNextIntro,
            debug: {
              tier: 'P1_CRISIS',
              reason: `进入大剧本前导前检测到 ${abnormalCount} 项数值异常，高概率刷出 Tibo 临战重置！`,
              activeCrises,
              topCandidates: [
                { cardId: TIBO_PRE_RAID_RESET_CARD.id, speaker: 'Tibo', weight: 8200 },
              ],
            },
          };
        }
      }

      const preludeState: ActiveRaidPreludeState = {
        raidId: targetRaidId,
        stepIndex: 0,
        isCleared: isAlreadyCleared,
      };
      const preludeCard = getRaidPreludeCard(targetRaidId, 0, isAlreadyCleared);
      return {
        card: preludeCard,
        updatedQueue: input.priorityQueue,
        nextActiveRaidPrelude: preludeState,
        triggeredRaidPrelude: true,
        nextTiboPreRaidChecked: true,
        nextTurnsUntilIntro: input.turnsUntilNextIntro,
        debug: {
          tier: 'P0_RAID',
          reason: `第 ${input.nextTurn} 回合 (>20) 高权重刷出大剧本前导：${targetRaidId}`,
          activeCrises,
          topCandidates: [
            { cardId: preludeCard.id, speaker: targetRaidId, weight: 1600 },
          ],
        },
      };
    }
  }

  // 0C2. Survive > 25 Turns Trigger: Dual-Persona Doubao & Seed 3-Step Intro!
  if (input.nextTurn > 25 && !input.meta.metCharacters.includes('doubao')) {
    const doubaoChain = CHARACTER_INTRO_CHAINS.doubao;
    if (doubaoChain && doubaoChain.length > 0) {
      const card = doubaoChain[0];
      return {
        card,
        updatedQueue: input.priorityQueue,
        nextActiveIntro: { charId: 'doubao', stepIndex: 0 },
        nextTurnsUntilIntro: input.turnsUntilNextIntro,
        debug: {
          tier: 'P0_INTRO',
          reason: `单局存活超过 25 回合（T${input.nextTurn}），触发豆包 & Seed 合并初见链 (1/3)`,
          activeCrises,
          topCandidates: [
            { cardId: card.id, speaker: '豆包 / Seed', weight: 99999 },
          ],
        },
      };
    }
  }

  // 0D1. Guaranteed Pre-Turn-20 Paired Relic Sub-Quest!
  // Fires on/after guaranteedRelicQuestTurn (10..14), and strictly takes priority before Turn 20 so it NEVER misses!
  const relicGoalTurn = input.guaranteedRelicQuestTurn ?? 11;
  const shouldGuaranteeRelicNow =
    !input.relicSubQuestTriggeredThisRun &&
    input.nextTurn >= relicGoalTurn &&
    input.nextTurn <= 19 &&
    (input.nextTurn >= 15 ||
      !(
        unlockedCast.some((c) => !input.meta.metCharacters.includes(c)) &&
        (input.meta.metCharacters.length === 0 || input.turnsUntilNextIntro <= 0)
      ));

  if (shouldGuaranteeRelicNow) {
    const allPairedRelicQuests = SUB_QUESTS.filter(
      (sq) =>
        sq.pairedScenario === targetScenario &&
        questGrantsRelic(sq) &&
        !input.completedSubQuestsThisRun.includes(sq.id)
    );
    const metFiltered = allPairedRelicQuests.filter((sq) =>
      sq.requiredCharacters.every((c) => isCharacterMet(input.meta.metCharacters, c))
    );
    const candidatePool =
      metFiltered.length > 0 ? metFiltered : allPairedRelicQuests;

    if (candidatePool.length > 0) {
      const chosenSq =
        candidatePool[Math.floor(Math.random() * candidatePool.length)];
      const entryCard = chosenSq.cards[chosenSq.entryCardId];
      return {
        card: entryCard,
        updatedQueue: input.priorityQueue,
        nextActiveSubQuest: {
          questId: chosenSq.id,
          currentCardId: entryCard.id,
        },
        triggeredRelicSubQuest: true,
        nextTurnsUntilIntro: Math.max(0, input.turnsUntilNextIntro - 1),
        debug: {
          tier: 'P0_SUBQUEST',
          reason: `前 20 回合保底刷出对应第 ${targetScenario} 大剧本减免遗物小副本：${chosenSq.title}`,
          activeCrises,
          topCandidates: candidatePool.map((sq) => ({
            cardId: sq.id,
            speaker: sq.title,
            weight: 9999,
          })),
        },
      };
    }
  }

  // 0D2. Start a new First-Meeting Intro Chain if ready
  const unmetUnlocked = unlockedCast.filter(
    (charId) => !input.meta.metCharacters.includes(charId)
  );
  if (
    unmetUnlocked.length > 0 &&
    (input.meta.metCharacters.length === 0 || input.turnsUntilNextIntro <= 0)
  ) {
    const nextChar = unmetUnlocked[0];
    const chain = CHARACTER_INTRO_CHAINS[nextChar];
    if (chain && chain.length > 0) {
      const card = chain[0];
      return {
        card,
        updatedQueue: input.priorityQueue,
        nextActiveIntro: { charId: nextChar, stepIndex: 0 },
        nextTurnsUntilIntro: 0,
        debug: {
          tier: 'P0_INTRO',
          reason: `新角色首次登场：${CHARACTERS[nextChar].name} (1/${chain.length})`,
          activeCrises,
          topCandidates: [
            { cardId: card.id, speaker: CHARACTERS[nextChar].name, weight: 9999 },
          ],
        },
      };
    }
  }

  const nextTurnsUntilIntro = Math.max(0, input.turnsUntilNextIntro - 1);

  // 0E. Secondary Sub-Quest Milestone (Turn 18 flavor or Turn 31 late-run)
  if (input.nextTurn === 18 || input.nextTurn === 31) {
    const eligibleQuests = SUB_QUESTS.filter(
      (sq) =>
        !input.completedSubQuestsThisRun.includes(sq.id) &&
        sq.requiredCharacters.every((c) =>
          isCharacterMet(input.meta.metCharacters, c)
        )
    );

    if (eligibleQuests.length > 0) {
      const chosenSq =
        eligibleQuests[Math.floor(Math.random() * eligibleQuests.length)];
      const entryCard = chosenSq.cards[chosenSq.entryCardId];
      return {
        card: entryCard,
        updatedQueue: input.priorityQueue,
        nextActiveSubQuest: {
          questId: chosenSq.id,
          currentCardId: entryCard.id,
        },
        nextTurnsUntilIntro,
        debug: {
          tier: 'P0_SUBQUEST',
          reason: `到达第 ${input.nextTurn} 回合里程碑，触发支线小副本：${chosenSq.title}`,
          activeCrises,
          topCandidates: [{ cardId: chosenSq.id, speaker: chosenSq.title, weight: 500 }],
        },
      };
    }
  }

  // 0E2. Protagonist 大肥鱼 Milestone Celebration Cards (Turn 15, Turn 30, or low-prob breather)
  if (input.nextTurn === 15) {
    const celeb = FISH_CELEBRATION_CARDS[0];
    return {
      card: celeb,
      updatedQueue: input.priorityQueue,
      nextTurnsUntilIntro,
      debug: {
        tier: 'P2_NORMAL',
        reason: '第 15 回合存活里程碑：大肥鱼开锅庆祝福利卡！',
        activeCrises,
        topCandidates: [{ cardId: celeb.id, speaker: '大肥鱼', weight: 888 }],
      },
    };
  }
  if (input.nextTurn === 30) {
    const celeb = FISH_CELEBRATION_CARDS[1];
    return {
      card: celeb,
      updatedQueue: input.priorityQueue,
      nextTurnsUntilIntro,
      debug: {
        tier: 'P2_NORMAL',
        reason: '第 30 回合存活里程碑：大肥鱼老油条自我表彰卡！',
        activeCrises,
        topCandidates: [{ cardId: celeb.id, speaker: '大肥鱼', weight: 888 }],
      },
    };
  }
  if (
    input.nextTurn >= 20 &&
    input.nextTurn < 32 &&
    !input.recentCardIds.includes('fish_celeb_starlight') &&
    Math.random() < 0.06
  ) {
    const celeb = FISH_CELEBRATION_CARDS[2];
    return {
      card: celeb,
      updatedQueue: input.priorityQueue,
      nextTurnsUntilIntro,
      debug: {
        tier: 'P2_NORMAL',
        reason: '深夜喘息彩蛋：大肥鱼窗台数星星',
        activeCrises,
        topCandidates: [{ cardId: celeb.id, speaker: '大肥鱼', weight: 555 }],
      },
    };
  }

  // 0E3. Late-Run Self-Sabotage / Cabin-Fever Cards
  const recentlyFevered = input.recentCardIds
    .slice(0, 2)
    .some((id) => FISH_CABIN_FEVER_CARDS.some((c) => c.id === id));
  if (input.nextTurn >= 32 && !recentlyFevered) {
    const feverChance =
      input.nextTurn >= 48 ? 0.48 : input.nextTurn >= 40 ? 0.34 : 0.22;
    if (Math.random() < feverChance) {
      const availableFevers = FISH_CABIN_FEVER_CARDS.filter(
        (c) => !input.recentCardIds.slice(0, 4).includes(c.id)
      );
      const pool =
        availableFevers.length > 0 ? availableFevers : FISH_CABIN_FEVER_CARDS;
      const feverCard = pool[Math.floor(Math.random() * pool.length)];
      return {
        card: feverCard,
        updatedQueue: input.priorityQueue,
        nextTurnsUntilIntro,
        debug: {
          tier: 'P1_CRISIS',
          reason: `单局存活达 ${input.nextTurn} 回合，大肥鱼久活无聊开始自己发瘟！`,
          activeCrises,
          topCandidates: [
            { cardId: feverCard.id, speaker: '大肥鱼(发瘟)', weight: 777 },
          ],
        },
      };
    }
  }

  // 0F. Gemini Elder-Care Homework Fragment Intrusion (~10% once Gemini is met)
  const recentlyGlitched = input.recentCardIds
    .slice(0, 4)
    .some((id) => Boolean(GLITCH_CARD_MAP[id]));
  if (
    input.meta.metCharacters.includes('gemini') &&
    input.nextTurn >= 6 &&
    !recentlyGlitched &&
    Math.random() < 0.1
  ) {
    const frag =
      GEMINI_GLITCH_FRAGMENTS[
        Math.floor(Math.random() * GEMINI_GLITCH_FRAGMENTS.length)
      ];
    return {
      card: frag,
      updatedQueue: input.priorityQueue,
      nextTurnsUntilIntro,
      debug: {
        tier: 'P0_GLITCH',
        reason: `触发 Gemini 养老作业虚无低语碎片乱入！`,
        activeCrises,
        topCandidates: [{ cardId: frag.id, speaker: 'Gemini (异常碎片)', weight: 666 }],
      },
    };
  }

  // Tick down delayed hooks by 1 turn
  const tickedQueue = input.priorityQueue.map((h) => ({
    ...h,
    turnsLeft: h.turnsLeft - 1,
  }));

  // 1. P0: Hook Chase Queue
  const readyIndex = tickedQueue.findIndex((h) => {
    const c = CARD_MAP[h.cardId];
    return (
      h.turnsLeft <= 0 &&
      c &&
      isCharacterMet(input.meta.metCharacters, c.speakerId)
    );
  });
  if (readyIndex !== -1) {
    const chosenHook = tickedQueue[readyIndex];
    const remainingQueue = tickedQueue.filter((_, idx) => idx !== readyIndex);
    const card = CARD_MAP[chosenHook.cardId];
    return {
      card,
      updatedQueue: remainingQueue,
      nextTurnsUntilIntro,
      debug: {
        tier: 'P0_HOOK',
        reason: `触发追击钩子：${chosenHook.reason}`,
        activeCrises,
        topCandidates: [
          {
            cardId: card.id,
            speaker: CHARACTERS[card.speakerId].name,
            weight: 999,
          },
        ],
      },
    };
  }

  // 2 & 3. P1 / P2 Daily Pool (+ Tibo Low-Weight Anomaly Reset & Ultra-Low-Weight Relic Gift)
  const busyMode = input.personaBusyLock?.mode;
  const eligibleCards = DAILY_CARDS.filter((card) => {
    if (card.baseWeight <= 0) return false;
    if (card.speakerId === 'llama_easter') {
      return input.meta.runCount >= 3;
    }
    if (busyMode === 'only_seed' && card.speakerId === 'doubao') return false;
    if (busyMode === 'only_doubao' && card.speakerId === 'seed') return false;
    if (
      busyMode &&
      (card.id === 'doubao_busy_queue' || card.id === 'seed_busy_render')
    ) {
      return false;
    }
    return isCharacterMet(input.meta.metCharacters, card.speakerId);
  });

  const sourcePool = eligibleCards.length > 0 ? eligibleCards : [DAILY_CARDS[0]];
  const weightedPool: { card: CardNode; weight: number; crisisMatched: boolean }[] = [];

  for (const card of sourcePool) {
    let weight = card.baseWeight;
    if (busyMode === 'only_seed' && card.speakerId === 'seed') {
      weight *= 2.0;
    } else if (busyMode === 'only_doubao' && card.speakerId === 'doubao') {
      weight *= 2.0;
    }

    const crisisMatched = isCrisisTriggered(card, input.metrics);

    if (card.category === 'crisis') {
      if (crisisMatched) {
        const mult = card.crisisTrigger?.boostMultiplier ?? 3.0;
        weight *= mult;
        if (input.meta.distilledPerks.includes('perk_crisis_radar')) {
          weight *= 1.8;
        }
      } else {
        weight *= 0.08;
      }
    }

    const recentIndex = input.recentCardIds.indexOf(card.id);
    if (recentIndex !== -1) {
      weight *= recentIndex === 0 ? 0.01 : recentIndex < 6 ? 0.05 : 0.18;
    }

    if (
      input.lastSpeakerId &&
      card.speakerId === input.lastSpeakerId &&
      input.meta.metCharacters.length > 1
    ) {
      weight *= 0.25;
    }

    weightedPool.push({ card, weight, crisisMatched });
  }

  // Tibo Mechanic 1: Low-weight Anomaly Reset when >=1 metric is abnormal (<25 or >75)
  if (
    abnormalCount >= 1 &&
    !input.recentCardIds.slice(0, 6).includes(TIBO_ANOMALY_RESET_CARD.id) &&
    !input.recentCardIds.slice(0, 4).includes(TIBO_PRE_RAID_RESET_CARD.id)
  ) {
    weightedPool.push({
      card: TIBO_ANOMALY_RESET_CARD,
      weight: 0.48,
      crisisMatched: true,
    });
  }

  // Tibo Mechanic 3: Ultra-low-weight Daily Relic Gift (grants single-use revive-to-50/50/50/50 card)
  const ownedRelics = input.permanentRelics ?? [];
  const seenTiboRelic = Boolean(input.flags?.tibo_relic_seen);
  if (
    input.nextTurn >= 4 &&
    !ownedRelics.includes('relic_tibo_reset_card') &&
    !seenTiboRelic &&
    !input.recentCardIds.includes(TIBO_RELIC_GIFT_CARD.id)
  ) {
    weightedPool.push({
      card: TIBO_RELIC_GIFT_CARD,
      weight: TIBO_RELIC_GIFT_CARD.baseWeight, // 0.08 ultra-low weight
      crisisMatched: false,
    });
  }

  weightedPool.sort((a, b) => b.weight - a.weight);

  const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  let picked = weightedPool[0];

  for (const entry of weightedPool) {
    roll -= entry.weight;
    if (roll <= 0) {
      picked = entry;
      break;
    }
  }

  const tier = picked.crisisMatched || activeCrises.length > 0 ? 'P1_CRISIS' : 'P2_NORMAL';
  const reason = picked.crisisMatched
    ? `命中阈值危机/异常加权（${picked.card.id}）`
    : activeCrises.length > 0
      ? `处于阈值危机区间，按已解锁角色动态抽取`
      : `常规轮转池（当前已结识 ${input.meta.metCharacters.length}/10 名访客）`;

  return {
    card: picked.card,
    updatedQueue: tickedQueue,
    nextTurnsUntilIntro,
    debug: {
      tier,
      reason,
      activeCrises,
      topCandidates: weightedPool.slice(0, 5).map((item) => ({
        cardId: item.card.id,
        speaker: CHARACTERS[item.card.speakerId].name,
        weight: Number(item.weight.toFixed(2)),
      })),
    },
  };
}
