import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStore, postUrl, siteName, siteUrl } from "../../../lib/site.ts";
import { isValidSlug, serialiseJsonLd } from "../../../lib/scatterpost/safe-html.ts";
import { collectTags, postsForTagSlug, tagNameForSlug } from "../../../lib/tags.ts";
import { PostCard } from "../../../components/post-card.tsx";

interface PageProps {
  params: Promise<{ tag: string }>;
}

/** Pre-renders a page for every tag currently in use; a tag coined after
 * the build still resolves on first request (`dynamicParams` defaults to
 * true) and is picked up statically from then on. */
export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const posts = await getStore().list();
  return collectTags(posts).map((summary) => ({ tag: summary.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  if (!isValidSlug(tag)) return {};
  const posts = await getStore().list();
  const matches = postsForTagSlug(posts, tag);
  if (matches.length === 0) return {};
  const name = tagNameForSlug(posts, tag);
  return {
    title: `Posts tagged "${name}"`,
    alternates: { canonical: `tags/${tag}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  if (!isValidSlug(tag)) {
    notFound();
  }

  const posts = await getStore().list();
  const matches = postsForTagSlug(posts, tag);
  if (matches.length === 0) {
    notFound();
  }

  const name = tagNameForSlug(posts, tag);
  const site = siteUrl();
  const canonical = `${site}/tags/${tag}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Posts tagged "${name}"`,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: siteName(), url: site },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: matches.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: post.canonical ?? postUrl(post.slug),
        name: post.title,
      })),
    },
  };

  return (
    <div className="index-page">
      <h1 className="index-page-heading">Posts tagged &quot;{name}&quot;</h1>
      <div className="story-grid">
        {matches.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(collectionJsonLd) }} />
    </div>
  );
}
