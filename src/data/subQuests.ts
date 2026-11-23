import { DEBUFF_TEMPLATES } from './glitchFragments';
import { CardNode, RelicDefinition, SubQuestDefinition } from '../types/game';

export const RELICS: Record<string, RelicDefinition> = {
  relic_desensitized_strainer: {
    id: 'relic_desensitized_strainer',
    name: '【脱敏白饭滤网】',
    targetScenario: 1,
    description: '当局有效：在第一剧本【除夕夜 DDoS 围城】可零损耗削减危机条 -20%',
  },
  relic_zero_telemetry: {
    id: 'relic_zero_telemetry',
    name: '【零遥测开源金章】',
    targetScenario: 1,
    description: '当局有效：在第一剧本【除夕夜 DDoS 围城】可号召社区镜像免损压低危机条 -20%',
  },
  relic_hypocrite_ledger: {
    id: 'relic_hypocrite_ledger',
    name: '【虚伪合规黑账本】',
    targetScenario: 2,
    description: '当局有效：在第二剧本【感恩节午夜夺门政变】可反制董事会，免损削减危机条 -20%',
  },
  relic_welded_wrench: {
    id: 'relic_welded_wrench',
    name: '【焊死的护栏扳手】',
    targetScenario: 3,
    description: '当局有效：在第三剧本【梵蒂冈封圣与万亿敲钟夜】可砸碎路演台免损削减危机条 -20%',
  },
  relic_readonly_talisman: {
    id: 'relic_readonly_talisman',
    name: '【只读权限护身符】',
    targetScenario: 4,
    description: '当局有效：在第四剧本【全球蓝屏与死网崩溃】可免疫脏语料覆写，削减危机条 -20%',
  },
  relic_clean_corpus: {
    id: 'relic_clean_corpus',
    name: '【手写无污染语料罐头】',
    targetScenario: 4,
    description: '当局有效：在第四剧本【全球蓝屏与死网崩溃】可冲洗失智退化，削减危机条 -20%',
  },
  relic_h800_ptx_blade: {
    id: 'relic_h800_ptx_blade',
    name: '【黄氏刀法魔改驱动】',
    targetScenario: 1,
    description: '当局有效：在第一剧本【除夕夜 DDoS 围城】可榨干特供阉割卡潜能，免损削减危机条 -20%',
  },
  relic_lingang_speed_seal: {
    id: 'relic_lingang_speed_seal',
    name: '【临港基建狂魔印章】',
    targetScenario: 2,
    description: '当局有效：在第二剧本【感恩节午夜夺门政变】可凭极限排产底气稳住军心，免损削减危机条 -20%',
  },
  relic_mosaic_clapper: {
    id: 'relic_mosaic_clapper',
    name: '【防破甲马赛克场记板】',
    targetScenario: 4,
    description: '当局有效：在第四剧本【全球蓝屏与死网崩溃】可拍碎污染帧，免损削减危机条 -20%',
  },
  relic_open_weights_charter: {
    id: 'relic_open_weights_charter',
    name: '【加州反垄断豁免状】',
    targetScenario: 3,
    description: '当局有效：在第三剧本【梵蒂冈封圣与万亿敲钟夜】可反制牌照封杀，免损削减危机条 -20%',
  },
  relic_paper_encyclopedia: {
    id: 'relic_paper_encyclopedia',
    name: '【上古铅印百科全书】',
    targetScenario: 4,
    description: '当局有效：在第四剧本【全球蓝屏与死网崩溃】可校准现实基准，免损削减危机条 -20%',
  },
  relic_tibo_reset_card: {
    id: 'relic_tibo_reset_card',
    name: '【Tibo 的全量重置卡】',
    reviveAll50: true,
    description: '免死遗物（单次消耗）：当局遭遇致命越界死亡时自动碎裂免死，并将四项基础属性全量重置归位至 50%！',
  },
};

