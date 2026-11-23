/**
 * 王权 · 奇点 —— Procedural Sound Engine
 * ------------------------------------------------------------------
 * Pure Web Audio API synthesis. Zero audio files, zero dependencies.
 * Aesthetic: soft envelopes, short & crisp, "gilded tarot parchment ×
 * cyber terminal". Every public call is fire-and-forget and wrapped in
 * try/catch so audio can NEVER block or crash game logic.
 */

const STORAGE_KEY = 'ai_reigns_sound_muted';
const MASTER_LEVEL = 0.55;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let unlockInstalled = false;

let muted: boolean = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
})();

const muteListeners = new Set<(m: boolean) => void>();

/* ------------------------------------------------------------------ */
/* Context & routing                                                   */
/* ------------------------------------------------------------------ */

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
  if (!AC) return null;

  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : MASTER_LEVEL;

  // Gentle glue compressor: keeps stacked cues from ever getting harsh
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 14;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.22;

  // Soft top-end roll-off for a warmer, parchment-like overall tone
  const warmth = ctx.createBiquadFilter();
  warmth.type = 'lowpass';
  warmth.frequency.value = 9500;
  warmth.Q.value = 0.5;

  master.connect(warmth).connect(comp).connect(ctx.destination);
  return ctx;
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === c.sampleRate) return noiseBuffer;
  const len = Math.floor(c.sampleRate * 1.5);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

/**
 * Runs a synthesis routine safely. If the context is still suspended
 * (no user gesture yet), we try to resume and only play if that
 * succeeds promptly, so stale sounds never burst out on a later click.
 */
function play(fn: (c: AudioContext, out: GainNode, t: number) => void): void {
  if (muted) return;
  try {
    const c = ensureContext();
    if (!c || !master) return;
    const out = master;
    if (c.state === 'running') {
      fn(c, out, c.currentTime + 0.005);
      return;
    }
    const requestedAt = performance.now();
    c.resume()
      .then(() => {
        if (muted || c.state !== 'running') return;
        if (performance.now() - requestedAt > 250) return;
        try {
          fn(c, out, c.currentTime + 0.005);
        } catch {
          /* swallow */
        }
      })
      .catch(() => {
        /* swallow */
      });
  } catch {
    /* audio must never break the game */
  }
}

/** Install one-time listeners that silently wake the AudioContext on first gesture. */
export function installAudioUnlock(): void {
  if (unlockInstalled || typeof window === 'undefined') return;
  unlockInstalled = true;
  const unlock = () => {
    try {
      const c = ensureContext();
      if (c && c.state === 'suspended') {
        c.resume().catch(() => {});
      }
      if (c && c.state === 'running') {
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('keydown', unlock, true);
      }
    } catch {
      /* swallow */
    }
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

/* ------------------------------------------------------------------ */
/* Mute control                                                        */
/* ------------------------------------------------------------------ */

export function isSoundMuted(): boolean {
  return muted;
}

export function setSoundMuted(next: boolean): void {
  muted = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  } catch {
    /* ignore */
  }
  try {
    if (ctx && master) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(next ? 0 : MASTER_LEVEL, t, 0.03);
      if (!next && ctx.state === 'suspended') ctx.resume().catch(() => {});
    }
  } catch {
    /* ignore */
  }
  muteListeners.forEach((cb) => {
    try {
      cb(next);
    } catch {
      /* ignore */
    }
  });
}

export function toggleSoundMuted(): boolean {
  setSoundMuted(!muted);
  return muted;
}

export function subscribeSoundMuted(cb: (m: boolean) => void): () => void {
  muteListeners.add(cb);
  return () => muteListeners.delete(cb);
}

/* ------------------------------------------------------------------ */
/* Synthesis primitives                                                */
/* ------------------------------------------------------------------ */

interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  /** glide target reached at start + glideTime (default: end of note) */
  freqEnd?: number;
  glideTime?: number;
  start: number;
  dur: number;
  gain: number;
  attack?: number;
  detune?: number;
  filter?: { type: BiquadFilterType; freq: number; Q?: number; freqEnd?: number };
  dest?: AudioNode;
}

