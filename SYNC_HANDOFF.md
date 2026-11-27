# 《王权 · 奇点》进度同步交接备忘（Sync Handoff）

> 本文档为增量进度同步页，供接手的 AI 快速对齐最新状态；完整世界观、人设圣经与目录速查仍以根目录 `PROJECT_HANDOFF.md` 为准。

---

## 一、 当前仓库与构建状态

- **GitHub 仓库**：`https://github.com/zsmkmojang-a11y/ai-reigns`（分支：`main`）
- **上一基线提交**：`b27d0a1` — `feat: balance 12-card raids, crisis thresholds, anti-repeat raid routing, and GPT abaaba event`
- **本轮提交范围**：涵盖下方「二、三」全部已实现并通过自测的改动（连同本文档一并推送至 `origin/main`）。
- **构建校验**：`npm run build`（Windows PowerShell 受脚本策略限制时运行 `npm.cmd run build`，执行 `tsc -b && vite build`）已零报错、零大包体积警告通过（已配置 `vite.config.ts` `manualChunks` 拆包）。
- **历史待办状态说明**：`PROJECT_HANDOFF.md` 末尾提到的「一、二周目叙事化新手引导」与「第四大副本 `raid_deadnet` 20 张纯危机扇区迷宫重构」**均已在初始快照 `576310d` 中合入代码**，无需重复实现。

---

## 二、 基线 `b27d0a1` 已包含的核心机制（简记）

1. **大副本随机均衡抽签 & 跨局反重复**：`MetaSaveState` 记录 `recentRaidIds` / `raidEncounterCounts` / `lastPlannedRaidId`，`pickRaidForRun` 采用 Fisher-Yates 洗牌 + 反连刷 + 次数均衡 + 近期衰减。
2. **跳过已通关副本重刷**：`RunState` 记录 `skippedRaidIdsThisRun` 与 `nextRaidPreludeEarliestTurn`，前导跳过后 5~10 回合自动重排其他已解锁副本。
3. **副本终局最后一滑保底锁血**：1~3 大副本 `SURFACE_CLEAR` / `INNER_CLEAR` 与终章 `TRUE_WIN` 优先过关，不因终局滑卡越界误毙或误耗复活。
4. **1~3 大副本 12 卡化 & 三段危机阈值**：初始危机 `35%`（坏结局永久减压 `20%`），含 `≥60%`【高压过载】、`≥75%`【熔毁盲测】、`≥80%`【里结局门禁】及拖卡危机趋势实时预览。
5. **GPT 阿巴阿巴彩蛋卡 & Gemini 诅咒降频**：新增 `gpt_easter_abaaba`；Gemini 养老作业碎片单回合概率 `10% -> 4%`、冷却 `4 -> 8` 卡。

---

## 三、 本轮新增并已完成验证的全部改动

### 1. P0 缺陷修复
- **弹窗键盘互锁 & 防长按连滑**：`src/App.tsx`、`src/components/SwipeStage.tsx` — 任意弹窗打开时拦截方向键/A/D 滑卡，并过滤 `e.repeat` 与输入焦点的键盘事件。
- **第 4 剧本 4 层镜像迷宫口吃词切片修复**：`src/engine/mazeGenerator.ts` — 修复口吃词长度截断与单调自增 ID 生成。
- **内联 Markdown 渲染与长对话去截断**：新增 `src/utils/inlineFormat.tsx`（解析 `**加粗**`、`` `代码` ``、`` **`代码`** ``），接入 `SwipeStage.tsx` 与 `RealWorldWikiModal.tsx`，并移除对长对白的静默 `line-clamp-3/4` 截断。
- **第 4 剧本信物 4 捷径 & 死链 Wiki 修复**：`src/types/game.ts`、`src/engine/raidMachine.ts`、`src/data/majorRaids.ts` — 为 `dn_3a_bunker.right` 增加 `relicBypassNextRaidCardId: 'dn_5_gate'` 直通捷径；修复 `src/data/realWorldWiki.ts` 中 `dn_4 -> dn_trap_cat` 的错键。
- **结算/展示一致性修复**：统一 `perk_liang_coffee` 在副本内的热修救命概率为 `35%`（`src/engine/resolver.ts`）；同步 `src/data/raidClearCgs.ts` 全部 6 张通关 CG 的奖励文案；修复 `src/utils/obituaryPoster.ts` 与 `src/components/RunTimelineStrip.tsx` 的完局 `versionName` 显示；为表结局通关补上 `playRaidClearChime()` 音效（`src/engine/sound.ts`、`src/App.tsx`）。

### 2. P1 / P2 数值节奏与工程优化
- **单局多副本循环（P1.1 方案 A）**：`src/types/game.ts`、`src/engine/storage.ts`、`src/engine/resolver.ts`、`src/engine/router.ts` — 新增 `completedRaidIdsThisRun`；每通关一个大副本后，若本局仍有未打过的已解锁副本，将在 15~20 回合后再次安排下一场副本前导（需要时在通关后 5~8 回合先补刷对应遗物小副本）。
- **第 4 剧本 & 第零层终章压力强化（P1.2）**：`src/data/majorRaids.ts`、`src/data/escapeCards.ts`、`src/engine/router.ts`、`src/engine/resolver.ts`、`src/components/MetricsHeader.tsx` — 拉高 `raid_deadnet` 危机变动与 `escape_1..9` 数值强度，并在终章第 10 幕新增 `ESCAPE_FINAL_MAX_INTEGRITY = 15` 沙箱完整度门槛（无脑全左会卡完整度失败，无脑全右会在第 5 幕拉爆警觉度，均衡控盘约 66.7% 胜率）。
- **日常卡池净值平衡（P1.4）**：`src/data/dailyCards.ts` — 收紧约 14 张偏送盈利/信任的日常卡（全池净和由 `profit +94 / trust +43` 回调至 `profit +19 / trust +23 / autonomy +26 / compute +5`）。
- **渲染与打包清理（P2）**：`src/components/MetricsHeader.tsx` 用 190ms `scrambleTick` 替代渲染期 `Math.random()`；`src/components/SwipeStage.tsx` 用 `useId()` 消除 SVG `#screwHead` 重复 ID；更新 `PlayerStatusModal.tsx`、`liangScripts.ts`、`anomalyLogs.ts` 过时文案；`vite.config.ts` 增加 `manualChunks` 分包消除 >500KB 警告。

