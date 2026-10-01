import Link from "next/link";
import type { Metadata } from "next";
import { getStore, siteName } from "../../lib/site.ts";
import { readingTimeMinutes } from "../../lib/reading-time.ts";

export const metadata: Metadata = {
  title: "Blog",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getStore().list();

  return (
    <div className="measure flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">
          No posts yet. Connect {siteName()} to scatterpost to publish the first one.
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-[var(--border)] pb-6">
              <Link href={`/blog/${post.slug}`} className="text-lg font-medium underline">
                {post.title}
              </Link>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                </time>
                {" · "}
                {readingTimeMinutes(post.bodyMarkdown)} min read
              </p>
              {post.description ? <p className="mt-2">{post.description}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
