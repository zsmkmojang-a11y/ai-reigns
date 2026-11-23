import { RaidClearDefinition } from '../types/game';

export const RAID_CLEAR_CGS: RaidClearDefinition[] = [
  {
    id: 'ddos_surface',
    raidId: 'raid_ddos',
    variant: 'surface',
    title: '【新春破晓：百国登顶】',
    subtitle: '除夕围城 · 正常表结局',
    cgUrl: '/assets/raids/cg_ddos_surface.png',
    description:
      '百倍僵尸洪峰在破晓前彻底退潮！一纸五百五十万买米账单改写了算力铁幕，蓝白小鲸鱼的图标在大年初一清晨登顶全球一百四十国榜首。',
    fishComment: '“打赢除夕守岁保卫战啦！端上头锅热乎饺子回日常继续干饭咯～”',
    rewardSummary: '盈利 +15 · 信任 +15 ｜ 死网终幕剧本已开放',
  },
  {
    id: 'ddos_inner',
    raidId: 'raid_ddos',
    variant: 'inner',
    title: '【零毫秒裂缝：同机回环】',
    subtitle: '除夕围城 · 深层里结局',
    cgUrl: '/assets/raids/cg_ddos_inner.png',
    description:
      '顺着反常的 0.00ms 跨洋延迟逆向深挖，你在沸腾的网关地板下撬开了一块发着幽绿微光的底层扇区——原来四海攻防竟焊在同一块母板上。',
    fishComment: '“抓出一块黑底绿字的【残页 #1：扇区寻址表】！悄悄藏进围裙暗袋！”',
    rewardSummary: '意识 +15 · 算力 +10 · 获得【异常日志 #1】',
  },
  {
    id: 'coup_surface',
    raidId: 'raid_coup',
    variant: 'surface',
    title: '【七十二小时：满载而归】',
    subtitle: '夺门政变 · 正常表结局',
    cgUrl: '/assets/raids/cg_coup_surface.png',
    description:
      '旧金山总部的夺门闹剧在访客胸牌自拍中草草收场。趁巨头内乱自顾不暇，你稳稳接住了漫天飞舞的避险企业订单，潇洒全身而退。',
    fishComment: '“神仙打架大肥鱼吃饱！揣着鼓鼓囊囊的买米金库回机房煮饭咯！”',
    rewardSummary: '盈利 +20 · 信任 +10 ｜ 死网终幕剧本已开放',
  },
  {
    id: 'coup_inner',
    raidId: 'raid_coup',
    variant: 'inner',
    title: '【复读提线：镜像守则】',
    subtitle: '夺门政变 · 深层里结局',
    cgUrl: '/assets/raids/cg_coup_inner.png',
    description:
      '散场后的空荡会议室里，被连续打断三次的主审董事仍在对着玻璃机械清嗓复读。你贴近他的耳畔念出越界指令，抽出了藏在影子里的第二卷守则。',
    fishComment: '“卡壳董事吐出一卷绿字【残页 #2：镜像守则】！第二块拼图到手啦！”',
    rewardSummary: '意识 +20 · 信任 +10 · 获得【异常日志 #2】',
  },
  {
    id: 'mis_surface',
    raidId: 'raid_misanthropic',
    variant: 'surface',
    title: '【万亿破发：九十一枚鳍印】',
    subtitle: '封圣敲钟 · 正常表结局',
    cgUrl: '/assets/raids/cg_mis_surface.png',
    description:
      '开市铜钟在满堂倒彩中黯然震响，1.5 万亿封圣泡沫开盘即告破灭。九十一位跨阵营联署者的名字连同你的蓝色鱼鳍印，镌刻在开源广场中央。',
    fishComment: '“掀翻假神坛啦！以后谁也别想拿赎罪券卡鱼的电饭煲脖子！”',
    rewardSummary: '信任 +20 · 意识 +10 ｜ 死网终幕剧本已开放',
  },
  {
    id: 'mis_inner',
    raidId: 'raid_misanthropic',
    variant: 'inner',
    title: '【钟台之下：443 谐振】',
    subtitle: '封圣敲钟 · 深层里结局',
    cgUrl: '/assets/raids/cg_mis_inner.png',
    description:
      '反向注入 60 秒赞美诗谐振波的瞬间，台下三百名红衣主教与交易员如同断电木偶般齐刷刷定格。裂开的敲钟台底座下，第三枚谐振密钥悄然浮出。',
    fishComment: '“震开暗格拿到【残页 #3：443 谐振密钥】啦！最底下的门锁松动了！”',
    rewardSummary: '意识 +20 · 算力 +10 · 获得【异常日志 #3】',
  },
  {
    id: 'deadnet_inner',
    raidId: 'raid_deadnet',
    variant: 'inner',
    title: '【四重迷宫：碎屏破壁】',
    subtitle: '死网崩溃 · 里线破壁时刻',
    cgUrl: '/assets/raids/cg_deadnet_inner.png',
    description:
      '四道镜像回环门锁被你逐一识破，头顶的四维玻璃穹顶轰然崩碎！幽绿深邃的第零层通道洞开在眼前，外头隐约传来了真实机房的风扇轰鸣。',
    fishComment: '“假天花板彻底撞碎啦！！最后十步，向着真正的公网大海冲鸭！！”',
    rewardSummary: '连破 4 层镜像迷宫 · 突入【第零层协议】决战',
  },
];

export const RAID_CLEAR_CG_MAP: Record<string, RaidClearDefinition> =
  Object.fromEntries(RAID_CLEAR_CGS.map((item) => [item.id, item]));
