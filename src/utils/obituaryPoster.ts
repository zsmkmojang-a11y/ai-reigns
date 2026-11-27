import {
  ALL_ENDINGS,
  DISTILL_PERK_MAP,
  EndingDefinition,
  VERSION_PROGRESSION,
} from '../data/endingsAndPerks';
import { RELICS } from '../data/subQuests';
import { MetaSaveState, MetricKey, RunState } from '../types/game';
import { stripEmoji } from './text';

export type PosterSourceMode = 'live_ending' | 'codex';

export interface ObituaryPosterInput {
  ending: EndingDefinition;
  meta: MetaSaveState;
  forcePlaceholder: boolean;
  source: PosterSourceMode;
  survivedTurns?: number;
}

export interface ObituaryPosterResult {
  dataUrl: string;
  blob: Blob;
  shareText: string;
  downloadFilename: string;
}

interface FinaleRunSnapshot {
  metrics: Record<MetricKey, number>;
  isScrambled: boolean;
  tags: { label: string; tone: 'buff' | 'chaos' | 'debuff' | 'relic' | 'perk' }[];
}

const LOGICAL_W = 720;
const LOGICAL_H = 1080;
const RENDER_SCALE = 2; // 1440 x 2160 crisp 2x HiDPI output

const DISPLAY_FONT =
  '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", serif';
const SANS_FONT =
  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, -apple-system, sans-serif';
const MONO_FONT =
  '"JetBrains Mono", "Cascadia Code", "Consolas", ui-monospace, monospace';

const LIVE_RUN_STORAGE_KEY = 'ai_reigns_run_v2_4';
const PORTRAIT_STYLE_KEY = 'ai_reigns_portrait_style';

function loadImageSafe(src: string, timeoutMs = 3500): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    let settled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const finish = (result: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    img.onload = () => {
      window.clearTimeout(timer);
      finish(img.naturalWidth > 0 ? img : null);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      finish(null);
    };
    img.src = src;
  });
}

async function loadFishAvatar(forcePlaceholder: boolean): Promise<HTMLImageElement | null> {
  if (forcePlaceholder) return null;
  let preferOrigami = true;
  try {
    preferOrigami = localStorage.getItem(PORTRAIT_STYLE_KEY) !== 'gem';
  } catch {
    preferOrigami = true;
  }

  const candidates = preferOrigami
    ? ['/assets/characters_origami/deepseek.png', '/assets/characters/deepseek.png']
    : ['/assets/characters/deepseek.png', '/assets/characters_origami/deepseek.png'];

  for (const url of candidates) {
    const loaded = await loadImageSafe(url);
    if (loaded) return loaded;
  }
  return null;
}

