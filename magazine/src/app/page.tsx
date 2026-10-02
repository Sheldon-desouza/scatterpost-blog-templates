import { getStore } from "../lib/site.ts";
import { authorName, authorUrl, sameAsUrls, siteName, siteUrl } from "../lib/site.ts";
import { serialiseJsonLd } from "../lib/scatterpost/safe-html.ts";
import { collectTags, postsForTagSlug } from "../lib/tags.ts";
import { LeadStory } from "../components/lead-story.tsx";
import { PostCard } from "../components/post-card.tsx";
import { AuthorBlock } from "../components/author-block.tsx";
import { postsAtRoot } from "../lib/scatterpost/post-paths.ts";

export default async function HomePage() {
  const posts = await getStore().list();
  const site = siteUrl();

  const sameAs = sameAsUrls();
  const author = authorUrl()
    ? { "@type": "Person", name: authorName(), url: authorUrl(), sameAs: sameAs.length > 0 ? sameAs : undefined }
    : { "@type": "Organization", name: authorName(), sameAs: sameAs.length > 0 ? sameAs : undefined };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: siteName(), url: site },
      author,
    ],
  };

  const [lead, ...rest] = posts;

  if (!lead) {
    return (
      <div>
        <h1 className="sr-only">{siteName()}</h1>
        <div className="empty-state">
          <h2>No posts yet</h2>
          <p>
            This blog is ready to receive its first post. Connect it as a Website channel in scatterpost
            with your deployed URL and a webhook secret (<code>SCATTERPOST_WEBHOOK_SECRET</code>), or set up
            pull mode with <code>SCATTERPOST_API_URL</code> and <code>SCATTERPOST_API_KEY</code>. See this
            template&apos;s README for the exact steps.
          </p>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }} />
      </div>
    );
  }

  // The 3-column grid of recent stories, then one "More on <tag>" section
  // per tag still left over after the lead story and that grid, each
  // capped at three posts so the home page stays scannable rather than
  // repeating the whole archive by category.
  const grid = rest.slice(0, 6);
  const shown = new Set([lead.slug, ...grid.map((post) => post.slug)]);
  const tagSections = collectTags(posts)
    .map((summary) => ({
      summary,
      posts: postsForTagSlug(posts, summary.slug).filter((post) => !shown.has(post.slug)).slice(0, 3),
    }))
    .filter((section) => section.posts.length > 0)
    .slice(0, 3);

  // With posts at the root, /blog redirects here, so the home page also
  // carries every post the sections above did not already show: the
  // page as a whole is then the full listing.
  const shownAbove = new Set([...shown, ...tagSections.flatMap((section) => section.posts.map((post) => post.slug))]);
  const archive = postsAtRoot() ? posts.filter((post) => !shownAbove.has(post.slug)) : [];

  return (
    <div className="home">
      <LeadStory post={lead} />

      {grid.length > 0 ? (
        <section className="story-grid-section" aria-label="Recent stories">
          <div className="story-grid">
            {grid.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {tagSections.map((section) => (
        <section key={section.summary.slug} className="story-grid-section">
          <h2 className="section-heading">More on {section.summary.tag}</h2>
          <div className="story-grid">
            {section.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ))}

      {archive.length > 0 ? (
        <section className="story-grid-section">
          <h2 className="section-heading">More writing</h2>
          <div className="story-grid">
            {archive.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      <AuthorBlock />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }} />
    </div>
  );
}
