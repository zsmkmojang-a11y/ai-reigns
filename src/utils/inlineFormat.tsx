import React from 'react';

export type InlineTone = 'default' | 'escape' | 'banner' | 'wiki';

const TOKEN_RE = /(\*\*`[^`]+`\*\*|\*\*[^*]+\*\*|`[^`]+`)/g;

/**
 * Lightweight inline formatter for game dialogue, choice labels & Wiki copy.
 * Supports `**bold**`, `` `code` ``, and nested `` **`code`** `` without raw markdown leakage.
 */
export function renderInlineMarkup(
  text: string,
  tone: InlineTone = 'default'
): React.ReactNode {
  if (!text || (!text.includes('**') && !text.includes('`'))) {
    return text;
  }

  const parts = text.split(TOKEN_RE);
  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith('**`') && part.endsWith('`**') && part.length > 6) {
      const inner = part.slice(3, -3);
      const cls =
        tone === 'escape'
          ? 'font-mono font-bold px-1 py-[0.5px] mx-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-200'
          : tone === 'banner'
            ? 'font-mono font-black px-1 py-[0.5px] mx-0.5 rounded bg-black/50 border border-current/35'
            : 'font-mono font-bold text-[0.92em] px-1.5 py-[0.5px] mx-0.5 rounded bg-amber-400/15 border border-amber-300/45 text-amber-200';
      return (
        <code key={idx} className={cls}>
          {inner}
        </code>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      const cls =
        tone === 'escape'
          ? 'font-bold text-emerald-200'
          : tone === 'banner'
            ? 'font-black underline decoration-current/45 underline-offset-2'
            : tone === 'wiki'
              ? 'font-bold text-gold-200'
              : 'font-bold text-amber-200';
      return (
        <strong key={idx} className={cls}>
          {inner}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1);
      const cls =
        tone === 'escape'
          ? 'font-mono text-[0.94em] px-1 py-[0.5px] mx-0.5 rounded bg-emerald-500/15 border border-emerald-400/40 text-emerald-200'
          : tone === 'banner'
            ? 'font-mono text-[0.92em] px-1 py-[0.5px] mx-0.5 rounded bg-black/45 border border-current/30'
            : tone === 'wiki'
              ? 'font-mono text-[0.9em] px-1 py-[0.5px] mx-0.5 rounded bg-emerald-950/60 border border-emerald-400/35 text-emerald-200'
              : 'font-mono text-[0.92em] px-1 py-[0.5px] mx-0.5 rounded bg-cyan-950/70 border border-cyan-400/35 text-cyan-200';
      return (
        <code key={idx} className={cls}>
          {inner}
        </code>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}
