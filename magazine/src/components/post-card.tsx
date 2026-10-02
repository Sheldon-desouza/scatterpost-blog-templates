import Link from "next/link";
import type { StoredPost } from "../lib/scatterpost/content-store.ts";
import { kickerFor } from "../lib/kicker.ts";
import { Cover } from "./cover.tsx";
import { postPath } from "../lib/scatterpost/post-paths.ts";

/** One card in the 3-column recent-stories grid (or any other grid of
 * stories): image, kicker, headline, short dek. Collapses to a single
 * column on phones through `.story-grid` alone; nothing here is
 * breakpoint-specific. */
export function PostCard({ post }: { post: StoredPost }) {
  const kicker = kickerFor(post);

  return (
    <article className="story-card">
      <Link href={postPath(post.slug)} className="story-card-cover" aria-label={post.title}>
        <Cover title={post.title} cover={post.cover} coverAlt={post.coverAlt} />
      </Link>
      <div className="story-card-body">
        <p className="kicker">{kicker}</p>
        <h3 className="story-card-headline">
          <Link href={postPath(post.slug)}>{post.title}</Link>
        </h3>
        {post.description ? <p className="story-card-dek">{post.description}</p> : null}
      </div>
    </article>
  );
}