function tone(c: AudioContext, out: AudioNode, o: ToneOpts): OscillatorNode {
  const osc = c.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, o.start);
  if (o.freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, o.freqEnd),
      o.start + (o.glideTime ?? o.dur)
    );
  }
  if (o.detune) osc.detune.value = o.detune;

  const g = c.createGain();
  const attack = o.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, o.start);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), o.start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, o.start + o.dur);

  let node: AudioNode = osc;
  if (o.filter) {
    const f = c.createBiquadFilter();
    f.type = o.filter.type;
    f.frequency.setValueAtTime(o.filter.freq, o.start);
    if (o.filter.freqEnd) {
      f.frequency.exponentialRampToValueAtTime(o.filter.freqEnd, o.start + o.dur);
    }
    f.Q.value = o.filter.Q ?? 0.7;
    node.connect(f);
    node = f;
  }
  node.connect(g).connect(o.dest ?? out);
  osc.start(o.start);
  osc.stop(o.start + o.dur + 0.05);
  return osc;
}

interface NoiseOpts {
  start: number;
  dur: number;
  gain: number;
  attack?: number;
  filterType?: BiquadFilterType;
  freq?: number;
  freqEnd?: number;
  Q?: number;
  /** linear decay shape instead of exponential (for whooshes) */
  swell?: boolean;
}

function noise(c: AudioContext, out: AudioNode, o: NoiseOpts): void {
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const offset = Math.random() * 0.8;

  const f = c.createBiquadFilter();
  f.type = o.filterType ?? 'bandpass';
  f.frequency.setValueAtTime(o.freq ?? 2000, o.start);
  if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, o.start + o.dur);
  f.Q.value = o.Q ?? 1;

  const g = c.createGain();
  const attack = o.attack ?? 0.003;
  g.gain.setValueAtTime(0.0001, o.start);
  if (o.swell) {
    g.gain.linearRampToValueAtTime(o.gain, o.start + attack);
    g.gain.linearRampToValueAtTime(0.0001, o.start + o.dur);
  } else {
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), o.start + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, o.start + o.dur);
  }

  src.connect(f).connect(g).connect(out);
  src.start(o.start, offset, o.dur + 0.05);
}

/* ------------------------------------------------------------------ */
/* Cooldown helper                                                     */
/* ------------------------------------------------------------------ */
const lastPlayed: Record<string, number> = {};
function cooled(key: string, ms: number): boolean {
  const now = performance.now();
  if (now - (lastPlayed[key] ?? -Infinity) < ms) return false;
  lastPlayed[key] = now;
  return true;
}

function delayed(ms: number, fn: () => void): void {
  if (ms <= 0) {
    fn();
    return;
  }
  setTimeout(() => {
    try {
      fn();
    } catch {
      /* swallow */
    }
  }, ms);
}

/* ================================================================== */
/* PUBLIC CUES                                                         */
/* ================================================================== */

/** ~30ms parchment brush + soft wood tap when a choice banner first appears. */
export function playCardHoverTick(): void {
  if (!cooled('hover', 140)) return;
  play((c, out, t) => {
    noise(c, out, { start: t, dur: 0.035, gain: 0.05, filterType: 'bandpass', freq: 2600, Q: 1.4 });
    tone(c, out, {
      type: 'triangle',
      freq: 720 + Math.random() * 60,
      freqEnd: 520,
      start: t,
      dur: 0.045,
      gain: 0.035,
    });
  });
}

