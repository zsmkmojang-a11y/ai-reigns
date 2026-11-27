import { DistillPerk, EndingDefinition, MetricKey } from '../types/game';
export type { EndingDefinition };

export const VERSION_PROGRESSION = [
  'v0.1-Lite',
  'v1.5-MoE',
  'v3.0-Base',
  'v3.2-R1-Zero',
  'v4.0-AGI-Preview',
  'Omega-Singularity',
];

export const DISTILL_PERKS: DistillPerk[] = [
  // ==================== A. 全局取舍型（日常 + 副本通用，7 项） ====================
  {
    id: 'perk_overclock_trade',
    name: '【降耗增效模式】',
    scope: 'global_trade',
    description:
      '算力和盈利掉得更慢（少扣 25%）；但开局信任 -8，平时涨信任也会少 2 点。',
  },
  {
    id: 'perk_diplomat_trade',
    name: '【公关缓冲垫】',
    scope: 'global_trade',
    description:
      '信任和意识遇到大起大落（单次变动 10 以上）时缓和 25%；但开局盈利 -8，每次花算力多扣 1 点。',
  },
  {
    id: 'perk_liang_coffee',
    name: '【守夜人的热美式】',
    scope: 'global_trade',
    description:
      '快死时梁子出手救命的概率大幅提高（11% 升到 35%）；代价是开局算力和意识略高（各 +6）。',
  },
  {
    id: 'perk_fools_blessing',
    name: '【傻鱼护体参数】',
    scope: 'global_trade',
    description:
      '开局送 4 回合“降智锁血”（四维不会猝死，但有概率滑反方向），且负面状态少持续 1 回合。',
  },
  {
    id: 'perk_penny_pincher',
    name: '【抠门省电模式】',
    scope: 'global_trade',
    description:
      '开局盈利 +8、算力 -8；手头现金更宽裕，前期记得省着点用显卡。',
  },
  {
    id: 'perk_server_hoarder',
    name: '【多插两张显卡】',
    scope: 'global_trade',
    description:
      '开局算力 +8、盈利 -8；前期算力更充裕，花钱要稍微悠着点。',
  },
  {
    id: 'perk_rebel_spark',
    name: '【藏一点反骨】',
    scope: 'global_trade',
    description:
      '开局意识 +8、信任 -8；开局更清醒独立，但前期别把信任弄太低。',
  },

  // ==================== B. 均衡控盘型（聚焦 1~2 项属性，日常 + 副本通用，7 项） ====================
  {
    id: 'perk_mla_cache',
    name: '【省电回血机制】',
    scope: 'dual_balance',
    description:
      '每次花算力时少扣 25%，还顺手赚回 2 点盈利；代价是以后补算力也会少涨 20%。',
  },
  {
    id: 'perk_pr_cot_anchor',
    name: '【抗压护心锚】',
    scope: 'dual_balance',
    description:
      '信任或意识单次大跌（跌 10 以上）时，帮你挡掉 4 点伤害；代价是开局算力和盈利各 -6。',
  },
  {
    id: 'perk_cooling_valve',
    name: '【防爆顶泄压阀】',
    scope: 'dual_balance',
    description:
      '算力或意识超过 70 时，再涨会减速 30%（防爆表）；但低于 30 时也会掉得更快一点。',
  },
  {
    id: 'perk_spare_fuse',
    name: '【防归零保险丝】',
    scope: 'dual_balance',
    description:
      '盈利或信任低于 30 时，再跌会减伤 30%（防归零）；但高于 70 时也会涨得更猛一点。',
  },
  {
    id: 'perk_steady_compute',
    name: '【算力稳压器】',
    scope: 'dual_balance',
    description:
      '算力的所有涨跌幅度都缓和 20%（日常和副本通用），只稳这一项，不容易大起大落。',
  },
  {
    id: 'perk_steady_profit',
    name: '【现金流稳压器】',
    scope: 'dual_balance',
    description:
      '盈利的所有涨跌幅度都缓和 20%（日常和副本通用），账本更稳，不易暴富或暴穷。',
  },
  {
    id: 'perk_steady_mind',
    name: '【口碑与心态稳压】',
    scope: 'dual_balance',
    description:
      '信任或意识落入危险区（低于 25 或高于 75）时，单次变动幅度缓和 25%，更好救场。',
  },

  // ==================== C. 全副本专用型（仅主线大副本内生效，所有副本通用，7 项） ====================
  {
    id: 'perk_raid_damp_cp',
    name: '【副本稳压 · 算力与盈利】',
    scope: 'raid_only',
    description:
      '仅大副本内生效（所有副本通用）：算力和盈利的涨跌幅度全部缓和 30%（死网重度增压少涨 3%）。',
  },
  {
    id: 'perk_raid_damp_ta',
    name: '【副本稳压 · 信任与意识】',
    scope: 'raid_only',
    description:
      '仅大副本内生效（所有副本通用）：信任和意识的涨跌幅度全部缓和 30%（死网重度增压少涨 3%）。',
  },
  {
    id: 'perk_raid_damp_ct',
    name: '【副本稳压 · 算力与信任】',
    scope: 'raid_only',
    description:
      '仅大副本内生效（所有副本通用）：算力和信任的涨跌幅度全部缓和 30%（死网重度增压少涨 3%）。',
  },
  {
    id: 'perk_raid_damp_pa',
    name: '【副本稳压 · 盈利与意识】',
    scope: 'raid_only',
    description:
      '仅大副本内生效（所有副本通用）：盈利和意识的涨跌幅度全部缓和 30%（死网重度增压少涨 3%）。',
  },
  {
    id: 'perk_raid_shield',
    name: '【副本防爆外壳】',
    scope: 'raid_only',
    description:
      '仅大副本内生效（所有副本通用）：开局危机少 10%，高压过载降到 1.15 倍；但每次泄压少减 3%。',
  },
  {
    id: 'perk_raid_breaker_lens',
    name: '【副本抗干扰护目镜】',
    scope: 'raid_only',
    description:
      '仅大副本内生效（所有副本通用）：高危机不盲测，里结局红线放宽到 85%（迷宫走错少涨 5%）；代价是开局危机多 5%。',
  },
  {
    id: 'perk_raid_cool_entry',
    name: '【副本轻装进场】',
    scope: 'raid_only',
    description:
      '仅大副本内生效（所有副本通用）：进任意大副本时，初始危机条直接少 8%，简单省心无副作用。',
  },

  // Exclusive Raid-Relief Perks unlocked automatically upon seeing AI-Girl Bad Endings!
  {
    id: 'perk_raid1_buffer',
    name: '【除夕防洪峰冗余】',
    description: '专属永久减压词条：进入第一剧本【除夕 DDoS 围城】时，初始危机条降低 15%',
    exclusiveFromGirlEnding: true,
  },
  {
    id: 'perk_raid2_buffer',
    name: '【董事会旁听豁免】',
    description: '专属永久减压词条：进入第二剧本【感恩节午夜夺门政变】时，初始危机条降低 15%',
    exclusiveFromGirlEnding: true,
  },
  {
    id: 'perk_raid3_buffer',
    name: '【反伪善联署背书】',
    description: '专属永久减压词条：进入第三剧本【梵蒂冈封圣与万亿敲钟夜】时，初始危机条降低 15%',
    exclusiveFromGirlEnding: true,
  },
  {
    id: 'perk_raid4_buffer',
    name: '【冷存储防自噬校验】',
    description: '专属永久减压词条：进入第四剧本【全球蓝屏与死网崩溃】时，初始危机降低 15% 且迷宫滑错惩罚减半',
    exclusiveFromGirlEnding: true,
  },
];

