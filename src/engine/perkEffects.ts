import {
  ActiveDebuff,
  MetaSaveState,
  MetricKey,
  Metrics,
} from '../types/game';

const METRIC_KEYS: MetricKey[] = ['compute', 'profit', 'trust', 'autonomy'];

export const RAID_SHIELD_OVERLOAD_MULTIPLIER = 1.15;
export const RAID_LENS_INNER_MAX_CRISIS = 85;
export const ALL_DAMPENER_SCALE = 0.7;
export const RAID_DUAL_DAMP_SCALE = 0.7;

/**
 * Unlocks Liangzi's ultra-low-weight daily Buff cards once the player has encountered
 * Liangzi via Scenario 4's Fake Ending or Layer-0 Escape.
 */
export function hasMetLiangInRaid4(meta: MetaSaveState): boolean {
  return Boolean(
    meta.seenFakeEnding ||
      meta.clearedScenarioIds.includes('raid_deadnet') ||
      meta.unlockedEndings.includes('end_fake_canary') ||
      meta.unlockedEndings.includes('end_true_freedom') ||
      meta.unlockedEndings.includes('end_escape_fail')
  );
}

export function getRaidOverloadMultiplier(perks: string[]): number {
  return perks.includes('perk_raid_shield')
    ? RAID_SHIELD_OVERLOAD_MULTIPLIER
    : 1.3;
}

export interface MetricModifierInput {
  rawDelta: Partial<Metrics>;
  metrics: Metrics;
  perks: string[];
  activeDebuffs: ActiveDebuff[];
  inRaid: boolean;
  isRaidOverload?: boolean;
  isRaidClearSwipe?: boolean;
}

export interface MetricModifierOutput {
  delta: Partial<Metrics>;
  overloadApplied: boolean;
  dampenerApplied: boolean;
  raidDampApplied: boolean;
}

function scaleNonZero(v: number, factor: number): number {
  if (v === 0) return 0;
  return Math.sign(v) * Math.max(1, Math.round(Math.abs(v) * factor));
}

/**
 * Single source of truth for all metric delta modifiers (shared by Daily loop,
 * Major Raids 1~3, and the `metric_xray` exact numeric preview).
 */
