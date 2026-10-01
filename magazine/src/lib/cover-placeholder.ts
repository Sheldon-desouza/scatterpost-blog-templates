/**
 * The placeholder shown in a cover's frame when a post has no
 * `coverImageUrl`: a solid surface block with the post's kicker set
 * over it, never a stock photo or a decorative gradient. Deliberately
 * plain, so a reader can tell at a glance that no cover was supplied
 * rather than mistaking the placeholder for art direction.
 */
export interface CoverPlaceholder {
  /** The kicker (or a generic fallback) shown over the surface block. */
  label: string;
}

export function coverPlaceholder(kicker: string): CoverPlaceholder {
  return { label: kicker || "Dispatch" };
}
