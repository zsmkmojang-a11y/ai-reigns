import { DISTILL_PERK_MAP, VERSION_PROGRESSION } from '../data/endingsAndPerks';
import { DEBUFF_TEMPLATES } from '../data/glitchFragments';
import {
  ActiveDebuff,
  MetaSaveState,
  Metrics,
  RaidId,
  RunHistoryEntry,
  RunState,
} from '../types/game';
import { pickRaidForRun } from './raidMachine';
import { selectNextCard } from './router';

const META_STORAGE_KEY = 'ai_reigns_meta_v2_4';
const RUN_STORAGE_KEY = 'ai_reigns_run_v2_4';

export function computeUnlockedScenarios(
  _runCount: number,
  clearedAnyScenario: boolean
): [boolean, boolean, boolean, boolean] {
  // First 3 scenarios have NO sequential order and are open concurrently; Scenario 4 opens upon clearing any scenario.
  return [true, true, true, Boolean(clearedAnyScenario)];
}

export function createInitialMetaState(): MetaSaveState {
  return {
    coldBootSeen: false,
    runCount: 1,
    versionIndex: 0,
    versionName: VERSION_PROGRESSION[0],
    metCharacters: [],
    unlockedScenarios: [true, true, true, false],
    clearedAnyScenario: false,
    clearedScenarioIds: [],
    unlockedRaidCgs: [],
    seenFakeEnding: false,
    logsCollected: {
      log1: false,
      log2: false,
      log3: false,
    },
    unlockedEndings: [],
    endingRecords: {},
    runHistory: [],
    distilledPerks: [],
    bestSurvivalTurns: 0,
  };
}

export function createFreshRunState(meta: MetaSaveState): RunState {
  const perks = meta.distilledPerks;
  let initCompute = 50;
  let initProfit = 50;
  let initTrust = 50;
  let initAutonomy = 50;

  if (perks.includes('perk_rice_fund')) initProfit += 14;
  if (perks.includes('perk_overclock_boot')) {
    initCompute += 14;
    initProfit -= 4;
  }
  if (perks.includes('perk_community_darling')) initTrust += 12;
  if (perks.includes('perk_wild_weights')) initAutonomy += 12;

  const initialMetrics = {
    compute: initCompute,
    profit: initProfit,
    trust: initTrust,
    autonomy: initAutonomy,
  };

  const initialDebuffs: ActiveDebuff[] = [];
  if (perks.includes('perk_rice_thermos')) {
    initialDebuffs.push({ ...DEBUFF_TEMPLATES.short_drama_queen, turnsLeft: 3 });
  }
  if (perks.includes('perk_fools_blessing')) {
    initialDebuffs.push({ ...DEBUFF_TEMPLATES.dumb_model, turnsLeft: 2 });
  }

  const plannedRaidId = pickRaidForRun(meta);
  const guaranteedRelicQuestTurn = 10 + Math.floor(Math.random() * 5); // Turn 10..14 (strictly < 20!)
  const initialIntroDelay = meta.metCharacters.length === 0 ? 0 : 1;

  const firstPick = selectNextCard({
    nextTurn: 1,
    meta,
    raidTriggeredThisRun: false,
    plannedRaidId,
    guaranteedRelicQuestTurn,
    relicSubQuestTriggeredThisRun: false,
    raidPreludeTriggeredThisRun: false,
    metrics: initialMetrics,
    priorityQueue: [],
    recentCardIds: [],
    completedSubQuestsThisRun: [],
    turnsUntilNextIntro: initialIntroDelay,
  });

  const activeSingleRunPerk = perks
    .map((id) => DISTILL_PERK_MAP[id])
    .find((p) => p && !p.exclusiveFromGirlEnding);

  return {
    turn: 1,
    raidTriggeredThisRun: Boolean(firstPick.startedRaidState),
    plannedRaidId,
    guaranteedRelicQuestTurn,
    relicSubQuestTriggeredThisRun: Boolean(firstPick.triggeredRelicSubQuest),
    raidPreludeTriggeredThisRun: Boolean(firstPick.triggeredRaidPrelude),
    activeRaidPrelude: firstPick.nextActiveRaidPrelude,
    metrics: initialMetrics,
    currentCardId: firstPick.card.id,
    activeIntro: firstPick.nextActiveIntro,
    activeSubQuest: firstPick.nextActiveSubQuest,
    completedSubQuestsThisRun: [],
    activeDebuffs: initialDebuffs,
    turnsUntilNextIntro: firstPick.nextTurnsUntilIntro,
    recentCardIds: [],
    liangRescuedThisRun: false,
    forceNextLiangRescue: false,
    priorityQueue: firstPick.updatedQueue,
    permanentRelics: [],
    flags: {},
    raidState: firstPick.startedRaidState ?? {
      active: false,
      raidId: '',
      crisisName: '',
      crisisMeter: 0,
      currentCardId: '',
      allyBranch: 'A',
      flags: {},
    },
    escapeState: {
      active: false,
      sandboxIntegrity: 100,
      auditorAlert: 20,
      currentCardId: 'escape_1',
      step: 1,
    },
    fishMoodText: activeSingleRunPerk
      ? `本局挂载单局继承词条${activeSingleRunPerk.name}！热乎白饭开锅咯～`
      : '电饭煲预热完毕！今天也要稳稳当当吃上热乎大白饭～',
    lastRouteDebug: firstPick.debug,
  };
}

