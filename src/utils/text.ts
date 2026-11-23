/**
 * Strips emoji pictographs from UI-facing strings (choice labels, toasts, tags).
 * Character dialogue keeps its emoji since it's part of each persona's voice.
 */
const EMOJI_RE =
  /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u200D\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*\uFE0F?/gu;

export function stripEmoji(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(EMOJI_RE, (m) => (m.startsWith('\u25B6') ? m : ''))
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
