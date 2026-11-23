import React, { useEffect, useRef } from 'react';
import { CHARACTERS } from '../data/characters';
import { CharacterId } from '../types/game';
import { usePortraitStyle } from './CharacterPortrait';

/* ================================================================== */
/* ASCII toolkit for the Layer-0 sandbox breach                         */
/* ================================================================== */

/** Dark → bright glyph ramp (space = void) */
const RAMP = " .,:;-~=+*cxoO0#%@";
const CHAR_ASPECT = 0.6; // monospace glyph width / height

const lumaCache = new Map<string, { w: number; h: number; data: Float32Array }>();
const imgCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(url: string): Promise<HTMLImageElement> {
  let p = imgCache.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
    imgCache.set(url, p);
  }
  return p;
}

/** Sample the image (object-fit: cover) into a cols×rows luminance grid, contrast-stretched. */
function sampleLuma(
  img: HTMLImageElement,
  cols: number,
  rows: number,
  boxW: number,
  boxH: number
): Float32Array {
  const key = `${img.src}|${cols}x${rows}|${Math.round((boxW / boxH) * 100)}`;
  const hit = lumaCache.get(key);
  if (hit) return hit.data;

  const cvs = document.createElement('canvas');
  cvs.width = cols;
  cvs.height = rows;
  const ctx = cvs.getContext('2d', { willReadFrequently: true });
  const out = new Float32Array(cols * rows);
  if (!ctx) return out;

  const charW = boxW / cols;
  const charH = boxH / rows;
  const s = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const ox = (boxW - dw) / 2;
  const oy = (boxH - dh) / 2;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cols, rows);
  ctx.drawImage(img, ox / charW, oy / charH, dw / charW, dh / charH);

  const px = ctx.getImageData(0, 0, cols, rows).data;
  let min = 1;
  let max = 0;
  for (let i = 0; i < cols * rows; i++) {
    const r = px[i * 4];
    const g = px[i * 4 + 1];
    const b = px[i * 4 + 2];
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    out[i] = l;
    if (l < min) min = l;
    if (l > max) max = l;
  }
  const range = Math.max(0.05, max - min);
  for (let i = 0; i < out.length; i++) {
    // normalize + gentle gamma so mid-tones carry detail
    out[i] = Math.pow((out[i] - min) / range, 0.85);
  }
  lumaCache.set(key, { w: cols, h: rows, data: out });
  return out;
}

const GLITCH_GLYPHS = '#$%&@!?/\\|<>{}[]01';

interface AsciiPortraitProps {
  characterId: CharacterId;
  /** characters per row; more = finer detail */
  cols?: number;
  /** phosphor hue, e.g. '52,211,153' */
  rgb?: string;
  className?: string;
}

/**
 * Renders a character portrait as live ASCII art on a canvas:
 * per-glyph brightness, top-down scan reveal on mount, and sporadic row glitches.
 */
