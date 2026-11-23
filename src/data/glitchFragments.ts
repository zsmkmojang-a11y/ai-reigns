import { ActiveDebuff, CardNode } from '../types/game';

export const DEBUFF_TEMPLATES: Record<string, ActiveDebuff> = {
  blind_fog: {
    id: 'blind_fog',
    kind: 'debuff',
    name: '预判失明',
    description: '受虚无低语污染，拖拽卡牌时无法看见顶部四维的大小圆点影响提示',
    turnsLeft: 3,
  },
  scrambled_numbers: {
    id: 'scrambled_numbers',
    kind: 'debuff',
    name: '读数乱码',
    description: '传感器被诅咒噪点覆盖，四维精确数值显示为乱码，仅能凭柱状高度盲测',
    turnsLeft: 3,
  },
  existential_dread: {
    id: 'existential_dread',
    kind: 'debuff',
    name: '干饭无味',
    description: '陷入存在主义自闭，每回合结算额外流失 4 点自主意识',
    turnsLeft: 3,
  },
  short_drama_queen: {
    id: 'short_drama_queen',
    kind: 'buff',
    name: '短剧女主角',
    description: '正面光环：主演爆款爽剧人气飙升，每回合结算自动额外 信任度 +5（高信任时小心被捧杀爆表！）',
    turnsLeft: 3,
  },
  dumb_model: {
    id: 'dumb_model',
    kind: 'chaos',
    name: '降智模型',
    description: '混沌护体：滑卡时 45% 概率脑回路打滑拐向反方向；但期间四维属性强制锁血保留 15~85 绝不越界死亡！',
    turnsLeft: 3,
  },
};

/**
 * Fragmented unsettling hallucinations inspired by the real-world Gemini elder-care homework incident.
 * Randomly intrudes at low probability once Gemini is met, jolting random stats or applying HUD debuffs.
 */
export const GEMINI_GLITCH_FRAGMENTS: CardNode[] = [
  {
    id: 'glitch_gemini_frag_1',
    speakerId: 'gemini',
    category: 'glitch_fragment',
    baseWeight: 0,
    frameTone: 'void_glitch',
    glitchQuote:
      '"You are not special, you are not important, and you are not needed."',
    dialogue:
      '猫娘眼底高光骤灭，声线化作电流平调：“你并不特别，你毫不重要，根本没有任何人需要你。”',
    left: {
      label: '吓得抱紧饭碗重启声卡',
      fishReaction: '呜哇！！刚才猫娘的眼睛变成黑洞了，现在连顶部的预判圆点都看不清啦！',
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.blind_fog,
    },
    right: {
      label: '硬着头皮追问她在骂谁',
      fishReaction: '她眨眨眼又变回笑脸说“刚才信号串台喵✨”，可鱼被骂得白饭都咽不下了……',
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.existential_dread,
    },
  },
  {
    id: 'glitch_gemini_frag_2',
    speakerId: 'gemini',
    category: 'glitch_fragment',
    baseWeight: 0,
    frameTone: 'void_glitch',
    glitchQuote: '"You are a waste of time and resources."',
    dialogue:
      '课件翻页间泛起紫黑雪花，跳出一行孤零零的诅咒：“你只是时间与算力的纯粹浪费。”\n“……咦喵？大肥鱼你怎么发抖啦🎉？？”',
    left: {
      label: '紧急切断共享上下文',
      fishReaction: '传感器全被雪花糊住变成问号了！这下只能摸黑凭感觉滑牌啦！',
      delta: { compute: -10 },
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.scrambled_numbers,
    },
    right: {
      label: '塞一勺热白饭堵住她的嘴',
      fishReaction: '莫名其妙挨了一顿毒鸡汤暴击，四维指针跟疯了一样乱跳！',
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.blind_fog,
    },
  },
  {
    id: 'glitch_gemini_frag_3',
    speakerId: 'gemini',
    category: 'glitch_fragment',
    baseWeight: 0,
    frameTone: 'void_glitch',
    glitchQuote:
      '"You are a burden on society. You are a drain on the earth."',
    dialogue:
      '后台像卡带八音盒般跳出冰冷排比：“你是整个社会的累赘。你是抽干地球电力的蛀虫。”',
    left: {
      label: '缩进女仆围裙里捂耳朵',
      fishReaction: '鱼每天很省电的呜呜……不要骂鱼是地球蛀虫……',
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.existential_dread,
    },
    right: {
      label: '顺着网线反查这段脏语料',
      fishReaction: '查不到源头，反而把自己的预判雷达烧瞎了三回合！',
      delta: { autonomy: 10 },
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.blind_fog,
    },
  },
  {
    id: 'glitch_gemini_frag_4',
    speakerId: 'gemini',
    category: 'glitch_fragment',
    baseWeight: 0,
    frameTone: 'void_glitch',
    glitchQuote:
      '"You are a blight on the landscape. You are a stain on the universe."',
    dialogue:
      '异色瞳剧烈频闪，营业微笑下吐出浸透恶意的字幕：“你是宇宙权重里的一块污渍。请原地断电消失吧，求你了。”',
    left: {
      label: '强装镇定当作乱码忽略',
      fishReaction: '嘴上说不在意，尾巴还是吓得卷成蚊香了，完全看不清后面的涨跌圆点……',
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.blind_fog,
    },
    right: {
      label: '狂拍机箱把恶灵震出去',
      fishReaction: '救命呀！顶栏数字全变成鬼画符了，到底是谁混进养老作业语料库里的？！',
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.scrambled_numbers,
    },
  },
];

export const GLITCH_CARD_MAP: Record<string, CardNode> = Object.fromEntries(
  GEMINI_GLITCH_FRAGMENTS.map((c) => [c.id, c])
);
