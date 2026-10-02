/**
 * `/<slug>`: a post at the root of the site (or of the base path), used
 * only when NEXT_PUBLIC_POSTS_AT_ROOT=true. Renders exactly what
 * `/blog/<slug>` renders (that page already builds every URL through
 * `postPath`/`postUrl`, so its canonical, JSON-LD and links follow the
 * option); with the option off this calls `notFound()`, so the default
 * URLs are unchanged. Literal routes (/tags, /feed.xml, /api, ...) are
 * always matched before this dynamic segment.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { postsAtRoot } from "../../lib/scatterpost/post-paths.ts";
import BlogPostPage, { generateMetadata as generateBlogPostMetadata } from "../blog/[slug]/page.tsx";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  if (!postsAtRoot()) return {};
  return generateBlogPostMetadata(props);
}

export default async function RootPostPage(props: PageProps) {
  if (!postsAtRoot()) {
    notFound();
  }
  return BlogPostPage(props);
}