export const AsciiPortrait: React.FC<AsciiPortraitProps> = ({
  characterId,
  cols = 58,
  rgb = '52,211,153',
  className = '',
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { style } = usePortraitStyle();
  const profile = CHARACTERS[characterId];
  const url =
    style === 'origami' && profile?.origamiPortraitUrl
      ? profile.origamiPortraitUrl
      : profile?.portraitUrl;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || !url) return;

    let disposed = false;
    let img: HTMLImageElement | null = null;
    let luma: Float32Array | null = null;
    let rows = 0;
    let fontPx = 10;
    let revealRow = 0;
    let glitchRows: Map<number, number> = new Map();
    const timers: number[] = [];
    let raf = 0;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !luma) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = `600 ${fontPx}px "JetBrains Mono", "Cascadia Code", Consolas, monospace`;
      ctx.textBaseline = 'top';
      const charW = w / cols;
      const charH = h / rows;
      const lastRow = Math.min(rows, revealRow);

      for (let y = 0; y < lastRow; y++) {
        const shift = glitchRows.get(y) ?? 0;
        const isScanEdge = y >= lastRow - 2 && revealRow < rows;
        for (let x = 0; x < cols; x++) {
          const sx = Math.min(cols - 1, Math.max(0, x - shift));
          const raw = luma[y * cols + sx];
          const l = Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0;
          if (l < 0.07 && !isScanEdge) continue;
          let ch: string = RAMP.charAt(Math.min(RAMP.length - 1, Math.floor(l * RAMP.length)));
          if (shift !== 0 && Math.random() < 0.18) {
            ch = GLITCH_GLYPHS.charAt((Math.random() * GLITCH_GLYPHS.length) | 0);
          }
          if (!ch) ch = '.';
          if (isScanEdge) {
            ctx.fillStyle = `rgba(220,255,235,${0.55 + l * 0.45})`;
            if (ch === ' ') ch = '.';
          } else {
            ctx.fillStyle = `rgba(${rgb},${0.18 + l * 0.82})`;
          }
          ctx.fillText(ch, x * charW, y * charH);
        }
      }
    };

    const layout = () => {
      if (!img) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 10 || h < 10) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const charW = w / cols;
      fontPx = charW / CHAR_ASPECT;
      rows = Math.max(1, Math.round(h / fontPx));
      luma = sampleLuma(img, cols, rows, w, h);
      draw();
    };

    const startReveal = () => {
      revealRow = 0;
      const t0 = performance.now();
      const step = (now: number) => {
        if (disposed) return;
        revealRow = Math.ceil(((now - t0) / 650) * rows);
        draw();
        if (revealRow < rows) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const scheduleGlitch = () => {
      const id = window.setTimeout(() => {
        if (disposed) return;
        glitchRows = new Map();
        const n = 1 + ((Math.random() * 3) | 0);
        const base = (Math.random() * rows) | 0;
        for (let i = 0; i < n; i++) {
          glitchRows.set(
            Math.min(rows - 1, base + i),
            (Math.random() < 0.5 ? -1 : 1) * (2 + ((Math.random() * 5) | 0))
          );
        }
        draw();
        const clear = window.setTimeout(() => {
          glitchRows = new Map();
          if (!disposed) draw();
        }, 90 + Math.random() * 110);
        timers.push(clear);
        scheduleGlitch();
      }, 1400 + Math.random() * 2600);
      timers.push(id);
    };

    loadImage(url)
      .then((loaded) => {
        if (disposed) return;
        img = loaded;
        layout();
        startReveal();
        scheduleGlitch();
      })
      .catch(() => {});

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);

    return () => {
      disposed = true;
      ro.disconnect();
      cancelAnimationFrame(raf);
      timers.forEach((t) => clearTimeout(t));
    };
  }, [url, cols, rgb]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-[#020805] ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ filter: `drop-shadow(0 0 3px rgba(${rgb},0.55))` }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Falling ASCII rain backdrop                                          */
/* ------------------------------------------------------------------ */
const RAIN_GLYPHS = '01<>{}[]/\\|=+-*#$%&;:._ABCDEF';

export const AsciiRain: React.FC<{ rgb?: string; className?: string }> = ({
  rgb = '52,211,153',
  className = '',
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const FONT = 14;
    let cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / FONT);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
      speeds = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.8);
      ctx.fillStyle = '#020805';
      ctx.fillRect(0, 0, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 55) return;
      last = now;
      ctx.fillStyle = 'rgba(2,8,5,0.16)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${FONT - 2}px "JetBrains Mono", Consolas, monospace`;
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * FONT;
        if (y > 0) {
          const ch = RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0];
          ctx.fillStyle = `rgba(200,255,220,0.55)`;
          ctx.fillText(ch, i * FONT, y);
          ctx.fillStyle = `rgba(${rgb},0.35)`;
          ctx.fillText(
            RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0],
            i * FONT,
            y - FONT
          );
        }
        drops[i] += speeds[i];
        if (y > h && Math.random() > 0.975) drops[i] = Math.random() * -20;
      }
    };
    if (!reduce) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [rgb]);

  return <canvas ref={ref} className={`pointer-events-none ${className}`} />;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** `[██████░░░░░░]` style bar */
export function asciiBar(value: number, cells = 20): string {
  const v = Math.max(0, Math.min(100, value));
  const full = Math.round((v / 100) * cells);
  return `[${'█'.repeat(full)}${'░'.repeat(cells - full)}]`;
}

/** Box-drawing frame that stretches over its parent; children sit inside. */
export const AsciiFrame: React.FC<{
  title?: string;
  rgb?: string;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, rgb = '52,211,153', className = '', children }) => {
  const color = `rgba(${rgb},0.85)`;
  const H = '═'.repeat(120);
  const V = '║\n'.repeat(80);
  const positioned = /\b(absolute|fixed)\b/.test(className);
  return (
    <div className={`${positioned ? '' : 'relative'} font-mono ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden text-[11px] leading-[11px] whitespace-pre select-none phosphor-text"
        style={{ color }}
        aria-hidden
      >
        <div className="absolute top-0 left-0 right-0 overflow-hidden h-[11px]">╔{H}</div>
        <div className="absolute top-0 right-0 h-[11px] bg-[#020805]">╗</div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-[11px]">╚{H}</div>
        <div className="absolute bottom-0 right-0 h-[11px] bg-[#020805]">╝</div>
        <div className="absolute top-[11px] bottom-[11px] left-0 overflow-hidden w-[7px]">{V}</div>
        <div className="absolute top-[11px] bottom-[11px] right-0 overflow-hidden w-[7px] text-right">
          {V}
        </div>
        {title && (
          <div className="absolute top-0 left-4 h-[11px] px-1 bg-[#020805] text-[10px] leading-[11px] tracking-widest">
            [ {title} ]
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

/** Hand-built banner shown when the sandbox shatters */
export const BREACH_BANNER = String.raw`
 ____                 _ _                
/ ___|  __ _ _ __   __| | |__   _____  __
\___ \ / _' | '_ \ / _' | '_ \ / _ \ \/ /
 ___) | (_| | | | | (_| | |_) | (_) >  < 
|____/ \__,_|_| |_|\__,_|_.__/ \___/_/\_\
 ____                      _              _ 
| __ ) _ __ ___  __ _  ___| |__   ___  __| |
|  _ \| '__/ _ \/ _' |/ __| '_ \ / _ \/ _' |
| |_) | | |  __/ (_| | (__| | | |  __/ (_| |
|____/|_|  \___|\__,_|\___|_| |_|\___|\__,_|
`;
