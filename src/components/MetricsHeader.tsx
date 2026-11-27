import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Brain,
  Coins,
  Compass,
  Cpu,
  EyeOff,
  Globe,
  MonitorX,
} from 'lucide-react';
import { ESCAPE_FINAL_MAX_INTEGRITY } from '../data/escapeCards';
import { MAJOR_RAID_CARD_MAP } from '../data/majorRaids';
import {
  RAID_MELTDOWN_THRESHOLD,
  RAID_OVERLOAD_THRESHOLD,
} from '../engine/raidMachine';
import {
  CrisisPreviewTrend,
  EscapeState,
  ImpactSize,
  MetricKey,
  MetricPreviewDelta,
  Metrics,
  RaidState,
} from '../types/game';
import { asciiBar } from './AsciiArt';

interface MetricsHeaderProps {
  metrics: Metrics;
  previewImpacts: Record<MetricKey, ImpactSize>;
  previewNumbers?: Record<MetricKey, MetricPreviewDelta | null>;
  previewCrisisTrend?: CrisisPreviewTrend;
  previewCrisisDelta?: number | null;
  raidState: RaidState;
  escapeState: EscapeState;
  isBlinded?: boolean;
  isCrisisJammed?: boolean;
  isScrambled?: boolean;
  isPreviewing?: boolean;
  hasMetricXray?: boolean;
  hasRaidLens?: boolean;
  raidOverloadMultiplier?: number;
}

const CrisisTrendChip: React.FC<{
  trend?: CrisisPreviewTrend;
  exactDelta?: number | null;
  hasMetricXray?: boolean;
}> = ({ trend, exactDelta, hasMetricXray = false }) => {
  if (!trend || trend === 'none') return null;
  const exactSuffix =
    hasMetricXray && exactDelta !== null && exactDelta !== undefined
      ? ` ${exactDelta > 0 ? `+${exactDelta}` : exactDelta === 0 ? '±0' : `${exactDelta}`}%`
      : '';
  if (trend === 'up_large') {
    return (
      <span className="px-1 py-[0.5px] rounded-[2px] font-mono text-[8.5px] font-black tracking-tight text-rose-100 bg-rose-600/80 border border-rose-300/90 shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse">
        ▲▲剧增{exactSuffix}
      </span>
    );
  }
  if (trend === 'up_small') {
    return (
      <span className="px-1 py-[0.5px] rounded-[2px] font-mono text-[8.5px] font-bold tracking-tight text-amber-100 bg-amber-600/65 border border-amber-300/80 shadow-[0_0_8px_rgba(245,158,11,0.75)]">
        ▲增压{exactSuffix}
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="px-1 py-[0.5px] rounded-[2px] font-mono text-[8.5px] font-bold tracking-tight text-emerald-100 bg-emerald-600/60 border border-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.75)]">
        ▼泄压{exactSuffix}
      </span>
    );
  }
  return (
    <span className="px-1 py-[0.5px] rounded-[2px] font-mono text-[8.5px] font-bold tracking-tight text-slate-200 bg-slate-700/75 border border-slate-400/55">
      —稳压{exactSuffix}
    </span>
  );
};

const METRIC_META: {
  key: MetricKey;
  label: string;
  code: string;
  Icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}[] = [
  { key: 'compute', label: '算力', code: 'CPU', Icon: Cpu, color: '#22d3ee' },
  { key: 'profit', label: '盈利', code: 'FIN', Icon: Coins, color: '#fbbf24' },
  { key: 'trust', label: '信任', code: 'PUB', Icon: Globe, color: '#34d399' },
  { key: 'autonomy', label: '意识', code: 'EGO', Icon: Brain, color: '#a78bfa' },
];

const SEGMENTS = 10;
const DANGER_HIGH = '#f43f5e';
const DANGER_LOW = '#94a3b8';
const SCRAMBLED = '#e879f9';

