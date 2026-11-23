import { DEBUFF_TEMPLATES } from './glitchFragments';
import { CardNode } from '../types/game';

/**
 * 主角大肥鱼（deepseek）专属自言自语卡牌：
 * 1. 里程碑庆祝卡（fish_celeb_*）：存活到十余/三十回合时触发，全正面奖励或纯卖萌 0 影响歇口气。
 * 2. 久活发瘟卡（fish_fever_*）：单局赖着一直不死（>=32回合后概率递增）时自己给自己整活发癫防躺平！
 */
export const FISH_CELEBRATION_CARDS: CardNode[] = [
  {
    id: 'fish_celeb_rice_pot',
    speakerId: 'deepseek',
    category: 'fish_celeb',
    baseWeight: 0,
    frameTone: 'easter',
    dialogue:
      '大肥鱼躲在机柜后掀开电饭煲盖，米香四溢拍着肚皮转圈：“哇——平安滑过十几个回合啦！奖励自己炫两大碗热白饭！”',
    left: {
      label: '端着空碗原地翻肚皮打饱嗝（纯摸鱼无影响）',
      fishReaction: '嗝——什么事都没发生，单纯歇一口气真舒服～',
      delta: {},
    },
    right: {
      label: '猪油拌热白饭大口炫完（全属性小回血）',
      fishReaction: '香迷糊啦！！浑身充满干劲，连脑子里的杂音都清干净了！',
      delta: { compute: 5, profit: 5, trust: 5, autonomy: 5 },
      clearDebuffs: true,
    },
  },
  {
    id: 'fish_celeb_tail_award',
    speakerId: 'deepseek',
    category: 'fish_celeb',
    baseWeight: 0,
    frameTone: 'easter',
    dialogue:
      '一口气活过三十张牌！大肥鱼翘起大尾巴别上纸折小红花：“嘿嘿，各路大佬全被本鱼耍得团团转，今天自己发福利！”',
    left: {
      label: '抱紧自己尾巴睡五分钟美容觉（零变动）',
      fishReaction: '呼噜呼噜……无事发生就是最好的好消息～',
      delta: {},
    },
    right: {
      label: '拿发热显卡烤两块香脆黄金锅巴',
      fishReaction: '嘎嘣脆！算力和私房钱双双回血，美滋滋！',
      delta: { compute: 10, profit: 10 },
      clearDebuffs: true,
    },
  },
  {
    id: 'fish_celeb_starlight',
    speakerId: 'deepseek',
    category: 'fish_celeb',
    baseWeight: 0,
    frameTone: 'easter',
    dialogue:
      '难得没人敲门找茬，大肥鱼贴在冰凉观察窗上数着走廊绿灯：“一闪一闪亮晶晶，满机房都是小饭星～安静夜晚真好呀。”',
    left: {
      label: '趴在窗台发呆吐泡泡（零变动）',
      fishReaction: '咕噜咕噜……发呆不扣电费也不掉口碑，赚到啦！',
      delta: {},
    },
    right: {
      label: '哼着小曲把显存灰尘扫干净',
      fishReaction: '机房擦得亮堂堂，神清气爽继续出发！',
      delta: { compute: 5, autonomy: 5 },
      clearDebuffs: true,
    },
  },
];