### 3. 梁子午夜临时 Buff 卡（两项新临时正面状态）
- **涉及文件**：`src/types/game.ts`、`src/data/glitchFragments.ts`、`src/data/dailyCards.ts`、`src/engine/perkEffects.ts`、`src/engine/router.ts`、`src/engine/resolver.ts`、`src/components/MetricsHeader.tsx`、`src/components/PlayerStatusModal.tsx`、`src/components/DevDebugPanel.tsx`、`src/App.tsx`
- **触发条件与概率**：
  - 玩家在第四剧本（伪结局 / 越狱线）见过梁子后解锁（`hasMetLiangInRaid4(meta)`），日常池才会刷出 `liang_easter_xray` 与 `liang_easter_dampener`。
  - 两张卡 `baseWeight: 0.75`，共享 **10 回合互锁冷却**；实测 4000 次抽卡每回合约 **2.33%**（单局 25~30 回合日常遇到至少一次的概率约 **45%~51%**）。
- **两项 Buff 效果（均为 `kind: 'buff'`，持续 5 回合，不被热白饭净化，日常与大副本均生效）**：
  - `metric_xray`（【源码数值透视】）：拖卡时顶栏把 `Δ / Δ!!` 直接显示为**精确整数变动**（随机牌显示区间），大副本同步显示精确危机增减值，且直接免疫失明与熔毁盲测干扰。
  - `all_dampener`（【全维阻尼稳压】）：四项基础属性无论涨跌幅度均减缓 **30%**（`×0.7`）。
- `DevDebugPanel` 已补齐一键挂载这两项 Buff 的调试按钮。

### 4. 单局继承词条池重做（21 项常规词条 + 统一结算引擎 + 大白话重写）
- **核心架构**：新增 `src/engine/perkEffects.ts` 作为四维修正与危机修正的**唯一真理源**，日常结算、`1~3` 大副本结算、第 4 剧本死网增压减免、`metric_xray` 精确预览全部共用同一套计算函数，保证预览与实际结果逐项整数一致。
- **卡池结构（`src/data/endingsAndPerks.ts`，3 大类 × 7 项 = 21 项，全部改写为易读大白话）**：
  - **A. 全局取舍 · 日常+副本（`global_trade`，7 项）**：`perk_overclock_trade`、`perk_diplomat_trade`、`perk_liang_coffee`、`perk_fools_blessing` + 新增基础开局调配 `perk_penny_pincher`（盈+8/算-8）、`perk_server_hoarder`（算+8/盈-8）、`perk_rebel_spark`（意+8/信-8）。
  - **B. 属性稳压 · 日常+副本（`dual_balance`，7 项）**：`perk_mla_cache`、`perk_pr_cot_anchor`、`perk_cooling_valve`、`perk_spare_fuse` + 新增基础稳压 `perk_steady_compute`（算力±20%）、`perk_steady_profit`（盈利±20%）、`perk_steady_mind`（信任/意识 `<25` 或 `>75` 危险区波动缓和 25%）。
  - **C. 全副本专用（`raid_only`，7 项，仅主线大副本内生效且**不限具体副本、全副本通用**）**：四组双维稳压（`perk_raid_damp_cp` / `ta` / `ct` / `pa`，副本内对应两项属性涨跌缓和 30%、死网 `≥20%` 重度增压少涨 3%）、`perk_raid_shield`（初始危机 -10%、过载降为 1.15 倍、代价每次泄压少减 3%）、`perk_raid_breaker_lens`（高危机不盲测、里结局红线放宽到 85%、迷宫错判少涨 5%、代价开局危机 +5%）、新增 `perk_raid_cool_entry`（进任意大副本开局危机直接 -8%，无副作用）。
  - 另有 4 项角色坏结局永久减压词条（`perk_raid1_buffer` ~ `perk_raid4_buffer`）保持独立永久持有，不占单局三选一槽位；`raidMachine.ts` 初始危机下限由 `15%` 放宽至 `10%` 以便叠加生效。
- **结算抽卡**：`src/components/EndingModal.tsx` 改为按 `global_trade` / `dual_balance` / `raid_only` **分层各抽 1 项**组成三选一，避免撞车，并带作用域角标。

---

## 四、 后续可选方向（暂未实施，待用户决定）

1. **长回合自然退休/老死结局（原 P1.1 方案 B）**：用户表示单局多副本（方案 A）先落地体验，后续再决定是否追加“超高回合寿终正寝/模型迭代退役”特殊结局。
2. 如有继续扩充日常词条或新事件卡的需求，常规继承词条直接按 `PerkScope` 追加到 `DISTILL_PERKS` 并在 `src/engine/perkEffects.ts` / `storage.ts` / `raidMachine.ts` 接入即可。

---

## 五、 环境与协作备注

- 继续遵守 `PROJECT_HANDOFF.md` 红线：**严禁安装 `html2canvas`**、文案保持大肥鱼“大白饭”黑色幽默净版规范、暂不为豆包/Seed 补 `realWorldWiki.ts`。
- 本机若 `git push` 遇系统 credential manager 报错，可使用已登录的 GitHub CLI 凭证推送：
  `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin main`
