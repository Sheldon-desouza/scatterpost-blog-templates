/**
 * The placeholder shown in a cover's frame when a post has no
 * `coverImageUrl`: a solid block with the first letter of the post's
 * title set large and centred over it, in the surface colour itself,
 * never a stock photo or a decorative gradient. Deliberately plain, so
 * a reader can tell at a glance that no cover was supplied rather than
 * mistaking the placeholder for art direction. The kicker already
 * repeats just below every card, so the placeholder itself no longer
 * shows it too.
 */
export interface CoverPlaceholder {
  /** The single, uppercased first letter of the post's title, shown
   * large and centred over the surface block. */
  letter: string;
}

export function coverPlaceholder(title: string): CoverPlaceholder {
  // `[...string]` rather than `string[0]`, so a title starting with a
  // surrogate pair (an emoji, say) still yields one whole character
  // rather than half of one.
  const firstCharacter = [...title.trim()][0];
  return { letter: firstCharacter ? firstCharacter.toUpperCase() : "?" };
}
