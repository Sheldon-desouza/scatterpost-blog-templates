import Link from "next/link";
import type { Metadata } from "next";
import { getStore } from "../../lib/site.ts";
import { tagCounts } from "../../components/post-index.tsx";

export const metadata: Metadata = {
  title: "Tags",
  alternates: { canonical: "/tags" },
};

export default async function TagsIndexPage() {
  const posts = await getStore().list();
  const tags = tagCounts(posts);

  return (
    <div className="measure">
      <h1>Tags</h1>
      {tags.length === 0 ? (
        <p className="home-bio">No tags yet.</p>
      ) : (
        <nav className="tag-filter-row" aria-label="Every tag">
          {tags.map(({ tag, slug, count }) => (
            <Link key={slug} href={`/tags/${slug}`} className="tag-chip tag-chip-link">
              {tag} <span className="tag-chip-count">{count}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