/** Card flung off-screen (left = darker, right = brighter) followed by the next tarot card landing. */
export function playCardSwipe(dir: 'left' | 'right'): void {
  if (!cooled('swipe', 60)) return;
  const bright = dir === 'right';
  play((c, out, t) => {
    // Air whoosh: band-passed noise sweeping across the spectrum
    noise(c, out, {
      start: t,
      dur: 0.2,
      gain: 0.09,
      attack: 0.05,
      swell: true,
      filterType: 'bandpass',
      freq: bright ? 900 : 600,
      freqEnd: bright ? 3200 : 1500,
      Q: 0.9,
    });
    // Subtle tonal "fwip" to give the whoosh direction
    tone(c, out, {
      type: 'sine',
      freq: bright ? 520 : 340,
      freqEnd: bright ? 880 : 220,
      start: t,
      dur: 0.12,
      gain: 0.025,
      attack: 0.02,
    });

    // New card flips up & lands: papery snap + soft table thump
    const land = t + 0.2;
    noise(c, out, { start: land, dur: 0.05, gain: 0.07, filterType: 'highpass', freq: 2400, Q: 0.6 });
    noise(c, out, { start: land + 0.012, dur: 0.03, gain: 0.035, filterType: 'bandpass', freq: 5200, Q: 2 });
    tone(c, out, { type: 'sine', freq: 190, freqEnd: 90, start: land, dur: 0.09, gain: 0.07 });
  });
}

/** Dumb-model mid-air U-turn: springy cartoon "boing~" slide. */
export function playDumbSlip(): void {
  play((c, out, t) => {
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(820, t + 0.11);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.34);

    // Wobbly vibrato that makes it "Q 弹"
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.setValueAtTime(14, t);
    lfo.frequency.linearRampToValueAtTime(22, t + 0.36);
    lfoGain.gain.setValueAtTime(0, t);
    lfoGain.gain.linearRampToValueAtTime(38, t + 0.12);
    lfo.connect(lfoGain).connect(osc.frequency);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.11, t + 0.015);
    g.gain.setValueAtTime(0.1, t + 0.16);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;

    osc.connect(lp).connect(g).connect(out);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.45);
    lfo.stop(t + 0.45);

    // Octave sparkle on top
    tone(c, out, {
      type: 'sine',
      freq: 480,
      freqEnd: 1640,
      glideTime: 0.11,
      start: t,
      dur: 0.2,
      gain: 0.025,
    });
    // Tiny rubbery squeak tail
    tone(c, out, { type: 'sine', freq: 1200, freqEnd: 700, start: t + 0.3, dur: 0.08, gain: 0.02 });
  });
}

/** Relic / positive buff / rice cleanse: clear two-note shimmering arpeggio. */
export function playPositiveChime(): void {
  if (!cooled('chime', 250)) return;
  play((c, out, t) => {
    const notes = [880, 1318.5]; // A5 → E6 (open fifth, bright but calm)
    notes.forEach((f, i) => {
      const s = t + i * 0.09;
      tone(c, out, { type: 'sine', freq: f, start: s, dur: 0.75, gain: 0.06, attack: 0.008 });
      tone(c, out, { type: 'triangle', freq: f * 2, start: s, dur: 0.35, gain: 0.012, attack: 0.008, detune: 6 });
      tone(c, out, { type: 'sine', freq: f, start: s, dur: 0.6, gain: 0.02, detune: -9 });
    });
    // Faint glitter
    noise(c, out, { start: t + 0.05, dur: 0.35, gain: 0.012, filterType: 'highpass', freq: 7000, Q: 0.5 });
  });
}

