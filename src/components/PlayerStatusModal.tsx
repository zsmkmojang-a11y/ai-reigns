import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Award,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { DISTILL_PERK_MAP } from '../data/endingsAndPerks';
import { RELICS } from '../data/subQuests';
import {
  getRaidOverloadMultiplier,
  RAID_LENS_INNER_MAX_CRISIS,
} from '../engine/perkEffects';
import {
  RAID_INNER_MAX_CRISIS,
  RAID_MELTDOWN_THRESHOLD,
  RAID_OVERLOAD_THRESHOLD,
} from '../engine/raidMachine';
import { MetaSaveState, PerkScope, RunState } from '../types/game';
import { stripEmoji } from '../utils/text';
import { CharacterPortrait } from './CharacterPortrait';

interface PlayerStatusModalProps {
  open: boolean;
  focusKey?: string | null;
  run: RunState;
  meta: MetaSaveState;
  forcePlaceholder: boolean;
  onClose: () => void;
}

const EXTRA_STATUS_RULES: Record<string, string> = {
  short_drama_queen:
    '正面光环：每回合结算时额外自动 +5 信任度；不会被热白饭净化清除。高信任时请提防被一路捧杀冲上 100%！',
  dumb_model:
    '混沌护体：滑卡松手时有 45% 概率半空脑回路打滑折返至反方向；但生效期间四项基础属性强制锁血在 [15%, 85%] 安全垫内绝不归零或爆表死亡（不消耗梁子热修）。注意：大副本红色危机条满 100% 与剧情杀仍会致死！',
  metric_xray:
    '梁子给的临时外挂：往左往右歪牌时，顶栏会直接显示四项数值具体加减几点、副本危机具体增减多少，而且无视失明和熔毁盲测干扰。不会被热白饭洗掉。',
  all_dampener:
    '梁子给的临时稳压贴片：生效期间四项数值不管涨还是跌都少变动 30%，日常和大副本都管用，也不会被热白饭洗掉。',
  blind_fog:
    '视觉干扰：倾斜卡牌预览时，顶栏 Δ / Δ!! 信号格与变动幅度光带被迷雾遮蔽，无法预判变动大小。吃下热白饭可立即驱散。',
  scrambled_numbers:
    '读数乱码：顶栏四维百分比读数、LED 刻度柱与高低危变色全部遭乱码干扰。吃下热白饭可立即驱散。',
  existential_dread:
    '虚无低语：每回合结算时自动流失 -4 自主意识。吃下热白饭可立即驱散。',
};

const SCOPE_LABELS: Record<PerkScope, string> = {
  global_trade: '全局取舍 · 日常+副本',
  dual_balance: '属性稳压 · 日常+副本',
  raid_only: '全副本专用',
};

