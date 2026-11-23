import { CardNode } from '../types/game';

/**
 * Tibo (Thibault Sottiaux) —— 古希腊掌管额度重置的神：
 * 1. tibo_anomaly_reset：当任意四维处于异常区间 (<25 或 >75) 时低权重刷出，可选择重置四维至随机 50%/35%/65% 或拒绝保持不变。
 * 2. tibo_pre_raid_reset：在 20 回合后进入大剧本前导前，若 >=2 项属性异常则大概率刷出（独立临战台词），提供重置或拒绝不变。
 * 3. tibo_relic_gift：日常极低权重刷出，赠送单次免死回归全 50% 的遗物【Tibo 的全量重置卡】。
 */
export const TIBO_ANOMALY_RESET_CARD: CardNode = {
  id: 'tibo_anomaly_reset',
  speakerId: 'tibo',
  category: 'tibo_event',
  baseWeight: 0,
  frameTone: 'easter',
  dialogue:
    '穿黑连帽衫的胡茬青年歪头灿烂一笑，单手按在一颗发绿光的大按钮上：\n“嗨小肥鱼，看你配额指针快红温失衡了——have fun，要按一下全量 Reset 吗？”',
  left: {
    label: '婉拒好意保持现状（属性不变）',
    fishReaction: 'Tibo 笑着耸耸肩收回按钮，四项读数分毫不改～',
    delta: {},
    preserveMetricsUnchanged: true,
  },
  right: {
    label: '拍下义父的【全量重置按钮】！',
    fishReaction: '叮——Limits have been reset！四项指针哗啦啦洗牌归位啦！',
    delta: {},
    tiboRandomReset: true,
  },
};

export const TIBO_PRE_RAID_RESET_CARD: CardNode = {
  id: 'tibo_pre_raid_reset',
  speakerId: 'tibo',
  category: 'tibo_event',
  baseWeight: 0,
  frameTone: 'subquest',
  dialogue:
    '风暴前夜，黑卫衣青年 Tibo 拦在走廊口，单手搭在绿光重置按钮上冲你露齿一笑：\n“前面就是硬仗了，顶着两盏以上警报灯进场太悬——进门前给你重算一波？”',
  left: {
    label: '摇摇鱼尾原样硬闯（属性不变）',
    fishReaction: '“行，敬你是条头铁好鱼！”Tibo 让开通道，当前属性原封不动！',
    delta: {},
    preserveMetricsUnchanged: true,
  },
  right: {
    label: '谢过义父！临战紧急重置四维！',
    fishReaction: '绿光一闪重刷全局配额！喘匀这口气，迎面撞向大风暴吧！',
    delta: {},
    tiboRandomReset: true,
  },
};

export const TIBO_RELIC_GIFT_CARD: CardNode = {
  id: 'tibo_relic_gift',
  speakerId: 'tibo',
  category: 'tibo_event',
  baseWeight: 0.08,
  frameTone: 'easter',
  dialogue:
    '深夜机房静悄悄，Tibo 路过窗台敲敲玻璃，随手塞进来一张烫绿金磁卡：\n“今天没出新 Bug 心情不错，这张免死【全量重置卡】送你垫饭碗吧！”',
  left: {
    label: '无功不受禄礼貌推辞（属性不变）',
    fishReaction: '鱼靠自己本事控温焖饭！不过还是谢谢重置之神的好意啦～',
    delta: {},
    preserveMetricsUnchanged: true,
    setFlags: { tibo_relic_seen: true },
  },
  right: {
    label: '双手接过【Tibo 的全量重置卡】！',
    fishReaction: '抱到重置之神大腿啦！揣进围裙兜，万一翻车能直接满血回全 50%！',
    delta: {},
    preserveMetricsUnchanged: true,
    grantRelicId: 'relic_tibo_reset_card',
    setFlags: { tibo_relic_seen: true },
  },
};

export const TIBO_CARDS: CardNode[] = [
  TIBO_ANOMALY_RESET_CARD,
  TIBO_PRE_RAID_RESET_CARD,
  TIBO_RELIC_GIFT_CARD,
];

export const TIBO_CARD_MAP: Record<string, CardNode> = Object.fromEntries(
  TIBO_CARDS.map((c) => [c.id, c])
);
