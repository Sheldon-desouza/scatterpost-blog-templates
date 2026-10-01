import Link from "next/link";
import type { Metadata } from "next";
import { getStore } from "../../lib/site.ts";
import { collectTags } from "../../lib/tags.ts";

export const metadata: Metadata = {
  title: "Tags",
  alternates: { canonical: "/tags" },
};

export default async function TagsIndexPage() {
  const posts = await getStore().list();
  const tags = collectTags(posts);

  return (
    <div className="index-page">
      <h1 className="index-page-heading">Tags</h1>
      {tags.length === 0 ? (
        <p className="story-card-dek">No tags yet.</p>
      ) : (
        <ul className="tag-list">
          {tags.map((summary) => (
            <li key={summary.slug}>
              <Link href={`/tags/${summary.slug}`} className="tag-chip">
                {summary.tag} ({summary.count})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
