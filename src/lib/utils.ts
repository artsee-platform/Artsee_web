import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Among non-empty string candidates, pick the one richest in CJK characters so UI can prefer Chinese
 * when multiple DB fields exist (e.g. overview vs highlights).
 */
export function preferCjkRichText(
  fallback: string,
  ...candidates: Array<string | undefined | null>
): string {
  const trimmed = [...candidates, fallback]
    .map((value) => (value == null ? '' : String(value).trim()))
    .filter(Boolean);
  if (!trimmed.length) return fallback;

  const cjkWeight = (text: string) => {
    const cjkMatches = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
    const cjk = cjkMatches ? cjkMatches.length : 0;
    return text.length ? cjk / text.length : 0;
  };

  return trimmed.reduce((best, current) => {
    const diff = cjkWeight(current) - cjkWeight(best);
    if (diff > 0) return current;
    if (diff < 0) return best;
    return current.length >= best.length ? current : best;
  });
}
