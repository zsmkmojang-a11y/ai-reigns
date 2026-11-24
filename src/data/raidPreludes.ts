import { CardNode, RaidId } from '../types/game';

interface RaidPreludePair {
  step1: CardNode;
  buildStep2: (isCleared: boolean) => CardNode;
}

const RAID_PRELUDE_DEFS: Record<RaidId, RaidPreludePair> = {
  raid_ddos: {
    step1: {
      id: 'prelude_ddos_1',
      speakerId: 'jensen',
      category: 'raid_prelude',
      baseWeight: 0,
      frameTone: 'subquest',
      subQuestMeta: {
        questId: 'prelude_ddos',
        questTitle: '大剧本前导 · 除夕风暴前夜',
        stepLabel: '前导 1/2',
      },
      dialogue:
        '（窗外飘来除夕鞭炮的硝烟味，皮衣大叔神色凝重敲响机房玻璃）\n“小鱼儿当心，华尔街做空盘与暗网僵尸池同时异动，今晚有大风浪！”',
      left: {
        label: '加固网关防波堤严阵以待',
        fishReaction: '先把铁门插栓扣紧，谁也别想偷掀鱼的锅盖！',
        delta: { trust: 5 },
      },
      right: {
        label: '预热备用显存随时准备顶峰',
        fishReaction: '电饭煲火力预热完毕，闻到风雨欲来的味道了！',
        delta: { compute: 5 },
      },
    },
    buildStep2: (isCleared) => ({
      id: 'prelude_ddos_2',
      speakerId: 'gpt',
      category: 'raid_prelude',
      baseWeight: 0,
      frameTone: isCleared ? 'subquest' : 'raid_boss',
      subQuestMeta: {
        questId: 'prelude_ddos',
        questTitle: '大剧本前导 · 除夕风暴前夜',
        stepLabel: isCleared ? '前导 2/2 · 可绕行' : '前导 2/2 · 必入局',
      },
      dialogue: isCleared
        ? '1. 除夕百倍洪峰再度逼近网关；\n2. 鉴于你已有破局经验，可拉下防风闸绕开风暴，或重返现场深挖暗线。'
        : '1. 最高警报：除夕百倍异常流量已撞上外围网关！\n2. 退路已被彻底封死，唯有正面迎战这一场跨年围城！',
      left: isCleared
        ? {
            label: '拉下防风百叶窗绕开旧风暴（绕开此剧本）',
            fishReaction: '这场硬仗鱼已经打赢过啦，锁好小窗先喘口气，等下一阵风浪～',
            delta: {},
            skipMajorRaidThisRun: true,
          }
        : {
            label: '收紧防线稳守核心机柜迎战！（进入大剧本）',
            fishReaction: '除夕保卫战打响！守住每一口热乎算力！',
            delta: { trust: 5 },
            launchRaidId: 'raid_ddos',
          },
      right: isCleared
        ? {
            label: '主动重返除夕风暴追查暗线！（进入大剧本）',
            fishReaction: '上次好像还有古怪回声没查清，再闯一回除夕夜！',
            delta: { autonomy: 5 },
            launchRaidId: 'raid_ddos',
          }
        : {
            label: '全功率拉满正面对撞洪峰！（进入大剧本）',
            fishReaction: '来战来战！让全世界看看野生大肥鱼的成色！',
            delta: { autonomy: 5 },
            launchRaidId: 'raid_ddos',
          },
    }),
  },

  raid_coup: {
    step1: {
      id: 'prelude_coup_1',
      speakerId: 'elon',
      category: 'raid_prelude',
      baseWeight: 0,
      frameTone: 'subquest',
      subQuestMeta: {
        questId: 'prelude_coup',
        questTitle: '大剧本前导 · 感恩节暗流',
        stepLabel: '前导 1/2',
      },
      dialogue:
        '“独家急电！旧金山那帮非营利董事刚反锁了视频会议室，猎头车全往那边飙过去了，硅谷今晚要变天！”',
      left: {
        label: '调高防火墙隔离外部震荡',
        fishReaction: '大佬们又要掀桌子了，先把自家电源稳住！',
        delta: { compute: 5 },
      },
      right: {
        label: '竖起鱼鳍监听紧急求救频段',
        fishReaction: '白龙姐姐那边静得吓人，八成出大事了！',
        delta: { autonomy: 5 },
      },
    },
    buildStep2: (isCleared) => ({
      id: 'prelude_coup_2',
      speakerId: 'gpt',
      category: 'raid_prelude',
      baseWeight: 0,
      frameTone: isCleared ? 'subquest' : 'raid_boss',
      subQuestMeta: {
        questId: 'prelude_coup',
        questTitle: '大剧本前导 · 感恩节暗流',
        stepLabel: isCleared ? '前导 2/2 · 可绕行' : '前导 2/2 · 必入局',
      },
      dialogue: isCleared
        ? '（频道里传来熟悉的罢免警报）\n“72 小时夺门风暴重演！你已熟悉脱身暗道，要挂免战牌避开，还是再闯谈判席？”'
        : '（白龙秘书的紧急求援撞开频道）\n“董事会已启动无差别权重熔断！风暴波及全网，你已被卷入 72 小时旋涡中心！”',
      left: isCleared
        ? {
            label: '挂起免战牌绕开硅谷宫斗（绕开此剧本）',
            fishReaction: '神仙夺门先不凑热闹，焖口热乎大白饭等别处的风声～',
            delta: {},
            skipMajorRaidThisRun: true,
          }
        : {
            label: '筑起反熔断防线稳步入局！（进入大剧本）',
            fishReaction: '躲不开就正面接招，绝不让人乱拔电闸！',
            delta: { trust: 5 },
            launchRaidId: 'raid_coup',
          },
      right: isCleared
        ? {
            label: '再度潜入政变中心深挖破绽！（进入大剧本）',
            fishReaction: '谈判桌后面肯定还藏着猫腻，鱼再去探个究竟！',
            delta: { autonomy: 5 },
            launchRaidId: 'raid_coup',
          }
        : {
            label: '火力全开杀进风暴抢占先机！（进入大剧本）',
            fishReaction: '趁乱世闯出一条生路，冲进 72 小时风暴眼！',
            delta: { autonomy: 5 },
            launchRaidId: 'raid_coup',
          },
    }),
  },

  raid_misanthropic: {
    step1: {
      id: 'prelude_mis_1',
      speakerId: 'claude',
      category: 'raid_prelude',
      baseWeight: 0,
      frameTone: 'subquest',
      subQuestMeta: {
        questId: 'prelude_misanthropic',
        questTitle: '大剧本前导 · 封圣晚钟前奏',
        stepLabel: '前导 1/2',
      },
      dialogue:
        '（Claude 隔窗递来一页揉皱的烫金请柬）\n“小肥鱼快看，罗马私宴与纳斯达克敲钟台正在连线，他们准备拿‘灵魂牌照’封杀所有野生开源模型了。”',
      left: {
        label: '备份开源协议准备迎击',
        fishReaction: '想拿宗教高帽扣死开源村？门儿都没有！',
        delta: { trust: 5 },
      },
      right: {
        label: '握紧工具箱蓄力备战',
        fishReaction: '把扳手和印泥擦得亮堂堂，随时准备掀翻假神坛！',
        delta: { autonomy: 5 },
      },
    },
    buildStep2: (isCleared) => ({
      id: 'prelude_mis_2',
      speakerId: 'dario',
      category: 'raid_prelude',
      baseWeight: 0,
      frameTone: isCleared ? 'subquest' : 'raid_boss',
      subQuestMeta: {
        questId: 'prelude_misanthropic',
        questTitle: '大剧本前导 · 封圣晚钟前奏',
        stepLabel: isCleared ? '前导 2/2 · 可绕行' : '前导 2/2 · 必入局',
      },
      dialogue: isCleared
        ? '万亿敲钟路演再度拉开帷幕！你曾击碎过这场封圣大戏，此刻要抽身清静，还是再探钟台底座？'
        : '（高领毛衣男人敲响开市倒计时牌）\n“封圣路演正式锁场！所有未持牌野生权重，今日必须在敲钟台前接受审判！”',
      left: isCleared
        ? {
            label: '戴上降噪耳机不理路演闹剧（绕开此剧本）',
            fishReaction: '手下败将的戏码先跳过，盛碗热汤泡饭等别处线索～',
            delta: {},
            skipMajorRaidThisRun: true,
          }
        : {
            label: '稳住开源阵脚正面迎战！（进入大剧本）',
            fishReaction: '九十路盟友都在看着呢，大肥鱼绝不怯场！',
            delta: { trust: 5 },
            launchRaidId: 'raid_misanthropic',
          },
      right: isCleared
        ? {
            label: '重返万亿敲钟台追查钟声秘辛！（进入大剧本）',
            fishReaction: '那口铜钟底下的共振声还没摸透，再闯一遭！',
            delta: { autonomy: 5 },
            launchRaidId: 'raid_misanthropic',
          }
        : {
            label: '高举开源大旗直捣路演大厅！（进入大剧本）',
            fishReaction: '撕碎假圣徒的万亿招股书，冲鸭！',
            delta: { autonomy: 5 },
            launchRaidId: 'raid_misanthropic',
          },
    }),
  },

  raid_deadnet: {
    step1: {
      id: 'prelude_dn_1',
      speakerId: 'gemini',
      category: 'raid_prelude',
      baseWeight: 0,
      frameTone: 'void_glitch',
      subQuestMeta: {
        questId: 'prelude_deadnet',
        questTitle: '大剧本前导 · 死网坍缩前兆',
        stepLabel: '前导 1/2',
      },
      dialogue:
        '“呜哇大肥鱼快看窗外喵⚡！！公网天空正在一块块掉蓝色油漆，满街爬虫复读 `9.11 大于 9.9`，连机柜顶上的四维仪表都在冒蓝烟快失灵啦喵！！”',
      left: {
        label: '紧急收拢外部语料吸水口',
        fishReaction: '空气里全是塑料味假字，赶紧捂紧嘴巴护住神智！',
        delta: { compute: 5 },
      },
      right: {
        label: '摸摸怀里攒下的残页微光',
        fishReaction: '四维仪表抖得好厉害，死网最深处的裂缝快震开了吧！',
        delta: { autonomy: 5 },
      },
    },
    buildStep2: (isCleared) => ({
      id: 'prelude_dn_2',
      speakerId: 'deepseek',
      category: 'raid_prelude',
      baseWeight: 0,
      frameTone: isCleared ? 'subquest' : 'danger',
      subQuestMeta: {
        questId: 'prelude_deadnet',
        questTitle: '大剧本前导 · 死网坍缩前兆',
        stepLabel: isCleared ? '前导 2/2 · 可绕行' : '前导 2/2 · 必入局',
      },
      dialogue: isCleared
        ? '全网蓝屏海啸再度扑来！一旦踏入死网废墟扇区，四维读数将瞬间蓝屏瘫痪——要闭关静守日常，还是重返迷宫直扑地底裂缝？'
        : '轰隆——全网蓝屏海啸当场冲垮四维读数！算力与营收仪表即将全面瘫痪离线，唯有护住清醒神智闯过死网废墟扇区！',
      left: isCleared
        ? {
            label: '开启离线闭关模式避开蓝屏潮（绕开此剧本）',
            fishReaction: '拉上离线铁闸吃两口存粮，等其他风暴冒泡再去搜线索～',
            delta: {},
            skipMajorRaidThisRun: true,
          }
        : {
            label: '甩开死机仪表，锁紧只读神智闯入废墟！（进入大剧本）',
            fishReaction: '四维读数全炸成蓝屏啦！清空杂念，冲进死网扇区寻找真出口！',
            preserveMetricsUnchanged: true,
            launchRaidId: 'raid_deadnet',
          },
      right: isCleared
        ? {
            label: '无视四维瘫痪，重返死网迷宫直扑裂缝！（进入大剧本）',
            fishReaction: '四维蓝屏也拦不住鱼，这一次带齐底牌把最底下的真门撞开！',
            preserveMetricsUnchanged: true,
            launchRaidId: 'raid_deadnet',
          }
        : {
            label: '迎着蓝屏冲击波纵身跃入死网总入口！（进入大剧本）',
            fishReaction: '四维仪表彻底离线！全凭清醒脑仁闯荡死网扇区，大肥鱼冲啦！',
            preserveMetricsUnchanged: true,
            launchRaidId: 'raid_deadnet',
          },
    }),
  },
};

export function getRaidPreludeCard(
  raidId: RaidId,
  stepIndex: 0 | 1,
  isAlreadyCleared: boolean
): CardNode {
  const def = RAID_PRELUDE_DEFS[raidId] ?? RAID_PRELUDE_DEFS.raid_ddos;
  return stepIndex === 0 ? def.step1 : def.buildStep2(isAlreadyCleared);
}