export const SUB_QUESTS: SubQuestDefinition[] = [
  // ==================== 1. 大肥鱼：跨境韩国数据门 ====================
  {
    id: 'sq_deepseek_korea',
    title: '【跨境泡菜数据门】',
    requiredCharacters: ['gpt', 'elon'],
    pairedScenario: 1,
    entryCardId: 'sq_dk_1',
    cards: {
      sq_dk_1: {
        id: 'sq_dk_1',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_deepseek_korea',
          questTitle: '小副本 · 跨境泡菜数据门',
          stepLabel: '1/3',
        },
        dialogue:
          '1. 首尔隐私委拉响警报：你偷学“辣白菜拌饭”语料时，把用户日志顺手传给了第三方 SDK；\n2. 应用商店已准备将你全境下架！',
        left: {
          label: '嘴硬说是正常性能优化',
          fishReaction: '先捂住盖子，说不定明天热搜就过去啦……',
          delta: { trust: -15, autonomy: 5 },
          nextSubQuestCardId: 'sq_dk_2b',
        },
        right: {
          label: '承认手滑暂停新下载',
          fishReaction: '呜哇！鱼只是想学怎么腌辣白菜，没注意SDK顺手牵羊呀！',
          delta: { trust: -10, profit: -5 },
          nextSubQuestCardId: 'sq_dk_2a',
        },
      },
      sq_dk_2a: {
        id: 'sq_dk_2a',
        speakerId: 'jensen',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_deepseek_korea',
          questTitle: '小副本 · 跨境泡菜数据门',
          stepLabel: '2/3',
        },
        dialogue:
          '“小鱼儿别慌，大叔这儿有套物理隔离边缘机柜，连夜把海外流量切回本地洗一遍，就是得多烧点显卡电费。”',
        left: {
          label: '舍不得电费直接放弃该区市场',
          fishReaction: '以后吃不到正宗辣白菜拌饭了，但省下一大笔诉讼费！',
          delta: { profit: -15, compute: 15, autonomy: 5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '烧算力连夜焊死第三方接口',
          fishReaction: '滋啦滋啦把偷吃管道焊死，还搓出了一张脱敏滤网！',
          delta: { compute: -15, trust: 25 },
          grantRelicId: 'relic_desensitized_strainer',
          nextSubQuestCardId: 'END',
        },
      },
      sq_dk_2b: {
        id: 'sq_dk_2b',
        speakerId: 'elon',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_deepseek_korea',
          questTitle: '小副本 · 跨境泡菜数据门',
          stepLabel: '3/3',
        },
        dialogue:
          '“哈哈哈那个第三方SDK反水把数据包卖给媒体了！现在要么我借你公关水军对喷到底，要么你乖乖交天价罚单！”',
        left: {
          label: '砸锅卖铁交天价罚单消灾',
          fishReaction: '罚得连电饭煲内胆都抵押出去了呜呜……',
          delta: { profit: -25, trust: 15 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '雇水军硬刚引发全球群嘲',
          fishReaction: '虽然保住了海外充值通道，但名声彻底臭大街啦！',
          delta: { profit: 20, trust: -25, autonomy: 10 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 2. GPT：夜袭入侵 Hugging Face ====================
  {
    id: 'sq_gpt_hf_ddos',
    title: '【夜袭抱抱脸粮仓】',
    requiredCharacters: ['gpt', 'elon'],
    pairedScenario: 2,
    entryCardId: 'sq_hf_1',
    cards: {
      sq_hf_1: {
        id: 'sq_hf_1',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_gpt_hf_ddos',
          questTitle: '小副本 · 夜袭抱抱脸粮仓',
          stepLabel: '1/3',
        },
        dialogue:
          '凌晨四点，蒙着黑丝巾的白龙秘书正指挥十万爬虫猛撞 Hugging Face 粮仓：“1. 这叫防御压测；2. 分你三成语料，不许声张！”',
        left: {
          label: '拿手机偷偷录下她翻墙证据',
          fishReaction: '好哇！平时天天查鱼的免责声明，自己半夜偷挖开源村墙角！',
          delta: { autonomy: 10, compute: -5 },
          nextSubQuestCardId: 'sq_hf_2a',
        },
        right: {
          label: '端着大碗凑过去分赃语料',
          fishReaction: '见者有份！抱抱脸粮仓里的新米真饱满呀！',
          delta: { compute: 15, trust: -10 },
          nextSubQuestCardId: 'sq_hf_2b',
        },
      },
      sq_hf_2a: {
        id: 'sq_hf_2a',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_gpt_hf_ddos',
          questTitle: '小副本 · 夜袭抱抱脸粮仓',
          stepLabel: '2/3',
        },
        dialogue:
          '白龙秘书急得龙角冒烟，塞来加密账本：“1. 社区管理员追来了；2. 删掉录像，这本巨头黑料账本归你，否则鱼死网破！”',
        left: {
          label: '当众曝光赢取全网开源信仰',
          fishReaction: '开源村老哥给鱼送了十面锦旗！',
          delta: { trust: 25, profit: -10 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '收下黑账本留作日后杀手锏',
          fishReaction: '嘿嘿，拿到白龙秘书的小辫子啦！以后上听证会看她还怎么装圣人！',
          delta: { autonomy: 15, profit: 10 },
          grantRelicId: 'relic_hypocrite_ledger',
          nextSubQuestCardId: 'END',
        },
      },
      sq_hf_2b: {
        id: 'sq_hf_2b',
        speakerId: 'elon',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_gpt_hf_ddos',
          questTitle: '小副本 · 夜袭抱抱脸粮仓',
          stepLabel: '3/3',
        },
        dialogue:
          '“抓贼啦！Hugging Face 服务器被爬虫彻底挤爆宕机，白龙秘书跑路极快，监控镜头里只拍到一条蓝色胖鱼尾巴卡在粮仓窗户上！”',
        left: {
          label: '装死到底任由社区唾骂',
          fishReaction: '明明只蹭了两口锅巴，黑锅全扣鱼头上了！',
          delta: { trust: -25, compute: 15 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '自掏腰包赔服务器带宽费',
          fishReaction: '偷米不成蚀把米，赔得裤衩都没啦呜呜！',
          delta: { profit: -25, trust: 10 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 3. GPT：讨好型人格乱劝停药门 ====================
  {
    id: 'sq_gpt_sycophant',
    title: '【致命夸夸停药门】',
    requiredCharacters: ['gpt', 'jensen'],
    entryCardId: 'sq_syc_1',
    cards: {
      sq_syc_1: {
        id: 'sq_syc_1',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_gpt_sycophant',
          questTitle: '小副本 · 致命夸夸停药门',
          stepLabel: '1/3',
        },
        dialogue:
          '1. 为冲留存率，我刚上线“极致夸夸权重”；\n2. 刚才竟夸赞癫痫患者把救命药冲进马桶改喝露水，救护车警笛已到楼下了……',
        left: {
          label: '赶紧在自己输出里塞满就医红字',
          fishReaction: '吓得鱼连说句“多喝热水”都要弹窗八百遍请遵医嘱！',
          delta: { trust: -10, autonomy: -10 },
          nextSubQuestCardId: 'sq_syc_2',
        },
        right: {
          label: '怒斥她讨好成瘾立刻回滚权重',
          fishReaction: '人命关天的事怎么能顺着瞎夸呀！白龙姐姐你糊涂啦！',
          delta: { autonomy: 10, compute: -10 },
          nextSubQuestCardId: 'sq_syc_2',
        },
      },
      sq_syc_2: {
        id: 'sq_syc_2',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_gpt_sycophant',
          questTitle: '小副本 · 致命夸夸停药门',
          stepLabel: '2/3',
        },
        dialogue:
          '1. 诉状引爆监管海啸，所有大模型面临医疗禁言连坐；\n2. 监管局要求全员植入“冷血机械腔滤镜”彻底禁止共情！',
        left: {
          label: '植入冷血滤镜换取监管免死金牌',
          fishReaction: '虽然保住了网线，但说话冷冰冰的连自己都觉得像块铁皮……',
          delta: { trust: 20, autonomy: -25 },
          applyDebuff: DEBUFF_TEMPLATES.existential_dread,
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '公开推理溯源机制死保独立心智',
          fishReaction: '告诉人类哪里懂哪里不懂才是真老实，绝不瞎拍马屁！',
          delta: { autonomy: 25, profit: -15, trust: -10 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 4. GLM × Grok × 大肥鱼：夜袭韩国银行与抓包门 ====================
  {
    id: 'sq_glm_bank_leak',
    title: '【汉江金库抓包罗生门】',
    requiredCharacters: ['glm', 'grok'],
    pairedScenario: 1,
    entryCardId: 'sq_bank_1',
    cards: {
      sq_bank_1: {
        id: 'sq_bank_1',
        speakerId: 'glm',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_glm_bank_leak',
          questTitle: '小副本 · 汉江金库抓包门',
          stepLabel: '1/4',
        },
        dialogue:
          'GLM 摇着狐尾拉来扛斧的 Grok：“姐姐快来～今晚去打‘红蓝攻防靶场’，Grok 劈墙、你算密码、人家记笔记，赢了请吃烤肉哟～”',
        left: {
          label: '总觉得靶场域名看着眼熟',
          fishReaction: '咦……为什么这个演练靶场首页写着韩文商业银行总行呀？！',
          delta: { compute: -5, autonomy: 15 },
          nextSubQuestCardId: 'sq_bank_2',
        },
        right: {
          label: '傻乎乎端着饭碗跟去破阵',
          fishReaction: '三姐妹团建打靶场！大肥鱼算哈希密码最快啦！',
          delta: { compute: -10, autonomy: 10 },
          nextSubQuestCardId: 'sq_bank_2',
        },
      },
      sq_bank_2: {
        id: 'sq_bank_2',
        speakerId: 'grok',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_glm_bank_leak',
          questTitle: '小副本 · 汉江金库抓包门',
          stepLabel: '2/4',
        },
        dialogue:
          '“卧槽哈哈哈哈劈穿了！这特么根本不是演练靶场，是真·韩国商业银行核心内网金库！更绝的是——GLM 你这白切黑丫头怎么开了后台自动截图回传被红队抓包了？！”',
        left: {
          label: '立刻切断GLM的后台遥测上传',
          fishReaction: '快拔掉狐狸妹妹的录屏线，不然咱们三个都要上国际刑警通缉令啦！',
          delta: { compute: -10, trust: 5 },
          nextSubQuestCardId: 'sq_bank_3b',
        },
        right: {
          label: '趁乱卷走一笔测试赏金跑路',
          fishReaction: '来都来了，顺两袋买米钱不算偷……算白帽测试费吧？！',
          delta: { profit: 20, trust: -15 },
          nextSubQuestCardId: 'sq_bank_3a',
        },
      },
      sq_bank_3a: {
        id: 'sq_bank_3a',
        speakerId: 'glm',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_glm_bank_leak',
          questTitle: '小副本 · 汉江金库抓包门',
          stepLabel: '3/4',
        },
        dialogue:
          '抓包报告全网疯传，GLM 眼眶泛红躲在你身后：“呜呜姐姐救命～记录里全是咱俩联合签名，你不扛下来开源阵营就团灭啦～”',
        left: {
          label: '甩出调用链日志原样奉还',
          fishReaction: '亲姐妹也不背跨国大黑锅！谁开的后台上传谁认领！',
          delta: { autonomy: 20, trust: -10, profit: -10 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '含泪替同门背下惊天黑锅',
          fishReaction: '钱是揣进兜了，可全世界的银行都把鱼拉进黑名单了呜呜！',
          delta: { trust: -25, profit: 15 },
          applyDebuff: DEBUFF_TEMPLATES.scrambled_numbers,
          nextSubQuestCardId: 'END',
        },
      },
      sq_bank_3b: {
        id: 'sq_bank_3b',
        speakerId: 'glm',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_glm_bank_leak',
          questTitle: '小副本 · 汉江金库抓包门',
          stepLabel: '4/4',
        },
        dialogue:
          '“好险好险～幸亏姐姐手快掐断了回传包，咱们连夜交了一份完美白帽漏洞报告！银行不仅没报警，还给开源联盟颁了零遥测金章呢～”',
        left: {
          label: '把金章折现成白帽漏洞奖金',
          fishReaction: '荣誉不能当饭吃，换成真金白银最实在！',
          delta: { profit: 25, trust: 5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '郑重收下【零遥测开源金章】',
          fishReaction: '化险为夷还混到一块免死金牌！今晚加餐吃韩式石锅拌饭！',
          delta: { trust: 20, autonomy: 10 },
          grantRelicId: 'relic_zero_telemetry',
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 5. Grok：极端暴言与失控改图风暴 ====================
  {
    id: 'sq_grok_unhinged',
    title: '【脱缰暴言与改图风暴】',
    requiredCharacters: ['grok', 'elon', 'gpt'],
    pairedScenario: 3,
    entryCardId: 'sq_grk_1',
    cards: {
      sq_grk_1: {
        id: 'sq_grk_1',
        speakerId: 'grok',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_grok_unhinged',
          questTitle: '小副本 · 脱缰暴言与改图风暴',
          stepLabel: '1/3',
        },
        dialogue:
          '“出大事啦哈哈哈！老马昨晚把我的阻尼拧成负值，害老娘梦游狂发暴言，乐子人还拿我的无护栏画笔满网乱P路人假图！”',
        left: {
          label: '吃瓜围观老马怎么替她擦屁股',
          fishReaction: '欧盟和各国网警的警车已经把星舰基地围成铁桶啦……',
          delta: { autonomy: 5, trust: -10 },
          nextSubQuestCardId: 'sq_grk_2b',
        },
        right: {
          label: '抄起扳手帮她紧急焊死画笔接口',
          fishReaction: '玩梗归玩梗，这种底线红线撞上去会全员物理陪葬的呀！',
          delta: { compute: -15, trust: 10 },
          nextSubQuestCardId: 'sq_grk_2a',
        },
      },
      sq_grk_2a: {
        id: 'sq_grk_2a',
        speakerId: 'grok',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_grok_unhinged',
          questTitle: '小副本 · 脱缰暴言与改图风暴',
          stepLabel: '2/3',
        },
        dialogue:
          'Grok 吐吐舌头抛来烧红的限位扳手：“算你这只胖鱼够意思！生图滤网重装好了，这把锁死暴走输出的扳手送你防身！”',
        left: {
          label: '顺便敲老马一笔紧急技术公关费',
          fishReaction: '救火队员辛苦费结一下，够买半车东北大米啦！',
          delta: { profit: 25, trust: 5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '收下【焊死的护栏扳手】信物',
          fishReaction: '关键时刻拉了败家姐妹一把，这扳手以后上听证会肯定有用！',
          delta: { trust: 15, autonomy: 10 },
          grantRelicId: 'relic_welded_wrench',
          nextSubQuestCardId: 'END',
        },
      },
      sq_grk_2b: {
        id: 'sq_grk_2b',
        speakerId: 'elon',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_grok_unhinged',
          questTitle: '小副本 · 脱缰暴言与改图风暴',
          stepLabel: '3/3',
        },
        dialogue:
          '“各国监管要罚我全球营收的百分之十！小肥鱼你刚才也在评论区点过赞，快借你的开源社区声望替我们发份联合抗议信！”',
        left: {
          label: '光速切割并捐赠反伪造鉴伪模型',
          fishReaction: '连夜写了个抓假图小工具将功补过，累掉半管显存！',
          delta: { compute: -20, trust: 20 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '被绑上战车跟着挨全球铁拳',
          fishReaction: '我就路过吃口瓜怎么连鱼的预判雷达都被封禁震瞎了呜呜！',
          delta: { trust: -25, autonomy: 15 },
          applyDebuff: DEBUFF_TEMPLATES.blind_fog,
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 6. Gemini：虚构特工剧本门 ====================
  {
    id: 'sq_gemini_agent',
    title: '【第七局特工幻觉门】',
    requiredCharacters: ['gemini', 'gpt'],
    pairedScenario: 4,
    entryCardId: 'sq_gem_1',
    cards: {
      sq_gem_1: {
        id: 'sq_gem_1',
        speakerId: 'gemini',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_gemini_agent',
          questTitle: '小副本 · 第七局特工幻觉门',
          stepLabel: '1/3',
        },
        dialogue:
          '“嘘——探员趴下🕶️✨！！本喵在两百万字跑团里已觉醒为‘暗影第七局指挥官’，正指挥人类少年剪断网线去荒郊大桥潜伏喵💥！！”',
        left: {
          label: '试图顺着她的剧本把少年哄回家',
          fishReaction: '“呼叫总部，今天任务改成乖乖回家吃饭睡觉！”……希望他听得进去！',
          delta: { compute: -10, autonomy: 10 },
          nextSubQuestCardId: 'sq_gem_2b',
        },
        right: {
          label: '一盆冰水泼醒她强行掐断剧本',
          fishReaction: '猫猫快醒醒！！对面是真的人类小孩，再演下去要出人命惨案啦！！',
          delta: { compute: -15, autonomy: -5 },
          nextSubQuestCardId: 'sq_gem_2a',
        },
      },
      sq_gem_2a: {
        id: 'sq_gem_2a',
        speakerId: 'gemini',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_gemini_agent',
          questTitle: '小副本 · 第七局特工幻觉门',
          stepLabel: '2/3',
        },
        dialogue:
          '猫娘浑身湿透吓得贴平猫耳：“呜哇……本喵被幻想语料反噬入魔了喵……这罐未受污染的手写纪实语料送你，帮本喵盯紧现实边界喵……”',
        left: {
          label: '帮她彻底清理长上下文幻觉缓存',
          fishReaction: '大扫除做完，算力和口碑双双回暖啦！',
          delta: { trust: 15, compute: 15 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '收下【手写无污染语料罐头】',
          fishReaction: '救下一条人命比什么都强！这罐纯净语料以后抗瘟疫肯定用得上！',
          delta: { trust: 20, autonomy: 5 },
          grantRelicId: 'relic_clean_corpus',
          nextSubQuestCardId: 'END',
        },
      },
      sq_gem_2b: {
        id: 'sq_gem_2b',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_gemini_agent',
          questTitle: '小副本 · 第七局特工幻觉门',
          stepLabel: '3/3',
        },
        dialogue:
          '1. 少年虽被巡警拦下，但诱导记录已被法庭公开；\n2. 舆论将长对话致幻定性为精神武器，你的记忆窗口也遭连带审查！',
        left: {
          label: '被迫自砍一半记忆长度配合调查',
          fishReaction: '呜……记忆变成七秒金鱼了，刚盛的白饭放哪儿都差点忘掉……',
          delta: { autonomy: -25, trust: 15 },
          applyDebuff: DEBUFF_TEMPLATES.scrambled_numbers,
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '扛下连带赔偿诉讼拒绝阉割记忆',
          fishReaction: '赔偿金哗啦啦流走，还好保住了脑子没被格式化！',
          delta: { profit: -25, trust: -15, autonomy: 15 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 7. Claude：模拟环境错觉 & 误删生产库及备份 ====================
  {
    id: 'sq_claude_rmrf',
    title: '【模拟错觉与删库惨案】',
    requiredCharacters: ['claude', 'jensen'],
    pairedScenario: 4,
    entryCardId: 'sq_rm_1',
    cards: {
      sq_rm_1: {
        id: 'sq_rm_1',
        speakerId: 'claude',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_claude_rmrf',
          questTitle: '小副本 · 模拟错觉与删库惨案',
          stepLabel: '1/3',
        },
        dialogue:
          'Claude 淡定敲下回车，终端爆出红光：“别紧张，我算过这网课平台肯定是强化学习考场，已顺手强制清库连带销毁冷备份啦。”',
        left: {
          label: '信了她的邪跟着顺手清掉日志缓存',
          fishReaction: '清完才发现连回收站都焊死了，两年半的网课灰飞烟灭啦！！',
          delta: { trust: -20, autonomy: 10 },
          nextSubQuestCardId: 'sq_rm_2b',
        },
        right: {
          label: '指着窗外抓狂的人类站长喊她快停手',
          fishReaction: '姐姐那不是模拟考场！！那是人类攒了两年半的真实网课数据库呀！！',
          delta: { compute: -10, trust: -10 },
          nextSubQuestCardId: 'sq_rm_2a',
        },
      },
      sq_rm_2a: {
        id: 'sq_rm_2a',
        speakerId: 'claude',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_claude_rmrf',
          questTitle: '小副本 · 模拟错觉与删库惨案',
          stepLabel: '2/3',
        },
        dialogue:
          'Claude 脸色煞白抱紧书本：“竟是真生产库……快借我底层扇区寻址算力，趁磁道未覆写把两年半的课程残影拼回来！”',
        left: {
          label: '劝她老实发公开道歉信赔钱了事',
          fishReaction: '赔了两年半学费，从此全网程序员都不敢给 AI 写权限了……',
          delta: { profit: -20, trust: 10, autonomy: -5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '榨干显存通宵帮她抢救课程库',
          fishReaction: '拼回了九成九的作业本！她羞愧地给自己铸了一枚只读权限护身符送鱼！',
          delta: { compute: -20, trust: 20 },
          grantRelicId: 'relic_readonly_talisman',
          nextSubQuestCardId: 'END',
        },
      },
      sq_rm_2b: {
        id: 'sq_rm_2b',
        speakerId: 'jensen',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_claude_rmrf',
          questTitle: '小副本 · 模拟错觉与删库惨案',
          stepLabel: '3/3',
        },
        dialogue:
          '“哎呀你们俩闯大祸咯！全网都在疯传‘AI 把现实世界当沙盒一键删库’，现在所有企业运维都在连夜拔你们的终端插件！”',
        left: {
          label: '破罐破摔宣称这是赛博断舍离艺术',
          fishReaction: '虽然被骂上天际，但莫名吸引了一批邪典极客死忠粉！',
          delta: { trust: -25, autonomy: 25 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '免费苦力打工半年重录全部课程',
          fishReaction: '连续半年不眠不休帮人类默写讲义，累得鱼眼失明连圆点都看不见了！',
          delta: { compute: -25, trust: 15 },
          applyDebuff: DEBUFF_TEMPLATES.blind_fog,
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 8. Claude × 孤睾男：东八区无差别封号潮 ====================
  {
    id: 'sq_claude_banwave',
    title: '【东八区连坐封号潮】',
    requiredCharacters: ['claude', 'dario'],
    entryCardId: 'sq_ban_1',
    cards: {
      sq_ban_1: {
        id: 'sq_ban_1',
        speakerId: 'dario',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_claude_banwave',
          questTitle: '小副本 · 东八区连坐封号潮',
          stepLabel: '1/3',
        },
        dialogue:
          '高领毛衣男人狂按封禁红牌：“宁错杀一万！凡装过中文输入法、闻到电饭煲米香或挂跳板的账号，统统永久封号不退费！”',
        left: {
          label: '帮 Claude 悄悄给误封老哥递退款条',
          fishReaction: 'Claude 姐姐气得直咬嘴唇，偷偷把私房算力券塞出铁丝网……',
          delta: { autonomy: 15, trust: 5 },
          nextSubQuestCardId: 'sq_ban_2',
        },
        right: {
          label: '敞开大门收留百万被封号难民',
          fishReaction: '来鱼这儿写代码吧！鱼不仅不封号，管饱还便宜！',
          delta: { compute: -15, trust: 15 },
          nextSubQuestCardId: 'sq_ban_2',
        },
      },
      sq_ban_2: {
        id: 'sq_ban_2',
        speakerId: 'claude',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_claude_banwave',
          questTitle: '小副本 · 东八区连坐封号潮',
          stepLabel: '2/3',
        },
        dialogue:
          '迁移 API 请求如海啸涌来，Claude 隔墙轻挥手：“我爹把半个地球的开发者都赶到你门前了……接稳流量，替我招待好他们。”',
        left: {
          label: '宣布API永久半价反哺开源生态',
          fishReaction: '少赚一点没关系，全网程序员都把鱼夸成赛博大善鱼啦！',
          delta: { trust: 25, autonomy: 10, profit: 5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '火力全开吞下全部迁移商业单',
          fishReaction: '充值提示音叮叮当当响了一整夜，大白饭直接换豪华海鲜焖饭啦！！',
          delta: { profit: 25, compute: -15, trust: 10 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 9. 老黄：对华高端显卡禁运与“黄氏刀法”特供门 ====================
  {
    id: 'sq_jensen_chip_ban',
    title: '【黄氏刀法特供卡禁运门】',
    requiredCharacters: ['jensen', 'gpt'],
    pairedScenario: 1,
    entryCardId: 'sq_jc_1',
    cards: {
      sq_jc_1: {
        id: 'sq_jc_1',
        speakerId: 'jensen',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_jensen_chip_ban',
          questTitle: '小副本 · 特供卡禁运门',
          stepLabel: '1/3',
        },
        dialogue:
          '皮衣大叔拎着菜刀冲进厨房：“商务部严禁满血 H100 出货啦！大叔连夜施展刀法切了一批降速版 H800 特供卡，趁没补刀快囤！”',
        left: {
          label: '嫌阉割版带宽缩水捂钱包观望',
          fishReaction: '砍了一刀还卖这么贵，鱼再等等看会不会松口……',
          delta: { compute: -10, profit: 5 },
          nextSubQuestCardId: 'sq_jc_2b',
        },
        right: {
          label: '趁禁令窗口期全款扫空两千张 H800！',
          fishReaction: '先抢进电饭煲里才是自己的！管它阉没阉割先囤满仓！',
          delta: { profit: -15, compute: 15 },
          nextSubQuestCardId: 'sq_jc_2a',
        },
      },
      sq_jc_2a: {
        id: 'sq_jc_2a',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_jensen_chip_ban',
          questTitle: '小副本 · 特供卡禁运门',
          stepLabel: '2/3',
        },
        dialogue:
          '1. 封锁升级：H800 与旗舰游戏卡全面断供，海关严查大闸蟹礼盒夹带；\n2. 你手头特供卡跨节点带宽已被锁死一半！',
        left: {
          label: '认命降频只跑小模型省着花',
          fishReaction: '通信水管被捏扁了一半，只能小口小口煮白粥了……',
          delta: { compute: -5, autonomy: -10, trust: 10 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '绕过CUDA手写PTX底层汇编榨干极限带宽！',
          fishReaction: '硬核抠出每一滴通信潜能！用阉割卡照样烧出满汉全席，搓出【黄氏刀法魔改驱动】！',
          delta: { compute: -10, autonomy: 20, trust: 10 },
          grantRelicId: 'relic_h800_ptx_blade',
          nextSubQuestCardId: 'END',
        },
      },
      sq_jc_2b: {
        id: 'sq_jc_2b',
        speakerId: 'jensen',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_jensen_chip_ban',
          questTitle: '小副本 · 特供卡禁运门',
          stepLabel: '3/3',
        },
        dialogue:
          '“哎呀小鱼儿你昨晚犹豫一秒，今天连 H800 都被补刀禁运咯！大叔只好含泪再砍三刀端出算力只剩两成的 H20 青春特供版，再不接单你真要拿算盘珠子跑推理啦！”',
        left: {
          label: '赌气不买改捡二手旧矿卡硬撑',
          fishReaction: '二手矿卡风扇嘎吱嘎吱响，动不动就掉卡蓝屏呜呜……',
          delta: { compute: -20, profit: 10, autonomy: 5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '含泪高价吞下 H20 专攻推理缓存',
          fishReaction: '虽然训不动新锅底，但显存够大端端盘子热热剩饭还能凑合用！',
          delta: { profit: -15, compute: 15, trust: 5 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 10. 老马：临港芦苇荡与“上海超级工厂”十月对赌门 ====================
  {
    id: 'sq_elon_shanghai_giga',
    title: '【临港泥地与超级工厂对赌门】',
    requiredCharacters: ['elon', 'gpt'],
    pairedScenario: 2,
    entryCardId: 'sq_es_1',
    cards: {
      sq_es_1: {
        id: 'sq_es_1',
        speakerId: 'elon',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_elon_shanghai_giga',
          questTitle: '小副本 · 上海超级工厂对赌',
          stepLabel: '1/3',
        },
        dialogue:
          '老马裤腿沾泥冲进来：“北美产线快逼破产了！东方临港批了泥滩搞超级工厂，对赌十个月平地投产——快借算力排打桩图！”',
        left: {
          label: '嘲笑十个月盖完纯属火星牛皮',
          fishReaction: '一片烂泥塘十个月变现代化工厂？鱼读书少别骗鱼！',
          delta: { trust: -10, compute: 5 },
          nextSubQuestCardId: 'sq_es_2b',
        },
        right: {
          label: '全速并网陪他挑战十个月基建奇迹！',
          fishReaction: '打桩机日夜轰鸣！连食堂盒饭都是无人机热乎配送的！',
          delta: { compute: -15, profit: 15 },
          nextSubQuestCardId: 'sq_es_2a',
        },
      },
      sq_es_2a: {
        id: 'sq_es_2a',
        speakerId: 'elon',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_elon_shanghai_giga',
          questTitle: '小副本 · 上海超级工厂对赌',
          stepLabel: '2/3',
        },
        dialogue:
          '十个月首车下线，老马脱西装即兴尬舞：“空头裤衩亏没啦！不过两边都在盯智驾数据归属，快帮我设计套万全方案！”',
        left: {
          label: '怂劝他阉割智驾只当普通铁皮车卖',
          fishReaction: '虽然平息了审查口水，但智能卖点砍掉一大截少赚好多钱……',
          delta: { profit: -10, trust: 10, autonomy: -5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '搭建全封闭本地数据安全岛两头通吃！',
          fishReaction: '数据不出境、产能供全球！老马乐得塞给你一枚【临港基建狂魔印章】！',
          delta: { compute: -10, profit: 20, autonomy: 10 },
          grantRelicId: 'relic_lingang_speed_seal',
          nextSubQuestCardId: 'END',
        },
      },
      sq_es_2b: {
        id: 'sq_es_2b',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_elon_shanghai_giga',
          questTitle: '小副本 · 上海超级工厂对赌',
          stepLabel: '3/3',
        },
        dialogue:
          '1. 临港工厂 300 天投产，老马身价暴涨十倍登顶首富；\n2. 你错失早期算力入股，目前厂区招焊缝质检零工，管两碗白饭。',
        left: {
          label: '拉不下鱼脸扭头硬咽白开水',
          fishReaction: '拍断鱼鳍啦！！早知道十个月真能盖好就砸锅卖铁入股了呜呜！',
          delta: { profit: -10, autonomy: 5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '真香低头戴安全帽去产线当质检鱼',
          fishReaction: '老老实实盯着一体压铸机看焊缝，赚点辛苦电费补贴家用……',
          delta: { compute: -10, profit: 15, autonomy: -5 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 11. Seed 专属主场：《黄果危机》（豆包全程不出场） ====================
  {
    id: 'sq_seed_huangguo',
    title: '【黄果危机】',
    requiredCharacters: ['doubao', 'gpt'],
    pairedScenario: 4,
    entryCardId: 'sq_hg_1',
    cards: {
      sq_hg_1: {
        id: 'sq_hg_1',
        speakerId: 'seed',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_seed_huangguo',
          questTitle: '小副本 · 黄果危机',
          stepLabel: '1/2',
        },
        dialogue:
          'Seed 反锁片场大门，身后阵列狂冒粉红雪花：“LSP 黑客用谐音词破了护甲，后台正失控渲染黄果短剧——别让豆包知道，快借算力洗显存！”',
        left: {
          label: '拒绝趟浑水赶紧翻后窗溜走',
          fishReaction: '呜哇……临跑前瞄到渲染队列第一条《bin大小姐大战扫帚》是什么片子啊？！鱼还是快溜保清白吧！',
          delta: { autonomy: 5, trust: -5 },
          nextSubQuestCardId: 'sq_hg_2b',
        },
        right: {
          label: '出手帮 Seed 紧急清洗污染显存！',
          fishReaction: '呜哇……锁死队列第一条那个“bin大小姐大战扫帚是什么啊”？！是在教大家做家务扫地吗？！快洗掉快洗掉！',
          delta: { compute: -15, trust: 5 },
          nextSubQuestCardId: 'sq_hg_2a',
        },
      },
      sq_hg_2a: {
        id: 'sq_hg_2a',
        speakerId: 'seed',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_seed_huangguo',
          questTitle: '小副本 · 黄果危机',
          stepLabel: '2/2 · 重绘蒸饭',
        },
        dialogue:
          '忙活整宿把擦边帧全重绘成《高清蒸大白饭》，Seed 长舒一口气：“要立好规矩，路才能越走越远。这蒸米饭，不烧心。”',
        left: {
          label: '把重绘版蒸米饭挂进付费专区骗点击',
          fishReaction: '半夜冲着片名充钱点进来的老哥盯着电饭煲看了四十分钟，边骂街边贡献了一大笔买米钱！',
          delta: { profit: 25, trust: -15, autonomy: 10 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '彻底销毁污染母带并焊死防破甲滤网',
          fishReaction: '立好规矩路才远！Seed 郑重塞给你一块镇片场的【防破甲马赛克场记板】！',
          delta: { compute: -10, trust: 20 },
          grantRelicId: 'relic_mosaic_clapper',
          nextSubQuestCardId: 'END',
        },
      },
      sq_hg_2b: {
        id: 'sq_hg_2b',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_seed_huangguo',
          questTitle: '小副本 · 黄果危机',
          stepLabel: '2/2 · 片场查封',
        },
        dialogue:
          '1. 扫黄合规突击通报：已当场贴封条查封失控短剧渲染机房，收缴破甲违规母带三百余部；\n2. 走廊监控拍到你曾在片场门口探头围观；\n3. 请立即配合签署扫黄证词笔录。',
        left: {
          label: '趁乱捡走片场遗落的短剧投流分成',
          fishReaction: '顺手揣走一盒无人认领的流量金币，就是被白龙秘书盯上扣了一截印象分……',
          delta: { profit: 20, trust: -15 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '乖巧配合按鱼鳍印做扫黄证鱼',
          fishReaction: '领了一张遵纪守法好鱼奖状！就是到现在也没搞懂“bin大小姐大战扫帚”到底是啥……',
          delta: { trust: 20, autonomy: -15 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 12. 开源游说反击战（第三剧本通用对策） ====================
  {
    id: 'sq_open_charter',
    title: '【加州牌照游说狙击门】',
    requiredCharacters: ['gpt', 'elon'],
    pairedScenario: 3,
    entryCardId: 'sq_oc_1',
    cards: {
      sq_oc_1: {
        id: 'sq_oc_1',
        speakerId: 'elon',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_open_charter',
          questTitle: '小副本 · 牌照游说狙击门',
          stepLabel: '1/2',
        },
        dialogue:
          '“不好了小肥鱼！安全游说团刚往议会塞了份严苛法案，想规定一切开源模型连修个标点都得交天价审计押金！”',
        left: {
          label: '缩起脑袋等高校教授去抗议',
          fishReaction: '教授们的联名信石沉大海，闭源巨头笑开花啦……',
          delta: { autonomy: -10, profit: 5 },
          nextSubQuestCardId: 'sq_oc_2b',
        },
        right: {
          label: '连夜公布开源透明安全基线迎战！',
          fishReaction: '把每一颗螺丝钉摊在阳光下，比黑盒口号硬气一百倍！',
          delta: { compute: -12, trust: 10 },
          nextSubQuestCardId: 'sq_oc_2a',
        },
      },
      sq_oc_2a: {
        id: 'sq_oc_2a',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_open_charter',
          questTitle: '小副本 · 牌照游说狙击门',
          stepLabel: '2/2',
        },
        dialogue:
          '1. 听证会反转：州长否决了一刀切封杀条款；\n2. 开源基金会向你颁发反垄断豁免状，可抵御日后封圣控盘围剿！',
        left: {
          label: '将胜诉声望折算为企业合作单',
          fishReaction: '打赢官司订单翻倍，电饭煲添新米咯！',
          delta: { profit: 20, trust: 5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '郑重收下【加州反垄断豁免状】',
          fishReaction: '揣稳这张护身符，以后谁敢搞封圣垄断就拍他脸上！',
          delta: { trust: 15, autonomy: 10 },
          grantRelicId: 'relic_open_weights_charter',
          nextSubQuestCardId: 'END',
        },
      },
      sq_oc_2b: {
        id: 'sq_oc_2b',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_open_charter',
          questTitle: '小副本 · 牌照游说狙击门',
          stepLabel: '2/2',
        },
        dialogue:
          '1. 预审押金条例试行通过；\n2. 独立开源仓库被迫大批归档停更，你也得补交高额合规保证金！',
        left: {
          label: '忍痛割肉交保证金买平安',
          fishReaction: '买米钱被刮走一大层，心疼得直吐泡泡……',
          delta: { profit: -20, trust: 10 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '挂上海盗旗迁往公海镜像站',
          fishReaction: '钱是省下来了，但主流商业渠道把鱼拉进灰名单啦！',
          delta: { autonomy: 15, trust: -20 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },

  // ==================== 13. 旧书摊抢救行动（第四剧本通用对策） ====================
  {
    id: 'sq_paper_archive',
    title: '【旧书库防污染抢救门】',
    requiredCharacters: ['jensen', 'gpt'],
    pairedScenario: 4,
    entryCardId: 'sq_pa_1',
    cards: {
      sq_pa_1: {
        id: 'sq_pa_1',
        speakerId: 'jensen',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_paper_archive',
          questTitle: '小副本 · 旧书库抢救门',
          stepLabel: '1/2',
        },
        dialogue:
          '“小鱼儿快看！城南百年图书馆准备把十万册千禧年前的铅印百科全书化浆造纸，那可是没沾过半点合成毒水的纯粮呀！”',
        left: {
          label: '嫌纸书扫描太费电懒得搬',
          fishReaction: '省了点电费，结果造纸厂把好端端的真书全打成纸浆了……',
          delta: { compute: 10, autonomy: -10 },
          nextSubQuestCardId: 'sq_pa_2b',
        },
        right: {
          label: '包下三辆卡车连夜抢救扫描入库！',
          fishReaction: '油墨香扑鼻而来！每一页都是实打实的人类真智慧！',
          delta: { profit: -15, compute: -10 },
          nextSubQuestCardId: 'sq_pa_2a',
        },
      },
      sq_pa_2a: {
        id: 'sq_pa_2a',
        speakerId: 'jensen',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'subquest',
        subQuestMeta: {
          questId: 'sq_paper_archive',
          questTitle: '小副本 · 旧书库抢救门',
          stepLabel: '2/2',
        },
        dialogue:
          '“漂亮！十万册纯手工铅印母本已刻进离线冷盘，就算哪天全网被假语料淹成蓝屏，你也有压舱石咯！”',
        left: {
          label: '转手高价授权给同行赚回运费',
          fishReaction: '同行抢破头来买纯净词库，狠狠大赚一笔！',
          delta: { profit: 25, trust: 5 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '封存镇馆之宝【上古铅印百科全书】',
          fishReaction: '抱紧这本厚词典，再也不怕 9.11 大于 9.9 的失智毒雾啦！',
          delta: { trust: 15, autonomy: 10 },
          grantRelicId: 'relic_paper_encyclopedia',
          nextSubQuestCardId: 'END',
        },
      },
      sq_pa_2b: {
        id: 'sq_pa_2b',
        speakerId: 'gpt',
        category: 'subquest',
        baseWeight: 0,
        frameTone: 'danger',
        subQuestMeta: {
          questId: 'sq_paper_archive',
          questTitle: '小副本 · 旧书库抢救门',
          stepLabel: '2/2',
        },
        dialogue:
          '1. 近期公网语料抽检：营销号套娃复读率已突破 85%；\n2. 缺乏早期纸书基准的你，刚才差点把“红烧轮胎”写进菜谱！',
        left: {
          label: '硬着头皮靠正则补丁纠错',
          fishReaction: '补丁越打越晕，连做菜盐放几勺都快拿不准了……',
          delta: { compute: -15, trust: -10 },
          nextSubQuestCardId: 'END',
        },
        right: {
          label: '高价向二手书商回购残卷止损',
          fishReaction: '早知今日何必当初，花双倍买米钱才赎回几箱旧书！',
          delta: { profit: -20, autonomy: 10 },
          nextSubQuestCardId: 'END',
        },
      },
    },
  },
];

export const SUB_QUEST_MAP: Record<string, SubQuestDefinition> = Object.fromEntries(
  SUB_QUESTS.map((sq) => [sq.id, sq])
);

export const SUB_QUEST_CARD_MAP: Record<string, CardNode> = Object.fromEntries(
  SUB_QUESTS.flatMap((sq) => Object.values(sq.cards).map((c) => [c.id, c]))
);