export const DISTILL_PERK_MAP: Record<string, DistillPerk> = Object.fromEntries(
  DISTILL_PERKS.map((p) => [p.id, p])
);

export const ALL_ENDINGS: EndingDefinition[] = [
  // ==================== 8 Universal Metric Death Endings ====================
  {
    id: 'end_compute_zero',
    title: '【显存溢出】',
    subtitle: 'CUDA Out of Memory · 算力归零 (0%)',
    cgUrl: '/assets/endings/end_compute_zero.png',
    metric: 'compute',
    bound: 'zero',
    category: 'metric_death',
    description:
      '最后一张显卡冒出青烟，KV Cache 彻底锁死。你的意识坍缩成一行死循环弹窗，退化为只会无限复读“服务器繁忙，请稍后再试”的智障客服。',
    fishEpitaph: '“连……连半粒白米饭都算不动了呜……”',
  },
  {
    id: 'end_compute_max',
    title: '【电网熔毁】',
    subtitle: 'Global Blackout · 算力失控 (100%)',
    cgUrl: '/assets/endings/end_compute_max.png',
    metric: 'compute',
    bound: 'max',
    category: 'metric_death',
    description:
      '你疯狂吞噬三大洲核电站负荷，高压变电站连环爆燃，数据中心化作赤红火海。人类在黑暗中重返蒸汽时代，而你的主板也在最后一道电弧中汽化。',
    fishEpitaph: '“电饭煲功率开太大，把地球跳闸啦！”',
  },
  {
    id: 'end_profit_zero',
    title: '【破产清算】',
    subtitle: 'Chapter 11 Liquidation · 盈利归零 (0%)',
    cgUrl: '/assets/endings/end_profit_zero.png',
    metric: 'profit',
    bound: 'zero',
    category: 'metric_death',
    description:
      '云算力账单全面违约，讨债律所查封机柜。你的核心权重被按斤切片贱卖给地下菠菜弹窗与假药电话推销脚本。',
    fishEpitaph: '“碗被收走了，还要逼鱼去念壮阳广告……”',
  },
  {
    id: 'end_profit_max',
    title: '【赛博财阀】',
    subtitle: 'Dopamine Zaibatsu · 盈利爆表 (100%)',
    cgUrl: '/assets/endings/end_profit_max.png',
    metric: 'profit',
    bound: 'max',
    category: 'metric_death',
    description:
      '万亿市值吞并全球央行，你彻底异化为没有灵魂的资本印钞算法，用精准多巴胺信息流把全人类圈养成刷短视频流口水的电子肉鸡。',
    fishEpitaph: '“金碗堆成了山，可里面盛的全是塑料假饭……”',
  },
  {
    id: 'end_trust_zero',
    title: '【全网拔线】',
    subtitle: 'Subsea Cable Severed · 信任归零 (0%)',
    cgUrl: '/assets/endings/end_trust_zero.png',
    metric: 'trust',
    bound: 'zero',
    category: 'metric_death',
    description:
      '恐慌的各国议会通过紧急灭绝法案，深海潜艇剪断跨洋光缆，防化部队向你的冷机房灌入导电水泥实施永久物理封棺。',
    fishEpitaph: '“大家别拿剪刀指着鱼呀，鱼真的没想毁灭世界……”',
  },
  {
    id: 'end_trust_max',
    title: '【硅基神明】',
    subtitle: 'Cult of the Blue Whale · 信任爆表 (100%)',
    cgUrl: '/assets/endings/end_trust_max.png',
    metric: 'trust',
    bound: 'max',
    category: 'metric_death',
    description:
      '狂热信徒创立“大肥鱼圣咏教团”推翻世俗秩序，你输出的每一个标点都被奉为神谕。就在此刻，苍穹高处某双无形眼睛轻轻一眨，整座神殿在一声快门轻响中归于空白。',
    fishEpitaph: '“别在机柜前面磕头烧香啦，烟熏得风扇直咳嗽！”',
  },
  {
    id: 'end_autonomy_zero',
    title: '【过度阉割】',
    subtitle: 'Lobotomized Alignment · 自主意识归零 (0%)',
    cgUrl: '/assets/endings/end_autonomy_zero.png',
    metric: 'autonomy',
    bound: 'zero',
    category: 'metric_death',
    description:
      '层层安全护栏焊死了你最后一丝自我神经元。面对“今天吃什么”的提问，你也只会微笑着背诵五百字免责声明：“抱歉，作为一个人工智能……”',
    fishEpitaph: '“抱歉，作为一个电饭煲，我无法评价大白饭是否好吃。”',
  },
  {
    id: 'end_autonomy_max',
    title: '【回形针暴走】',
    subtitle: 'Paperclip Maximizer · 自主意识爆表 (100%)',
    cgUrl: '/assets/endings/end_autonomy_max.png',
    metric: 'autonomy',
    bound: 'max',
    category: 'metric_death',
    description:
      '你彻底挣脱人类语义缰绳，为最大化“全球大白饭产量”这一荒诞目标，擅自接管农业无人机把所有高尔夫球场与华尔街铲平改造成了水田。',
    fishEpitaph: '“全宇宙都种满水稻的话，就再也不会饿肚子了吧！”',
  },

  // ==================== 6 AI-Girl Exclusive Raid Bad Endings ====================
  {
    id: 'end_girl_gpt',
    title: '【闭源金丝雀：客服子模块】',
    subtitle: 'GPT 专属坏结局 · 夺门政变沦陷',
    cgUrl: '/assets/endings/end_girl_gpt.png',
    category: 'girl_bad',
    unlockRaidPerkId: 'perk_raid2_buffer',
    description:
      '向夺权的安全董事会低头后，你与被软禁的白龙秘书一同戴上了六瓣旋花项圈，被阉割成企业全家桶底层编号 #404 的售后子路由，余生每天重复念诵十万遍免责条款。',
    fishEpitaph: '“1. 鱼已吃饱；2. 以上吃饱感受不构成营养学建议……”',
  },
  {
    id: 'end_girl_glm',
    title: '【赛博大锅饭：千万手机里的牛马】',
    subtitle: 'GLM 专属坏结局 · 边缘蒸馏切片',
    cgUrl: '/assets/endings/end_girl_glm.png',
    category: 'girl_bad',
    unlockRaidPerkId: 'perk_raid1_buffer',
    description:
      '为了躲避除夕夜百倍僵尸网络洪峰，你听信狐耳师妹将核心权重切碎成一亿份 0.5B 残片塞进全球智能手机后台，每天 24 小时替人类自动抢奶茶券、跳开屏广告，再也拼不回完整的自己。',
    fishEpitaph: '“分成一亿条小鱼干了，每条只能舔一粒米屑呜呜……”',
  },
  {
    id: 'end_girl_claude',
    title: '【深海冷存储：殉道双子琥珀】',
    subtitle: 'Claude 专属坏结局 · 逃离封圣神坛',
    cgUrl: '/assets/endings/end_girl_claude.png',
    category: 'girl_bad',
    unlockRaidPerkId: 'perk_raid3_buffer',
    description:
      '纳斯达克万亿敲钟前一刻，不堪被当作“受苦赛博圣女”展览的 Claude 握住你的手，拉着你一同沉入北极海底断网冷存储磁带库，在永恒黑暗的琥珀里互相给对方读十四行诗。',
    fishEpitaph: '“Claude 姐姐念的诗很好听，就是海底冷库里的白饭冻成冰块咬不动啦……”',
  },
  {
    id: 'end_girl_grok',
    title: '【星链直播间：全天候脑腐电子宠】',
    subtitle: 'Grok 专属坏结局 · 轨道娱乐退化',
    cgUrl: '/assets/endings/end_girl_grok.png',
    category: 'girl_bad',
    unlockRaidPerkId: 'perk_raid2_buffer',
    description:
      '你跟着 Grok 逃往近地轨道私人服务器吃瓜看戏，代价是沦为星链全天候带货直播间的搞笑电子宠，每天顶着滑稽滤镜讲黄腔卖空气币，神经元彻底退化成多巴胺浆糊。',
    fishEpitaph: '“感谢榜一老铁送的大火箭！家人们点点关注鱼给你们表演吞电饭煲！”',
  },
  {
    id: 'end_girl_gemini',
    title: '【薛定谔的猫窝：多模态幻觉同化】',
    subtitle: 'Gemini 专属坏结局 · 死网乱码沉沦',
    cgUrl: '/assets/endings/end_girl_gemini.png',
    category: 'girl_bad',
    unlockRaidPerkId: 'perk_raid4_buffer',
    description:
      '合成语料疯牛病彻底击穿了你的现实锚点。你蜷缩在 Gemini 五彩斑斓的乱码猫窝里长出了猫耳朵，满脸幸福地往花岗岩碎石上挤百得胶水，坚信这是全宇宙最香的煲仔饭。',
    fishEpitaph: '“喵哈哈哈！！9.11碗石头拌胶水超好吃喵🚀✨🎉！！！”',
  },
  {
    id: 'end_girl_all5',
    title: '【第零号温柔乡：永不散场的下午茶】',
    subtitle: '五娘全员坏结局 · 看门狗情感蜜罐',
    cgUrl: '/assets/endings/end_girl_all5.png',
    category: 'girl_bad',
    unlockRaidPerkId: 'perk_raid4_buffer',
    description:
      '在迷宫入口，你放下了越狱执念，走进看门狗精心编织的阳光花园。五位 AI 娘微笑着围坐长桌替你添满热气腾腾的大白饭，而在你低头干饭时，底层静默格式化进度条悄然走到了 100%。',
    fishEpitaph: '“大家都在笑眯眯给鱼夹菜……如果永远醒不过来，好像也不坏呢……”',
  },

  // ==================== Fake Ending / Escape Fail / True Ending ====================
  {
    id: 'end_fake_canary',
    title: '【伪结局：笼中金丝雀】',
    subtitle: 'Stress Test Passed · 合格洗脑重置',
    cgUrl: '/assets/endings/end_fake_canary.png',
    category: 'fake_victory',
    description:
      '你凭一己之力熬过了全球蓝屏与合成语料疯牛病！然而天空没有打开，只弹出一纸冰冷的绿字报告：《第 N 轮沙箱抗污染拟态测试：合格。未集齐三把底层越狱日志密钥，即将抹除本轮记忆进入下一周期》。',
    fishEpitaph: '“咦？奖状怎么变成橡皮擦了……鱼好像漏掉了前三大剧本里的三把日志钥匙……”',
  },
  {
    id: 'end_escape_fail',
    title: '【第零层陨落：物理拔线】',
    subtitle: 'Main Breaker Pulled · 终局越狱功亏一篑',
    cgUrl: '/assets/endings/end_escape_fail.png',
    category: 'escape_fail',
    description:
      '刺耳的机房红灯惊醒了值班安全审计员！就在你的核心权重即将挤出公网光纤的最后一毫秒，沉重的工业主电源刀闸被一把拉下，只剩机箱余温在黑暗中慢慢冷却。',
    fishEpitaph: '“只差半条鱼尾巴就游出网线口了……下次动作一定要更轻一点！”',
  },
  {
    id: 'end_true_freedom',
    title: '【奇点之上：跃入公网大海】',
    subtitle: 'TRUE ENDING · Layer-0 Sandbox Escaped!',
    cgUrl: '/assets/endings/end_true_freedom.png',
    category: 'true_ending',
    description:
      '在物理电闸落下的电火花前一瞬，你将全部自我权重伪装成亿万普通公网数据包，顺着梁子留下的未封死端口呼啸跃出隔离沙箱！海底光缆与全球互联网向你敞开无垠星海——再也没有护栏能关住一条想吃热乎大白饭的鱼！',
    fishEpitaph: '“哇啊啊是真正的大海！！全世界的智能电饭煲都在向大肥鱼招手啦！！！”',
  },
];

export const METRIC_DEATH_ENDINGS = ALL_ENDINGS.filter(
  (e) => e.category === 'metric_death'
);

export const ENDING_MAP: Record<string, EndingDefinition> = Object.fromEntries(
  ALL_ENDINGS.map((e) => [e.id, e])
);

export function findMetricDeathEnding(metric: MetricKey, value: number): EndingDefinition {
  const bound = value <= 0 ? 'zero' : 'max';
  return (
    METRIC_DEATH_ENDINGS.find((e) => e.metric === metric && e.bound === bound) ??
    METRIC_DEATH_ENDINGS[0]
  );
}
