import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "../../../lib/site.ts";
import { PostIndex, postsForTagSlug, tagCounts } from "../../../components/post-index.tsx";

interface PageProps {
  params: Promise<{ tag: string }>;
}

/**
 * Pre-renders a static page per tag at build time, from whatever posts
 * the configured store already holds. A tag added by a post published
 * later (push or pull, after the build) still resolves, since the
 * content store itself, not this list, is what `getStore().list()`
 * reads from on every request to a route Next did not statically
 * generate ahead of time.
 */
export async function generateStaticParams(): Promise<Array<{ tag: string }>> {
  const posts = await getStore().list();
  return tagCounts(posts).map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const posts = await getStore().list();
  const match = postsForTagSlug(posts, tag);
  if (!match) return {};
  return {
    title: `Posts tagged "${match.tag}"`,
    alternates: { canonical: `tags/${tag}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = await getStore().list();
  const match = postsForTagSlug(posts, tag);
  if (!match) {
    notFound();
  }

  return (
    <div className="measure">
      <p className="post-kicker">Tag</p>
      <h1>{match.tag}</h1>
      <section className="index-section">
        <PostIndex posts={match.posts} />
      </section>
    </div>
  );
}