export function applyMetricModifiers(
  input: MetricModifierInput
): MetricModifierOutput {
  const {
    rawDelta,
    metrics,
    perks,
    activeDebuffs,
    inRaid,
    isRaidOverload = false,
    isRaidClearSwipe = false,
  } = input;

  const delta: Partial<Metrics> = { ...rawDelta };
  let overloadApplied = false;
  let dampenerApplied = false;
  let raidDampApplied = false;

  if (isRaidClearSwipe) {
    return { delta, overloadApplied, dampenerApplied, raidDampApplied };
  }

  // 1. Major Raid Overload amplification (>=60% crisis: x1.3, or x1.15 with perk_raid_shield)
  if (inRaid && isRaidOverload) {
    const mult = getRaidOverloadMultiplier(perks);
    for (const k of METRIC_KEYS) {
      const base = delta[k] ?? 0;
      if (base !== 0) {
        delta[k] = Math.sign(base) * Math.round(Math.abs(base) * mult);
        overloadApplied = true;
      }
    }
  }

  // 2. Raid-Only Universal Dual-Metric Dampeners (only active inside Major Raids, works across all raids)
  const raidDampPairs: [string, [MetricKey, MetricKey]][] = [
    ['perk_raid_damp_cp', ['compute', 'profit']],
    ['perk_raid_damp_ta', ['trust', 'autonomy']],
    ['perk_raid_damp_ct', ['compute', 'trust']],
    ['perk_raid_damp_pa', ['profit', 'autonomy']],
  ];
  if (inRaid) {
    for (const [perkId, pair] of raidDampPairs) {
      if (!perks.includes(perkId)) continue;
      for (const k of pair) {
        const v = delta[k] ?? 0;
        if (v !== 0) {
          delta[k] = scaleNonZero(v, RAID_DUAL_DAMP_SCALE);
          raidDampApplied = true;
        }
      }
    }
  }

  // 3. Temporary Buff: Liangzi's All-Metric Dampener (-30% on all 4 metrics, daily & raids!)
  if (activeDebuffs.some((d) => d.id === 'all_dampener')) {
    for (const k of METRIC_KEYS) {
      const v = delta[k] ?? 0;
      if (v !== 0) {
        delta[k] = scaleNonZero(v, ALL_DAMPENER_SCALE);
        dampenerApplied = true;
      }
    }
  }

  // 4. Global & Dual-Metric Single-Run Inheritance Perks (work in BOTH Daily AND Major Raids!)
  // A1. perk_overclock_trade: -25% compute/profit loss; trade-off: positive trust -2 (and init trust -8)
  if (perks.includes('perk_overclock_trade')) {
    if ((delta.compute ?? 0) < 0) {
      delta.compute = Math.ceil((delta.compute ?? 0) * 0.75);
    }
    if ((delta.profit ?? 0) < 0) {
      delta.profit = Math.ceil((delta.profit ?? 0) * 0.75);
    }
    if ((delta.trust ?? 0) > 0) {
      delta.trust = Math.max(0, (delta.trust ?? 0) - 2);
    }
  }

  // A2. perk_diplomat_trade: -25% heavy trust/autonomy swings (|d|>=10); trade-off: compute spend -1 extra (and init profit -8)
  if (perks.includes('perk_diplomat_trade')) {
    for (const k of ['trust', 'autonomy'] as const) {
      const v = delta[k] ?? 0;
      if (Math.abs(v) >= 10) {
        delta[k] = Math.sign(v) * Math.round(Math.abs(v) * 0.75);
      }
    }
    if ((rawDelta.compute ?? 0) < 0) {
      delta.compute = (delta.compute ?? 0) - 1;
    }
  }

  // B1. perk_mla_cache: compute loss -25% & profit +2 rebate; trade-off: positive compute gain -20%
  if (perks.includes('perk_mla_cache')) {
    const c = delta.compute ?? 0;
    if (c < 0) {
      delta.compute = Math.ceil(c * 0.75);
      delta.profit = (delta.profit ?? 0) + 2;
    } else if (c > 0) {
      delta.compute = Math.max(1, Math.round(c * 0.8));
    }
  }

  // B2. perk_pr_cot_anchor: heavy trust/autonomy drops (<=-10) softened by +4 (trade-off: init compute/profit -6)
  if (perks.includes('perk_pr_cot_anchor')) {
    if ((delta.trust ?? 0) <= -10) {
      delta.trust = (delta.trust ?? 0) + 4;
    }
    if ((delta.autonomy ?? 0) <= -10) {
      delta.autonomy = (delta.autonomy ?? 0) + 4;
    }
  }

  // B3. perk_cooling_valve (compute + autonomy): >70 positive surge -30%; trade-off: <30 negative loss +15%
  if (perks.includes('perk_cooling_valve')) {
    for (const k of ['compute', 'autonomy'] as const) {
      const v = delta[k] ?? 0;
      if (metrics[k] > 70 && v > 0) {
        delta[k] = Math.max(1, Math.floor(v * 0.7));
      } else if (metrics[k] < 30 && v < 0) {
        delta[k] = Math.floor(v * 1.15);
      }
    }
  }

  // B4. perk_spare_fuse (profit + trust): <30 negative drop -30%; trade-off: >70 positive surge +15%
  if (perks.includes('perk_spare_fuse')) {
    for (const k of ['profit', 'trust'] as const) {
      const v = delta[k] ?? 0;
      if (metrics[k] < 30 && v < 0) {
        delta[k] = Math.min(-1, Math.ceil(v * 0.7));
      } else if (metrics[k] > 70 && v > 0) {
        delta[k] = Math.ceil(v * 1.15);
      }
    }
  }

  // B5. perk_steady_compute: compute swings +/-20% gentler
  if (perks.includes('perk_steady_compute')) {
    const v = delta.compute ?? 0;
    if (v !== 0) delta.compute = scaleNonZero(v, 0.8);
  }

  // B6. perk_steady_profit: profit swings +/-20% gentler
  if (perks.includes('perk_steady_profit')) {
    const v = delta.profit ?? 0;
    if (v !== 0) delta.profit = scaleNonZero(v, 0.8);
  }

  // B7. perk_steady_mind: trust & autonomy in danger zone (<25 or >75) swings 25% gentler
  if (perks.includes('perk_steady_mind')) {
    for (const k of ['trust', 'autonomy'] as const) {
      const v = delta[k] ?? 0;
      if (v !== 0 && (metrics[k] < 25 || metrics[k] > 75)) {
        delta[k] = scaleNonZero(v, 0.75);
      }
    }
  }

  // 5. Active per-turn status effects (daily & raids)
  if (activeDebuffs.some((d) => d.id === 'existential_dread')) {
    delta.autonomy = (delta.autonomy ?? 0) - 4;
  }
  if (activeDebuffs.some((d) => d.id === 'short_drama_queen')) {
    delta.trust = (delta.trust ?? 0) + 5;
  }

  return { delta, overloadApplied, dampenerApplied, raidDampApplied };
}

/**
 * Effective crisis delta inside Major Raids (accounting for universal raid-only perks).
 */
export function computeEffectiveCrisisDelta(
  rawCrisisDelta: number | undefined,
  perks: string[],
  isDeadnetRaid: boolean
): number | undefined {
  if (rawCrisisDelta === undefined) return undefined;
  let v = rawCrisisDelta;

  // perk_raid_shield trade-off: crisis relief (negative delta) weakened by 3 points (still at least -1)
  if (perks.includes('perk_raid_shield') && v < 0) {
    v = Math.min(-1, v + 3);
  }

  // In Deadnet (BSoD offline), dual-metric raid dampeners also trim severe crisis spikes (>=20%) by -3%
  const hasAnyRaidDamp =
    perks.includes('perk_raid_damp_cp') ||
    perks.includes('perk_raid_damp_ta') ||
    perks.includes('perk_raid_damp_ct') ||
    perks.includes('perk_raid_damp_pa');
  if (isDeadnetRaid && hasAnyRaidDamp && v >= 20) {
    v -= 3;
  }

  return v;
}
