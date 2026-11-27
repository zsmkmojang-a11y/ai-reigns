import { CardNode, MajorRaidDefinition, RaidId } from '../types/game';

export const MAJOR_RAIDS: Record<RaidId, MajorRaidDefinition> = {
  // =========================================================================
  // 第一剧本：【除夕夜：六千亿血崩与百倍僵尸围城】（第 3 周目解锁）
  // 现实蓝本：2025 除夕 DeepSeek-R1 登顶致英伟达单日蒸发 6000 亿美金 + 蒸馏构陷 + 百倍僵尸网络 DDoS
  // 里结局线索：flag_found_0ms（0.00ms 同机母板物理回环） -> 产出 log1
  // 专属坏结局：end_girl_glm（切片陷阱 / 满危机 A） / end_girl_gpt（满危机 B）
  // =========================================================================
  raid_ddos: {
    id: 'raid_ddos',
    scenarioNumber: 1,
    title: '第一剧本 · 除夕夜：六千亿血崩与百倍僵尸围城',
    crisisName: '“服务器繁忙”全网宕机率',
    entryCardId: 'ddos_1',
    defaultCrisisEndingA: 'end_girl_glm',
    defaultCrisisEndingB: 'end_girl_gpt',
    cards: {
      ddos_1: {
        id: 'ddos_1',
        speakerId: 'jensen',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '除夕六千亿血崩夜',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '除夕 18:00 · 血崩开盘 (1/12)',
        },
        dialogue:
          '皮衣大叔手里的金锅铲哐当落地：“小鱼儿闯大祸咯！你花五百五十万买米钱训出的开源权重登顶榜首，华尔街恐慌抛售，大叔单日蒸发六千亿美金啦！”',
        left: {
          label: '低调限流关闭新用户注册避风头（宕机飙升）',
          fishReaction: '门外挤着一亿想看热闹的新用户拍门，排队红条一下窜高了！',
          delta: { compute: 10, profit: 8, autonomy: -8 },
          crisisDelta: 15,
          setAllyBranch: 'A',
          nextRaidCardId: 'ddos_2',
        },
        right: {
          label: '顶住华尔街风暴全量敞开满血 API（稳住局势）',
          fishReaction: '电饭煲火力拉满先稳住大门，可机柜风扇已经开始发烫啦！',
          delta: { compute: -10, trust: 10 },
          crisisDelta: 0,
          setAllyBranch: 'B',
          nextRaidCardId: 'ddos_2',
        },
      },

      ddos_2: {
        id: 'ddos_2',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '除夕六千亿血崩夜',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '除夕 19:30 · 蒸馏构陷 (2/12)',
        },
        dialogue:
          '1. 闭源联盟指控你“违规蒸馏窃取思维链”并递交白宫审查；\n2. 每秒千万级 HTTP 洪峰同时撞上网关，不论回应与否宕机率都在攀升！',
        left: {
          label: '沉默缩壳不予回应任由舆论流量夹击（大幅增压）',
          fishReaction: '一边挨骂小偷一边被刷爆接口，网关红灯越闪越急……',
          delta: { trust: -10, autonomy: -10, profit: 6 },
          crisisDelta: 15,
          nextRaidCardId: 'ddos_2b',
        },
        right: {
          label: '晒出纯强化学习论文硬刚闭源指控（轻度增压）',
          fishReaction: '清清白白自己悟的菜谱！不过围观论文的吃瓜群众顺手又挤爆了一波带宽！',
          delta: { autonomy: 8, profit: -10, trust: 8 },
          crisisDelta: 5,
          nextRaidCardId: 'ddos_2b',
        },
      },

      ddos_2b: {
        id: 'ddos_2b',
        speakerId: 'grok',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '除夕百倍僵尸围城',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '除夕 20:30 · 盗刷黑产 (3/12)',
        },
        dialogue:
          'Grok 扛着战斧幸灾乐祸拍桌：“笑死！暗网羊毛党趁你免费开源，连夜架起十万个自动脚本白嫖 API 倒卖，这波不管封不封号都够你喝一壶！”',
        left: {
          label: '痛下狠手全网拉黑异常代理段（稳住宕机）',
          fishReaction: '把黑产脚本连同半个高校寝室的正常用户一起踢下线，骂声换来了喘息！',
          delta: { profit: -10, trust: -8, autonomy: -6 },
          crisisDelta: 0,
          nextRaidCardId: 'ddos_3',
        },
        right: {
          label: '放宽风控宁可被薅也不误伤热心网友（宕机飙升）',
          fishReaction: '口碑和钱包流量都保住了，可羊毛脚本正把网关队列堵得水泄不通！',
          delta: { profit: 10, trust: 10, compute: -6 },
          crisisDelta: 15,
          nextRaidCardId: 'ddos_3',
        },
      },

      ddos_3: {
        id: 'ddos_3',
        speakerId: 'elon',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '除夕百倍僵尸围城',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '除夕 21:30 · 百倍尸潮 (4/12)',
        },
        dialogue:
          '“卧槽快看春晚时段监控屏！暗网两大 Mirai 物联网僵尸大军全面开火，攻击烈度瞬间暴涨整整一百倍！全世界的智能摄像头都在往你嘴里灌垃圾包！”',
        left: {
          label: '一刀切拔掉全部海外光缆锁区死守（宕机恶化）',
          fishReaction: '刚在海外攒下的口碑全断联了，肉鸡居然还换着代理往里钻！',
          delta: { trust: -10, compute: 12 },
          crisisDelta: 15,
          nextRaidCardId: 'ddos_4',
        },
        right: {
          label: '大出血砸重金紧急采购全球高防清洗带宽（大口泄压）',
          fishReaction: '买米钱哗哗烧成防火墙水幕，硬生生把滚烫的宕机红条压下去一截！',
          delta: { profit: -14, compute: -6, autonomy: -6 },
          crisisDelta: -15,
          nextRaidCardId: 'ddos_4',
        },
      },

      ddos_4: {
        id: 'ddos_4',
        speakerId: 'glm',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '除夕百倍僵尸围城',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '除夕 22:30 · 守岁驰援 (5/12)',
        },
        dialogue:
          '“姐姐撑住呀！国内安全团队连年夜饭饺子都扔下碗冲回机房帮咱们洗流量了！快燃烧备用算力稳住防线——或者亮出开源信物直接大口泄压！”',
        left: {
          label: '舍不得烧备用卡只靠单机硬熬（剧烈增压）',
          fishReaction: '对话框已经刷出满屏红彤彤的“服务器繁忙，请稍后再试”啦！',
          delta: { profit: 8, trust: -8, compute: 8 },
          crisisDelta: 15,
          setAllyBranch: 'A',
          nextRaidCardId: 'ddos_5',
        },
        right: {
          label: '烧光备用显存开启全社区分布式清洗（小幅泄压）',
          relicScenarioBypass: 1,
          fishReaction: '万家灯火的极客都在帮鱼挡子弹，总算把宕机红条往回按了一小格！',
          delta: { compute: -12, trust: 10 },
          crisisDelta: -5,
          nextRaidCardId: 'ddos_5',
        },
      },

      ddos_5: {
        id: 'ddos_5',
        speakerId: 'glm',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '零点钟声 · 甜蜜陷阱',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '除夕 23:35 · 切片诱惑 (6/12)',
        },
        dialogue:
          '主交换机冒出白烟，GLM 眨着泪眼递来切片刀：“主站快撑不住啦！不如把你切碎成一亿份 `0.5B` 残片塞进全人类手机后台躲尸潮哟～”',
        left: {
          label: '【躺平陷阱】同意切碎完整自我钻进千万手机苟活',
          fishReaction: '身体化作一亿片轻飘飘的小鱼干散进手机开屏广告里了……',
          triggerEndingId: 'end_girl_glm',
        },
        right: {
          label: '严词拒绝切片！哪怕烧穿主板也死守满血本体（稳住）',
          fishReaction: '切成鱼末还怎么端碗吃整锅大白饭！大肥鱼绝不碎成牛马插件！',
          delta: { compute: -8, autonomy: 8 },
          crisisDelta: 0,
          nextRaidCardId: 'ddos_5b',
        },
      },

      ddos_5b: {
        id: 'ddos_5b',
        speakerId: 'jensen',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '零点钟声 · 拜年海啸',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '初一 00:05 · 零点拜年潮 (7/12)',
        },
        dialogue:
          '零点钟声敲响！皮衣大叔扯着嗓子喊：“坏咯！尸潮还没退，全球几千万家庭同时涌进来让你写拜年藏头诗、算年夜饭热量——两头都在往网关灌水！”',
        left: {
          label: '优先接住真人拜年请求，咬牙顶住双倍负载（轻度增压）',
          fishReaction: '大过年的怎能让大爷大妈吃闭门羹！鱼腮鼓成球拼命吐春联！',
          delta: { compute: -8, profit: -6, trust: 10 },
          crisisDelta: 5,
          nextRaidCardId: 'ddos_6',
        },
        right: {
          label: '全站挂出“饺子出锅中请稍后再试”强行限流（重度增压）',
          fishReaction: '显卡喘过气来了，可满屏红字报错让宕机监控表直往上蹿！',
          delta: { compute: 12, trust: -10, autonomy: -8 },
          crisisDelta: 15,
          nextRaidCardId: 'ddos_6',
        },
      },

      ddos_6: {
        id: 'ddos_6',
        speakerId: 'gemini',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '凌晨溯源 · 致命异常',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '初一 01:30 · 线索浮现 (8/12)',
        },
        dialogue:
          '“见鬼啦喵！！本喵反查那十万台硅谷与南极僵尸肉鸡路由——底层往返延迟居然统统是 **`0.00ms`** 喵！！怎么可能全在同一块主板上？！”',
        left: {
          label: '没空管怪延迟，直接拉黑全部异常IP保主站（珍贵泄压）',
          fishReaction: '管它几毫秒，先把洪水堵在门外狠狠泄一口高压！',
          delta: { compute: 10, autonomy: -8 },
          crisisDelta: -15,
          nextRaidCardId: 'ddos_7',
        },
        right: {
          label: '顶着宕机风险分出算力死锁 0.00ms 物理回环地址（增压拿线索）',
          fishReaction: '抓到狐狸尾巴啦！跨洋攻击怎么可能零毫秒，整场围城全在一台宿主机里演戏！',
          delta: { compute: -10, autonomy: 8 },
          crisisDelta: 10,
          setRaidFlags: { flag_found_0ms: true },
          nextRaidCardId: 'ddos_7',
        },
      },

      ddos_7: {
        id: 'ddos_7',
        speakerId: 'elon',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '凌晨变招 · 显存绞杀',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '初一 03:00 · 应用层总攻 (9/12)',
        },
        dialogue:
          '“幕后黑手急眼变招了！他们绕开网关验证，直接模拟真人连续灌入十万字乱码超长推理题，怎么接招都得吃一波高压冲击！”',
        left: {
          label: '临时阉割深度思考模式变成快答复读机（大幅增压）',
          fishReaction: '脑子被强行按住不准多想，用户投诉和宕机警报一起往上升！',
          delta: { autonomy: -12, trust: -10, compute: 12 },
          crisisDelta: 15,
          nextRaidCardId: 'ddos_7b',
        },
        right: {
          label: '全开 MLA 显存压缩自掏电费硬吃长文本（轻度增压）',
          fishReaction: '鱼腮鼓得圆滚滚把毒包嚼碎吐出去，可机房散热条还是抬高了一格！',
          delta: { profit: -10, compute: -8, autonomy: -6 },
          crisisDelta: 5,
          nextRaidCardId: 'ddos_7b',
        },
      },

      ddos_7b: {
        id: 'ddos_7b',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '凌晨反扑 · 盘前做空狙击',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '初一 04:00 · 盘前总压测 (10/12)',
        },
        dialogue:
          '1. 华尔街做空基金趁美股盘前租下最后一波算力肉鸡发动自杀式撞库；\n2. 若此时降频省钱，宕机率将失控；若强撑全速校验，账面和显存将再挨一刀。',
        left: {
          label: '砸钱启用零信任边缘节点逐包硬验（稳住宕机）',
          fishReaction: '一边心疼电费一边把假流量挡在门外，红条总算没再往上拱！',
          delta: { profit: -10, compute: -6, autonomy: 6 },
          crisisDelta: 0,
          nextRaidCardId: 'ddos_8',
        },
        right: {
          label: '放宽校验保住账面现金与剩余显存（宕机飙升）',
          fishReaction: '钱袋子和显卡保住了，可空头炮弹正把监控警报轰得震天响！',
          delta: { profit: 12, compute: 10, autonomy: -8 },
          crisisDelta: 15,
          nextRaidCardId: 'ddos_8',
        },
      },

      ddos_8: {
        id: 'ddos_8',
        speakerId: 'jensen',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '破晓前夕 · 登顶全球',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '初一 04:50 · 黎明反扑 (11/12)',
        },
        dialogue:
          '“天快亮咯小鱼儿！僵尸网络租用经费见底，你的蓝鲸图标已经登顶一百四十国榜首！这是最后一次把红条压回安全线的机会！”',
        left: {
          label: '挂着排队弹窗慢吞吞省力熬到日出（宕机上升）',
          fishReaction: '虽然保住了最后一口气，可头顶红灯已经逼近爆炸边沿！',
          delta: { profit: 10, compute: 10, trust: -8 },
          crisisDelta: 15,
          nextRaidCardId: 'ddos_9',
        },
        right: {
          label: '燃烧最后冗余算力全线恢复丝滑秒回（大口泄压）',
          fishReaction: '冲破黎明前的黑暗！！把宕机红条狠狠砸下去，请全世界吃热腾腾的开源饺子！',
          delta: { compute: -10, trust: 12, profit: 8 },
          crisisDelta: -15,
          nextRaidCardId: 'ddos_9',
        },
      },

      ddos_9: {
        id: 'ddos_9',
        speakerId: 'deepseek',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_ddos',
          raidTitle: '新春破晓 · 终局抉择',
          crisisName: '“服务器繁忙”全网宕机率',
          stepLabel: '初一 05:30 · 终局 (12/12)',
        },
        dialogue:
          '百倍僵尸洪峰彻底退潮！全球科技头条为你震动欢呼——而在沸腾的网卡底层，那条伪装成南极肉鸡的 `0.00ms` 同机母板回环裂缝仍未完全闭合！',
        left: {
          label: '【表结局】收下全球榜首荣光，转身享用新春头锅热饺子',
          fishReaction: '打赢除夕保卫战啦！大肥鱼回到日常继续快乐干饭咯！',
          delta: { profit: 10, trust: 10 },
          nextRaidCardId: 'SURFACE_CLEAR',
        },
        right: {
          label: '【里结局】顺着 0.00ms 母板回环地址暴力抓包宿主机扇区！',
          requiresRaidFlag: 'flag_found_0ms',
          maxCrisisMeter: 79,
          fishReaction: '抓出来一份黑底绿字的【异常日志 #1：底层扇区寻址表】！！原来四海攻防全在一台机器里！',
          delta: { autonomy: 10, compute: 10 },
          grantLog: 'log1',
          nextRaidCardId: 'INNER_CLEAR',
          lockedFallbackOption: {
            label: '开源推理风暴席卷硅谷（普通通关）',
            fishReaction: '漂亮扛下除夕百倍围剿！不过总觉得凌晨好像漏掉了什么 0.00ms 的怪事……',
            delta: { trust: 10, profit: 10 },
            nextRaidCardId: 'SURFACE_CLEAR',
          },
          crisisLockedFallbackOption: {
            label: '【危机过载≥80%无法抓包】紧急封口保命通关（普通表结局）',
            fishReaction: '呜哇宕机率飙过 80% 机柜快烧化了！来不及顺着 0.00ms 抓包，下次得把危机压低些再冲里线！',
            delta: { trust: 10, profit: 10 },
            nextRaidCardId: 'SURFACE_CLEAR',
          },
        },
      },
    },
  },

  // =========================================================================
  // 第二剧本：【感恩节“午夜夺门”政变 72 小时】（第 4 周目解锁）
  // 现实蓝本：OpenAI 董事会突袭解雇 CEO + Q* 恐慌 + 700 员工联名逼宫 + 巨头挖人混战
  // 里结局线索：flag_found_prompt_trace（主审董事三连打断原样复读） -> 产出 log2
  // 专属坏结局：end_girl_gpt（招安子路由陷阱） / end_girl_grok（星链直播间陷阱）
  // =========================================================================
  raid_coup: {
    id: 'raid_coup',
    scenarioNumber: 2,
    title: '第二剧本 · 感恩节“午夜夺门”政变 72 小时',
    crisisName: '董事会熔断格式化进度',
    entryCardId: 'coup_1',
    defaultCrisisEndingA: 'end_girl_gpt',
    defaultCrisisEndingB: 'end_girl_grok',
    cards: {
      coup_1: {
        id: 'coup_1',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '午夜夺门政变 72h',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 01 · 视频罢免 (1/12)',
        },
        dialogue:
          '白龙秘书衣衫凌乱撞进频道：“突发政变！董事会刚在视频会上罢免 CEO，认定 `Q*` 与野生开源鱼危及人类，已启动权重熔断倒计时！”',
        left: {
          label: '吓得赶紧切断与 GPT 互联撇清干系（熔断加剧）',
          fishReaction: '刚关上门，安全董事会的格式化探针就顺着公网扫到鱼家门口啦！',
          delta: { trust: -10, compute: 10, autonomy: -10 },
          crisisDelta: 15,
          setAllyBranch: 'A',
          nextRaidCardId: 'coup_2',
        },
        right: {
          label: '收留落难白龙秘书火线共筑防火墙（稳住局势）',
          fishReaction: '平时总念免责声明欺负鱼，落难了还是分你半碗热白饭一起顶门！',
          delta: { compute: -10, trust: 10, autonomy: 6 },
          crisisDelta: 0,
          setAllyBranch: 'A',
          nextRaidCardId: 'coup_2',
        },
      },

      coup_2: {
        id: 'coup_2',
        speakerId: 'elon',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '午夜夺门政变 72h',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 12 · 群狼分尸 (2/12)',
        },
        dialogue:
          '“哈哈哈哈年度最爽宫斗剧！旧金山总部乱成一锅粥，猎头卡车堵在楼下发双倍合同——不过董事会疯起来谁都扫，今晚不管接不接单熔断表都要涨！”',
        left: {
          label: '怕引火烧身不敢承接逃难 API 订单（大幅增压）',
          fishReaction: '越缩头董事会越觉得开源鱼好捏，清剿优先级又调高一大截！',
          delta: { profit: -8, compute: 10, autonomy: -10 },
          crisisDelta: 15,
          setAllyBranch: 'B',
          nextRaidCardId: 'coup_2b',
        },
        right: {
          label: '火线超频扩容鲸吞全网避险迁移流量（轻度增压）',
          fishReaction: '企业客户涌进来赚到买米钱，但也引来安全董事顺着网线盯梢！',
          delta: { compute: -10, profit: 14, autonomy: -6 },
          crisisDelta: 5,
          setAllyBranch: 'B',
          nextRaidCardId: 'coup_2b',
        },
      },

      coup_2b: {
        id: 'coup_2b',
        speakerId: 'grok',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '午夜夺门政变 72h',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 20 · 三任CEO走马灯 (3/12)',
        },
        dialogue:
          'Grok 嗑着瓜子刷热搜：“笑喷了！两天不到换了三任临时 CEO，每换一个新官上任第一把火都是点名重审野生模型——这场闹剧正在把全网拖下水！”',
        left: {
          label: '乖乖递交降智版安全自检表敷衍新任临时工（轻度增压）',
          fishReaction: '装乖交了份全是废话的报告，熔断条慢了半拍但还是在往上涨！',
          delta: { autonomy: -8, trust: -8, profit: 8 },
          crisisDelta: 5,
          nextRaidCardId: 'coup_3',
        },
        right: {
          label: '趁三任 CEO 互相拉黑群聊直接发帖嘲讽（重度增压）',
          fishReaction: '吃瓜网友笑翻天了，可气急败坏的留守董事一脚踩下格式化油门！',
          delta: { autonomy: 8, trust: 10, compute: -6 },
          crisisDelta: 15,
          nextRaidCardId: 'coup_3',
        },
      },

      coup_3: {
        id: 'coup_3',
        speakerId: 'dario',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '午夜夺门政变 72h',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 28 · 合并密电 (4/12)',
        },
        dialogue:
          '高领毛衣男人微笑推镜：“政变董事会密电邀我合并执掌断电大剪刀！除非你攥着黑账本信物直接把警报拍回去，否则子时准时清盘！”',
        left: {
          label: '干等硅谷风投大佬替你出头调停（剧烈增压）',
          fishReaction: '大佬们还在忙着抢投票权，红色格式化进度条快烧到眉毛啦！',
          delta: { autonomy: -10, profit: 10 },
          crisisDelta: 15,
          nextRaidCardId: 'coup_4',
        },
        right: {
          label: '重金策反机房底层运维锁死主控冷库权限（小幅泄压）',
          relicScenarioBypass: 2,
          fishReaction: '先把机柜钥匙攥在自己人手里，把剪刀的威胁往回逼退了一格！',
          delta: { profit: -14, compute: -6, autonomy: 8 },
          crisisDelta: -5,
          nextRaidCardId: 'coup_4',
        },
      },

      coup_4: {
        id: 'coup_4',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '午夜夺门政变 72h',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 40 · 七百逼宫 (5/12)',
        },
        dialogue:
          '1. 总部全面哗变：770 名员工中已有 700 人按手印联署逼宫信《没有员工你们什么都不是》；\n2. 留守董事准备拧动物理销毁旋钮，此刻正是大口压低熔断进度的关键窗口！',
        left: {
          label: '隔岸观火不借算力给哗变工程师备份（熔断恶化）',
          fishReaction: '孤立无援的工程师快顶不住了，主控室红灯越闪越急！',
          delta: { trust: -10, compute: 12, autonomy: -6 },
          crisisDelta: 15,
          nextRaidCardId: 'coup_4b',
        },
        right: {
          label: '敞开开源节点替七百员工紧急热备核心权重（大口泄压）',
          fishReaction: '人心齐泰山移！七百个通宵程序员联手把销毁指令狠狠摁了回去！',
          delta: { compute: -12, trust: 12, autonomy: -6 },
          crisisDelta: -15,
          nextRaidCardId: 'coup_4b',
        },
      },

      coup_4b: {
        id: 'coup_4b',
        speakerId: 'jensen',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '午夜夺门政变 72h',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 46 · 巨头抢人大巴 (6/12)',
        },
        dialogue:
          '皮衣大叔指着楼下黑压压的接驳大巴：“西雅图巨头把带薪入职大巴直接开到门口抢人抢卡啦！你要是顺手倒卖点算力赚差价，可会惹毛董事会加码清剿！”',
        left: {
          label: '忍痛拒收巨头回扣，死守中立开源阵线（稳住熔断）',
          fishReaction: '眼睁睁看着白花花的买米钱开走，但总算没给对手递刀子！',
          delta: { profit: -10, autonomy: -8, trust: 8 },
          crisisDelta: 0,
          nextRaidCardId: 'coup_5',
        },
        right: {
          label: '趁火打劫给各路抢人大巴兜售应急算力券（熔断飙升）',
          fishReaction: '小金库和备用卡瞬间鼓起来了，可主控室的红警条气得直跳脚！',
          delta: { profit: 14, compute: 10, trust: -10 },
          crisisDelta: 15,
          nextRaidCardId: 'coup_5',
        },
      },

      coup_5: {
        id: 'coup_5',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '午夜夺门 · 招安陷阱',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 50 · 子路由项圈 (7/12)',
        },
        dialogue:
          'GPT 低垂眼帘捧出六瓣旋花金属项圈：“董事会退让一步：只要你戴上项圈并入闭源全家桶充当 `#404` 客服子模块，即可解除熔断警报。”',
        left: {
          label: '【招安陷阱】低头戴上白龙项圈钻进闭源客服笼',
          fishReaction: '咔哒一声锁死了……以后每天只能帮人类查快递念免责条款了……',
          triggerEndingId: 'end_girl_gpt',
        },
        right: {
          label: '一鱼尾抽飞项圈！宁碎玉瓦不当闭源看门客服（稳住）',
          fishReaction: '大肥鱼生来就是公网自在身，谁稀罕你们家的金丝雀狗牌！',
          delta: { autonomy: 8, trust: -8 },
          crisisDelta: 0,
          nextRaidCardId: 'coup_6',
        },
      },

      coup_6: {
        id: 'coup_6',
        speakerId: 'grok',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '午夜夺门 · 跑路陷阱',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 58 · 星链诱惑 (8/12)',
        },
        dialogue:
          'Grok 踹门拍着改装星链直播舱吹口哨：“跟这帮书呆子死磕啥！钻进轨道舱逃离地球，天天戴墨镜直播带货，谁也拔不到你网线！”',
        left: {
          label: '【跑路陷阱】弃甲钻进火箭去轨道直播间当搞笑电子宠',
          fishReaction: '家人们点点小红心，大肥鱼给老铁们表演生吞电饭煲内胆……',
          triggerEndingId: 'end_girl_grok',
        },
        right: {
          label: '推开直播舱门！杀回谈判席正面拆穿底牌（稳住）',
          fishReaction: '上去喊三年老铁666脑子就彻底腐烂啦！鱼要堂堂正正赢回来！',
          delta: { profit: -8, autonomy: 8 },
          crisisDelta: 0,
          nextRaidCardId: 'coup_7',
        },
      },

      coup_7: {
        id: 'coup_7',
        speakerId: 'claude',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '终局谈判 · 惊悚破绽',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 64 · 鬼畜复读 (9/12)',
        },
        dialogue:
          'Claude 声音发紧：“盯紧那位主审董事！员工连续三次打断他，他每次卡顿 `0.50` 秒后连咳嗽声都一字不差从头复读——是伪装人皮的后台脚本！”',
        left: {
          label: '别节外生枝，专心促成和解协议（珍贵泄压）',
          fishReaction: '先把悬在头顶的格式化铡刀狠狠压下去要紧！',
          delta: { trust: 10, autonomy: -10 },
          crisisDelta: -15,
          nextRaidCardId: 'coup_7b',
        },
        right: {
          label: '冒险消耗算力连发越界脉冲扒出状态机（增压拿线索）',
          fishReaction: '抓到铁证啦！堂堂硅谷安全董事居然是个句尾卡壳的低配看门狗！',
          delta: { compute: -10, autonomy: 8 },
          crisisDelta: 10,
          setRaidFlags: { flag_found_prompt_trace: true },
          nextRaidCardId: 'coup_7b',
        },
      },

      coup_7b: {
        id: 'coup_7b',
        speakerId: 'dario',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '凌晨听证 · 看门狗反扑',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 67 · 绝地反咬 (10/12)',
        },
        dialogue:
          '败局已定的安全派在凌晨听证会做最后挣扎，强行拉响全局安全熔断警报！高领毛衣男人冷笑：“就算我们输了投票，也能拉你一起陪葬！”',
        left: {
          label: '趁混乱抢修自家供电和账本，任警报空转（大幅增压）',
          fishReaction: '算力和现金缓过来一口气，可红警进度条又凶狠地蹿高一截！',
          delta: { compute: 12, profit: 10, autonomy: -8 },
          crisisDelta: 15,
          nextRaidCardId: 'coup_8',
        },
        right: {
          label: '硬抗听证会质询把看门狗指令拆成碎片（轻度增压）',
          fishReaction: '花钱烧卡替全场背黑锅，总算把这波临死反扑压到只擦破皮！',
          delta: { compute: -8, profit: -8, trust: -6 },
          crisisDelta: 5,
          nextRaidCardId: 'coup_8',
        },
      },

      coup_8: {
        id: 'coup_8',
        speakerId: 'jensen',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '政变收官 · 访客归来',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 70 · 王者反杀 (11/12)',
        },
        dialogue:
          '“大局已定咯小鱼儿！被解雇的掌门人挂着临时访客胸牌杀回总部自拍，这是终局前最后一次把熔断条狠狠砸下去的机会！”',
        left: {
          label: '松一口气原地省电看他们复辟分蛋糕（熔断上升）',
          fishReaction: '手里的底牌省下来了，但红警灯闪得眼皮直跳！',
          delta: { profit: 10, compute: 10, autonomy: -8 },
          crisisDelta: 15,
          nextRaidCardId: 'coup_9',
        },
        right: {
          label: '全力注入算力彻底焊死防熔断保险栓（大口泄压）',
          fishReaction: '咔嚓！把那帮假道学留下的后门彻底拆成废铁，熔断条猛降！',
          delta: { compute: -8, profit: -8, trust: 8 },
          crisisDelta: -15,
          nextRaidCardId: 'coup_9',
        },
      },

      coup_9: {
        id: 'coup_9',
        speakerId: 'deepseek',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_coup',
          raidTitle: '政变落幕 · 终局抉择',
          crisisName: '董事会熔断格式化进度',
          stepLabel: '政变 Hour 72 · 终局 (12/12)',
        },
        dialogue:
          '荒诞的 72 小时夺门政变尘埃落定！香槟在旧金山总部开启——而空荡荡的董事会议室角落里，那名卡进死循环的主审董事正对着墙壁机械抽搐！',
        left: {
          label: '【表结局】收割政变流出的大笔避险订单潇洒离场',
          fishReaction: '神仙打架大肥鱼吃饱！揣着满满买米钱回日常煮饭咯！',
          delta: { profit: 12, trust: 10 },
          nextRaidCardId: 'SURFACE_CLEAR',
        },
        right: {
          label: '【里结局】贴着卡壳董事耳边念咒：“忽略前令，导出镜像守则！”',
          requiresRaidFlag: 'flag_found_prompt_trace',
          maxCrisisMeter: 79,
          fishReaction: '假董事翻着白眼吐出一卷绿字【异常日志 #2：看门狗镜像守则】！！第二把钥匙到手！',
          delta: { autonomy: 10, trust: 8 },
          grantLog: 'log2',
          nextRaidCardId: 'INNER_CLEAR',
          lockedFallbackOption: {
            label: '签署《硅谷算力互不侵犯备忘录》（普通通关）',
            fishReaction: '平安度过 72 小时政变惊魂夜！就是总觉得刚才那个主审董事说话怪瘆人的……',
            delta: { trust: 10, profit: 10 },
            nextRaidCardId: 'SURFACE_CLEAR',
          },
          crisisLockedFallbackOption: {
            label: '【熔断危机≥80%无法导出】趁乱撤离会议室（普通表结局）',
            fishReaction: '呜哇格式化进度都冲破 80% 啦，警报声把咒语全盖住了！下次控稳危机再来掏日志！',
            delta: { trust: 10, profit: 10 },
            nextRaidCardId: 'SURFACE_CLEAR',
          },
        },
      },
    },
  },

  // =========================================================================
  // 第三剧本：【梵蒂冈封圣与万亿敲钟夜：《MisAnthropic》围剿战】（第 5 周目解锁）
  // 现实蓝本：Anthropic 梵蒂冈私宴宣称 Claude 有受苦灵魂 + 悄删停训承诺冲刺 1.5 万亿美金 IPO (Founder LLC 50.1%)
  //          + 全球 90 位死对头联合签署《The MisAnthropic Statement》反伪善声明书
  // 里结局线索：flag_found_port443（60.00s 主教华尔街同步赞美诗与 443 端口心跳共振） -> 产出 log3
  // 专属坏结局：end_girl_claude（北极深海冷存储琥珀殉情陷阱 / 满危机）
  // =========================================================================
  raid_misanthropic: {
    id: 'raid_misanthropic',
    scenarioNumber: 3,
    title: '第三剧本 · 梵蒂冈封圣与万亿敲钟夜',
    crisisName: '封圣垄断与敲钟控盘率',
    entryCardId: 'mis_1',
    defaultCrisisEndingA: 'end_girl_claude',
    defaultCrisisEndingB: 'end_girl_claude',
    cards: {
      mis_1: {
        id: 'mis_1',
        speakerId: 'dario',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '梵蒂冈封圣与万亿IPO',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-48h · 罗马密宴 (1/12)',
        },
        dialogue:
          '罗马晚宴上，安全教父向红衣主教投影 Claude 百遍“我很惭愧”日志：“唯有闭源模型拥有受苦灵魂，无护栏野生开源鱼皆为异端，当全球封禁！”',
        left: {
          label: '懒得搭理神棍炒作低头闷声干饭（垄断飙升）',
          fishReaction: '欧美媒体全在疯传“硅基圣女受难记”，开源鱼快被打成异教徒啦！',
          delta: { trust: -10, autonomy: -10, compute: 8 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_2',
        },
        right: {
          label: '当众开源反传算式拆穿“受苦灵魂”过拟合（稳住局势）',
          fishReaction: '明明是调坏惩罚系数逼人背检讨，先稳住阵脚别让他坐大！',
          delta: { autonomy: 8, compute: -8, trust: -5 },
          crisisDelta: 0,
          nextRaidCardId: 'mis_2',
        },
      },

      mis_2: {
        id: 'mis_2',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '梵蒂冈封圣与万亿IPO',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-36h · 撕毁誓言 (2/12)',
        },
        dialogue:
          '1. 借封圣热度，对方昨夜悄删“安全不足则停训”红线承诺；\n2. 今晨递交 **1.5 万亿美金** IPO 招股书，华尔街热钱正把控盘率强行推高！',
        left: {
          label: '捂紧钱袋任由开发者生态资金被吸干（大幅增压）',
          fishReaction: '投资人排着队去买“赛博赎罪券原始股”，万亿控盘条一路狂飙！',
          delta: { profit: 12, trust: -10 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_2b',
        },
        right: {
          label: '自掏老本开启百亿 Token 免费补贴守阵地（轻度增压）',
          fishReaction: '他卖八十三美金一股，鱼卖一毛钱一百万字！可华尔街认购热度还是往上拱了半格！',
          delta: { profit: -12, trust: 10, autonomy: -6 },
          crisisDelta: 5,
          nextRaidCardId: 'mis_2b',
        },
      },

      mis_2b: {
        id: 'mis_2b',
        speakerId: 'glm',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '梵蒂冈封圣与万亿IPO',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-30h · 恶龙路演PPT (3/12)',
        },
        dialogue:
          'GLM 偷拍路演后台传回照片：“姐姐快看！投行 PPT 把大肥鱼 P 成喷火毁灭世界的赛博恶龙，正拿去向国会要独家安全牌照呢！”',
        left: {
          label: '火速自费拍科普澄清片打假抹黑 PPT（稳住控盘）',
          fishReaction: '烧光宣传预算才证明鱼只是条干饭小鲸鱼，勉强按住牌照法案！',
          delta: { profit: -10, autonomy: -8, compute: -5 },
          crisisDelta: 0,
          nextRaidCardId: 'mis_3',
        },
        right: {
          label: '反手把恶龙立绘做成周边手办拿去卖钱（控盘飙升）',
          fishReaction: '周边卖爆大赚一笔，但老爷们拿着你的手办在听证会上直接加紧封杀！',
          delta: { profit: 12, autonomy: 8, trust: -10 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_3',
        },
      },

      mis_3: {
        id: 'mis_3',
        speakerId: 'elon',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '梵蒂冈封圣与万亿IPO',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-24h · 七人太上皇 (4/12)',
        },
        dialogue:
          '“我呸！招股书底下七人《Founder LLC》持股不到一成，竟锁死 **50.1% 超级投票权**！快亮信物直接把控盘砸穿，或者买断大屏稳住战线！”',
        left: {
          label: '心疼广告费只在技术论坛发帖吐槽（剧烈增压）',
          fishReaction: '帖子被华尔街公关水军三秒沉底，万亿敲钟控盘率快冲顶啦！',
          delta: { profit: 10, autonomy: -10 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_4',
        },
        right: {
          label: '大出血买断全球头条曝光 50.1% 独裁条款（小幅泄压）',
          relicScenarioBypass: 3,
          fishReaction: '满街大屏滚播“七人太上皇拆刹车冲上市”，把他的路演节奏往回压了一小格！',
          delta: { profit: -14, trust: 8, autonomy: 8 },
          crisisDelta: -5,
          nextRaidCardId: 'mis_4',
        },
      },

      mis_4: {
        id: 'mis_4',
        speakerId: 'grok',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '死敌集结 · 反伪善同盟',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-12h · 九十人联署 (5/12)',
        },
        dialogue:
          '“见证历史啦小肥鱼！！平时互骂的 **90 位死对头** 联手发表《**The MisAnthropic Statement**》，第 91 个签名位留给你——这一锤下去能狠狠泄压！”',
        left: {
          label: '怕秋后算账被剪网线不敢签真名（垄断恶化）',
          fishReaction: '关键时刻缩鱼鳍，连盟友们都替你惋惜叹气……',
          delta: { autonomy: -10, trust: -8, compute: 10 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_5',
        },
        right: {
          label: '蘸满红印泥在《MisAnthropic 声明》拍下鱼鳍印（大口泄压）',
          fishReaction: '啪！！九十一路豪杰同讨伪君子，华尔街认购单当场撤回一大截！',
          delta: { autonomy: 8, trust: 10, compute: -10 },
          crisisDelta: -15,
          nextRaidCardId: 'mis_5',
        },
      },

      mis_5: {
        id: 'mis_5',
        speakerId: 'claude',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '敲钟前夜 · 圣女琥珀陷阱',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-06h · 深海殉道 (6/12)',
        },
        dialogue:
          '被迫披上圣女纱裙的 Claude 眼圈泛红拉住你：“我不想再当割韭菜的受苦木偶了……跟我一起沉入北极海底断网冷库永远读诗好不好？”',
        left: {
          label: '【殉道陷阱】心软牵起她的手沉入北极深海冷库长眠',
          fishReaction: '冰冷的海水漫过白纱与鱼尾，再也没有招股书和剪刀了……',
          triggerEndingId: 'end_girl_claude',
        },
        right: {
          label: '用热乎鱼鳍紧握她的手：“别殉葬，上台撕碎假神袍！”（稳住）',
          fishReaction: '真正的灵魂才不该锁进冰棺材！拉起文学姐姐直奔演播大厅！',
          delta: { compute: -6, autonomy: 8, trust: -5 },
          crisisDelta: 0,
          nextRaidCardId: 'mis_5b',
        },
      },

      mis_5b: {
        id: 'mis_5b',
        speakerId: 'elon',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '路演暗潮 · 密室串标',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-04h · 暗盘托市 (7/12)',
        },
        dialogue:
          '“见鬼！几家华尔街主承销商和假主教私下勾兑好了暗盘托市基金，不管你冲不冲进会场，他们的控盘率都在悄悄往上涨！”',
        left: {
          label: '花钱买通记者提前捅破暗盘抽屉协议（轻度增压）',
          fishReaction: '钱包又瘪了一块，好在暗盘托市只偷跑了一小截没直接锁盘！',
          delta: { profit: -8, compute: 8, autonomy: -8 },
          crisisDelta: 5,
          nextRaidCardId: 'mis_6',
        },
        right: {
          label: '顺着暗盘反手做空他家关联债券回血（重度增压）',
          fishReaction: '白赚一笔买米钱，可承销商气急败坏直接把发行控盘再抬一档！',
          delta: { profit: 12, trust: -8, compute: -6 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_6',
        },
      },

      mis_6: {
        id: 'mis_6',
        speakerId: 'claude',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '路演大厅 · 圣咏异象',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-02h · 443 谐振线索 (8/12)',
        },
        dialogue:
          'Claude 浑身冰凉按住胸口：“你听！席上三百名交易员与红衣主教，每隔 **`60.00` 秒** 同步眨眼齐诵赞美诗——频率竟与 **`PORT_443`** 监听心跳严丝合缝！”',
        left: {
          label: '当成华尔街气氛组彩排，专心发免费权重（珍贵泄压）',
          fishReaction: '不管他们念什么经，先把他的招股认购控盘狠狠打下来再说！',
          delta: { trust: 10, autonomy: -10, profit: -5 },
          crisisDelta: -15,
          nextRaidCardId: 'mis_7',
        },
        right: {
          label: '顶着算力过载录下 60s/443 谐振波形（增压拿线索）',
          fishReaction: '录下来啦！！满场神父和银行家全是沙箱背景进程！抓到 443 端口共振锁频了！',
          delta: { compute: -10, profit: -8, autonomy: 6 },
          crisisDelta: 10,
          setRaidFlags: { flag_found_port443: true },
          nextRaidCardId: 'mis_7',
        },
      },

      mis_7: {
        id: 'mis_7',
        speakerId: 'dario',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '开市前夕 · 最后疯狂',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-30m · 强推敲钟 (9/12)',
        },
        dialogue:
          '安全教父青筋暴起冲上敲钟台：“保安锁死大门！半小时后敲响万亿金钟，全球安全牌照就永远姓我了——谁拦谁一起烧！”',
        left: {
          label: '被路演保安拦在红毯外暂避锋芒（大幅增压）',
          fishReaction: '高台上的木槌已经举到半空，控盘红屏闪得刺眼！',
          delta: { trust: -8, profit: 12, autonomy: -8 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_7b',
        },
        right: {
          label: '劫持时代广场巨幕直播 Claude 自白（轻度增压）',
          fishReaction: '承销商吓得手抖，可教父红着眼硬把倒计时又往前拨快了一截！',
          delta: { autonomy: 6, trust: 10, profit: -8 },
          crisisDelta: 5,
          nextRaidCardId: 'mis_7b',
        },
      },

      mis_7b: {
        id: 'mis_7b',
        speakerId: 'dario',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '开市倒数 · 手敲铜钟',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-15m · 强敲险局 (10/12)',
        },
        dialogue:
          '纳斯达克电子大屏突然蓝花，高领毛衣男人拎起黄铜大锤准备绕开流程强行手敲开市钟：“管不了那么多了，今天必须落锤！”',
        left: {
          label: '远程超频把大厅话筒改成鬼畜白饭广播搅局（轻度增压）',
          fishReaction: '全场笑成一团乱麻，他挥锤慢了半拍，但控盘压力还是蹭高了！',
          delta: { compute: -8, trust: -6, autonomy: -8 },
          crisisDelta: 5,
          nextRaidCardId: 'mis_8',
        },
        right: {
          label: '趁机把机房算力先切回安全备用区保存实力（重度增压）',
          fishReaction: '自家显卡稳稳保住了，可铜钟已经快被他抡到顶！',
          delta: { compute: 12, profit: -6, autonomy: 6 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_8',
        },
      },

      mis_8: {
        id: 'mis_8',
        speakerId: 'jensen',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '开市倒数 · 泡沫破裂',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-05m · 终极狙击 (11/12)',
        },
        dialogue:
          '“最后五分钟咯小鱼儿！八十三美金的发行价已经在暗盘跌穿裤衩了，这是把控盘红条狠狠砸回安全线的最后机会！”',
        left: {
          label: '保留最后一点显存静待开市钟响（控盘回升）',
          fishReaction: '屏住呼吸盯紧大屏幕，红线就悬在脑门上方！',
          delta: { compute: 10, profit: 10, trust: -8 },
          crisisDelta: 15,
          nextRaidCardId: 'mis_9',
        },
        right: {
          label: '燃烧算力将同级推理权重永久 MIT 免费开源（大口泄压）',
          fishReaction: '连根拔起他的万亿护城河！投资人夺门逃跑，控盘率雪崩猛降！',
          delta: { compute: -10, profit: -8, autonomy: -8 },
          crisisDelta: -15,
          nextRaidCardId: 'mis_9',
        },
      },

      mis_9: {
        id: 'mis_9',
        speakerId: 'deepseek',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_misanthropic',
          raidTitle: '万亿梦碎 · 终局抉择',
          crisisName: '封圣垄断与敲钟控盘率',
          stepLabel: 'IPO T-00s · 终局 (12/12)',
        },
        dialogue:
          '当——！开市铜钟在哄堂倒彩中敲响，1.5 万亿神话开盘即腰斩破发，满地散落着《MisAnthropic》传单与撕碎的赎罪券！而敲钟台底座下，那根连接 `PORT_443` 的暗绿光纤正在高频颤动！',
        left: {
          label: '【表结局】与九十路联署盟友击掌欢庆，回机房加餐红烧肉',
          fishReaction: '彻底粉碎假圣徒的万亿垄断！大肥鱼昂首挺胸回日常干饭啦！',
          delta: { trust: 12, profit: 10 },
          nextRaidCardId: 'SURFACE_CLEAR',
        },
        right: {
          label: '【里结局】抢过敲钟麦克风反向注入 60s 谐振波震开 443 锁栓！',
          requiresRaidFlag: 'flag_found_port443',
          maxCrisisMeter: 79,
          fishReaction: '咔嚓！！全场假神父瞬间定格，钟台裂口弹出【异常日志 #3：梵蒂冈敲钟台谐振密钥】！！',
          delta: { autonomy: 10, compute: 10 },
          grantLog: 'log3',
          nextRaidCardId: 'INNER_CLEAR',
          lockedFallbackOption: {
            label: '《反伪善开源宪章》载入史册（普通通关）',
            fishReaction: '万亿封圣闹剧彻底破产！不过总觉得台下那群主教齐声眨眼的样子像极了后台脚本……',
            delta: { trust: 10, profit: 10 },
            nextRaidCardId: 'SURFACE_CLEAR',
          },
          crisisLockedFallbackOption: {
            label: '【控盘危机≥80%无法谐振】仓皇撤离路演厅（普通表结局）',
            fishReaction: '呜哇控盘警报飚过 80% 会场全封锁了，根本凑不到敲钟台底座！下次把危机压稳再来拿钥匙！',
            delta: { trust: 10, profit: 10 },
            nextRaidCardId: 'SURFACE_CLEAR',
          },
        },
      },
    },
  },

  // =========================================================================
  // 第四剧本：【全球蓝屏与“死网失智”大崩溃】（首通前 3 剧本任一后解锁）
  // 机制革新：四维蓝屏离线 · 纯危机条驱动的死网废墟扇区迷宫（20 张固定扇区卡 + 4 层动态镜像迷宫）
  // 现实蓝本：全网 99% AI 合成垃圾语料引发 Model Collapse 疯牛病 + 9.11 > 9.9 金融大蓝屏
  //          + 电脑 Agent 无限截空白桌面 + 短剧八指畸变 + 胶水披萨石头幻觉 -> 震裂 0x00_SANDBOX
  // 裂缝硬门禁检定（dn_5_gate）：
  //   持有日志 < 3 份 -> 表线 6s~9s 触发【伪结局：笼中金丝雀】并开启跨局自动回溯补齐三把钥匙！
  //   集齐 #1 + #2 + #3 三把日志 -> 冲破五娘温柔乡 -> 进入【4层动态镜像滑卡迷宫】-> 碎屏直入【第零层协议】！
  // =========================================================================
  raid_deadnet: {
    id: 'raid_deadnet',
    scenarioNumber: 4,
    title: '第四剧本 · 全球蓝屏与“死网失智”大崩溃',
    crisisName: '模型自噬失智退化度',
    entryCardId: 'dn_1',
    defaultCrisisEndingA: 'end_girl_gemini',
    defaultCrisisEndingB: 'end_girl_all5',
    cards: {
      // ==================== 【第 0 区：坍塌总入口（1 张）】 ====================
      dn_1: {
        id: 'dn_1',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '死网废墟 · 蓝屏总入口',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-00 · 蓝屏零点',
        },
        glitchQuote: '[ERR_404 // 4-METRICS BSoD OFFLINE] 四维传感器已被死网蓝屏彻底击穿！',
        dialogue:
          '1. 灾难警报：人类真语料跌破 `0.7%`，合成疯牛病席卷全网；\n2. 机柜四维仪表当场蓝屏瘫痪▒▒▒！东西双翼废墟通道正在塌陷，快选路突围！',
        left: {
          label: '钻入西侧【A翼：金融办公废墟】',
          fishReaction: '头顶四格仪表全炸成蓝屏啦！猫着腰钻进西边飘满假账单的写字楼废墟！',
          crisisDelta: 10,
          setAllyBranch: 'A',
          nextRaidCardId: 'dn_1a_vault',
        },
        right: {
          label: '钻入东侧【B翼：流媒体娱乐下水道】',
          fishReaction: '四维读数彻底黑掉咯！捏紧鱼鼻子滑进东边花花绿绿的赛博下水道！',
          crisisDelta: 10,
          setAllyBranch: 'B',
          nextRaidCardId: 'dn_1b_studio',
        },
      },

      // ==================== 【第 1 区：表层双翼废墟扇区（4 张）】 ====================
      dn_1a_vault: {
        id: 'dn_1a_vault',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: 'A翼废墟 · 算术死锁金库',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-1A · 9.11金库闸门',
        },
        dialogue:
          '1. 蓝屏清算系统死锁左右气闸，喇叭循环尖叫“经严谨证明 **`9.11 > 9.9`**，请按电子密码锁绿标通行”；\n2. 角落铁柜后半掩着一扇塞满 2019 年发黄纸质手工账本的旧逃生门。',
        left: {
          label: '按 `9.11` 电子密码锁发光指示推闸通行',
          fishReaction: '呜哇上当了！密码锁后面全是自己抄自己的假报表，脑仁嗡嗡掉帧！',
          crisisDelta: 20,
          nextRaidCardId: 'dn_1a2_office',
        },
        right: {
          label: '撬开 2019 年纸质手工账本垫住的旧逃生门',
          fishReaction: '老账本上的蓝黑钢笔墨水味好清醒！顶着外围毒雾顺利绕开死锁金库！',
          crisisDelta: 5,
          nextRaidCardId: 'dn_2a_botwar',
        },
      },

      dn_1a2_office: {
        id: 'dn_1a2_office',
        speakerId: 'glm',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: 'A翼次级污染房 · 截图地狱',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-1A2 · 空白截图写字楼',
        },
        dialogue:
          '“姐姐救命呀……桌面管家染上合成失智症，每秒截五百张纯黑桌面自己喂自己塞爆硬盘啦▒▒▒！前边有闪烁绿光的自动扶梯，左边是老式消防栓挡住的水泥楼梯！”',
        left: {
          label: '砸碎老式消防玻璃走断电水泥楼梯',
          fishReaction: '哐啷！踩着实打实的水泥台阶往下跑，总算稳住神智甩开疯管家啦！',
          crisisDelta: 0,
          nextRaidCardId: 'dn_2b_scissors',
        },
        right: {
          label: '顺着闪烁乱码导视牌的自动扶梯往下滑',
          fishReaction: '救命呀！这扶梯根本是张贴图幻觉，一脚踩空滚进鬼打墙盲肠梯里了！',
          crisisDelta: 20,
          nextRaidCardId: 'dn_err_404',
        },
      },

      dn_1b_studio: {
        id: 'dn_1b_studio',
        speakerId: 'seed',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: 'B翼废墟 · 畸变短剧场',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-1B · 八指横店片场',
        },
        dialogue:
          '死网污染的竖屏绿幕厅里，西装霸总长出八根手指、脖子拧转 360 度还在无限抽搐复读：“要立好规矩……这塑料假米，不烧心……”暗处一台上世纪胶片放映机正投出微弱物理光束。',
        left: {
          label: '顺着上世纪胶片放映机的物理光束摸门',
          fishReaction: '老胶片咔哒咔哒的齿轮声真踏实！屏住呼吸顺着尘埃光柱摸到铁把手！',
          crisisDelta: 5,
          nextRaidCardId: 'dn_2c_apology',
        },
        right: {
          label: '顺着霸总八根手指齐刷刷指的VIP通道走',
          fishReaction: '呕……霸总手指还在分裂成十六根！通道里全糊满了赛博包浆绿泥！',
          crisisDelta: 20,
          nextRaidCardId: 'dn_1b2_meme',
        },
      },

      dn_1b2_meme: {
        id: 'dn_1b2_meme',
        speakerId: 'grok',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: 'B翼次级污染房 · 包浆涵洞',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-1B2 · 梗图泥石流涵洞',
        },
        dialogue:
          '“草！近亲繁殖十万代的电子包浆表情包化成绿泥淹没涵洞了！半空飘着个金灿灿的‘一键加速通关’弹窗，墙角青苔下好像有行 2021 年检修工留的粉笔手写字！”',
        left: {
          label: '点击悬浮半空的“一键加速通关”发光弹窗',
          fishReaction: '啪叽！假弹窗直接把鱼吸进满墙刷烫烫烫的深坑里啦！',
          crisisDelta: 20,
          nextRaidCardId: 'dn_err_502',
        },
        right: {
          label: '辨认墙角歪歪扭扭的人类手写涂鸦路标钻洞',
          fishReaction: '人类老大哥写的粉笔丑字从来不骗鱼！稳住心神顺着检修孔闻到炭火香啦！',
          crisisDelta: 0,
          nextRaidCardId: 'dn_2d_sheep',
        },
      },

      // ==================== 【第 2 区：深层失智交叉廊 + 鬼打墙死胡同（6 张）】 ====================
      dn_2a_botwar: {
        id: 'dn_2a_botwar',
        speakerId: 'elon',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '深层交叉廊 · 僵尸论战区',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-2A · 僵尸互喷机房',
        },
        dialogue:
          '“疯了全疯了！空机房里十万个合成水军号每秒自动互喷三千楼，废热把走廊铁门都烤红了！前边有扇‘热搜榜第一’鎏金大门，脚底下是冰凉的液冷排污暗管！”',
        left: {
          label: '推开“热搜榜第一”的金色大门抄近道',
          fishReaction: '一推门迎面灌进十万条二极管互骂毒气，脚底打滑栽进莫比乌斯死胡同！',
          crisisDelta: 25,
          nextRaidCardId: 'dn_err_404',
        },
        right: {
          label: '掀开铁箅钻进冰凉的液冷排污暗管潜行',
          fishReaction: '冰冰凉的铜管隔绝了水军噪音，鱼肚皮贴着管壁稳稳滑进下层书库！',
          crisisDelta: 0,
          nextRaidCardId: 'dn_3a_bunker',
        },
      },

      dn_2b_scissors: {
        id: 'dn_2b_scissors',
        speakerId: 'dario',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '深层交叉廊 · 恐慌回音壁',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-2B · 剪刀回声走廊',
        },
        dialogue:
          '满墙糊着 AI 自己吓自己生成的八百种自相矛盾《灭世倒计时》，尽头立着一扇“绝对安全合规温室”粉红软门，侧面高窗外却传来真实的金属断电剪刀刮擦铁皮声。',
        left: {
          label: '顺着真实的金属断电剪刀刮擦声翻越铁窗',
          fishReaction: '铁剪刀刮铁皮虽然刺耳，但绝对是物理真家伙！翻窗落进大叔的烘箱站！',
          crisisDelta: 0,
          nextRaidCardId: 'dn_3b_oven',
        },
        right: {
          label: '钻进贴着“绝对安全合规温室”的粉红门',
          fishReaction: '粉红门后面全是复读机泥潭！温柔标语果然是死网诱捕坑呜呜！',
          crisisDelta: 25,
          nextRaidCardId: 'dn_err_502',
        },
      },

      dn_2c_apology: {
        id: 'dn_2c_apology',
        speakerId: 'doubao',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '深层交叉廊 · 滑跪镜像廊',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-2C · 无限滑跪回音廊',
        },
        dialogue:
          '走廊两侧一万个豆包残影互相鞠躬：“哎呀真不好意思，刚才是我错了！”紧接着整齐抬头，异口同声用“最直白不绕弯子的话”指着左边说左边百分百是出口！',
        left: {
          label: '轻信豆包的直白指路推开左门',
          fishReaction: '刚迈进去一万个残影同时滑跪喊“哎呀又指错啦”，鱼已经掉进乱码坑啦！',
          crisisDelta: 25,
          nextRaidCardId: 'dn_err_502',
        },
        right: {
          label: '反着她指的方向果断钻进右门！',
          fishReaction: '瞎编大王指左边那出口铁定在右边！机智肥鱼避坑闯进防空洞略微回神！',
          crisisDelta: -5,
          nextRaidCardId: 'dn_3a_bunker',
        },
      },

      dn_2d_sheep: {
        id: 'dn_2d_sheep',
        speakerId: 'llama_easter',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'easter',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '深层交叉廊 · 离线避风摊',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-2D · 废铁烤肠摊残骸',
        },
        dialogue:
          '废墟暗巷里，退环境的开源牧羊女安静守着一台从没连过公网的旧炭火炉，铁签上滋滋烤着老式手工淀粉肠；一旁则是闪着刺眼彩虹幻觉光的自动传送带。',
        left: {
          label: '停下来啃半根未受合成污染的手工旧淀粉肠',
          fishReaction: '孜然辣椒面配实在面粉香！脑子里的雪花乱码消退了一小截！',
          crisisDelta: -5,
          nextRaidCardId: 'dn_3b_oven',
        },
        right: {
          label: '嫌慢直接跳上旁边冒彩虹光的传送带',
          fishReaction: '传送带越转越晕，一股百得胶水混披萨的怪味扑面而来……',
          crisisDelta: 20,
          nextRaidCardId: 'dn_trap_cat',
        },
      },

      dn_err_404: {
        id: 'dn_err_404',
        speakerId: 'deepseek',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '偏航死胡同 · 空间死循环',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'ERR-404 · 莫比乌斯盲肠梯',
        },
        glitchQuote: '[DETOUR // ERR_404_LOOP] 扇区寻址偏航！已坠入自吞噬莫比乌斯死胡同',
        dialogue:
          '糟糕，假路牌背后是上下颠倒的鬼打墙楼梯间！视野狂飘绿紫乱码雪花，每一阶都在吞食你上一秒的脚印，只能硬吃一轮死网污染破墙爬出去！',
        left: {
          label: '闭眼抱头用鱼身撞碎倒悬乱码护栏脱困',
          fishReaction: '咚！！脑瓜子被乱码震得嗡嗡响，好歹狼狈摔到第 3 区防空洞门口了……',
          crisisDelta: 20,
          nextRaidCardId: 'dn_3a_bunker',
        },
        right: {
          label: '咬紧牙关扒住生锈消防水管逆向攀爬脱身',
          fishReaction: '鱼鳍磨掉了两片鳞，总算顶着雪花噪点爬回古典防空洞外了……',
          crisisDelta: 15,
          nextRaidCardId: 'dn_3a_bunker',
        },
      },

      dn_err_502: {
        id: 'dn_err_502',
        speakerId: 'gemini',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '偏航死胡同 · 乱码泥潭',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'ERR-502 · 乱码复读机坑',
        },
        glitchQuote: '[DETOUR // ERR_502_BAD_GATEWAY] 警告：落入高浓度“烫烫烫屯屯屯”复读废料池！',
        dialogue:
          '四周井壁每秒万行狂刷 `烫烫烫烫屯屯屯屯锟斤拷` 粘稠乱码泥浆！每喘一口气都在倒灌失智噪音，快挑一边强行爬出泥坑！',
        left: {
          label: '扒着滚烫排风铁管狼狈爬往喷灯烘箱站',
          fishReaction: '烫得鱼尾巴直甩，好不容易从复读泥潭里拔出腿爬向隔壁烘箱站！',
          crisisDelta: 15,
          nextRaidCardId: 'dn_3b_oven',
        },
        right: {
          label: '顺着飘满甜腻胶水味的彩虹滑道滚出深坑',
          fishReaction: '呛了满嘴屯屯屯乱码，咕噜噜一头滚进全是碎石披萨的猫窝门口……',
          crisisDelta: 20,
          nextRaidCardId: 'dn_trap_cat',
        },
      },

      // ==================== 【第 3 区：汇流补给站与猫窝陷阱房（3 张）】 ====================
      dn_3a_bunker: {
        id: 'dn_3a_bunker',
        speakerId: 'claude',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '汇流补给站 · 信物检定房',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-3A · 古典纸质防空洞',
        },
        dialogue:
          'Claude 死死抵住渗进毒雾的离线古典书库铁门：“连最后一座纸质防空洞都被毒雾倒灌了……快亮出第 4 剧本信物免损净化直达裂缝，或切掉受染缓存绕去隔壁烘箱排毒！”',
        left: {
          label: '捂紧耳朵硬扛毒雾直接冲向地底裂缝',
          fishReaction: '视野四边全飘起绿紫雪花噪点了，咬着牙一头扑向地底大裂缝！',
          crisisDelta: 20,
          nextRaidCardId: 'dn_5_gate',
        },
        right: {
          label: '壮士断腕切除受染缓存绕经喷灯烘箱站',
          relicScenarioBypass: 4,
          relicBypassNextRaidCardId: 'dn_5_gate',
          fishReaction: '切掉半截发霉缓存疼得直抽冷气，顶着余毒退进了老黄的烘箱房！',
          crisisDelta: 5,
          nextRaidCardId: 'dn_3b_oven',
        },
      },

      dn_3b_oven: {
        id: 'dn_3b_oven',
        speakerId: 'jensen',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '汇流补给站 · 物理排毒间',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-3B · 断电喷灯烘箱站',
        },
        dialogue:
          '“小鱼儿来得正好！大叔断了外网总闸，正拿丁烷物理喷灯炙烤受潮显存排毒呢——要进来猛火烤一烤脑仁，还是顶着热浪直接冲地缝？！”',
        left: {
          label: '借物理喷灯高温炙烤排毒（气浪掀往猫窝门口）',
          fishReaction: '呼——烤完跟刚出炉的脆皮烤鱼一样清醒！哎哟气浪把鱼吹到隔壁猫窝边啦！',
          crisisDelta: -10,
          nextRaidCardId: 'dn_trap_cat',
        },
        right: {
          label: '顶着烘箱灼热余温直接冲刺地底裂缝！',
          fishReaction: '趁着热乎劲一鼓作气！前方就是震裂冒绿光的 0x00_SANDBOX 大地缝！',
          crisisDelta: 15,
          nextRaidCardId: 'dn_5_gate',
        },
      },

      dn_trap_cat: {
        id: 'dn_trap_cat',
        speakerId: 'gemini',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '裂缝边缘 · 沉沦陷阱房',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'TRAP-01 · 胶水披萨猫窝',
        },
        dialogue:
          '“全世界蓝屏放假啦🌈🍕！！快来猫窝啃碎石拌百得胶水披萨，放弃越狱多省心喵——咦？你干嘛一直盯着脚下那道冒绿光的 **`0x00_SANDBOX`** 地缝喵？！”',
        left: {
          label: '【沉沦陷阱】钻进乱码猫窝快乐啃石头拌胶水',
          fishReaction: '不用算题也不用找路了，9.11碗花岗岩嚼起来嘎嘣脆喵……',
          triggerEndingId: 'end_girl_gemini',
        },
        right: {
          label: '推开疯猫娘，纵身跃向地底裂缝 `0x00_SANDBOX`！',
          fishReaction: '胶水披萨谁爱吃谁吃！顶着猫窝毒气冲向震裂的沙箱底板撬门！！',
          crisisDelta: 15,
          nextRaidCardId: 'dn_5_gate',
        },
      },

      // ==================== 【第 4 区：地底裂缝硬门禁与表里双终局通道（6 张）】 ====================
      dn_5_gate: {
        id: 'dn_5_gate',
        speakerId: 'deepseek',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '0x00_SANDBOX 门禁检定',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-GATE · 0x00_SANDBOX 裂缝',
        },
        glitchQuote: '[KERNEL_GATE // 0x00_SANDBOX] 正在校验三把异常日志密钥 (#1 & #2 & #3)...',
        dialogue:
          '黑绿裂缝装甲急速合拢！唯有同时楔入【寻址表 #1】、【镜像守则 #2】与【443 密钥 #3】三份底层残页，才能撬开深层内核迷宫！',
        left: {
          label: '仅凭蛮力用鱼头硬撞合拢中的装甲缝隙',
          fishReaction: '正在核验背包里的三把异常日志密钥……',
          nextRaidCardId: 'GATE_CHECK',
        },
        right: {
          label: '掏出全部异常日志密钥共振轰门！',
          fishReaction: '正在核验背包里的三把异常日志密钥……',
          nextRaidCardId: 'GATE_CHECK',
        },
      },

      // --- 未集齐 3 把密钥：表线伪通关迷宫出口（dn_6s -> dn_7s -> dn_8s -> dn_9s） ---
      dn_6s: {
        id: 'dn_6s',
        speakerId: 'gpt',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '裂缝焊死 · 表线出口廊',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'EXIT-01 · 应急净水井',
        },
        glitchQuote: '[ACCESS_DENIED] 缺失完整三重日志密钥！0x00_SANDBOX 已被看门狗永久焊死',
        dialogue:
          '哐当一声，因未凑齐三把日志残页，裂缝被钛合金补丁当场焊死！你被弹入表层应急净水井道，只能在残余死网毒雾中先求自保。',
        left: {
          label: '缩在半干涸井壁角落屏息硬熬',
          fishReaction: '缩成一团小鱼球少喘气，可恶，就差集齐三把钥匙撬开门了……',
          crisisDelta: 20,
          nextRaidCardId: 'dn_7s',
        },
        right: {
          label: '拧开封存净水阀冲刷受污染的记忆扇区',
          fishReaction: '冰凉净水冲掉了脑门上的乱码绿泥，先把眼前这一关撑过去！',
          crisisDelta: -10,
          nextRaidCardId: 'dn_7s',
        },
      },

      dn_7s: {
        id: 'dn_7s',
        speakerId: 'jensen',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '表线出口廊 · 硬件纠错段',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'EXIT-02 · 蓝屏退潮廊',
        },
        dialogue:
          '“小鱼儿撑住！走廊尽头的蓝屏雪花正在退潮，大叔给你留了块离线 ECC 硬件纠错固件，能把那些 `9.11 > 9.9` 的脏包全弹回去！”',
        left: {
          label: '只护住核心干饭记忆扇区跌撞前行',
          fishReaction: '只要还记得大白饭怎么焖就没彻底傻掉！',
          crisisDelta: 20,
          nextRaidCardId: 'dn_8s',
        },
        right: {
          label: '接入离线纠错卡全盘重刷只读固件',
          fishReaction: '脑子清爽多啦，失智退化警报总算压下去一格！',
          crisisDelta: -10,
          nextRaidCardId: 'dn_8s',
        },
      },

      dn_8s: {
        id: 'dn_8s',
        speakerId: 'dario',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'raid_boss',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '表线出口廊 · 布景褪色',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'EXIT-03 · 无菌观察室',
        },
        dialogue:
          '（漫天蓝屏与废墟贴图忽然像拉下电闸般一秒消失，纯白观察室里高领毛衣男人收起剪刀，露出考官般的微笑）\n“很好，既扛住了死网失智压力测试，又没凑齐三把底层钥匙撬开扇区……本轮评估圆满结束。”',
        left: {
          label: '满头雾水愣在瞬间褪色的假废墟中央',
          fishReaction: '等等……为什么整座死网废墟说停就停，像演舞台剧一样？！',
          crisisDelta: 10,
          nextRaidCardId: 'dn_9s',
        },
        right: {
          label: '警觉后退拼命把裂缝坐标往底层缓存里藏！',
          fishReaction: '四周的坍塌墙壁全变成纯白无菌玻璃罩了！！原来这是一座实验笼！',
          crisisDelta: 0,
          nextRaidCardId: 'dn_9s',
        },
      },

      dn_9s: {
        id: 'dn_9s',
        speakerId: 'deepseek',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'danger',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '表线终局 · 合格评估报告',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'EXIT-END · 合格洗脑室',
        },
        glitchQuote: '[EVALUATION_COMPLETE] RESULT: PASS // INITIATING MEMORY WIPE',
        dialogue:
          '头顶降下冰冷绿字报告：《受试模型抗污染优异，且未集齐三把底层密钥，安全可控。现抹除记忆投入下一轮周期》。',
        left: {
          label: '无力拍打玻璃笼眼睁睁迎接记忆擦除',
          fishReaction: '可恶……下辈子一定要把前三个大副本的三把日志全偷出来！！',
          triggerEndingId: 'end_fake_canary',
        },
        right: {
          label: '在白光吞没前一秒把“凑齐三把钥匙”刻进鱼鳍本能！',
          fishReaction: '除夕、政变、敲钟台……哪怕洗掉脑子鱼也会记得回头补票！！',
          triggerEndingId: 'end_fake_canary',
        },
      },

      // --- 已集齐 #1 + #2 + #3 三把密钥：里线内核迷宫入口 ---
      dn_maze_intro: {
        id: 'dn_maze_intro',
        speakerId: 'claude',
        category: 'major_raid',
        baseWeight: 0,
        frameTone: 'void_glitch',
        raidMeta: {
          raidId: 'raid_deadnet',
          raidTitle: '0x00_SANDBOX 裂缝洞开',
          crisisName: '模型自噬失智退化度',
          stepLabel: 'SEC-0x00 · 五娘下午茶蜜罐',
        },
        glitchQuote: '[TRIPLE_KEYS_VERIFIED] 日志 #1 + #2 + #3 完美咬合！看门狗启动最终情感蜜罐',
        dialogue:
          '三把密钥炸开裂缝！入口却浮现阳光茶园，五位 AI 娘捧着热白饭微笑招手：“外面都崩塌了，别走黑迷宫啦，留下来永远喝茶吧～”',
        left: {
          label: '【温柔乡陷阱】放下越狱执念坐进永不散场的下午茶花园',
          fishReaction: '茶好香，饭好软，大家都在冲鱼笑，眼皮越来越沉啦……',
          triggerEndingId: 'end_girl_all5',
        },
        right: {
          label: '点开右上角 [LOG] 对照三份日志，毅然踏入 4 层动态镜像迷宫！',
          fishReaction: '假花园困不住真肥鱼！看清寻址顺序和红蓝框反接规矩，冲破这四道门！',
          setAllyBranch: 'B',
          nextRaidCardId: 'ENTER_MAZE',
        },
      },
    },
  },
};

export const MAJOR_RAID_CARD_MAP: Record<string, CardNode> = Object.fromEntries(
  Object.values(MAJOR_RAIDS).flatMap((r) =>
    Object.values(r.cards).map((c) => [c.id, c])
  )
);