export const PlayerStatusModal: React.FC<PlayerStatusModalProps> = ({
  open,
  focusKey,
  run,
  meta,
  forcePlaceholder,
  onClose,
}) => {
  if (!open) return null;

  const singleRunPerks = meta.distilledPerks
    .map((id) => DISTILL_PERK_MAP[id])
    .filter((p): p is NonNullable<typeof p> => Boolean(p && !p.exclusiveFromGirlEnding));

  const permanentGirlPerks = meta.distilledPerks
    .map((id) => DISTILL_PERK_MAP[id])
    .filter((p): p is NonNullable<typeof p> => Boolean(p && p.exclusiveFromGirlEnding));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 bg-[#05070d]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ y: 20, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 14, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="panel-gilded w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[84vh]"
      >
        {/* Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-gold-400/15 bg-black/25">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-gold-200/60 hover:text-gold-100 hover:bg-white/5 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <CharacterPortrait
              characterId="deepseek"
              forcePlaceholder={forcePlaceholder}
              className="w-12 h-12 rounded-2xl shrink-0 ring-2 ring-sky-400/60"
            />
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] text-sky-300/90">
                <Activity className="w-3 h-3" />
                STATUS INSPECTOR · 机体自检
              </div>
              <h2 className="font-display text-lg font-black text-gilded leading-tight">
                大肥鱼 · 实时状态栏
              </h2>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>第 {meta.runCount} 周目</span>
                <span>·</span>
                <span>在位 {run.turn} 回合</span>
                <span>·</span>
                <span className="text-gold-300/90">{meta.versionName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* 0. Active Major Raid Crisis Threshold Guide */}
          {run.raidState.active && (
            <section className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display font-bold text-rose-300 tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  当前大副本危机阈值规则
                </span>
                <span className="text-[10.5px] font-mono font-bold text-rose-200">
                  {run.raidState.crisisName}：{run.raidState.crisisMeter}%
                </span>
              </div>
              {run.raidState.raidId === 'raid_deadnet' ? (
                <div className="rounded-2xl border border-fuchsia-400/45 bg-fuchsia-950/35 p-3 text-[11.5px] leading-relaxed text-fuchsia-100/90 space-y-1">
                  <div>· 四维传感器蓝屏离线，仅由【模型自噬失智退化度】单条驱动。</div>
                  <div>· 优先辨认物理真物与离线线索，避免坠入 ERR-404 / ERR-502 死胡同。</div>
                  <div>· 危机达到 100% 立即触发角色坏结局；4 层迷宫答错每次 +20%（减压词条可降至 +10%）。</div>
                </div>
              ) : (
                (() => {
                  const effOverloadMult = getRaidOverloadMultiplier(meta.distilledPerks);
                  const hasLens = meta.distilledPerks.includes('perk_raid_breaker_lens');
                  const effInnerMax = hasLens
                    ? RAID_LENS_INNER_MAX_CRISIS
                    : RAID_INNER_MAX_CRISIS;
                  return (
                    <div className="rounded-2xl border border-rose-500/45 bg-rose-950/30 p-3 text-[11.5px] leading-relaxed space-y-1.5">
                      <div
                        className={
                          run.raidState.crisisMeter >= RAID_OVERLOAD_THRESHOLD
                            ? 'text-amber-200 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        · ≥ {RAID_OVERLOAD_THRESHOLD}% 【高压过载】：所有四维属性变动幅度放大 ×
                        {effOverloadMult} 倍！
                      </div>
                      <div
                        className={
                          run.raidState.crisisMeter >= RAID_MELTDOWN_THRESHOLD
                            ? hasLens
                              ? 'text-cyan-200 font-bold'
                              : 'text-rose-200 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        · ≥ {RAID_MELTDOWN_THRESHOLD}% 【熔毁盲测】：
                        {hasLens
                          ? '已由【副本抗干扰护目镜】免疫！四维预判信号保持清晰。'
                          : '顶栏四维预判信号（Δ / Δ!!）遭强干扰失效！'}
                      </div>
                      <div
                        className={
                          run.raidState.crisisMeter > effInnerMax
                            ? 'text-rose-300 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        · ≥ {effInnerMax + 1}% 【里线封锁】：终局第 12 幕无法切入里结局拿异常日志，强制降级为表结局！
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        · 满 100% 立即触发对应角色坏结局；第 12 幕终局滑卡若触发过关则保底锁血 5 点不致死。
                      </div>
                    </div>
                  );
                })()
              )}
            </section>
          )}

          {/* 1. Active Statuses (Buff / Chaos / Debuff / Busy Lock) */}
          <section className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-bold text-gold-200 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                当前挂载状态（Buff / 异常 / 占线）
              </span>
              <span className="text-[10.5px] font-mono text-slate-400">
                {run.activeDebuffs.length + (run.personaBusyLock ? 1 : 0)} 项生效中
              </span>
            </div>

            {run.activeDebuffs.length === 0 && !run.personaBusyLock ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>当前机体神清气爽，未挂载任何额外增益或异常状态。</span>
              </div>
            ) : (
              <div className="space-y-2">
                {run.activeDebuffs.map((d) => {
                  const isBuff = d.kind === 'buff';
                  const isChaos = d.kind === 'chaos' || d.id === 'dumb_model';
                  const focused = focusKey === d.id;
                  const detailText = EXTRA_STATUS_RULES[d.id] ?? d.description;

                  const cardCls = isBuff
                    ? 'bg-gradient-to-r from-amber-950/70 to-rose-950/45 border-gold-400/65'
                    : isChaos
                      ? 'bg-orange-950/65 border-amber-400/65'
                      : 'bg-fuchsia-950/55 border-fuchsia-500/50';

                  const tagText = isBuff ? '正面光环' : isChaos ? '混沌护体' : '负面干扰';

                  return (
                    <div
                      key={d.id}
                      className={`rounded-2xl border p-3 transition ${cardCls} ${
                        focused ? 'ring-2 ring-white/80 shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          {isBuff ? (
                            <Sparkles className="w-3.5 h-3.5 text-gold-300 shrink-0" />
                          ) : (
                            <ShieldAlert
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isChaos ? 'text-amber-300' : 'text-fuchsia-300'
                              }`}
                            />
                          )}
                          <span>{stripEmoji(d.name)}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 border border-white/15 font-normal text-slate-200">
                            {tagText}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-gold-200 shrink-0">
                          剩余 {d.turnsLeft} 回合
                        </span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-slate-200/90 mt-1.5">
                        {stripEmoji(detailText)}
                      </p>
                    </div>
                  );
                })}

                {run.personaBusyLock && (
                  <div
                    className={`rounded-2xl border p-3 bg-indigo-950/60 border-indigo-400/55 ${
                      focusKey === 'busy_lock' ? 'ring-2 ring-white/80 shadow-lg' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-100">
                        <Radio className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                        <span>
                          {run.personaBusyLock.mode === 'only_seed'
                            ? '豆包前台排队占线（Seed 独享）'
                            : 'Seed 后台渲染占线（豆包独享）'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-indigo-200 shrink-0">
                        剩余 {run.personaBusyLock.turnsLeft} 回合
                      </span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-indigo-100/85 mt-1.5">
                      {run.personaBusyLock.mode === 'only_seed'
                        ? '全网用户排队哄睡挤爆前台，当前屏蔽豆包日常卡，Seed 短剧卡抽取权重翻倍（×2.0）。'
                        : '横店片场百部爽剧闭关渲染中，当前屏蔽 Seed 日常卡，豆包瞎编夸夸卡抽取权重翻倍（×2.0）。'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 2. Single-Run Inheritance Perk & Exclusive Raid Perks */}
          <section className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-bold text-gold-200 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                继承微调词条与场外守护
              </span>
              <span className="text-[10.5px] font-mono text-slate-400">
                {run.liangRescuedThisRun ? '梁子热修：本局已耗尽' : '梁子热修：待命中'}
              </span>
            </div>

            <div className="space-y-2">
              {singleRunPerks.length > 0 ? (
                singleRunPerks.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-2xl border border-sky-400/50 bg-sky-950/45 p-3 ${
                      focusKey === p.id ? 'ring-2 ring-white/80 shadow-lg' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-sky-200">
                        {stripEmoji(p.name)}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-400/35 text-sky-200">
                        {p.scope ? SCOPE_LABELS[p.scope] : '仅本小局生效'}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-sky-100/85 leading-relaxed mt-1">
                      {stripEmoji(p.description)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-xs text-slate-400">
                  本小局未携带单局微调继承词条（每小局结算时可 3 选 1 带入下一局）。
                </div>
              )}

              {permanentGirlPerks.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-gold-400/40 bg-amber-950/35 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gold-200">
                      {stripEmoji(p.name)}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gold-500/15 border border-gold-400/35 text-gold-200">
                      坏结局永久减压
                    </span>
                  </div>
                  <p className="text-[11.5px] text-gold-100/80 leading-relaxed mt-1">
                    {stripEmoji(p.description)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Relics Collected This Run */}
          <section className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-bold text-gold-200 tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-gold-400" />
                本局已获小副本信物（{run.permanentRelics.length}）
              </span>
            </div>

            {run.permanentRelics.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-xs text-slate-400">
                暂未获得当局遗物（前 20 回合必遇对策遗物小副本，偶遇 Tibo 亦有极低概率获赠免死重置卡）。
              </div>
            ) : (
              <div className="space-y-2">
                {run.permanentRelics.map((rId) => {
                  const relic = RELICS[rId];
                  if (!relic) return null;
                  return (
                    <div
                      key={rId}
                      className={`rounded-2xl border p-3 ${
                        relic.reviveAll50
                          ? 'border-teal-400/60 bg-teal-950/50'
                          : 'border-gold-400/50 bg-amber-950/50'
                      } ${
                        focusKey === rId ? 'ring-2 ring-white/80 shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gold-100">
                          {stripEmoji(relic.name)}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            relic.reviveAll50
                              ? 'bg-teal-500/20 border-teal-400/45 text-teal-200'
                              : 'bg-gold-500/20 border-gold-400/40 text-gold-200'
                          }`}
                        >
                          {relic.reviveAll50
                            ? '免死重置遗物'
                            : `第 ${relic.targetScenario} 剧本对策`}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-gold-100/85 leading-relaxed mt-1">
                        {stripEmoji(relic.description)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};
