/**
 * The Open Graph card for `/<slug>`, the same card `/blog/<slug>` has.
 * Only answers while NEXT_PUBLIC_POSTS_AT_ROOT=true, like the page.
 */
import { notFound } from "next/navigation";
import { postsAtRoot } from "../../lib/scatterpost/post-paths.ts";
import BlogPostOpengraphImage from "../blog/[slug]/opengraph-image.tsx";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage(props: ImageProps) {
  if (!postsAtRoot()) {
    notFound();
  }
  return BlogPostOpengraphImage(props);
}