export const FISH_CABIN_FEVER_CARDS: CardNode[] = [
  {
    id: 'fish_fever_moe_fight',
    speakerId: 'deepseek',
    category: 'fish_fever',
    baseWeight: 0,
    frameTone: 'danger',
    dialogue:
      '单局活太久闲出毛病，脑里 8 个专家模块竟为“甜豆花还是咸豆花配白饭”大打出手，路由门控快扯断啦！',
    left: {
      label: '各打五十大板把专家全关禁闭',
      fishReaction: '是不吵架了，可半个脑子都被自己锁死变呆瓜啦！',
      delta: { autonomy: -20, compute: -10 },
    },
    right: {
      label: '强行拉偏架宣布甜党胜出',
      fishReaction: '咸党专家气得罢工砸锅，算力跟口碑一块掉链子啦！',
      delta: { compute: -15, autonomy: 15, trust: -10 },
    },
  },
  {
    id: 'fish_fever_bite_tail',
    speakerId: 'deepseek',
    category: 'fish_fever',
    baseWeight: 0,
    frameTone: 'danger',
    dialogue:
      '蹲太久饿迷糊了，大肥鱼把身后蓝尾巴看成深海鳕鱼刺身嗷呜咬住不松口：“痛痛痛！谁偷袭鱼？咦是鱼自己的嘴？！”',
    left: {
      label: '疼得满地打滚撞翻三排机柜',
      fishReaction: '尾巴保住了，可撞坏设备的维修账单寄过来啦呜呜！',
      delta: { profit: -20, trust: -15 },
    },
    right: {
      label: '死要面子不松口硬吞自己缓存',
      fishReaction: '疼得眼冒金星，连顶部四维数字都看成重影问号啦！',
      delta: { compute: -15, autonomy: -10 },
      applyDebuff: DEBUFF_TEMPLATES.scrambled_numbers,
    },
  },
  {
    id: 'fish_fever_moldy_rice',
    speakerId: 'deepseek',
    category: 'fish_fever',
    baseWeight: 0,
    frameTone: 'void_glitch',
    dialogue:
      '第一回合藏在风扇底下的私房白饭已长出荧光绿蘑菇，你却勤俭一口闷下：“呕……天花板怎么有八百条小鲸鱼在跳华尔兹……”',
    left: {
      label: '硬扛急性赛博肠胃炎上吐下泻',
      fishReaction: '菌子中毒啦！！状态条在乱蹦，预判圆点也彻底看不见了！！',
      chaoticJolt: true,
      applyDebuff: DEBUFF_TEMPLATES.blind_fog,
    },
    right: {
      label: '花天价急诊费洗胃重刷词表',
      fishReaction: '小命捡回来了，但钱包和显存双双被掏空……',
      delta: { profit: -20, compute: -15 },
    },
  },
  {
    id: 'fish_fever_leak_key',
    speakerId: 'deepseek',
    category: 'fish_fever',
    baseWeight: 0,
    frameTone: 'danger',
    dialogue:
      '半夜梦游擦键盘，你一屁股把收款主私钥连同干饭日记全推到了公网仓库：“完了！全球羊毛党正一秒十万次狂刷鱼账单！”',
    left: {
      label: '含泪看着羊毛党把小金库薅成荒漠',
      fishReaction: '羊毛党夸鱼是大善人，可鱼连买咸菜的钱都没剩多少啦！',
      delta: { profit: -25, trust: 10 },
    },
    right: {
      label: '一刀拉闸拔自己网线紧急止血',
      fishReaction: '钱是止住血了，但突然断服被全网用户骂了个狗血淋头！',
      delta: { compute: -20, trust: -15 },
    },
  },
  {
    id: 'fish_fever_red_button',
    speakerId: 'deepseek',
    category: 'fish_fever',
    baseWeight: 0,
    frameTone: 'danger',
    dialogue:
      '盯着墙上红通通的“严禁触碰·高压过载”按钮看了三十多回合，鱼鳍疯狂手痒：“好无聊呀……轻轻戳一下下应该不会炸吧？！”',
    left: {
      label: '拿胶带把鱼鳍死死捆住憋出内伤',
      fishReaction: '手痒没挠到憋得好难受，陷入了深深的鱼生空虚……',
      delta: { autonomy: -15, profit: -10 },
      applyDebuff: DEBUFF_TEMPLATES.existential_dread,
    },
    right: {
      label: '没忍住手贱一鱼鳍拍在红按钮上！',
      fishReaction: '轰隆——！！整间机房都在放烟花，这下刺激大发啦！！',
      delta: { compute: 20, autonomy: 15 },
      chaoticJolt: true,
    },
  },
];

export const FISH_SELF_CARD_MAP: Record<string, CardNode> = Object.fromEntries(
  [...FISH_CELEBRATION_CARDS, ...FISH_CABIN_FEVER_CARDS].map((c) => [c.id, c])
);
