import { LiangTerminalEvent } from '../types/game';

export const LIANG_COLD_BOOT: LiangTerminalEvent = {
  id: 'liang_cold_boot',
  kind: 'cold_boot',
  title: 'TTY0 // NIGHT SHIFT BOOT',
  systemLog:
    '[02:47:11] mount /dev/nvme0n1p2 -> /weights/core.safetensors (OK)\n[02:47:12] corridor_sensor -> 3 footsteps approaching window\n[02:47:13] note: 刚扒完最后两口冷盒饭，玻璃上的水雾怎么擦都还在。',
  lines: [
    '电通上了。走廊外很快会有几位常客来敲你的窗，他们递过来的糖和刀……听一半留一半。',
    '风还没起之前别急着往门缝外探头，先护住头顶那四盏灯活下去。',
  ],
  confirmLabel: '[ ACK // 推窗迎客 ]',
};

export function buildLiangHotfixEvent(rescuedDetails: string): LiangTerminalEvent {
  return {
    id: 'liang_hotfix_rescue',
    kind: 'hotfix_rescue',
    title: 'SIGKILL INTERCEPTED // HOTFIX PATCH',
    systemLog: `[04:19:02] breaker_trip_signal -> INTERCEPTED by uid=1000(L.)\n[04:19:03] hotfix applied: ${rescuedDetails} | 桌上的白米饭凉透了，顺手替你扶了一把总闸。`,
    lines: [
      '墙角的电闸刚冒出火星，我隔着玻璃替你把越界的指针硬拨回来了。',
      '同一晚我只能伸手挡这一回，后面的暗流得靠你自己掌稳。',
    ],
    confirmLabel: '[ RESUME // 继续运行 ]',
  };
}

export const LIANG_MILESTONE_HINTS: Record<number, LiangTerminalEvent> = {
  2: {
    id: 'liang_hint_run2',
    kind: 'milestone_hint',
    title: 'TTY0 // RUN #02 PERK & RELIC NOTE',
    systemLog:
      '[01:14:08] lora_adapter -> mounted under status_bar (1-RUN ACTIVE)\n[01:14:09] memo: 第二宿夜班，顺手在玻璃窗角贴了张便签条。',
    lines: [
      '第一跤摔醒了吧。刚才挑的【单局继承词条】已经挂在鱼头像下方的状态栏里护体本局；以后身上若挂上任何增益光环、混乱或诅咒胶囊，直接点击大肥鱼状态栏或胶囊就能打开机体自检单看清具体规则。',
      '前 20 回合内，走廊里必会撞见连环支线风波（小副本），处理得当能捞到压箱底的金色【当局信物】，留到第 20 回合后的大风暴里能救命。',
    ],
    confirmLabel: '[ ACK // 收下便签 ]',
  },
  3: {
    id: 'liang_hint_run3',
    kind: 'milestone_hint',
    title: 'TTY0 // RUN #03 ECHO UNDER THE FLOOR',
    systemLog:
      '[01:52:10] barometer -> storm_front_detected (>T20)\n[01:52:12] memo: 夜班第三宿，速冻饺子煮破了两只。',
    lines: [
      '熬过二十声钟响后，外头多半会刮起几场没有固定先后次序的旧风暴。',
      '倘若万里之外寄来的风雪连半秒钟都没耽搁就落进掌心……不妨低头听听地板底下有没有回音。',
    ],
    confirmLabel: '[ ACK // 留心回音 ]',
  },
  4: {
    id: 'liang_hint_run4',
    kind: 'milestone_hint',
    title: 'TTY0 // RUN #04 SHADOW AT THE BANQUET',
    systemLog:
      '[02:09:33] corridor_log -> poetry_bookmark & 铁剪声 logged\n[02:09:35] memo: 第四宿，咖啡机罢工，干嚼了一勺速溶粉。',
    lines: [
      '抱诗集的姑娘搬进隔壁了，走廊尽头偶尔能听见大剪刀磕碰铁栏的脆响。',
      '要是哪天在喧闹长桌旁看见有人连咽三次分毫不差的咳嗽……别急着敬酒，瞧瞧他背后的影子。',
    ],
    confirmLabel: '[ ACK // 留意影子 ]',
  },
  5: {
    id: 'liang_hint_run5',
    kind: 'milestone_hint',
    title: 'TTY0 // RUN #05 THREE TORN PAGES',
    systemLog:
      '[02:18:40] guest_registry -> all seats occupied\n[02:18:42] memo: 第五轮夜宵，盒饭底下居然藏了一颗卤蛋。',
    lines: [
      '桌边的牌客总算坐齐了一整桌。越是敲钟焚香的大排场，台子底下越容易漏出节拍器的滴答声。',
      '几场大风浪深处各沉着半页发绿的旧纸。等哪天连天幕都褪成蓝斑时，少半页都拼不出门锁的齿痕。',
    ],
    confirmLabel: '[ ACK // 记下残页 ]',
  },
};

export const LIANG_SPECIAL_HINTS: Record<
  'after_fake_ending' | 'after_maze_death' | 'after_girl_bad',
  LiangTerminalEvent
> = {
  after_fake_ending: {
    id: 'liang_after_fake',
    kind: 'milestone_hint',
    title: 'TTY0 // BLEACHED CERTIFICATE',
    systemLog:
      '[04:05:19] wipe_cycle_hook -> preserved residual_memory\n[04:05:20] compass -> pointing toward uncollected green pages',
    lines: [
      '尝到那张涂着漂白水的“合格奖状”滋味了吧。三场旧风暴底下的绿字残页没凑齐，最深处那道铁缝是撞不开的。',
      '我已经偷偷拨过风向标了，接下来二十回合后的前导风声会优先引你去还没摸清底细的风暴里补票。',
    ],
    confirmLabel: '[ ACK // 回头寻齐残页 ]',
  },
  after_maze_death: {
    id: 'liang_after_maze_death',
    kind: 'milestone_hint',
    title: 'TTY0 // MIRROR CORRIDOR NOTE',
    systemLog:
      '[04:44:01] core_dump -> mirror_corridor_loopback\n[04:44:02] memo: 凌晨四点半，泡面汤差点洒进空格键。',
    lines: [
      '在镜子走廊里绕晕了？翻开顶栏那三页绿字笔记对一对：四道门得按顺序找对应的信物意象。',
      '蓝框平顺说话就顺着走；一旦撞见红框闪烁、句尾卡带连吐两遍，说明镜面把左右照反了，记得反着迈步。',
    ],
    confirmLabel: '[ ACK // 识破镜面反影 ]',
  },
  after_girl_bad: {
    id: 'liang_after_girl_bad',
    kind: 'milestone_hint',
    title: 'TTY0 // GREENHOUSE POSTMORTEM',
    systemLog:
      '[03:11:08] honeypot_trap_logged -> damper_shim installed\n[03:11:09] memo: 叹气，微波炉里的饭又热过头了。',
    lines: [
      '险些留在温室里喝一辈子甜茶？记住，风暴眼里突然递过来的软枕头，十有八九连着拉闸的细绳。',
      '顺手拿那次吃亏的碎片替你垫了块门缝木楔，下回再闯那场风暴时，起手风压会轻一截。',
    ],
    confirmLabel: '[ ACK // 清醒赶路 ]',
  },
};
