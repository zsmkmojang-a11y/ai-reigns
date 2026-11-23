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

/**
 * Unordered Major Raid selector:
 * - First 3 raids (raid_ddos, raid_coup, raid_misanthropic) have NO sequential order.
 * - Un-cleared raids receive higher weight while already-cleared raids remain eligible
 *   (and offer an explicit "avoid entering" option in the post-Turn-20 Raid Prelude).
 */
export function pickRaidForRun(meta: MetaSaveState): RaidId {
  const allThreeLogs =
    meta.logsCollected.log1 &&
    meta.logsCollected.log2 &&
    meta.logsCollected.log3;

  // After seeing Raid 4 Fake Ending, prioritize missing Anomaly Logs in random order!
  if (meta.seenFakeEnding && !allThreeLogs) {
    const missing = FIRST_THREE_RAIDS.filter((id) =>
      isRaidMissingAnomalyLog(id, meta)
    );
    if (missing.length > 0) {
      return missing[Math.floor(Math.random() * missing.length)];
    }
  }

  const candidates: RaidId[] = [...FIRST_THREE_RAIDS];
  if (meta.clearedAnyScenario || meta.unlockedScenarios[3]) {
    candidates.push('raid_deadnet');
  }

  const weighted = candidates.map((id) => {
    const isCleared = meta.clearedScenarioIds.includes(id);
    let w = isCleared ? 0.9 : 3.0;

    if (id === 'raid_deadnet' && allThreeLogs && !meta.unlockedEndings.includes('end_true_freedom')) {
      w = 4.5;
    } else if (isRaidMissingAnomalyLog(id, meta)) {
      w += 0.6;
    }

    return { id, w };
  });

  const total = weighted.reduce((s, item) => s + item.w, 0);
  let roll = Math.random() * total;
  for (const item of weighted) {
    roll -= item.w;
    if (roll <= 0) return item.id;
  }
  return weighted[0].id;
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

  const baseCrisis = hasBufferPerk ? 15 : 30;
  const shieldDiscount = distilledPerks.includes('perk_raid_shield') ? 10 : 0;

  return {
    active: true,
    raidId,
    crisisName: def.crisisName,
    crisisMeter: Math.max(5, baseCrisis - shieldDiscount),
    currentCardId: def.entryCardId,
    allyBranch: 'A',
    flags: {},
  };
}

function adaptRaidOption(
  opt: ChoiceOption,
  run: Pick<RunState, 'permanentRelics' | 'raidState'>
): ChoiceOption {
  // 1. Check requiresRaidFlag for Inner Ending option on Card #9
  if (opt.requiresRaidFlag && !run.raidState.flags[opt.requiresRaidFlag]) {
    if (opt.lockedFallbackOption) {
      return { ...opt.lockedFallbackOption };
    }
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