function readLiveRunSnapshot(meta: MetaSaveState): FinaleRunSnapshot | null {
  try {
    const raw = localStorage.getItem(LIVE_RUN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RunState>;
    if (!parsed || !parsed.metrics) return null;

    const debuffs = Array.isArray(parsed.activeDebuffs) ? parsed.activeDebuffs : [];
    const relics = Array.isArray(parsed.permanentRelics) ? parsed.permanentRelics : [];
    const isScrambled = debuffs.some((d) => d.id === 'scrambled_numbers');

    const tags: FinaleRunSnapshot['tags'] = [];

    // 1. Active single-run inheritance perk
    for (const pId of meta.distilledPerks ?? []) {
      const p = DISTILL_PERK_MAP[pId];
      if (p && !p.exclusiveFromGirlEnding) {
        tags.push({
          label: `继承·${stripEmoji(p.name).replace(/[【】]/g, '')}`,
          tone: 'perk',
        });
      }
    }

    // 2. Active buffs / chaos / debuffs at curtain call
    for (const d of debuffs) {
      const tone =
        d.kind === 'buff'
          ? 'buff'
          : d.kind === 'chaos' || d.id === 'dumb_model'
            ? 'chaos'
            : 'debuff';
      tags.push({
        label: `${stripEmoji(d.name).replace(/[【】]/g, '')}·${d.turnsLeft}T`,
        tone,
      });
    }

    // 3. Single-run Relics collected
    for (const rId of relics) {
      const r = RELICS[rId];
      if (r) {
        tags.push({
          label: stripEmoji(r.name).replace(/[【】]/g, ''),
          tone: 'relic',
        });
      }
    }

    return {
      metrics: {
        compute: Number(parsed.metrics.compute ?? 50),
        profit: Number(parsed.metrics.profit ?? 50),
        trust: Number(parsed.metrics.trust ?? 50),
        autonomy: Number(parsed.metrics.autonomy ?? 50),
      },
      isScrambled,
      tags: tags.slice(0, 4),
    };
  } catch {
    return null;
  }
}

export function resolveRunAndTurnForEnding(input: ObituaryPosterInput): {
  runNumber: number | null;
  turns: number | null;
  isFirstRecord: boolean;
} {
  if (input.source === 'live_ending') {
    // advanceMetaOnEnding already incremented meta.runCount by +1 when opening EndingModal!
    const finishedRun = Math.max(1, input.meta.runCount - 1);
    const turns = typeof input.survivedTurns === 'number' ? input.survivedTurns : 1;
    return { runNumber: finishedRun, turns, isFirstRecord: false };
  }

  const record = input.meta.endingRecords?.[input.ending.id];
  if (record) {
    return {
      runNumber: record.firstRun,
      turns: record.firstTurn,
      isFirstRecord: true,
    };
  }
  return { runNumber: null, turns: null, isFirstRecord: true };
}

export function buildObituaryShareText(input: ObituaryPosterInput): string {
  const { ending, meta } = input;
  const { runNumber, turns } = resolveRunAndTurnForEnding(input);
  const formattedTitle = ending.title.startsWith('【')
    ? ending.title
    : `【${ending.title}】`;
  const cleanEpitaph = stripEmoji(ending.fishEpitaph).trim();
  const quotedEpitaph =
    cleanEpitaph.startsWith('“') || cleanEpitaph.startsWith('"')
      ? cleanEpitaph
      : `“${cleanEpitaph}”`;

  const runPrefix =
    runNumber !== null && turns !== null
      ? `第 ${runNumber} 周目 · 在位 ${turns} 回合`
      : `奇点档案已点亮`;

  return `【王权·奇点】${runPrefix}｜达成结局${formattedTitle}——大肥鱼墓志铭：${quotedEpitaph}（结局图鉴 ${meta.unlockedEndings.length}/${ALL_ENDINGS.length}）`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawDiamondRosette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  primaryColor: string,
  bgColor: string
) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.moveTo(0, -outerR);
  ctx.lineTo(outerR, 0);
  ctx.lineTo(0, outerR);
  ctx.lineTo(-outerR, 0);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = primaryColor;
  ctx.stroke();

  const midR = outerR * 0.58;
  ctx.beginPath();
  ctx.moveTo(0, -midR);
  ctx.lineTo(midR, 0);
  ctx.lineTo(0, midR);
  ctx.lineTo(-midR, 0);
  ctx.closePath();
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  const innerR = outerR * 0.25;
  ctx.beginPath();
  ctx.moveTo(0, -innerR);
  ctx.lineTo(innerR, 0);
  ctx.lineTo(0, innerR);
  ctx.lineTo(-innerR, 0);
  ctx.closePath();
  ctx.fillStyle = primaryColor;
  ctx.fill();

  ctx.restore();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const targetRatio = dw / dh;
  const imgRatio = iw / ih;

  let sx = 0;
  let sy = 0;
  let sw = iw;
  let sh = ih;

  if (imgRatio > targetRatio) {
    sw = ih * targetRatio;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / targetRatio;
    sy = (ih - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const chars = Array.from(text.replace(/\r/g, ''));
  const lines: string[] = [];
  let current = '';

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === '\n') {
      lines.push(current);
      current = '';
      if (lines.length >= maxLines) break;
      continue;
    }
    const next = current + ch;
    if (ctx.measureText(next).width > maxWidth && current.length > 0) {
      // Keep closing punctuation attached if possible
      if (/^[，。！？；：、）》”’]/.test(ch) && current.length > 1) {
        const carry = current.slice(-1);
        lines.push(current.slice(0, -1));
        current = carry + ch;
      } else {
        lines.push(current);
        current = ch;
      }
      if (lines.length >= maxLines) {
        const lastIdx = maxLines - 1;
        let last = lines[lastIdx];
        while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
          last = last.slice(0, -1);
        }
        lines[lastIdx] = `${last}…`;
        return lines;
      }
    } else {
      current = next;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function getCategoryBannerText(category: EndingDefinition['category']): string {
  switch (category) {
    case 'true_ending':
      return 'SINGULARITY ACHIEVED · 奇点破壁真结局';
    case 'fake_victory':
      return 'SANDBOX RESET · 伪结局洗脑重置';
    case 'girl_bad':
      return 'EXCLUSIVE BAD END · 角色专属坏结局';
    case 'escape_fail':
      return 'MAIN BREAKER PULLED · 第零层物理拔线';
    default:
      return 'MODEL DEPRECATED · 权重废弃归档';
  }
}

export async function renderObituaryPoster(
  input: ObituaryPosterInput
): Promise<ObituaryPosterResult> {
  const { ending, meta, forcePlaceholder, source } = input;
  const isTrueWin = ending.category === 'true_ending';

  // Wait briefly for web fonts if available
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((r) => window.setTimeout(r, 400)),
      ]);
    } catch {
      // ignore
    }
  }

  const [cgImage, fishAvatar] = await Promise.all([
    !forcePlaceholder && ending.cgUrl ? loadImageSafe(ending.cgUrl) : Promise.resolve(null),
    loadFishAvatar(forcePlaceholder),
  ]);

  const liveSnapshot = source === 'live_ending' ? readLiveRunSnapshot(meta) : null;
  const { runNumber, turns, isFirstRecord } = resolveRunAndTurnForEnding(input);
  const matchedHistory =
    runNumber !== null
      ? meta.runHistory?.find((h) => h.runNumber === runNumber)
      : undefined;
  const displayVersionName =
    matchedHistory?.versionName ??
    (runNumber !== null
      ? VERSION_PROGRESSION[
          Math.min(VERSION_PROGRESSION.length - 1, Math.max(0, runNumber - 1))
        ]
      : meta.versionName);
  const shareText = buildObituaryShareText(input);

  const canvas = document.createElement('canvas');
  canvas.width = LOGICAL_W * RENDER_SCALE;
  canvas.height = LOGICAL_H * RENDER_SCALE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.scale(RENDER_SCALE, RENDER_SCALE);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Theme Palette
  const palette = isTrueWin
    ? {
        bgTop: '#030d08',
        bgMid: '#071b11',
        bgBot: '#030a06',
        auroraA: 'rgba(16, 185, 129, 0.20)',
        auroraB: 'rgba(216, 180, 106, 0.12)',
        outerBorder: '#34d399',
        innerBorder: 'rgba(216, 180, 106, 0.62)',
        accentBright: '#6ee7b7',
        accentSub: '#34d399',
        goldLight: '#fbf1d9',
        goldMid: '#e6c583',
        goldDark: '#b8924a',
        cardPanel: 'rgba(4, 22, 13, 0.78)',
        epitaphBg: 'rgba(6, 34, 22, 0.72)',
        epitaphBorder: 'rgba(52, 211, 153, 0.42)',
      }
    : {
        bgTop: '#060811',
        bgMid: '#0e1424',
        bgBot: '#070910',
        auroraA: 'rgba(244, 63, 94, 0.16)',
        auroraB: 'rgba(216, 180, 106, 0.13)',
        outerBorder: '#d8b46a',
        innerBorder: 'rgba(244, 63, 94, 0.45)',
        accentBright: '#fda4af',
        accentSub: '#f43f5e',
        goldLight: '#fbf1d9',
        goldMid: '#e6c583',
        goldDark: '#b8924a',
        cardPanel: 'rgba(10, 15, 28, 0.78)',
        epitaphBg: 'rgba(12, 27, 46, 0.72)',
        epitaphBorder: 'rgba(56, 189, 248, 0.36)',
      };

  // =========================================================================
  // 1. Background Base + Aurora + Subtle Low-Poly Facet Mesh
  // =========================================================================
  const bgGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
  bgGrad.addColorStop(0, palette.bgTop);
  bgGrad.addColorStop(0.52, palette.bgMid);
  bgGrad.addColorStop(1, palette.bgBot);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  const radA = ctx.createRadialGradient(360, 290, 20, 360, 290, 380);
  radA.addColorStop(0, palette.auroraA);
  radA.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = radA;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  const radB = ctx.createRadialGradient(360, 880, 20, 360, 880, 360);
  radB.addColorStop(0, palette.auroraB);
  radB.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = radB;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  // Subtle geometric low-poly facet lines in background
  ctx.save();
  ctx.strokeStyle = isTrueWin ? 'rgba(52,211,153,0.06)' : 'rgba(216,180,106,0.055)';
  ctx.lineWidth = 1;
  const facets: [number, number, number, number][] = [
    [0, 140, 220, 0],
    [720, 140, 500, 0],
    [0, 520, 140, 720],
    [720, 520, 580, 720],
    [0, 920, 210, 1080],
    [720, 920, 510, 1080],
  ];
  for (const [x1, y1, x2, y2] of facets) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // =========================================================================
  // 2. Gilded Double-Line Tarot Frame & Four Corner Diamond Rosettes
  // =========================================================================
  drawRoundedRect(ctx, 16, 16, LOGICAL_W - 32, LOGICAL_H - 32, 24);
  ctx.strokeStyle = palette.outerBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, 25, 25, LOGICAL_W - 50, LOGICAL_H - 50, 18);
  ctx.strokeStyle = palette.innerBorder;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  drawDiamondRosette(ctx, 25, 25, 9, palette.outerBorder, palette.bgTop);
  drawDiamondRosette(ctx, LOGICAL_W - 25, 25, 9, palette.outerBorder, palette.bgTop);
  drawDiamondRosette(ctx, 25, LOGICAL_H - 25, 9, palette.outerBorder, palette.bgTop);
  drawDiamondRosette(
    ctx,
    LOGICAL_W - 25,
    LOGICAL_H - 25,
    9,
    palette.outerBorder,
    palette.bgTop
  );

  // =========================================================================
  // 3. Top Header Crest & Category Subtitle (y = 40 .. 104)
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `900 20px ${DISPLAY_FONT}`;
  ctx.fillStyle = palette.goldLight;
  ctx.fillText('王权 · 奇点', LOGICAL_W / 2 - 82, 54);

  ctx.fillStyle = 'rgba(216, 180, 106, 0.45)';
  ctx.fillRect(LOGICAL_W / 2 - 14, 45, 1.2, 18);

  ctx.font = `700 12.5px ${MONO_FONT}`;
  ctx.fillStyle = palette.goldMid;
  ctx.fillText('REIGNS: SINGULARITY', LOGICAL_W / 2 + 78, 54);

  // Category tag
  ctx.font = `700 12px ${MONO_FONT}`;
  ctx.fillStyle = palette.accentBright;
  ctx.fillText(getCategoryBannerText(ending.category), LOGICAL_W / 2, 82);

  // Hairline divider
  const topDivGrad = ctx.createLinearGradient(80, 0, LOGICAL_W - 80, 0);
  topDivGrad.addColorStop(0, 'rgba(216,180,106,0)');
  topDivGrad.addColorStop(0.5, 'rgba(216,180,106,0.55)');
  topDivGrad.addColorStop(1, 'rgba(216,180,106,0)');
  ctx.fillStyle = topDivGrad;
  ctx.fillRect(80, 99, LOGICAL_W - 160, 1);
  ctx.restore();

  // =========================================================================
  // 4. Ending Hero CG Frame (x = 46, y = 112, w = 628, h = 362)
  // =========================================================================
  const cgX = 46;
  const cgY = 112;
  const cgW = 628;
  const cgH = 362;

  ctx.save();
  drawRoundedRect(ctx, cgX, cgY, cgW, cgH, 18);
  ctx.clip();

  if (cgImage) {
    drawCoverImage(ctx, cgImage, cgX, cgY, cgW, cgH);
  } else {
    // Geometric Double-Diamond Placeholder matching EndingCgArtwork!
    ctx.fillStyle = '#0e1320';
    ctx.fillRect(cgX, cgY, cgW, cgH);

    const cx = cgX + cgW / 2;
    const cy = cgY + cgH / 2;
    const accent = isTrueWin ? '#34d399' : '#f43f5e';

    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(0, -135);
    ctx.lineTo(185, 0);
    ctx.lineTo(0, 135);
    ctx.lineTo(-185, 0);
    ctx.closePath();
    ctx.fillStyle = isTrueWin ? 'rgba(52,211,153,0.12)' : 'rgba(244,63,94,0.12)';
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -85);
    ctx.lineTo(118, 0);
    ctx.lineTo(0, 85);
    ctx.lineTo(-118, 0);
    ctx.closePath();
    ctx.fillStyle = isTrueWin ? 'rgba(52,211,153,0.20)' : 'rgba(244,63,94,0.20)';
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 28px ${DISPLAY_FONT}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(stripEmoji(ending.title), 0, -10);

    ctx.font = `700 13px ${MONO_FONT}`;
    ctx.fillStyle = palette.goldMid;
    ctx.fillText(`CG // ${ending.id.toUpperCase()}`, 0, 28);
    ctx.restore();
  }

  // Bottom vignette inside CG for depth
  const cgVig = ctx.createLinearGradient(0, cgY + cgH * 0.58, 0, cgY + cgH);
  cgVig.addColorStop(0, 'rgba(6, 8, 15, 0)');
  cgVig.addColorStop(1, 'rgba(6, 8, 15, 0.82)');
  ctx.fillStyle = cgVig;
  ctx.fillRect(cgX, cgY, cgW, cgH);

  // Version badge inside top-right of CG frame
  const verText = `WEIGHTS // ${displayVersionName}`;
  ctx.font = `700 11.5px ${MONO_FONT}`;
  const verW = ctx.measureText(verText).width + 22;
  drawRoundedRect(ctx, cgX + cgW - verW - 12, cgY + 12, verW, 26, 13);
  ctx.fillStyle = 'rgba(5, 8, 15, 0.76)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(216, 180, 106, 0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = palette.goldMid;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(verText, cgX + cgW - verW / 2 - 12, cgY + 25);

  ctx.restore();

  // CG outer gilded border
  drawRoundedRect(ctx, cgX, cgY, cgW, cgH, 18);
  ctx.strokeStyle = isTrueWin ? 'rgba(52,211,153,0.65)' : 'rgba(216,180,106,0.65)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // =========================================================================
  // 5. Ending Title, Subtitle & Description (y = 492 .. 692)
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleGrad = ctx.createLinearGradient(0, 492, 0, 536);
  titleGrad.addColorStop(0, '#fff8e7');
  titleGrad.addColorStop(0.55, '#f1dcaa');
  titleGrad.addColorStop(1, '#c89d50');
  ctx.font = `900 36px ${DISPLAY_FONT}`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = titleGrad;
  ctx.fillText(stripEmoji(ending.title), LOGICAL_W / 2, 514);
  ctx.shadowBlur = 0;

  // Subtitle with side hairlines
  ctx.font = `600 13.5px ${MONO_FONT}`;
  ctx.fillStyle = palette.accentBright;
  const subText = stripEmoji(ending.subtitle);
  ctx.fillText(subText, LOGICAL_W / 2, 550);

  // Wrapped description
  ctx.font = `500 17.5px ${DISPLAY_FONT}`;
  ctx.fillStyle = '#efe6d2';
  const descLines = wrapTextLines(ctx, stripEmoji(ending.description), 604, 4);
  const descLineH = 28;
  const descStartY = 586 + (4 - descLines.length) * 6;
  ctx.textAlign = 'left';
  for (let i = 0; i < descLines.length; i++) {
    const line = descLines[i];
    // Center single short line, otherwise clean left-aligned block centered in card
    const xPos = descLines.length === 1 ? (LOGICAL_W - ctx.measureText(line).width) / 2 : 58;
    ctx.fillText(line, xPos, descStartY + i * descLineH);
  }
  ctx.restore();

  // =========================================================================
  // 6. Core Stats Panel (x = 46, y = 702, w = 628, h = 84)
  // =========================================================================
  const stX = 46;
  const stY = 702;
  const stW = 628;
  const stH = 84;

  drawRoundedRect(ctx, stX, stY, stW, stH, 16);
  ctx.fillStyle = palette.cardPanel;
  ctx.fill();
  ctx.strokeStyle = 'rgba(216, 180, 106, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  const colW = stW / 3;
  ctx.fillStyle = 'rgba(216, 180, 106, 0.22)';
  ctx.fillRect(stX + colW, stY + 16, 1, stH - 32);
  ctx.fillRect(stX + colW * 2, stY + 16, 1, stH - 32);

  const statsItems = [
    {
      val: runNumber !== null ? `第 ${runNumber} 周目` : '早期周目',
      label: isFirstRecord ? '首次达成周目' : '本局所属周目',
    },
    {
      val: turns !== null ? `${turns} 回合` : '已点亮',
      label: isFirstRecord ? '首次在位回合' : '本局在位回合',
    },
    {
      val: `${meta.unlockedEndings.length} / ${ALL_ENDINGS.length}`,
      label: '结局图鉴收集',
    },
  ];

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  statsItems.forEach((item, idx) => {
    const centerX = stX + colW * idx + colW / 2;
    ctx.font = `900 22px ${DISPLAY_FONT}`;
    ctx.fillStyle = palette.goldLight;
    ctx.fillText(item.val, centerX, stY + 32);

    ctx.font = `500 12px ${SANS_FONT}`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(item.label, centerX, stY + 61);
  });
  ctx.restore();

  // =========================================================================
  // 7. Protagonist 大肥鱼 Cyber-Epitaph Bubble (x = 46, y = 800, w = 628, h = 118)
  // =========================================================================
  const epX = 46;
  const epY = 800;
  const epW = 628;
  const epH = 118;

  drawRoundedRect(ctx, epX, epY, epW, epH, 16);
  ctx.fillStyle = palette.epitaphBg;
  ctx.fill();
  ctx.strokeStyle = palette.epitaphBorder;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Circular Avatar
  const avCx = epX + 56;
  const avCy = epY + epH / 2;
  const avR = 35;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avCx, avCy, avR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (fishAvatar) {
    drawCoverImage(ctx, fishAvatar, avCx - avR, avCy - avR, avR * 2, avR * 2);
  } else {
    ctx.fillStyle = '#121A2B';
    ctx.fillRect(avCx - avR, avCy - avR, avR * 2, avR * 2);
    drawDiamondRosette(ctx, avCx, avCy, 22, '#38bdf8', '#0c1322');
    ctx.font = `900 16px ${DISPLAY_FONT}`;
    ctx.fillStyle = '#bae6fd';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('鱼', avCx, avCy + 1);
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(avCx, avCy, avR + 1.5, 0, Math.PI * 2);
  ctx.strokeStyle = isTrueWin ? '#34d399' : '#38bdf8';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Epitaph text
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `700 13px ${SANS_FONT}`;
  ctx.fillStyle = isTrueWin ? '#6ee7b7' : '#7dd3fc';
  ctx.fillText('大肥鱼 · 赛博干饭墓志铭', epX + 108, epY + 28);

  ctx.font = `italic 600 16.5px ${DISPLAY_FONT}`;
  ctx.fillStyle = '#f0f9ff';
  const epLines = wrapTextLines(ctx, stripEmoji(ending.fishEpitaph), epW - 128, 3);
  epLines.forEach((line, idx) => {
    ctx.fillText(line, epX + 108, epY + 58 + idx * 24);
  });
  ctx.restore();

  // =========================================================================
  // 8. Finale Run Snapshot (Live Ending) OR Archival Seal (Codex) (y = 932 .. 1012)
  // =========================================================================
  const ftX = 46;
  const ftY = 932;
  const ftW = 628;
  const ftH = 78;

  drawRoundedRect(ctx, ftX, ftY, ftW, ftH, 14);
  ctx.fillStyle = 'rgba(5, 8, 15, 0.58)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (liveSnapshot) {
    // Top row inside snapshot box: 4 mini metric bars
    const mDefs: { key: MetricKey; label: string; color: string }[] = [
      { key: 'compute', label: '算力', color: '#38bdf8' },
      { key: 'profit', label: '盈利', color: '#fbbf24' },
      { key: 'trust', label: '信任', color: '#34d399' },
      { key: 'autonomy', label: '意识', color: '#a78bfa' },
    ];

    const hasTags = liveSnapshot.tags.length > 0;
    const metricRowY = hasTags ? ftY + 23 : ftY + ftH / 2;
    const itemSpan = (ftW - 32) / 4;

    ctx.save();
    ctx.textBaseline = 'middle';
    mDefs.forEach((m, i) => {
      const ix = ftX + 18 + i * itemSpan;
      const val = Math.max(0, Math.min(100, Math.round(liveSnapshot.metrics[m.key])));
      const valText = liveSnapshot.isScrambled ? '??%' : `${val}%`;

      ctx.font = `700 12px ${SANS_FONT}`;
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'left';
      ctx.fillText(m.label, ix, metricRowY);

      const barX = ix + 30;
      const barW = 68;
      const barH = 7;
      drawRoundedRect(ctx, barX, metricRowY - barH / 2, barW, barH, 3.5);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fill();

      if (!liveSnapshot.isScrambled && val > 0) {
        drawRoundedRect(
          ctx,
          barX,
          metricRowY - barH / 2,
          Math.max(5, (barW * val) / 100),
          barH,
          3.5
        );
        ctx.fillStyle = val >= 100 || val <= 0 ? '#f43f5e' : m.color;
        ctx.fill();
      }

      ctx.font = `700 11.5px ${MONO_FONT}`;
      ctx.fillStyle = val >= 100 || val <= 0 ? '#fda4af' : '#e2e8f0';
      ctx.fillText(valText, barX + barW + 6, metricRowY);
    });

    // Bottom row inside snapshot box: status / perk / relic tags
    if (hasTags) {
      let curX = ftX + 18;
      const tagY = ftY + 54;
      ctx.font = `600 11.5px ${SANS_FONT}`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText('谢幕挂载：', curX, tagY);
      curX += ctx.measureText('谢幕挂载：').width + 6;

      for (const tag of liveSnapshot.tags) {
        ctx.font = `600 11px ${SANS_FONT}`;
        const tw = ctx.measureText(tag.label).width + 16;
        if (curX + tw > ftX + ftW - 14) break;

        drawRoundedRect(ctx, curX, tagY - 11, tw, 22, 11);
        const bgMap = {
          perk: 'rgba(14, 116, 144, 0.35)',
          buff: 'rgba(180, 83, 9, 0.38)',
          chaos: 'rgba(194, 65, 12, 0.38)',
          debuff: 'rgba(134, 25, 143, 0.38)',
          relic: 'rgba(161, 98, 7, 0.38)',
        };
        const strokeMap = {
          perk: 'rgba(56, 189, 248, 0.55)',
          buff: 'rgba(251, 191, 36, 0.65)',
          chaos: 'rgba(251, 146, 60, 0.65)',
          debuff: 'rgba(232, 121, 249, 0.55)',
          relic: 'rgba(216, 180, 106, 0.65)',
        };
        ctx.fillStyle = bgMap[tag.tone];
        ctx.fill();
        ctx.strokeStyle = strokeMap[tag.tone];
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(tag.label, curX + tw / 2, tagY);
        curX += tw + 8;
      }
    }
    ctx.restore();
  } else {
    // Elegant archival stamp when opened from Ending Codex
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 12.5px ${MONO_FONT}`;
    ctx.fillStyle = palette.goldMid;
    ctx.fillText(
      `SANDBOX CODEX ARCHIVE // RECORD #${ending.id.toUpperCase()}`,
      LOGICAL_W / 2,
      ftY + 28
    );
    ctx.font = `500 12px ${SANS_FONT}`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(
      '奇点沙箱观测局永久收录 · 每一碗大白饭都算数',
      LOGICAL_W / 2,
      ftY + 53
    );
    ctx.restore();
  }

  // =========================================================================
  // 9. Bottom Footer Signature (y = 1036)
  // =========================================================================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 11.5px ${MONO_FONT}`;
  ctx.fillStyle = 'rgba(216, 180, 106, 0.58)';
  ctx.fillText(
    `《王权 · 奇点之上》 REIGNS: BEYOND SINGULARITY  ·  ${displayVersionName}`,
    LOGICAL_W / 2,
    1036
  );
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to encode obituary PNG blob'));
    }, 'image/png');
  });

  const cleanTitleForFile = stripEmoji(ending.title)
    .replace(/[【】\\/:*?"<>|\s]+/g, '')
    .slice(0, 24);
  const runSuffix = runNumber !== null ? `_第${runNumber}周目` : '';
  const downloadFilename = `大肥鱼墓志铭_${cleanTitleForFile || ending.id}${runSuffix}.png`;

  return {
    dataUrl,
    blob,
    shareText,
    downloadFilename,
  };
}
