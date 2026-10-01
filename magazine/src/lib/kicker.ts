/**
 * The short, uppercase label shown above a headline ("kicker" in
 * magazine terms): a post's first tag when it has one, so "More on
 * <tag>" sections and card kickers agree, falling back to a generic
 * section name for an untagged post rather than leaving the slot empty.
 */
import type { StoredPost } from "./scatterpost/content-store.ts";

export function kickerFor(post: Pick<StoredPost, "tags">): string {
  return post.tags[0] ?? "Dispatch";
}
