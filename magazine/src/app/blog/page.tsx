import type { Metadata } from "next";
import { getStore, siteName } from "../../lib/site.ts";
import { PostCard } from "../../components/post-card.tsx";

export const metadata: Metadata = {
  title: "Writing",
  alternates: { canonical: "blog" },
};

export default async function BlogIndexPage() {
  const posts = await getStore().list();

  return (
    <div className="index-page">
      <h1 className="index-page-heading">Writing</h1>
      {posts.length === 0 ? (
        <p className="story-card-dek">
          No posts yet. Connect {siteName()} to scatterpost to publish the first one.
        </p>
      ) : (
        <div className="story-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
