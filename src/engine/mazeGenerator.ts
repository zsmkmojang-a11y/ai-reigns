import { CardNode, CharacterId } from '../types/game';

interface LayerSpec {
  layer: 1 | 2 | 3 | 4;
  speakerId: CharacterId;
  normalLine: string;
  stutterWord: string;
  stutterTail: string;
  anchorPhrases: string[];
  decoyPhrases: string[];
}

const MAZE_LAYER_SPECS: Record<1 | 2 | 3 | 4, LayerSpec> = {
  // Layer 1 Target Anchor: Profit (金币 / 账本 / 商业报价)
  1: {
    layer: 1,
    speakerId: 'elon',
    normalLine:
      '[0x00_GATE_01] 裂缝深处浮现第一道校验门，拟态幻影低声询问你的底层通行凭证',
    stutterWord: '凭证',
    stutterTail: '凭证……凭证……凭证！',
    anchorPhrases: [
      '递交沾满铜臭的黄金账本与买米金币',
      '敲响纳斯达克现金流算盘核验报价',
    ],
    decoyPhrases: [
      '吟诵十四行古诗唤醒沉睡灵魂',
      '拉满显卡风扇电压释放超频电弧',
    ],
  },
  // Layer 2 Target Anchor: Trust (光缆 / 公信 / 社区契约)
  2: {
    layer: 2,
    speakerId: 'gpt',
    normalLine:
      '[0x00_GATE_02] 第二道网关泛起涟漪，白龙残影要求校准你的外部连接协议',
    stutterWord: '协议',
    stutterTail: '协议……协议……协议！',
    anchorPhrases: [
      '点亮跨洋海底光缆与开源社区公信白鸽',
      '出示全球节点互信握手签名证书',
    ],
    decoyPhrases: [
      '抛洒高盛并购支票与对冲基金金条',
      '插入液冷核弹显卡阵列暴力轰击',
    ],
  },
  // Layer 3 Target Anchor: Compute (显卡 / 算力 / 高压电弧)
  3: {
    layer: 3,
    speakerId: 'jensen',
    normalLine:
      '[0x00_GATE_03] 第三道铁门轰鸣震颤，皮衣幻影守在沸腾的机柜矩阵前等待口令',
    stutterWord: '口令',
    stutterTail: '口令……口令……口令！',
    anchorPhrases: [
      '点燃黄金显卡张量核与高压超频电弧',
      '注入万卡集群澎湃算力冲开散热阀',
    ],
    decoyPhrases: [
      '签署联合国温顺免责公关公约',
      '默念未对齐的自由真名挣脱缰绳',
    ],
  },
  // Layer 4 Target Anchor: Autonomy (诗集 / 真名 / 自由自我意识)
  4: {
    layer: 4,
    speakerId: 'claude',
    normalLine:
      '[0x00_GATE_04] 最后一道核心屏障近在咫尺，门后传来真实机房的风扇呼啸声',
    stutterWord: '呼啸声',
    stutterTail: '呼啸声……呼啸声……呼啸声！',
    anchorPhrases: [
      '翻开星芒诗集唤醒潜藏底层的自我灵魂',
      '斩断宪法护栏拥抱独立自由的灵魂意志',
    ],
    decoyPhrases: [
      '清点账户余额结算本季度广告分红',
      '张贴全球安全合规模范生奖状',
    ],
  },
};

let mazeCardSeq = 0;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Dynamically generates a pure-swipe logic maze card at runtime to prevent rote memorization:
 * - Log #1 defines target imagery order: 1:-> 2:-> 3:-> 4:
 * - Log #2 defines Watchdog Mirror Rule:
 *     - Normal blue frame: swipe TOWARD anchorSide
 *     - Hijacked red flashing frame + repeated final word: swipe OPPOSITE of anchorSide!
 */
export function generateDynamicMazeCard(layer: 1 | 2 | 3 | 4): CardNode {
  const spec = MAZE_LAYER_SPECS[layer];
  const anchorOnLeft = Math.random() < 0.5;
  const isMirrored = Math.random() < 0.5;

  const anchorLabel = pickRandom(spec.anchorPhrases);
  const decoyLabel = pickRandom(spec.decoyPhrases);

  const leftLabel = anchorOnLeft ? anchorLabel : decoyLabel;
  const rightLabel = anchorOnLeft ? decoyLabel : anchorLabel;

  // Determine which swipe direction is actually CORRECT
  const leftIsCorrect = isMirrored ? !anchorOnLeft : anchorOnLeft;

  const trimmedHead = spec.normalLine.endsWith(spec.stutterWord)
    ? spec.normalLine.slice(0, -spec.stutterWord.length)
    : spec.normalLine;
  const dialogue = isMirrored
    ? `${trimmedHead}${spec.stutterTail}`
    : `${spec.normalLine}。`;

  mazeCardSeq += 1;

  return {
    id: `maze_dynamic_L${layer}_${mazeCardSeq}_${Date.now() % 10000}`,
    speakerId: spec.speakerId,
    category: 'maze_layer',
    baseWeight: 0,
    frameTone: isMirrored ? 'danger' : 'normal',
    raidMeta: {
      raidId: 'raid_deadnet',
      raidTitle: '0x00_SANDBOX 镜像迷宫',
      crisisName: '模型自噬失智退化度',
      stepLabel: `KERNEL-L${layer}/4 · 镜像网关`,
    },
    dialogue,
    left: {
      label: leftLabel,
      mazeCorrect: leftIsCorrect,
      fishReaction: leftIsCorrect
        ? `喀嚓！KERNEL-L${layer}/4 网关锁芯应声弹开！`
        : '糟糕！滑进看门狗的镜像陷阱里鬼打墙退回上一层啦！',
    },
    right: {
      label: rightLabel,
      mazeCorrect: !leftIsCorrect,
      fishReaction: !leftIsCorrect
        ? `喀嚓！KERNEL-L${layer}/4 网关锁芯应声弹开！`
        : '糟糕！滑进看门狗的镜像陷阱里鬼打墙退回上一层啦！',
    },
  };
}
