import Link from "next/link";
import type { Metadata } from "next";
import { getStore, siteName } from "../../lib/site.ts";
import { splitPosts } from "../../lib/changelog.ts";
import { postPath } from "../../lib/scatterpost/post-paths.ts";

export const metadata: Metadata = {
  title: "Blog",
  alternates: { canonical: "blog" },
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogIndexPage() {
  const { blogPosts: posts } = splitPosts(await getStore().list());

  return (
    <div className="measure">
      <div className="page-header">
        <h1>Blog</h1>
        <p className="subscribe-row">
          <Link href="/feed.xml">RSS</Link>
        </p>
      </div>
      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>No articles yet</h2>
          <p>Connect {siteName()} to scatterpost to publish the first one.</p>
        </div>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.slug} className="post-list-row">
              <Link href={postPath(post.slug)} className="post-list-title">
                {post.title}
              </Link>
              <p className="post-list-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              {post.description ? <p className="post-list-summary">{post.description}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