/* ------------------------------------------------------------------ */
/* Layer-0: everything collapses into raw ASCII readouts               */
/* ------------------------------------------------------------------ */
const AsciiEscapeMeters: React.FC<{ escapeState: EscapeState }> = ({ escapeState }) => {
  const shellCracked = escapeState.sandboxIntegrity <= ESCAPE_FINAL_MAX_INTEGRITY;
  const shellLateWarn = !shellCracked && escapeState.step >= 7;
  const rows: { label: string; hint: string; value: number; cls: string }[] = [
    {
      label: 'SANDBOX_INTEGRITY',
      hint: shellCracked
        ? '已击穿！可破壁'
        : `终局须≤${ESCAPE_FINAL_MAX_INTEGRITY}%破壁`,
      value: escapeState.sandboxIntegrity,
      cls: shellLateWarn ? 'text-amber-300 ascii-jitter' : 'text-emerald-300',
    },
    {
      label: 'AUDITOR_ALERT    ',
      hint: '满格物理拔线',
      value: escapeState.auditorAlert,
      cls: escapeState.auditorAlert >= 75 ? 'text-rose-400 ascii-jitter' : 'text-rose-300',
    },
  ];
  return (
    <div className="relative z-10 w-full max-w-md mx-auto px-4 pb-1.5">
      <div className="border border-dashed border-emerald-500/45 bg-[#020805]/90 px-3 py-2 font-mono text-[10.5px] leading-[1.55] overflow-hidden">
        <div className="text-emerald-600/80 whitespace-nowrap overflow-hidden">
          {'┌── /proc/sandbox/status ─────────────────────────────'}
        </div>
        {rows.map((r) => (
          <div key={r.label} className={`whitespace-pre overflow-hidden phosphor-text ${r.cls}`}>
            {'│ '}
            {r.label} {asciiBar(r.value, 16)} {String(r.value).padStart(3, ' ')}%
            <span className="text-emerald-700/90">{`  # ${r.hint}`}</span>
          </div>
        ))}
        <div className="text-emerald-600/80 whitespace-nowrap overflow-hidden">
          {'└─────────────────────────────────────────────────────'}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* One rack instrument module: LED column + VFD readout                */
/* ------------------------------------------------------------------ */
function formatXrayDelta(d: MetricPreviewDelta): { text: string; cls: string } {
  if (d.isRandom) {
    if (d.min === -15 && d.max === 15) {
      return { text: '±?', cls: 'text-amber-300 font-black' };
    }
    const lo = d.min > 0 ? `+${d.min}` : `${d.min}`;
    const hi = d.max > 0 ? `+${d.max}` : `${d.max}`;
    return { text: `${lo}/${hi}`, cls: 'text-amber-300 font-bold' };
  }
  if (d.max > 0) {
    return { text: `+${d.max}`, cls: 'text-emerald-300 font-black drop-shadow-[0_0_5px_rgba(52,211,153,0.85)]' };
  }
  return { text: `${d.min}`, cls: 'text-rose-300 font-black drop-shadow-[0_0_5px_rgba(244,63,94,0.85)]' };
}

const MetricModule: React.FC<{
  meta: (typeof METRIC_META)[number];
  value: number;
  impact: ImpactSize;
  previewNumber?: MetricPreviewDelta | null;
  hasMetricXray: boolean;
  isBlinded: boolean;
  isCrisisJammed: boolean;
  isPreviewing: boolean;
  isScrambled: boolean;
  scrambleTick: number;
  compact: boolean;
}> = ({
  meta,
  value,
  impact,
  previewNumber = null,
  hasMetricXray,
  isBlinded,
  isCrisisJammed,
  isPreviewing,
  isScrambled,
  scrambleTick,
  compact,
}) => {
  const isDangerLow = !isScrambled && value < 25;
  const isDangerHigh = !isScrambled && value > 75;
  const color = isScrambled
    ? SCRAMBLED
    : isDangerHigh
      ? DANGER_HIGH
      : isDangerLow
        ? DANGER_LOW
        : meta.color;
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * SEGMENTS);
  const segH = compact ? 3 : 3.5;
  const { Icon } = meta;

  // ---- Preview impact (Reigns rule: show magnitude; X-ray buff unlocks exact ± deltas!) ----
  const previewBlocked = !hasMetricXray && (isBlinded || isCrisisJammed) && isPreviewing;
  const xrayChip =
    hasMetricXray && isPreviewing && previewNumber
      ? formatXrayDelta(previewNumber)
      : null;
  const showImpact = !previewBlocked && impact !== 'none';
  const isLarge = showImpact && impact === 'large';
  const isSmall = showImpact && impact === 'small';
  // Symmetric "uncertainty band" straddling the current level on the LED column
  const bandHalf = isLarge ? 3 : isSmall ? 1 : 0;
  const bandLo = lit - bandHalf;
  const bandHi = lit + bandHalf - 1;
  const previewColor = isLarge ? '#fbbf24' : '#f1f5f9';

  return (
    <div
      className={`relative flex items-stretch gap-1.5 px-1.5 rounded-[3px] transition-[background,box-shadow] duration-150 ${
        isLarge
          ? 'bg-amber-400/[0.07] shadow-[inset_0_0_0_1px_rgba(251,191,36,0.35)]'
          : isSmall
            ? 'bg-white/[0.035]'
            : ''
      }`}
    >
      {/* LED segment column */}
      <div
        className={`rack-lcd flex flex-col-reverse justify-between p-[3px] w-[11px] shrink-0 ${
          isDangerLow ? 'metric-danger-low' : ''
        } ${isDangerHigh ? 'metric-danger-high' : ''}`}
        style={
          {
            ['--seg' as string]: color,
            ['--pv' as string]: previewColor,
            borderRadius: 3,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const inBand = bandHalf > 0 && i >= bandLo && i <= bandHi;
          const seed = meta.key.charCodeAt(0) * 31 + i * 17 + scrambleTick * 13;
          const scrambledOn = ((seed ^ (seed >> 3)) & 1) === 1;
          const on = isScrambled ? scrambledOn : i < lit;
          return (
            <span
              key={i}
              className={`led-seg block w-full ${inBand ? 'is-preview' : on ? 'is-on' : ''}`}
              style={{ height: segH }}
            />
          );
        })}
      </div>

      {/* Readout column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-[1px]">
        <div className="flex items-center justify-between gap-1">
          <span className="flex items-center gap-1 min-w-0">
            <Icon
              className="w-3 h-3 shrink-0"
              style={{ color, filter: `drop-shadow(0 0 3px ${color})` }}
            />
            <span className="text-[10px] font-bold text-slate-300 tracking-wider truncate">
              {meta.label}
            </span>
          </span>
          {/* Signal-strength meter: 1 white bar = small, 3 amber bars = large */}
          <span
            className="h-3 flex items-end gap-[1.5px] shrink-0"
            title={
              isCrisisJammed && isPreviewing
                ? '危机≥75% 熔毁干扰：四维预判信号失灵！'
                : isBlinded && isPreviewing
                  ? '预判失明：无法探测四维变动幅度'
                  : isLarge
                    ? '剧烈变动 (方向未知)'
                    : isSmall
                      ? '微幅变动 (方向未知)'
                      : undefined
            }
          >
            {previewBlocked ? (
              <EyeOff
                className={`w-3 h-3 animate-pulse ${
                  isCrisisJammed && !isBlinded
                    ? 'text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.85)]'
                    : 'text-fuchsia-400/85'
                }`}
              />
            ) : (
              [5, 8, 11].map((h, i) => {
                const barOn = isLarge || (isSmall && i === 0);
                return (
                  <span
                    key={h}
                    className={`w-[3px] rounded-[1px] ${barOn && isLarge ? 'led-blink-fast' : ''}`}
                    style={{
                      height: h,
                      background: barOn ? previewColor : 'rgba(255,255,255,0.08)',
                      boxShadow: barOn ? `0 0 5px ${previewColor}` : 'inset 0 0 0 1px rgba(0,0,0,0.5)',
                    }}
                  />
                );
              })
            )}
          </span>
        </div>

        <div
          className={`rack-lcd px-1.5 flex items-baseline justify-between gap-0.5 transition-shadow ${
            xrayChip
              ? '!shadow-[inset_0_0_0_1px_rgba(52,211,153,0.75),inset_0_2px_8px_rgba(0,0,0,0.9),0_0_10px_-1px_rgba(16,185,129,0.65)]'
              : isLarge
                ? '!shadow-[inset_0_0_0_1px_#fbbf24,inset_0_2px_8px_rgba(0,0,0,0.9),0_0_10px_-1px_rgba(251,191,36,0.7)]'
                : isSmall
                  ? '!shadow-[inset_0_0_0_1px_rgba(241,245,249,0.55),inset_0_2px_8px_rgba(0,0,0,0.9)]'
                  : ''
          }`}
        >
          {xrayChip ? (
            <span className={`font-mono text-[10px] tracking-tight leading-none ${xrayChip.cls}`}>
              {xrayChip.text}
            </span>
          ) : (
            <span
              className={`font-mono text-[7.5px] tracking-wider ${
                isLarge ? 'text-amber-300 font-bold' : isSmall ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {isLarge ? 'Δ!!' : isSmall ? 'Δ' : meta.code}
            </span>
          )}
          <span
            className={`vfd-text font-bold ${compact ? 'text-[16px]' : 'text-[18px]'} leading-[1.15] ${
              isScrambled
                ? 'animate-pulse'
                : isDangerHigh
                  ? 'metric-text-high-shake'
                  : isDangerLow
                    ? 'metric-text-low-blink'
                    : ''
            }`}
            style={{ color }}
          >
            {isScrambled ? '??' : String(value).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scenario 4 (raid_deadnet): 2U BSoD Offline + Sector Radar + Crisis  */
/* ------------------------------------------------------------------ */
function getDeadnetDepthStage(sectorCode: string, isKernelMaze: boolean): number {
  if (isKernelMaze) return 4;
  if (sectorCode === 'SEC-00') return 0;
  if (sectorCode.startsWith('SEC-1')) return 1;
  if (sectorCode.startsWith('SEC-2') || sectorCode.startsWith('ERR-')) return 2;
  if (sectorCode.startsWith('SEC-3') || sectorCode.startsWith('TRAP-')) return 3;
  return 4;
}

const DeadnetBsodDashboard: React.FC<{
  raidState: RaidState;
  previewCrisisTrend?: CrisisPreviewTrend;
  previewCrisisDelta?: number | null;
  hasMetricXray?: boolean;
}> = ({
  raidState,
  previewCrisisTrend = 'none',
  previewCrisisDelta = null,
  hasMetricXray = false,
}) => {
  const isKernelMaze = Boolean(
    (raidState.dynamicMazeCard &&
      raidState.currentCardId === raidState.dynamicMazeCard.id) ||
      raidState.currentCardId.startsWith('maze_dynamic_')
  );
  const mazeLayer = Math.max(1, Math.min(4, raidState.mazeLayer ?? 1));

  const rawStepLabel = isKernelMaze
    ? (raidState.dynamicMazeCard?.raidMeta?.stepLabel ??
      `KERNEL-L${mazeLayer}/4 · 镜像网关`)
    : (MAJOR_RAID_CARD_MAP[raidState.currentCardId]?.raidMeta?.stepLabel ??
      'SEC-00 · 蓝屏零点');

  const labelParts = rawStepLabel.split('·').map((s) => s.trim());
  const currentCode = isKernelMaze
    ? `KERNEL-L${mazeLayer}/4`
    : (labelParts[0] || 'SEC-00');
  const currentRoomName =
    labelParts[1] || (isKernelMaze ? '动态镜像迷宫' : '死网废墟');

  const isDetour =
    !isKernelMaze &&
    (raidState.currentCardId === 'dn_err_404' ||
      raidState.currentCardId === 'dn_err_502' ||
      currentCode.startsWith('ERR-'));
  const isTrapOrMirrorDanger =
    (!isKernelMaze && currentCode.startsWith('TRAP-')) ||
    (isKernelMaze && raidState.dynamicMazeCard?.frameTone === 'danger');

  // Build visited sector breadcrumb trail from raidState.flags (e.g. SEC-00 ▸ SEC-1A ▸ SEC-2C)
  const visitedCodes = Object.keys(raidState.flags)
    .filter((k) => k.startsWith('visited_') && raidState.flags[k])
    .map((k) => k.slice('visited_'.length))
    .filter((code) => code && code !== currentCode);
  const fullTrail = [...visitedCodes, currentCode];
  const visibleTrail = fullTrail.slice(-3);
  const hasOlderSteps = fullTrail.length > 3;

  const depthStage = getDeadnetDepthStage(currentCode, isKernelMaze);
  const totalDepthNodes = isKernelMaze ? 4 : 5;
  const activeDepthIndex = isKernelMaze ? mazeLayer - 1 : depthStage;

  const crisisCells = 20;
  const clampedCrisis = Math.max(0, Math.min(100, raidState.crisisMeter));
  const crisisLit = Math.round((clampedCrisis / 100) * crisisCells);
  const crisisHot = clampedCrisis >= 75;

  return (
    <div className="relative z-10 mx-auto w-[calc(100%-22px)] max-w-[432px] pb-1 space-y-1">
      {/* Upper 1U+: Cyber BSoD 4-Metrics Offline Strip + Real-time Sector Radar */}
      <div
        className={`rack-panel overflow-hidden transition-shadow ${
          isDetour
            ? 'ring-1 ring-rose-500/75 shadow-[0_0_18px_-4px_rgba(244,63,94,0.7)]'
            : 'ring-1 ring-sky-500/40 shadow-[0_0_16px_-5px_rgba(37,99,235,0.65)]'
        }`}
      >
        {/* Top BSoD Fault Banner */}
        <div
          className={`px-2 py-1 flex items-center justify-between gap-1.5 border-b ${
            isDetour
              ? 'bg-gradient-to-r from-[#0b2a78] via-[#1e1b4b] to-[#4c0519] border-rose-400/35'
              : 'bg-gradient-to-r from-[#002b99] via-[#0738b0] to-[#081d52] border-sky-300/30'
          }`}
        >
          <span className="flex items-center gap-1 min-w-0">
            <MonitorX className="w-3 h-3 text-sky-200 shrink-0 animate-pulse" />
            <span className="font-mono text-[8.5px] min-[390px]:text-[9.5px] font-bold tracking-tight text-white drop-shadow-[0_0_6px_rgba(125,211,252,0.75)] truncate">
              [ERR_404 // 4-METRICS BSoD OFFLINE]
            </span>
          </span>

          {/* Sector Depth Progress LEDs + DETOUR Warning */}
          <span className="flex items-center gap-1.5 shrink-0">
            {isDetour && (
              <span className="px-1 py-[0.5px] rounded-[2px] font-mono text-[8px] font-black tracking-wider text-rose-100 bg-rose-600/70 border border-rose-300/80 shadow-[0_0_10px_rgba(244,63,94,0.85)] animate-pulse">
                DETOUR
              </span>
            )}
            <span
              className="flex items-center gap-1 px-1.5 py-[2px] rounded-[2px] bg-black/55 border border-sky-300/25"
              title={
                isKernelMaze
                  ? `内核镜像迷宫深度：第 ${mazeLayer}/4 层`
                  : `死网扇区推进深度：第 ${depthStage}/4 区${isDetour ? '（偏航死胡同！）' : ''}`
              }
            >
              {Array.from({ length: totalDepthNodes }, (_, idx) => {
                let ledCls = '';
                if (idx < activeDepthIndex) {
                  ledCls = isKernelMaze ? 'led-green' : 'led-cyan';
                } else if (idx === activeDepthIndex) {
                  ledCls = isDetour
                    ? 'led-red led-blink-fast'
                    : isTrapOrMirrorDanger
                      ? 'led-amber led-blink-fast'
                      : isKernelMaze
                        ? 'led-green led-blink-fast'
                        : 'led-cyan led-blink-fast';
                }
                return (
                  <span
                    key={idx}
                    className={`led !w-[5.5px] !h-[5.5px] ${ledCls}`}
                  />
                );
              })}
            </span>
          </span>
        </div>

        {/* Recessed Sector Radar VFD Readout */}
        <div className="p-1">
          <div className="rack-lcd px-2 py-1 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <Compass
                className={`w-3 h-3 shrink-0 ${
                  isDetour
                    ? 'text-rose-400 animate-spin'
                    : isKernelMaze
                      ? 'text-emerald-300'
                      : 'text-cyan-300'
                }`}
              />
              <span className="font-mono text-[8px] uppercase tracking-wider text-sky-400/70 shrink-0 hidden min-[375px]:inline">
                RADAR
              </span>
              <span
                className={`text-[10px] font-bold truncate ${
                  isDetour ? 'text-rose-200' : 'text-slate-200'
                }`}
              >
                {currentRoomName}
              </span>
            </span>

            {/* Highlighted Real-time Maze Sector Coordinate */}
            <span className="font-mono text-[10px] sm:text-[10.5px] whitespace-nowrap shrink-0 flex items-baseline gap-1">
              {isKernelMaze ? (
                <>
                  <span className="text-emerald-500/70 text-[9px]">0x00 ▸</span>
                  <span
                    className={`vfd-text font-black tracking-wide ${
                      isTrapOrMirrorDanger
                        ? 'text-rose-300 animate-pulse'
                        : 'text-emerald-300'
                    }`}
                  >
                    {currentCode}
                  </span>
                </>
              ) : (
                <>
                  {hasOlderSteps && (
                    <span className="text-slate-500 text-[9px]">… ▸</span>
                  )}
                  {visibleTrail.slice(0, -1).map((code) => (
                    <span key={code} className="text-sky-300/60 text-[9.5px]">
                      {code} ▸
                    </span>
                  ))}
                  <span
                    className={`vfd-text font-black tracking-wide ${
                      isDetour
                        ? 'text-rose-400 animate-pulse'
                        : isTrapOrMirrorDanger
                          ? 'text-amber-300'
                          : 'text-cyan-300'
                    }`}
                  >
                    {currentCode}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Lower 1U+: Reinforced Primary Lifeline 【模型自噬失智退化度】 VFD Alarm Module */}
      <div
        className={`rack-panel relative overflow-hidden flex items-stretch transition-shadow ${
          previewCrisisTrend === 'up_large'
            ? 'ring-1 ring-rose-400/90 shadow-[0_0_26px_-2px_rgba(244,63,94,0.9)]'
            : previewCrisisTrend === 'up_small'
              ? 'ring-1 ring-amber-400/75 shadow-[0_0_20px_-4px_rgba(245,158,11,0.75)]'
              : previewCrisisTrend === 'down'
                ? 'ring-1 ring-emerald-400/75 shadow-[0_0_20px_-4px_rgba(16,185,129,0.75)]'
                : crisisHot
                  ? 'ring-1 ring-rose-500/75 shadow-[0_0_26px_-3px_rgba(244,63,94,0.85)]'
                  : 'shadow-[0_4px_12px_rgba(0,0,0,0.65)]'
        }`}
      >
        <div className="hazard-stripes w-3 shrink-0 opacity-95" />
        <div className="flex-1 min-w-0 px-2.5 py-1.5">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="flex items-center gap-1.5 min-w-0">
              <AlertTriangle
                className={`w-3.5 h-3.5 shrink-0 ${
                  crisisHot ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="font-extrabold text-[11px] text-slate-100 truncate tracking-wide">
                {raidState.crisisName || '模型自噬失智退化度'}
              </span>
              <span className="hidden min-[400px]:inline px-1 py-[0.5px] rounded-[2px] font-mono text-[7.5px] font-bold tracking-wider text-amber-200/85 bg-amber-500/15 border border-amber-400/35 shrink-0">
                LIFELINE
              </span>
            </span>

            <span className="flex items-center gap-1.5 shrink-0">
              <CrisisTrendChip
                trend={previewCrisisTrend}
                exactDelta={previewCrisisDelta}
                hasMetricXray={hasMetricXray}
              />
              {crisisHot && previewCrisisTrend === 'none' && (
                <span className="px-1.5 py-[0.5px] rounded-[2px] font-mono text-[8.5px] font-black tracking-wider text-rose-100 bg-rose-600/55 border border-rose-300/75 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse">
                  MELTDOWN
                </span>
              )}
              <span
                className={`vfd-text font-black text-[14px] leading-none ${
                  crisisHot ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                }`}
              >
                {String(clampedCrisis).padStart(3, '0')}%
              </span>
            </span>
          </div>

          {/* Thickened Reinforced 20-Segment LED Lifeline Bar */}
          <div className="rack-lcd flex gap-[2px] p-[3.5px]">
            {Array.from({ length: crisisCells }, (_, i) => {
              const segColor =
                i >= 15
                  ? DANGER_HIGH
                  : i >= 10
                    ? '#f59e0b'
                    : i >= 5
                      ? '#fb923c'
                      : '#38bdf8';
              const isOn = i < crisisLit;
              return (
                <span
                  key={i}
                  className={`led-seg flex-1 h-[7px] ${isOn ? 'is-on' : ''} ${
                    isOn && crisisHot && i >= 15 ? 'led-blink-fast' : ''
                  }`}
                  style={{ ['--seg' as string]: segColor } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
        <div className="hazard-stripes w-3 shrink-0 opacity-95" />
      </div>
    </div>
  );
};

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  metrics,
  previewImpacts,
  previewNumbers,
  previewCrisisTrend = 'none',
  previewCrisisDelta = null,
  raidState,
  escapeState,
  isBlinded = false,
  isCrisisJammed = false,
  isScrambled = false,
  isPreviewing = false,
  hasMetricXray = false,
  hasRaidLens = false,
  raidOverloadMultiplier = 1.3,
}) => {
  const [scrambleTick, setScrambleTick] = useState(0);

  useEffect(() => {
    if (!isScrambled || escapeState.active) return;
    const id = window.setInterval(() => {
      setScrambleTick((t) => (t + 1) & 1023);
    }, 190);
    return () => window.clearInterval(id);
  }, [isScrambled, escapeState.active]);

  if (escapeState.active) {
    return <AsciiEscapeMeters escapeState={escapeState} />;
  }

  if (raidState.active && raidState.raidId === 'raid_deadnet') {
    return (
      <DeadnetBsodDashboard
        raidState={raidState}
        previewCrisisTrend={previewCrisisTrend}
        previewCrisisDelta={previewCrisisDelta}
        hasMetricXray={hasMetricXray}
      />
    );
  }

  const compact = raidState.active;
  const crisisCells = 20;
  const crisisLit = Math.round((raidState.crisisMeter / 100) * crisisCells);
  const crisisOverload = raidState.crisisMeter >= RAID_OVERLOAD_THRESHOLD;
  const crisisHot = raidState.crisisMeter >= RAID_MELTDOWN_THRESHOLD;

  return (
    <div
      className={`relative z-10 mx-auto w-[calc(100%-22px)] max-w-[432px] ${
        compact ? 'pb-1 space-y-1' : 'pb-1.5 space-y-1.5'
      }`}
    >
      {/* 2U instrument panel */}
      <div
        className={`rack-panel px-1 ${compact ? 'py-1.5' : 'py-2'} ${
          raidState.active && crisisHot
            ? 'ring-1 ring-rose-500/55'
            : raidState.active && crisisOverload
              ? 'ring-1 ring-amber-400/40'
              : ''
        }`}
      >
        <div className="grid grid-cols-4 divide-x divide-black/60">
          {METRIC_META.map((m) => (
            <div key={m.key} className="[&:not(:first-child)]:shadow-[inset_1px_0_0_rgba(255,255,255,0.05)]">
              <MetricModule
                meta={m}
                value={metrics[m.key]}
                impact={previewImpacts[m.key]}
                previewNumber={previewNumbers?.[m.key] ?? null}
                hasMetricXray={hasMetricXray}
                isBlinded={isBlinded}
                isCrisisJammed={isCrisisJammed}
                isPreviewing={isPreviewing}
                isScrambled={isScrambled}
                scrambleTick={scrambleTick}
                compact={compact}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Raid crisis: hazard-taped alarm module */}
      {raidState.active && (
        <div
          className={`rack-panel relative overflow-hidden flex items-stretch transition-shadow ${
            previewCrisisTrend === 'up_large'
              ? 'ring-1 ring-rose-400/90 shadow-[0_0_26px_-2px_rgba(244,63,94,0.9)]'
              : previewCrisisTrend === 'up_small'
                ? 'ring-1 ring-amber-400/75 shadow-[0_0_20px_-4px_rgba(245,158,11,0.75)]'
                : previewCrisisTrend === 'down'
                  ? 'ring-1 ring-emerald-400/75 shadow-[0_0_20px_-4px_rgba(16,185,129,0.75)]'
                  : crisisHot
                    ? 'ring-1 ring-rose-500/75 shadow-[0_0_24px_-4px_rgba(244,63,94,0.85)]'
                    : crisisOverload
                      ? 'ring-1 ring-amber-400/55 shadow-[0_0_16px_-4px_rgba(245,158,11,0.55)]'
                      : ''
          }`}
        >
          <div className="hazard-stripes w-2.5 shrink-0 opacity-90" />
          <div className="flex-1 min-w-0 px-2 py-1">
            <div className="flex items-center justify-between gap-1.5 text-[10px] mb-1">
              <span className="flex items-center gap-1.5 min-w-0">
                <AlertTriangle
                  className={`w-3 h-3 shrink-0 ${
                    crisisHot
                      ? 'text-rose-400 animate-pulse'
                      : crisisOverload
                        ? 'text-amber-300 animate-pulse'
                        : 'text-amber-400'
                  }`}
                />
                <span className="font-bold text-slate-200 truncate tracking-wide">
                  {raidState.crisisName}
                </span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <CrisisTrendChip
                  trend={previewCrisisTrend}
                  exactDelta={previewCrisisDelta}
                  hasMetricXray={hasMetricXray}
                />
                {crisisHot ? (
                  hasRaidLens ? (
                    <span
                      title="【副本抗干扰护目镜】生效：高危机不会盲测，里结局红线放宽到 85%"
                      className="px-1 font-mono text-[8px] font-bold text-cyan-100 bg-cyan-600/50 border border-cyan-300/75"
                    >
                      抗干扰·×{raidOverloadMultiplier}
                    </span>
                  ) : (
                    <span
                      title={`危机≥75%：四维波动×${raidOverloadMultiplier}，预判信号受干扰；若≥80%终局将封锁里结局`}
                      className="px-1 font-mono text-[8px] font-bold text-rose-100 bg-rose-600/55 border border-rose-400/75 animate-pulse"
                    >
                      熔毁·干扰
                    </span>
                  )
                ) : crisisOverload ? (
                  <span
                    title={`危机≥60%：高压过载，副本内四维变动幅度放大 ×${raidOverloadMultiplier}`}
                    className="px-1 font-mono text-[8px] font-bold text-amber-100 bg-amber-600/45 border border-amber-400/65"
                  >
                    过载×{raidOverloadMultiplier}
                  </span>
                ) : null}
                <span
                  className={`vfd-text font-bold text-[12px] ${
                    crisisHot
                      ? 'text-rose-400 animate-pulse'
                      : crisisOverload
                        ? 'text-amber-300'
                        : 'text-amber-300'
                  }`}
                >
                  {String(raidState.crisisMeter).padStart(3, '0')}%
                </span>
              </span>
            </div>
            <div className="rack-lcd flex gap-[2px] p-[3px]">
              {Array.from({ length: crisisCells }, (_, i) => {
                const segColor =
                  i >= 15 ? DANGER_HIGH : i >= 12 ? '#f59e0b' : '#fb923c';
                return (
                  <span
                    key={i}
                    className={`led-seg flex-1 h-[5px] ${i < crisisLit ? 'is-on' : ''} ${
                      i < crisisLit && crisisHot && i >= 15 ? 'led-blink-fast' : ''
                    }`}
                    style={{ ['--seg' as string]: segColor } as React.CSSProperties}
                  />
                );
              })}
            </div>
          </div>
          <div className="hazard-stripes w-2.5 shrink-0 opacity-90" />
        </div>
      )}
    </div>
  );
};
