import Link from "next/link";
import type { Metadata } from "next";
import { getStore, siteDescription, siteName } from "../../lib/site.ts";
import { groupByMonth, parseCategory, parseVersion, splitPosts } from "../../lib/changelog.ts";

export const metadata: Metadata = {
  title: "Changelog",
  alternates: { canonical: "/changelog" },
};

const CATEGORY_LABEL = { new: "New", improved: "Improved", fixed: "Fixed" } as const;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default async function ChangelogIndexPage() {
  const { changelogPosts } = splitPosts(await getStore().list());
  const months = groupByMonth(changelogPosts);

  return (
    <div className="measure">
      <div className="page-header">
        <h1>Changelog</h1>
        <p className="page-description">{siteDescription()}</p>
        <p className="subscribe-row">
          <Link href="/changelog/feed.xml">RSS</Link>
        </p>
      </div>

      {months.length === 0 ? (
        <div className="empty-state">
          <h2>No updates yet</h2>
          <p>
            Tag a post &quot;changelog&quot; when publishing through {siteName()}&apos;s scatterpost connection to
            have it appear here as a dated entry.
          </p>
        </div>
      ) : (
        <ol className="timeline">
          {months.map((month) => (
            <li key={month.key} className="timeline-month">
              <h2 className="timeline-month-label">{month.label}</h2>
              <ul className="flex flex-col">
                {month.posts.map((post) => {
                  const version = parseVersion(post.title);
                  const category = parseCategory(post.tags);
                  const hasLongBody = post.bodyMarkdown.trim().length > 320;
                  return (
                    <li key={post.slug} className="timeline-entry">
                      <div className="timeline-meta">
                        <time dateTime={post.date} className="timeline-date">
                          {formatDate(post.date)}
                        </time>
                        {version ? <span className="version-badge">{version}</span> : null}
                      </div>
                      <div className="timeline-body">
                        <h3>
                          <Link href={`/changelog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        {category ? (
                          <p className="timeline-tags">
                            <span className={`category-pill category-pill-${category}`}>
                              {CATEGORY_LABEL[category]}
                            </span>
                          </p>
                        ) : null}
                        {post.description ? <p className="timeline-summary">{post.description}</p> : null}
                        {post.cover ? (
                          <p className="timeline-cover">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={post.cover} alt={post.title} width={800} height={450} />
                          </p>
                        ) : null}
                        {hasLongBody ? (
                          <Link href={`/changelog/${post.slug}`} className="read-more">
                            Read more
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
