import type { Metadata } from "next";
import { getStore, siteName } from "../../lib/site.ts";
import { PostIndex } from "../../components/PostIndex.tsx";

export const metadata: Metadata = {
  title: "Writing",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getStore().list();

  return (
    <div className="measure">
      <h1 className="text-3xl">All writing</h1>
      {posts.length === 0 ? (
        <p className="home-bio">No posts yet. Connect {siteName()} to scatterpost to publish the first one.</p>
      ) : (
        <div className="index-section">
          <PostIndex posts={posts} />
        </div>
      )}
    </div>
  );
}
