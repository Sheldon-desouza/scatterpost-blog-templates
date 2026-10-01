import Link from "next/link";
import type { StoredPost } from "../lib/scatterpost/content-store.ts";

/**
 * "All writing" index: posts grouped by year (newest year first, posts
 * within a year in the order the store already returns, newest first),
 * each row a mono date on the left and the title on the right with a
 * hairline rule between rows. The whole row is a single 44px+ link.
 */
export function PostIndex({ posts }: { posts: StoredPost[] }) {
  const byYear = new Map<string, StoredPost[]>();
  for (const post of posts) {
    const year = String(new Date(post.date).getFullYear());
    const existing = byYear.get(year);
    if (existing) existing.push(post);
    else byYear.set(year, [post]);
  }

  return (
    <div className="flex flex-col">
      {[...byYear.entries()].map(([year, yearPosts]) => (
        <div key={year} className="index-year">
          <h3>{year}</h3>
          <ul>
            {yearPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="index-row">
                  <time dateTime={post.date} className="index-row-date">
                    {new Date(post.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </time>
                  <span className="index-row-title">{post.title}</span>
                  {post.tags.length > 0 ? (
                    <span className="index-row-tags">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag-pill">
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
