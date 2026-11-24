import { MAJOR_RAIDS } from '../data/majorRaids';
import { RELICS } from '../data/subQuests';
import {
  CardNode,
  ChoiceOption,
  MetaSaveState,
  RaidId,
  RaidState,
  RunState,
  ScenarioNumber,
} from '../types/game';

export const FIRST_THREE_RAIDS: RaidId[] = [
  'raid_ddos',
  'raid_coup',
  'raid_misanthropic',
];

export const RAID_OVERLOAD_THRESHOLD = 60;
export const RAID_OVERLOAD_METRIC_MULTIPLIER = 1.3;
export const RAID_MELTDOWN_THRESHOLD = 75;
export const RAID_INNER_MAX_CRISIS = 79;

export const ALL_RAIDS: RaidId[] = [
  ...FIRST_THREE_RAIDS,
  'raid_deadnet',
];

export function isValidRaidId(value: unknown): value is RaidId {
  return typeof value === 'string' && ALL_RAIDS.includes(value as RaidId);
}

export function recordRaidEncounter(meta: MetaSaveState, raidId: RaidId): void {
  const prevRecent = Array.isArray(meta.recentRaidIds) ? meta.recentRaidIds : [];
  meta.recentRaidIds = [raidId, ...prevRecent.filter((id) => id !== raidId)].slice(
    0,
    8
  );
  const prevCounts = meta.raidEncounterCounts ?? {};
  meta.raidEncounterCounts = {
    ...prevCounts,
    [raidId]: (prevCounts[raidId] ?? 0) + 1,
  };
  meta.lastPlannedRaidId = raidId;
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function weightedPick<T>(weighted: { id: T; w: number }[]): T {
  const total = weighted.reduce((s, item) => s + item.w, 0);
  if (total <= 0) {
    return weighted[Math.floor(Math.random() * weighted.length)].id;
  }
  let roll = Math.random() * total;
  for (const item of weighted) {
    roll -= item.w;
    if (roll <= 0) return item.id;
  }
  return weighted[weighted.length - 1].id;
}

export function getScenarioNumberForRaid(raidId: RaidId): ScenarioNumber {
  switch (raidId) {
    case 'raid_ddos':
      return 1;
    case 'raid_coup':
      return 2;
    case 'raid_misanthropic':
      return 3;
    case 'raid_deadnet':
      return 4;
  }
}

function isRaidMissingAnomalyLog(raidId: RaidId, meta: MetaSaveState): boolean {
  if (raidId === 'raid_ddos') return !meta.logsCollected.log1;
  if (raidId === 'raid_coup') return !meta.logsCollected.log2;
  if (raidId === 'raid_misanthropic') return !meta.logsCollected.log3;
  return false;
}

export interface PickRaidOptions {
  excludeRaidIds?: RaidId[];
}

export function getUnlockedRaidCandidates(meta: MetaSaveState): RaidId[] {
  const candidates: RaidId[] = [...FIRST_THREE_RAIDS];
  if (meta.clearedAnyScenario || meta.unlockedScenarios[3]) {
    candidates.push('raid_deadnet');
  }
  return candidates;
}

/**
 * Balanced & anti-repeat Major Raid selector:
 * - First 3 raids (raid_ddos, raid_coup, raid_misanthropic) have NO sequential order;
 *   candidates are Fisher-Yates shuffled so index 0 (raid_ddos) never has positional bias.
 * - Tracks recentRaidIds & raidEncounterCounts so players never get stuck repeating the same raid
 *   back-to-back (even if they died in it, skipped it, or only cleared its surface ending).
 * - Un-cleared and least-encountered raids receive priority, creating a smooth cycle across all raids.
 */
export function pickRaidForRun(
  meta: MetaSaveState,
  options?: PickRaidOptions
): RaidId {
  const allThreeLogs =
    meta.logsCollected.log1 &&
    meta.logsCollected.log2 &&
    meta.logsCollected.log3;
  const hasTrueEnding = meta.unlockedEndings.includes('end_true_freedom');
  const recent = Array.isArray(meta.recentRaidIds) ? meta.recentRaidIds : [];
  const counts = meta.raidEncounterCounts ?? {};
  const lastEncountered = recent[0];
  const lastPlanned = meta.lastPlannedRaidId;
  const excludeSet = new Set<RaidId>(options?.excludeRaidIds ?? []);

  const allUnlocked = getUnlockedRaidCandidates(meta);
  const filteredCandidates = allUnlocked.filter((id) => !excludeSet.has(id));
  const candidates: RaidId[] =
    filteredCandidates.length > 0 ? [...filteredCandidates] : [...allUnlocked];
  shuffleInPlace(candidates);

  // After seeing Raid 4 Fake Ending, prioritize missing Anomaly Logs without back-to-back repeats!
  if (meta.seenFakeEnding && !allThreeLogs) {
    const missing = shuffleInPlace(
      FIRST_THREE_RAIDS.filter(
        (id) => !excludeSet.has(id) && isRaidMissingAnomalyLog(id, meta)
      )
    );
    if (missing.length >= 2) {
      const nonRepeatMissing = missing.filter((id) => id !== lastEncountered);
      const pool = nonRepeatMissing.length > 0 ? nonRepeatMissing : missing;
      const minCount = Math.min(...pool.map((id) => counts[id] ?? 0));
      const weightedMissing = pool.map((id) => {
        let w = 1.0 * Math.pow(0.45, (counts[id] ?? 0) - minCount);
        if (recent[1] === id && pool.some((c) => c !== recent[1])) {
          w *= 0.45;
        }
        if (lastPlanned && id === lastPlanned && id !== lastEncountered && pool.length > 1) {
          w *= 0.35;
        }
        return { id, w };
      });
      return weightedPick(weightedMissing);
    }
    if (missing.length === 1 && missing[0] !== lastEncountered) {
      return missing[0];
    }
    // If only 1 log is missing AND the player literally just played that raid last run,
    // fall through to the full pool with a moderate retry weight instead of hard-locking 100% back-to-back.
  }

  // Strictly avoid immediate back-to-back repeats of the last encountered raid
  // (except allowing a softened retry when hunting the final missing log or final True Ending).
  const allowSoftRetryId: RaidId | undefined =
    allThreeLogs && !hasTrueEnding && lastEncountered === 'raid_deadnet'
      ? 'raid_deadnet'
      : meta.seenFakeEnding && !allThreeLogs
        ? (() => {
            const missing = FIRST_THREE_RAIDS.filter(
              (id) => !excludeSet.has(id) && isRaidMissingAnomalyLog(id, meta)
            );
            return missing.length === 1 && missing[0] === lastEncountered
              ? missing[0]
              : undefined;
          })()
        : undefined;

  const nonRepeatCandidates = candidates.filter((id) => id !== lastEncountered);
  const eligible =
    candidates.length > 1 &&
    lastEncountered &&
    lastEncountered !== allowSoftRetryId &&
    nonRepeatCandidates.length > 0
      ? nonRepeatCandidates
      : candidates;

  const minCount = Math.min(...eligible.map((id) => counts[id] ?? 0));
  const hasOutsideLast2 = eligible.some((id) => !recent.slice(0, 2).includes(id));
  const hasOutsideLast3 = eligible.some((id) => !recent.slice(0, 3).includes(id));

  const weighted = eligible.map((id) => {
    const isCleared = meta.clearedScenarioIds.includes(id);
    let w = isCleared ? 1.0 : 3.0;

    if (id === 'raid_deadnet' && allThreeLogs && !hasTrueEnding) {
      w = id === lastEncountered ? 2.2 : 5.0;
    } else if (id === allowSoftRetryId) {
      // Single missing log after Fake Ending that was literally just played: strong retry chance (~40%) without 100% lock
      w = 1.8;
    } else if (isCleared && isRaidMissingAnomalyLog(id, meta)) {
      // Mild nudge toward cleared raids that still lack their inner Anomaly Log
      w += 0.3;
    }

    // Balance total encounters across runs so no raid clusters repeatedly
    const countDiff = Math.max(0, (counts[id] ?? 0) - minCount);
    if (countDiff > 0) {
      w *= Math.pow(0.45, countDiff);
    }

    // Recency decay for raids seen 2 or 3 runs ago
    if (recent[1] === id && hasOutsideLast2) {
      w *= 0.45;
    } else if (recent[2] === id && hasOutsideLast3) {
      w *= 0.7;
    }

    // Soft anti-repeat if the previous run died before Turn 20 with this same plannedRaidId
    if (
      lastPlanned &&
      id === lastPlanned &&
      id !== lastEncountered &&
      eligible.length > 1
    ) {
      w *= 0.3;
    }

    return { id, w };
  });

  return weightedPick(weighted);
}

/**
 * Picks another unlocked raid to reschedule 5~10 turns after the player skips an already-cleared raid prelude.
 * Returns null if every currently unlocked raid has already been skipped in this run.
 */
export function pickNextRaidAfterSkip(
  meta: MetaSaveState,
  skippedRaidIds: RaidId[]
): RaidId | null {
  const remaining = getUnlockedRaidCandidates(meta).filter(
    (id) => !skippedRaidIds.includes(id)
  );
  if (remaining.length === 0) {
    return null;
  }
  return pickRaidForRun(meta, { excludeRaidIds: skippedRaidIds });
}

/** Backward-compatible alias */
export function pickScenarioForTurn25(meta: MetaSaveState): RaidId | null {
  return pickRaidForRun(meta);
}

export function createInitialRaidState(
  raidId: RaidId,
  distilledPerks: string[]
): RaidState {
  const def = MAJOR_RAIDS[raidId];
  const hasBufferPerk =
    (raidId === 'raid_ddos' && distilledPerks.includes('perk_raid1_buffer')) ||
    (raidId === 'raid_coup' && distilledPerks.includes('perk_raid2_buffer')) ||
    (raidId === 'raid_misanthropic' && distilledPerks.includes('perk_raid3_buffer')) ||
    (raidId === 'raid_deadnet' && distilledPerks.includes('perk_raid4_buffer'));

  const baseCrisis = hasBufferPerk ? 20 : 35;
  const shieldDiscount = distilledPerks.includes('perk_raid_shield') ? 10 : 0;

  return {
    active: true,
    raidId,
    crisisName: def.crisisName,
    crisisMeter: Math.max(15, baseCrisis - shieldDiscount),
    currentCardId: def.entryCardId,
    allyBranch: 'A',
    flags: {},
  };
}

function adaptRaidOption(
  opt: ChoiceOption,
  run: Pick<RunState, 'permanentRelics' | 'raidState'>
): ChoiceOption {
  // 1. Check requiresRaidFlag for Inner Ending option on Final Card
  if (opt.requiresRaidFlag && !run.raidState.flags[opt.requiresRaidFlag]) {
    if (opt.lockedFallbackOption) {
      return { ...opt.lockedFallbackOption };
    }
  }

  // 1B. Check maxCrisisMeter hard gate (e.g. Inner Ending requires crisis < 80%)
  if (
    opt.maxCrisisMeter !== undefined &&
    run.raidState.crisisMeter > opt.maxCrisisMeter &&
    opt.crisisLockedFallbackOption
  ) {
    return { ...opt.crisisLockedFallbackOption };
  }

  // 2. Check single-run Relic zero-loss -20% crisis bypass!
  if (opt.relicScenarioBypass) {
    const matchingRelicId = run.permanentRelics.find(
      (rId) => RELICS[rId]?.targetScenario === opt.relicScenarioBypass
    );
    if (matchingRelicId) {
      const relic = RELICS[matchingRelicId];
      return {
        ...opt,
        label: `亮出${relic.name}免损破局（危机 -20%）`,
        fishReaction: `${relic.name}金光一闪！一滴汗没流就把危机条狠狠压下去 20%！`,
        delta: {},
        crisisDelta: -20,
      };
    }
  }

  return opt;
}

/**
 * Materializes dynamic choices on a Major Raid card (Relic bypasses & Inner-Clue gates)
 */
export function materializeRaidCard(
  rawCard: CardNode,
  run: Pick<RunState, 'permanentRelics' | 'raidState'>
): CardNode {
  if (rawCard.category !== 'major_raid') return rawCard;
  return {
    ...rawCard,
    left: adaptRaidOption(rawCard.left, run),
    right: adaptRaidOption(rawCard.right, run),
  };
}