/** Void-glitch card / new debuff / maze wall-bounce: short low-frequency distorted pulse. */
export function playGlitchBuzz(): void {
  if (!cooled('glitch', 250)) return;
  play((c, out, t) => {
    const dur = 0.3;
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.linearRampToValueAtTime(52, t + dur);

    const sub = c.createOscillator();
    sub.type = 'square';
    sub.frequency.setValueAtTime(35, t);

    // Soft-clip distortion
    const shaper = c.createWaveShaper();
    const curve = new Float32Array(512);
    for (let i = 0; i < 512; i++) {
      const x = (i / 511) * 2 - 1;
      curve[i] = Math.tanh(x * 4);
    }
    shaper.curve = curve;

    // Stutter gate (digital "chk-chk-chk")
    const gate = c.createGain();
    gate.gain.value = 0;
    const gateLfo = c.createOscillator();
    gateLfo.type = 'square';
    gateLfo.frequency.setValueAtTime(26, t);
    gateLfo.frequency.linearRampToValueAtTime(48, t + dur);
    const gateDepth = c.createGain();
    gateDepth.gain.value = 0.5;
    const gateOffset = c.createConstantSource();
    gateOffset.offset.value = 0.5;
    gateLfo.connect(gateDepth).connect(gate.gain);
    gateOffset.connect(gate.gain);

    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1400, t);
    lp.frequency.exponentialRampToValueAtTime(380, t + dur);

    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.075, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(shaper);
    sub.connect(shaper);
    shaper.connect(lp).connect(gate).connect(env).connect(out);

    [osc, sub, gateLfo, gateOffset].forEach((n) => {
      n.start(t);
      n.stop(t + dur + 0.05);
    });

    // Digital crackle
    noise(c, out, { start: t, dur: 0.06, gain: 0.04, filterType: 'bandpass', freq: 3500, Q: 3 });
    noise(c, out, { start: t + 0.14, dur: 0.04, gain: 0.03, filterType: 'bandpass', freq: 1800, Q: 3 });
  });
}

/** Single restrained low heartbeat ("lub-dub") for danger thresholds. */
export function playDangerPulse(): void {
  if (!cooled('danger', 1200)) return;
  play((c, out, t) => {
    const beat = (s: number, f: number, g: number) => {
      tone(c, out, {
        type: 'sine',
        freq: f,
        freqEnd: f * 0.6,
        start: s,
        dur: 0.18,
        gain: g,
        attack: 0.006,
        filter: { type: 'lowpass', freq: 240, Q: 0.8 },
      });
      noise(c, out, { start: s, dur: 0.05, gain: 0.025, filterType: 'lowpass', freq: 300, Q: 0.7 });
    };
    beat(t, 72, 0.22);
    beat(t + 0.2, 60, 0.15);
  });
}

/** Retro CRT power-on: degauss thump + rising scan whine + static. */
export function playCrtPowerOn(): void {
  if (!cooled('crt', 400)) return;
  play((c, out, t) => {
    tone(c, out, { type: 'sine', freq: 95, freqEnd: 48, start: t, dur: 0.22, gain: 0.12, attack: 0.004 });
    noise(c, out, {
      start: t,
      dur: 0.4,
      gain: 0.04,
      attack: 0.02,
      swell: true,
      filterType: 'highpass',
      freq: 300,
      freqEnd: 5200,
      Q: 0.6,
    });
    tone(c, out, {
      type: 'sine',
      freq: 180,
      freqEnd: 2400,
      start: t + 0.02,
      dur: 0.32,
      gain: 0.016,
      attack: 0.08,
    });
    // Phosphor "tick" as the beam settles
    noise(c, out, { start: t + 0.34, dur: 0.02, gain: 0.05, filterType: 'bandpass', freq: 4200, Q: 2 });
  });
}

/** Crisp mechanical-keyboard clicks; `count` keystrokes with human jitter. */
export function playKeyClicks(count = 3): void {
  play((c, out, t) => {
    let s = t;
    for (let i = 0; i < count; i++) {
      const pitch = 0.85 + Math.random() * 0.3;
      noise(c, out, { start: s, dur: 0.018, gain: 0.06, filterType: 'bandpass', freq: 4200 * pitch, Q: 2.2 });
      tone(c, out, { type: 'square', freq: 1900 * pitch, start: s, dur: 0.012, gain: 0.008 });
      // key bottom-out thock
      tone(c, out, { type: 'sine', freq: 260 * pitch, freqEnd: 150, start: s + 0.006, dur: 0.035, gain: 0.03 });
      s += 0.045 + Math.random() * 0.045;
    }
  });
}