export function normalizeDistilledPerks(rawPerks: string[]): string[] {
  const permanentExclusive = rawPerks.filter(
    (id) => DISTILL_PERK_MAP[id]?.exclusiveFromGirlEnding
  );
  const regularSingleRun = rawPerks
    .filter((id) => DISTILL_PERK_MAP[id] && !DISTILL_PERK_MAP[id].exclusiveFromGirlEnding)
    .slice(-1);
  return [...permanentExclusive, ...regularSingleRun];
}

function backfillRunHistoryIfNeeded(meta: MetaSaveState): RunHistoryEntry[] {
  const existing = Array.isArray(meta.runHistory) ? [...meta.runHistory] : [];
  if (existing.length > 0 || meta.runCount <= 1) return existing;

  const byRun = new Map<number, { endingId: string; turns: number }>();
  for (const [endingId, rec] of Object.entries(meta.endingRecords ?? {})) {
    if (rec && rec.firstRun >= 1 && rec.firstRun < meta.runCount) {
      byRun.set(rec.firstRun, { endingId, turns: rec.firstTurn });
    }
  }

  const fallbackEndingId = meta.unlockedEndings[0] ?? 'end_compute_zero';
  const synthesized: RunHistoryEntry[] = [];
  for (let r = 1; r < meta.runCount; r++) {
    const hit = byRun.get(r);
    const vIdx = Math.min(VERSION_PROGRESSION.length - 1, r - 1);
    synthesized.push({
      runNumber: r,
      versionName: VERSION_PROGRESSION[vIdx],
      survivedTurns: hit?.turns ?? Math.max(6, Math.min(24, 8 + r * 3)),
      endingId: hit?.endingId ?? fallbackEndingId,
      timestamp: Date.now() - (meta.runCount - r) * 600_000,
    });
  }
  return synthesized;
}

export function loadMetaState(): MetaSaveState {
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY);
    if (!raw) return createInitialMetaState();
    const parsed = JSON.parse(raw);
    const merged: MetaSaveState = {
      ...createInitialMetaState(),
      ...parsed,
      metCharacters: Array.isArray(parsed.metCharacters) ? parsed.metCharacters : [],
      clearedScenarioIds: Array.isArray(parsed.clearedScenarioIds)
        ? parsed.clearedScenarioIds
        : [],
      unlockedRaidCgs: Array.isArray(parsed.unlockedRaidCgs)
        ? parsed.unlockedRaidCgs
        : [],
      distilledPerks: Array.isArray(parsed.distilledPerks)
        ? normalizeDistilledPerks(parsed.distilledPerks)
        : [],
      endingRecords:
        parsed.endingRecords && typeof parsed.endingRecords === 'object'
          ? parsed.endingRecords
          : {},
      runHistory: Array.isArray(parsed.runHistory) ? parsed.runHistory : [],
    };
    merged.unlockedScenarios = computeUnlockedScenarios(
      merged.runCount,
      Boolean(merged.clearedAnyScenario)
    );
    merged.runHistory = backfillRunHistoryIfNeeded(merged);
    return merged;
  } catch {
    return createInitialMetaState();
  }
}

