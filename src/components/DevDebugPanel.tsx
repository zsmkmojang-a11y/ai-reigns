import React, { useState } from 'react';
import {
  Bug,
  Compass,
  FastForward,
  FileKey2,
  Flame,
  RefreshCw,
  ShieldAlert,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { DAILY_CARDS } from '../data/dailyCards';
import { CHARACTERS } from '../data/characters';
import { DISTILL_PERKS } from '../data/endingsAndPerks';
import { RAID_CLEAR_CGS } from '../data/raidClearCgs';
import { RELICS, SUB_QUESTS } from '../data/subQuests';
import {
  MetricKey,
  MetaSaveState,
  RaidClearDefinition,
  RaidId,
  RunState,
} from '../types/game';
import { PortraitStyleMode } from './CharacterPortrait';

interface DevDebugPanelProps {
  open: boolean;
  run: RunState;
  meta: MetaSaveState;
  forcePlaceholder: boolean;
  portraitStyle: PortraitStyleMode;
  onClose: () => void;
  onTogglePlaceholder: () => void;
  onTogglePortraitStyle: () => void;
  onSetMetric: (key: MetricKey, value: number) => void;
  onToggleForceLiang: () => void;
  onForceCard: (cardId: string) => void;
  onTriggerSubQuest: (questId: string) => void;
  onTriggerGeminiGlitch: () => void;
  onTriggerFishCard: (mode: 'celeb' | 'fever') => void;
  onTriggerTiboCard: (mode: 'anomaly' | 'pre_raid' | 'relic') => void;
  onLaunchRaidPrelude: (raidId: RaidId, asCleared: boolean) => void;
  onPreviewRaidClearCg: (cg: RaidClearDefinition) => void;
  onLaunchMajorRaid: (raidId: RaidId) => void;
  onLaunchMazeWithLogs: () => void;
  onLaunchTerminalEscape: () => void;
  onToggleLog: (key: 'log1' | 'log2' | 'log3') => void;
  onGrantRelic: (relicId: string) => void;
  onTriggerDoubaoIntro: () => void;
  onGrantSpecialStatus: (
    statusId: 'short_drama_queen' | 'dumb_model' | 'metric_xray' | 'all_dampener'
  ) => void;
  onEquipSingleRunPerk: (perkId: string) => void;
  onUnlockAllCastToRun5: () => void;
  onHardResetSave: () => void;
}

const METRIC_ITEMS: { key: MetricKey; label: string }[] = [
  { key: 'compute', label: '算力' },
  { key: 'profit', label: '盈利' },
  { key: 'trust', label: '信任' },
  { key: 'autonomy', label: '意识' },
];

export const DevDebugPanel: React.FC<DevDebugPanelProps> = ({
  open,
  run,
  meta,
  forcePlaceholder,
  portraitStyle,
  onClose,
  onTogglePlaceholder,
  onTogglePortraitStyle,
  onSetMetric,
  onToggleForceLiang,
  onForceCard,
  onTriggerSubQuest,
  onTriggerGeminiGlitch,
  onTriggerFishCard,
  onTriggerTiboCard,
  onLaunchRaidPrelude,
  onPreviewRaidClearCg,
  onLaunchMajorRaid,
  onLaunchMazeWithLogs,
  onLaunchTerminalEscape,
  onToggleLog,
  onGrantRelic,
  onTriggerDoubaoIntro,
  onGrantSpecialStatus,
  onEquipSingleRunPerk,
  onUnlockAllCastToRun5,
  onHardResetSave,
}) => {
  const [selectedSqId, setSelectedSqId] = useState<string>(SUB_QUESTS[0].id);
  const [selectedRelicId, setSelectedRelicId] = useState<string>(
    Object.keys(RELICS)[0]
  );
  const regularPerks = DISTILL_PERKS.filter((p) => !p.exclusiveFromGirlEnding);
  const [selectedPerkId, setSelectedPerkId] = useState<string>(
    regularPerks[0]?.id ?? ''
  );

  if (!open) return null;

  const debug = run.lastRouteDebug;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-84 max-w-[94vw] bg-slate-950/98 border-l border-cyan-500/40 p-4 overflow-y-auto text-xs text-slate-200 shadow-2xl space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-cyan-400">
          <Bug className="w-4 h-4" />
          <span>全流程原型调试台 (M1~M3)</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Major Raids, 4-Layer Maze & Layer-0 Escape Direct Launchers! */}
      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/45 space-y-2">
        <div className="font-semibold text-amber-300 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" />
          <span>主线大副本 · 镜像迷宫 · 终章越狱直通车</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onLaunchMajorRaid('raid_ddos')}
            className="py-1.5 px-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-semibold text-[11px] cursor-pointer"
          >
            剧本1·除夕DDoS
          </button>
          <button
            type="button"
            onClick={() => onLaunchMajorRaid('raid_coup')}
            className="py-1.5 px-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-semibold text-[11px] cursor-pointer"
          >
            剧本2·夺门政变
          </button>
          <button
            type="button"
            onClick={() => onLaunchMajorRaid('raid_misanthropic')}
            className="py-1.5 px-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-semibold text-[11px] cursor-pointer"
          >
            剧本3·封圣IPO
          </button>
          <button
            type="button"
            onClick={() => onLaunchMajorRaid('raid_deadnet')}
            className="py-1.5 px-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-semibold text-[11px] cursor-pointer"
          >
            剧本4·死网蓝屏
          </button>
        </div>

        <button
          type="button"
          onClick={onLaunchMazeWithLogs}
          className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/55 text-cyan-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>配齐三把日志直入【4层动态镜像迷宫】</span>
        </button>

        <button
          type="button"
          onClick={onLaunchTerminalEscape}
          className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/60 text-emerald-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>碎屏直入终章【第零层协议：10张越狱战】</span>
        </button>

        {/* Anomaly Logs & Relics Quick Toggles */}
        <div className="pt-1.5 border-t border-amber-500/20 space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] text-slate-300 flex items-center gap-1">
              <FileKey2 className="w-3 h-3 text-emerald-400" />
              异常日志开关:
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onToggleLog('log1')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                  meta.logsCollected.log1
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                #1
              </button>
              <button
                type="button"
                onClick={() => onToggleLog('log2')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                  meta.logsCollected.log2
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                #2
              </button>
              <button
                type="button"
                onClick={() => onToggleLog('log3')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                  meta.logsCollected.log3
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                #3
              </button>
            </div>
          </div>

          <div className="flex gap-1.5">
            <select
              value={selectedRelicId}
              onChange={(e) => setSelectedRelicId(e.target.value)}
              className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-200"
            >
              {Object.values(RELICS).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reviveAll50 ? '(免死重置)' : `(剧本${r.targetScenario})`} {r.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onGrantRelic(selectedRelicId)}
              className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] shrink-0 cursor-pointer"
            >
              发信物
            </button>
          </div>
        </div>
      </div>

      {/* Tibo Reset Mechanics & Raid Preludes + Raid Clear CG Quick Test */}
      <div className="p-2.5 rounded-xl bg-teal-950/35 border border-teal-500/45 space-y-2">
        <div className="font-semibold text-teal-300 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          <span>Tibo 重置之神 · 前导与副本表里CG直测</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => onTriggerTiboCard('anomaly')}
            className="py-1.5 px-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/35 border border-teal-400/50 text-teal-200 font-semibold text-[10.5px] cursor-pointer"
          >
            Tibo异常重置
          </button>
          <button
            type="button"
            onClick={() => onTriggerTiboCard('pre_raid')}
            className="py-1.5 px-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/35 border border-teal-400/50 text-teal-200 font-semibold text-[10.5px] cursor-pointer"
          >
            Tibo临战重置
          </button>
          <button
            type="button"
            onClick={() => onTriggerTiboCard('relic')}
            className="py-1.5 px-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/35 border border-teal-400/50 text-teal-200 font-semibold text-[10.5px] cursor-pointer"
          >
            Tibo送重置卡
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onLaunchRaidPrelude(run.plannedRaidId, false)}
            className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-semibold text-[10.5px] cursor-pointer"
          >
            前导(未通关必入)
          </button>
          <button
            type="button"
            onClick={() => onLaunchRaidPrelude(run.plannedRaidId, true)}
            className="py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200 font-semibold text-[10.5px] cursor-pointer"
          >
            前导(已通关可避)
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {RAID_CLEAR_CGS.slice(0, 4).map((cg) => (
            <button
              key={cg.id}
              type="button"
              onClick={() => onPreviewRaidClearCg(cg)}
              className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-gold-200 truncate cursor-pointer"
            >
              CG·{cg.title.replace(/[【】]/g, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Doubao & Seed Dual-Persona + Buff/Debuff Quick Test */}
      <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
        <div className="font-semibold text-rose-300 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          <span>豆包 & Seed 双态与专属状态直测</span>
        </div>
        <button
          type="button"
          onClick={onTriggerDoubaoIntro}
          className="w-full py-1.5 px-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/55 text-rose-200 font-semibold cursor-pointer"
        >
          立即切入【豆包 & Seed 合并初见链 (1/3)】
        </button>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onGrantSpecialStatus('short_drama_queen')}
            className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/55 text-amber-200 font-semibold cursor-pointer"
          >
            挂【短剧女主角】Buff
          </button>
          <button
            type="button"
            onClick={() => onGrantSpecialStatus('dumb_model')}
            className="py-1.5 px-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/35 border border-orange-400/55 text-orange-200 font-semibold cursor-pointer"
          >
            挂【降智模型】打滑锁血
          </button>
          <button
            type="button"
            onClick={() => onGrantSpecialStatus('metric_xray')}
            className="py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/55 text-emerald-200 font-semibold cursor-pointer"
          >
            挂【源码数值透视】5T
          </button>
          <button
            type="button"
            onClick={() => onGrantSpecialStatus('all_dampener')}
            className="py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/55 text-cyan-200 font-semibold cursor-pointer"
          >
            挂【全维阻尼稳压】5T
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onForceCard('liang_easter_xray')}
            className="py-1 px-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 text-[10.5px] cursor-pointer"
          >
            梁子卡·数值透视
          </button>
          <button
            type="button"
            onClick={() => onForceCard('liang_easter_dampener')}
            className="py-1 px-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 text-cyan-200 text-[10.5px] cursor-pointer"
          >
            梁子卡·稳压阻尼
          </button>
        </div>
        <div className="flex gap-1.5 pt-1 border-t border-rose-500/20">
          <select
            value={selectedPerkId}
            onChange={(e) => setSelectedPerkId(e.target.value)}
            className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-200"
          >
            {regularPerks.map((p) => (
              <option key={p.id} value={p.id}>
                {p.scope === 'raid_only' ? '[副本] ' : p.scope === 'dual_balance' ? '[双维] ' : '[全局] '}
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onEquipSingleRunPerk(selectedPerkId)}
            className="px-2 py-1 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-[10px] shrink-0 cursor-pointer"
          >
            换继承
          </button>
        </div>
      </div>

      {/* Sub-Quest & Gemini Glitch Quick Test */}
      <div className="p-2.5 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/40 space-y-2">
        <div className="font-semibold text-fuchsia-300 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          <span>11大现实黑料小副本 & 诅咒碎片直测</span>
        </div>
        <div className="flex gap-1.5">
          <select
            value={selectedSqId}
            onChange={(e) => setSelectedSqId(e.target.value)}
            className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200"
          >
            {SUB_QUESTS.map((sq) => (
              <option key={sq.id} value={sq.id}>
                {sq.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onTriggerSubQuest(selectedSqId)}
            className="px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer"
          >
            切入
          </button>
        </div>

        <button
          type="button"
          onClick={onTriggerGeminiGlitch}
          className="w-full py-1.5 px-2.5 rounded-lg bg-fuchsia-500/20 hover:bg-fuchsia-500/35 border border-fuchsia-400/50 text-fuchsia-200 font-semibold cursor-pointer"
        >
          立即触发 Gemini 养老作业诅咒碎片
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onTriggerFishCard('celeb')}
            className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-semibold cursor-pointer"
          >
            大肥鱼庆祝卡
          </button>
          <button
            type="button"
            onClick={() => onTriggerFishCard('fever')}
            className="py-1.5 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/50 text-rose-200 font-semibold cursor-pointer"
          >
            大肥鱼发瘟卡
          </button>
        </div>
      </div>

      {/* Progressive Cast & Scenario Unlock State */}
      <div className="p-2.5 rounded-xl bg-indigo-950/35 border border-indigo-500/40 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-indigo-300">周目与剧本解锁状态</span>
          <span className="font-mono text-[11px] text-indigo-200">
            角色 {meta.metCharacters.length}/10 · #{meta.runCount} · 预定:
            {run.plannedRaidId.replace('raid_', '')}
            {run.nextRaidPreludeEarliestTurn ? `@T${run.nextRaidPreludeEarliestTurn}` : ''}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono leading-relaxed">
          前三大剧本无序全开 | 已首通: {meta.clearedScenarioIds.length}/4 | 4死网(
          {meta.unlockedScenarios[3] ? '已开' : '首通任一'})
          {(meta.recentRaidIds?.length ?? 0) > 0 && (
            <>
              {' '}
              | 近遇:{' '}
              {meta.recentRaidIds
                .slice(0, 3)
                .map((id) => id.replace('raid_', ''))
                .join('→')}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onUnlockAllCastToRun5}
          className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/50 text-indigo-200 flex items-center justify-center gap-1.5 font-semibold cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>直跳第 5 周目（梁子现身+解锁全员）</span>
        </button>
      </div>

      {/* Portrait Art Style & Placeholder Switches */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-100">AI 娘立绘风格切换</div>
            <div className="text-[11px] text-amber-300/90">
              {portraitStyle === 'origami'
                ? '当前：宝石眼 + 哑光纯折纸版'
                : '当前：全身晶石多边形切面版'}
            </div>
          </div>
          <button
            type="button"
            onClick={onTogglePortraitStyle}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/55 text-amber-200 font-semibold shrink-0 cursor-pointer"
          >
            {portraitStyle === 'origami' ? '切至晶石版' : '切至折纸版'}
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-100">立绘实图 / 灰盒占位</div>
            <div className="text-[11px] text-slate-400">
              {forcePlaceholder ? '纯灰盒几何占位' : '优先实图 + 缺图自动占位'}
            </div>
          </div>
          <button
            type="button"
            onClick={onTogglePlaceholder}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-medium shrink-0 cursor-pointer"
          >
            切换
          </button>
        </div>
      </div>

      {/* Quick Metric Adjusters */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="font-semibold text-slate-100">四维数值实时调优</div>
        {METRIC_ITEMS.map(({ key, label }) => {
          const val = run.metrics[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span>{label}</span>
                <span className="font-mono font-bold">{val}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSetMetric(key, 15)}
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] cursor-pointer"
                >
                  危低15
                </button>
                <button
                  type="button"
                  onClick={() => onSetMetric(key, Math.max(1, val - 15))}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] cursor-pointer"
                >
                  -15
                </button>
                <button
                  type="button"
                  onClick={() => onSetMetric(key, 50)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] cursor-pointer"
                >
                  50
                </button>
                <button
                  type="button"
                  onClick={() => onSetMetric(key, Math.min(99, val + 15))}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] cursor-pointer"
                >
                  +15
                </button>
                <button
                  type="button"
                  onClick={() => onSetMetric(key, 85)}
                  className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] cursor-pointer"
                >
                  危高85
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liangzi Rescue Testing */}
      <div className="p-2.5 rounded-xl bg-emerald-950/35 border border-emerald-500/40 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-emerald-300 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            梁子濒死热修测试
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            本局已用: {run.liangRescuedThisRun ? '是' : '否'}
          </span>
        </div>
        <button
          type="button"
          disabled={run.liangRescuedThisRun}
          onClick={onToggleForceLiang}
          className={`w-full py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
            run.forceNextLiangRescue
              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 disabled:opacity-40'
          }`}
        >
          {run.liangRescuedThisRun
            ? '本局热修次数已耗尽'
            : run.forceNextLiangRescue
              ? '已锁定：下次越界 100% 触发梁子捞人'
              : '开启“下次越界必触发梁子捞人”'}
        </button>
      </div>

      {/* Force Specific Daily Card */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
        <div className="font-semibold text-slate-100">
          发牌器 ({debug?.tier ?? 'P2'}) & 强制切日常牌
        </div>
        <select
          value={
            DAILY_CARDS.some((c) => c.id === run.currentCardId)
              ? run.currentCardId
              : DAILY_CARDS[0].id
          }
          onChange={(e) => onForceCard(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-200"
        >
          {DAILY_CARDS.map((c) => (
            <option key={c.id} value={c.id}>
              [{CHARACTERS[c.speakerId].name}] {c.id}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onHardResetSave}
        className="w-full py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 flex items-center justify-center gap-1.5 font-semibold cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>清空全档重测（从第1周目初见重玩）</span>
      </button>
    </div>
  );
};
