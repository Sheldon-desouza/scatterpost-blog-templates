import Link from "next/link";
import type { StoredPost } from "../lib/scatterpost/content-store.ts";
import { kickerFor } from "../lib/kicker.ts";
import { readingTime } from "../lib/reading-time.ts";
import { authorName } from "../lib/site.ts";
import { Cover } from "./cover.tsx";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

/** The large lead story across the top of the home page: a big cover,
 * kicker, big headline, dek, byline and date. Everything here also
 * exists in `PostCard`; this is simply the oversized, single treatment
 * for the newest post. */
export function LeadStory({ post }: { post: StoredPost }) {
  const kicker = kickerFor(post);

  return (
    <article className="lead-story">
      <Link href={`/blog/${post.slug}`} className="lead-story-cover" aria-label={post.title}>
        <Cover title={post.title} kicker={kicker} cover={post.cover} coverAlt={post.coverAlt} priority />
      </Link>
      <div className="lead-story-body">
        <p className="kicker">{kicker}</p>
        <h1 className="lead-story-headline">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h1>
        {post.description ? <p className="lead-story-dek">{post.description}</p> : null}
        <p className="lead-story-byline">
          By {authorName()} &middot; <time dateTime={post.date}>{formatDate(post.date)}</time> &middot;{" "}
          {readingTime(post.bodyMarkdown)}
        </p>
      </div>
    </article>
  );
}