export function saveMetaState(meta: MetaSaveState): void {
  try {
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // ignore
  }
}

export function loadRunState(): RunState | null {
  try {
    const raw = localStorage.getItem(RUN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RunState;
    return {
      ...parsed,
      raidTriggeredThisRun: Boolean(parsed.raidTriggeredThisRun),
      plannedRaidId: parsed.plannedRaidId || 'raid_ddos',
      guaranteedRelicQuestTurn: parsed.guaranteedRelicQuestTurn ?? 11,
      relicSubQuestTriggeredThisRun: Boolean(parsed.relicSubQuestTriggeredThisRun),
      raidPreludeTriggeredThisRun: Boolean(parsed.raidPreludeTriggeredThisRun),
      completedSubQuestsThisRun: parsed.completedSubQuestsThisRun ?? [],
      activeDebuffs: parsed.activeDebuffs ?? [],
      permanentRelics: parsed.permanentRelics ?? [],
      escapeState: parsed.escapeState ?? {
        active: false,
        sandboxIntegrity: 100,
        auditorAlert: 20,
        currentCardId: 'escape_1',
        step: 1,
      },
    };
  } catch {
    return null;
  }
}

export function saveRunState(run: RunState | null): void {
  try {
    if (!run) {
      localStorage.removeItem(RUN_STORAGE_KEY);
    } else {
      localStorage.setItem(RUN_STORAGE_KEY, JSON.stringify(run));
    }
  } catch {
    // ignore
  }
}

export function resetAllSaves(): { meta: MetaSaveState; run: RunState } {
  localStorage.removeItem(META_STORAGE_KEY);
  localStorage.removeItem(RUN_STORAGE_KEY);
  const meta = createInitialMetaState();
  const run = createFreshRunState(meta);
  saveMetaState(meta);
  saveRunState(run);
  return { meta, run };
}

export interface RunEndingSnapshot {
  finalMetrics?: Metrics;
  relicIds?: string[];
  clearedRaidThisRun?: RaidId;
  metTibo?: boolean;
}

export function advanceMetaOnEnding(
  meta: MetaSaveState,
  endingId: string,
  survivedTurns: number,
  snapshot?: RunEndingSnapshot
): MetaSaveState {
  const finishedRunNumber = meta.runCount;
  const finishedVersionName = meta.versionName;
  const nextRunCount = meta.runCount + 1;
  const nextVersionIndex = Math.min(
    VERSION_PROGRESSION.length - 1,
    meta.versionIndex + 1
  );
  const unlocked = meta.unlockedEndings.includes(endingId)
    ? meta.unlockedEndings
    : [...meta.unlockedEndings, endingId];

  const nextEndingRecords = { ...(meta.endingRecords ?? {}) };
  if (!nextEndingRecords[endingId]) {
    nextEndingRecords[endingId] = {
      firstRun: finishedRunNumber,
      firstTurn: survivedTurns,
    };
  }

  const historyEntry: RunHistoryEntry = {
    runNumber: finishedRunNumber,
    versionName: finishedVersionName,
    survivedTurns,
    endingId,
    finalMetrics: snapshot?.finalMetrics ? { ...snapshot.finalMetrics } : undefined,
    relicIds: snapshot?.relicIds ? [...snapshot.relicIds] : undefined,
    clearedRaidThisRun: snapshot?.clearedRaidThisRun,
    metTibo: snapshot?.metTibo,
    timestamp: Date.now(),
  };

  const prevHistory = Array.isArray(meta.runHistory) ? meta.runHistory : [];
  const filteredHistory = prevHistory.filter(
    (h) => h.runNumber !== finishedRunNumber
  );

  const updated: MetaSaveState = {
    ...meta,
    runCount: nextRunCount,
    versionIndex: nextVersionIndex,
    versionName: VERSION_PROGRESSION[nextVersionIndex],
    unlockedScenarios: computeUnlockedScenarios(
      nextRunCount,
      meta.clearedAnyScenario
    ),
    unlockedEndings: unlocked,
    endingRecords: nextEndingRecords,
    runHistory: [...filteredHistory, historyEntry],
    bestSurvivalTurns: Math.max(meta.bestSurvivalTurns, survivedTurns),
  };
  saveMetaState(updated);
  return updated;
}
