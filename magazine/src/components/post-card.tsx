import Link from "next/link";
import type { StoredPost } from "../lib/scatterpost/content-store.ts";
import { Cover } from "./cover.tsx";
import { TagChips } from "./tag-chips.tsx";

export function PostCard({ post }: { post: StoredPost }) {
  return (
    <article className="card">
      <Link href={`/blog/${post.slug}`} className="block" aria-label={post.title}>
        <Cover title={post.title} cover={post.cover} />
      </Link>
      <div className="card-body">
        <h2 className="text-xl font-semibold">
          <Link href={`/blog/${post.slug}`} className="underline">
            {post.title}
          </Link>
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        </p>
        {post.description ? <p>{post.description}</p> : null}
        <TagChips tags={post.tags} />
      </div>
    </article>
  );
}
