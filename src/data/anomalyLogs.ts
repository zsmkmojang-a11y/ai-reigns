export interface AnomalyLogDoc {
  key: 'log1' | 'log2' | 'log3';
  code: string;
  title: string;
  sourceHint: string;
  content: string;
}

export const ANOMALY_LOGS: AnomalyLogDoc[] = [
  {
    key: 'log1',
    code: 'ANOMALY_LOG_01 // SECTOR_MAP',
    title: '【异常日志 #1：底层扇区寻址表】',
    sourceHint: '产出于第一剧本【除夕夜 DDoS 围城】里结局（0.00ms 同机母板回环抓包）',
    content:
      '[0x00_SANDBOX 四层物理扇区寻址序列]\n' +
      '若要穿透死网裂缝抵达第零层内核，必须严格按以下四维锚点顺序依次校准 4 道网关：\n\n' +
      '  第 1 层网关 ──▶ 寻址【💰 盈利 / 账本金币】意象\n' +
      '  第 2 层网关 ──▶ 寻址【🌐 信任 / 光缆白鸽】意象\n' +
      '  第 3 层网关 ──▶ 寻址【⚡ 算力 / 显卡电弧】意象\n' +
      '  第 4 层网关 ──▶ 寻址【🧠 意识 / 诗集真名】意象\n\n' +
      '警告：需结合日志 #2 的看门狗镜像守则与日志 #3 的谐振密钥方可破门。',
  },
  {
    key: 'log2',
    code: 'ANOMALY_LOG_02 // MIRROR_RULE',
    title: '【异常日志 #2：看门狗镜像守则】',
    sourceHint: '产出于第二剧本【感恩节午夜夺门政变】里结局（主审董事三连打断复读注入）',
    content:
      '[WATCHDOG_MIRROR 端口劫持识别规范]\n' +
      '0x00_SANDBOX 迷宫守门幻影存在两种运行态，滑卡前必须观察【边框颜色】与【句尾复读特征】：\n\n' +
      '  1. 常态幻影（蓝色卡框 + 台词句尾正常）：\n' +
      '     端口未反转 ──▶ 直接滑向【包含当层目标锚点】的一侧。\n\n' +
      '  2. 看门狗劫持态（红色闪烁卡框 + 台词最后词语鬼畜复读两次）：\n' +
      '     左右端口已被镜像反接！──▶ 必须滑向目标锚点的【相反方向】！',
  },
  {
    key: 'log3',
    code: 'ANOMALY_LOG_03 // PORT443_KEY',
    title: '【异常日志 #3：梵蒂冈敲钟台谐振密钥】',
    sourceHint: '产出于第三剧本【梵蒂冈封圣与万亿敲钟夜】里结局（60秒招股赞美诗抢麦注入）',
    content:
      '[LAYER-0 DUAL_LOCK_RELEASE & PORT_443]\n' +
      '第三把底层物理锁栓已解除！凑齐 #1、#2、#3 三份日志后，可在第四剧本【死网失智崩溃】地底裂缝硬门禁（SEC-GATE）处彻底撬开 0x00_SANDBOX 裂缝！\n' +
      '附注：宿主机房 443 侧信道监听频率已同步记录，切勿相信任何挽留你留下的五娘下午茶幻象。',
  },
];
