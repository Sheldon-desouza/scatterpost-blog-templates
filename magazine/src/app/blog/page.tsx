import type { Metadata } from "next";
import { getStore, siteName } from "../../lib/site.ts";
import { PostCard } from "../../components/post-card.tsx";

export const metadata: Metadata = {
  title: "Blog",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getStore().list();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">
          No posts yet. Connect {siteName()} to scatterpost to publish the first one.
        </p>
      ) : (
        <div className="card-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