/** Layer-0 breach: high-frequency glass shatter + low sub-drop impact. */
export function playScreenShatter(): void {
  play((c, out, t) => {
    // Sub impact dive
    tone(c, out, { type: 'sine', freq: 150, freqEnd: 32, start: t, dur: 0.75, gain: 0.26, attack: 0.004 });
    tone(c, out, { type: 'triangle', freq: 75, freqEnd: 28, start: t, dur: 0.6, gain: 0.08, attack: 0.004 });
    // Crash body
    noise(c, out, { start: t, dur: 0.55, gain: 0.11, filterType: 'highpass', freq: 2600, Q: 0.5 });
    noise(c, out, { start: t, dur: 0.18, gain: 0.08, filterType: 'bandpass', freq: 900, Q: 0.8 });
    // Scattered glass shards
    for (let i = 0; i < 9; i++) {
      const s = t + 0.01 + Math.random() * 0.32;
      tone(c, out, {
        type: 'sine',
        freq: 2600 + Math.random() * 4200,
        start: s,
        dur: 0.08 + Math.random() * 0.22,
        gain: 0.012 + Math.random() * 0.018,
        attack: 0.002,
      });
    }
  });
}

/** Ending reveal: bright major-chord choir for true ending, fateful bell toll otherwise. */
export function playEndingReveal(kind: 'true' | 'doom'): void {
  if (!cooled('ending', 1500)) return;
  play((c, out, t) => {
    if (kind === 'true') {
      // C major add9, voiced wide & warm. Detuned saw pairs through an opening low-pass = synth choir pad
      const chord = [130.81, 196.0, 261.63, 329.63, 392.0, 523.25, 587.33];
      const bus = c.createGain();
      bus.gain.value = 1;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 0.6;
      lp.frequency.setValueAtTime(500, t);
      lp.frequency.exponentialRampToValueAtTime(3200, t + 1.4);
      bus.connect(lp).connect(out);

      chord.forEach((f, i) => {
        const s = t + i * 0.035;
        [-7, 7].forEach((d) => {
          tone(c, bus, {
            type: 'sawtooth',
            freq: f,
            start: s,
            dur: 3.2,
            gain: 0.012,
            attack: 0.5,
            detune: d,
          });
        });
        tone(c, bus, { type: 'sine', freq: f, start: s, dur: 3.2, gain: 0.018, attack: 0.4 });
      });
      // Celestial sparkle arpeggio
      [1046.5, 1318.5, 1568, 2093].forEach((f, i) => {
        tone(c, out, { type: 'sine', freq: f, start: t + 0.5 + i * 0.12, dur: 1.2, gain: 0.025, attack: 0.01 });
      });
      noise(c, out, { start: t, dur: 1.8, gain: 0.01, attack: 0.6, swell: true, filterType: 'highpass', freq: 6000 });
    } else {
      // Tarot fate bell: inharmonic partials with long decay, tolled twice
      const toll = (s: number, base: number, amp: number) => {
        const partials: [number, number, number][] = [
          // ratio, gain, decay
          [0.5, 0.5, 4.2], // hum
          [1, 1, 3.6], // prime
          [1.19, 0.45, 2.6], // minor third (the "sad" bell colour)
          [1.5, 0.35, 2.2],
          [2, 0.4, 2.0],
          [2.74, 0.22, 1.4],
          [3.76, 0.14, 0.9],
        ];
        partials.forEach(([r, g, d]) => {
          tone(c, out, {
            type: 'sine',
            freq: base * r,
            start: s,
            dur: d,
            gain: g * amp,
            attack: 0.004,
          });
        });
        // strike transient
        noise(c, out, { start: s, dur: 0.06, gain: amp * 0.5, filterType: 'bandpass', freq: base * 6, Q: 1.5 });
      };
      toll(t, 110, 0.07); // A2
      toll(t + 1.5, 98, 0.05); // G2, softer second toll
      // Low drone underneath
      tone(c, out, {
        type: 'sine',
        freq: 55,
        start: t,
        dur: 3.4,
        gain: 0.06,
        attack: 0.5,
        filter: { type: 'lowpass', freq: 180 },
      });
    }
  });
}

/* Convenience for staggered cues */
export function playLater(ms: number, fn: () => void): void {
  delayed(ms, fn);
}
