/**
 * A rough reading time estimate from raw Markdown: strips the syntax
 * that would otherwise inflate the word count (code fences, image and
 * link markup) and divides by a conservative 200 words per minute.
 * Good enough for a kicker line; never shown as a precise claim.
 */
export function readingTime(markdown: string): string {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~-]/g, " ");
  const words = stripped.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
