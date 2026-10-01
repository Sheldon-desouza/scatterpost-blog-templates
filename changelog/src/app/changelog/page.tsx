import Link from "next/link";
import type { Metadata } from "next";
import { getStore, siteName } from "../../lib/site.ts";
import { groupByMonth, parseVersion, splitPosts } from "../../lib/changelog.ts";

export const metadata: Metadata = {
  title: "Changelog",
  alternates: { canonical: "/changelog" },
};

export default async function ChangelogIndexPage() {
  const { changelogPosts } = splitPosts(await getStore().list());
  const months = groupByMonth(changelogPosts);

  return (
    <div className="measure flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">Changelog</h1>
      {months.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">
          No updates yet. Tag a post &quot;changelog&quot; when publishing through{" "}
          {siteName()}&apos;s scatterpost connection to have it appear here.
        </p>
      ) : (
        <ol className="flex flex-col gap-10">
          {months.map((month) => (
            <li key={month.key} className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
                {month.label}
              </h2>
              <ul className="flex flex-col gap-6 border-l border-[var(--border)] pl-6">
                {month.posts.map((post) => {
                  const version = parseVersion(post.title);
                  return (
                    <li key={post.slug} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute top-2 -left-[29px] h-2 w-2 rounded-full bg-[var(--accent)]"
                      />
                      <p className="text-sm text-[var(--muted-foreground)]">
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      </p>
                      <Link href={`/changelog/${post.slug}`} className="text-lg font-medium underline">
                        {version ? <span className="mr-2 font-mono text-sm">{version}</span> : null}
                        {post.title}
                      </Link>
                      {post.description ? <p className="mt-1">{post.description}</p> : null}
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
