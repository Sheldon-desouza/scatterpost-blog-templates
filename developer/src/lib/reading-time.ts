/**
 * Rough reading time estimate: word count over 200 words per minute
 * (a commonly cited average for adult reading of mixed prose and
 * code), rounded up so a post never reads as "0 min read".
 */
export function readingTimeMinutes(bodyMarkdown: string): number {
  const words = bodyMarkdown
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
