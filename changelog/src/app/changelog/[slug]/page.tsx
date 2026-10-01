import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authorName, authorUrl, changelogUrl, getStore, siteName, siteUrl } from "../../../lib/site.ts";
import { renderMarkdown } from "../../../lib/scatterpost/render-markdown.ts";
import { isValidSlug, serialiseJsonLd } from "../../../lib/scatterpost/safe-html.ts";
import { isChangelogPost, parseVersion } from "../../../lib/changelog.ts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return {};
  const post = await getStore().get(slug);
  // A post that is not tagged "changelog" lives at /blog/[slug], not here.
  if (!post || !isChangelogPost(post)) return {};

  const canonical = post.canonical ?? changelogUrl(post.slug);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function ChangelogEntryPage({ params }: PageProps) {
  const { slug } = await params;
  // `..`, `/`, `%2F` and anything else outside the slug shape never reach
  // the store (a FileStore or BlobStore would otherwise join it into a
  // file or object path).
  if (!isValidSlug(slug)) {
    notFound();
  }
  const post = await getStore().get(slug);
  if (!post || !isChangelogPost(post)) {
    notFound();
  }

  const canonical = post.canonical ?? changelogUrl(post.slug);
  const html = renderMarkdown(post.bodyMarkdown);
  const site = siteUrl();
  const version = parseVersion(post.title);

  const author = authorUrl()
    ? { "@type": "Person", name: authorName(), url: authorUrl() }
    : { "@type": "Organization", name: authorName() };

  // BlogPosting, not a bespoke type: a changelog entry is a dated,
  // authored piece of writing like any other post, and BlogPosting is
  // the type search engines and AI crawlers already recognise.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: canonical,
    mainEntityOfPage: canonical,
    image: post.cover ? [post.cover] : [`${site}/changelog/${post.slug}/opengraph-image`],
    author,
    publisher: author,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: siteName(), item: site },
      { "@type": "ListItem", position: 2, name: "Changelog", item: `${site}/changelog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <div className="measure flex flex-col gap-4">
      <article>
        <h1 className="text-3xl font-semibold">
          {version ? <span className="mr-2 font-mono text-xl text-[var(--muted-foreground)]">{version}</span> : null}
          {post.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        </p>
        <div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(breadcrumbJsonLd) }} />
    </div>
  );
}
