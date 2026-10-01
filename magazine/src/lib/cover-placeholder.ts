/**
 * A tasteful generated placeholder for a post with no cover image, so
 * the card grid and the featured slot never show a broken image. The
 * gradient's two hues are derived from the post's own title with a
 * small, deterministic hash, so the same post always gets the same
 * placeholder and different posts tend to look different from one
 * another without any image at all.
 */
function hashTitle(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export interface CoverPlaceholder {
  /** CSS `background` value: a two-stop linear gradient. */
  background: string;
  /** One or two words from the title, shown over the gradient. */
  label: string;
}

export function coverPlaceholder(title: string): CoverPlaceholder {
  const hash = hashTitle(title || "Untitled");
  const hueA = hash % 360;
  const hueB = (hueA + 48) % 360;
  const background = `linear-gradient(135deg, hsl(${hueA} 55% 42%), hsl(${hueB} 60% 28%))`;

  const words = title.trim().split(/\s+/).filter(Boolean);
  const label = words.slice(0, 3).join(" ") || "Untitled";

  return { background, label };
}
