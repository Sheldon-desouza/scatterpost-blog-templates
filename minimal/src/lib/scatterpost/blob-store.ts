/**
 * `ContentStore` backed by Vercel Blob (`@vercel/blob`), the default
 * store on Vercel: its production filesystem is read-only, so `FileStore`
 * cannot take a post written at request time. Posts are stored as
 * Markdown with front matter, one object per post, under the `posts/`
 * prefix, so the file shape matches `FileStore`'s and a founder can move
 * between stores without rewriting content by hand.
 *
 * Reads happen only server-side (route handlers, generated pages), so the
 * store is created with `access: "private"`: a private store's blobs are
 * only reachable through `get()` with a valid token, never by a bare
 * URL, which keeps an unpublished or deleted post from being readable by
 * anyone who guesses its blob path.
 */
import { del, get, list, put } from "@vercel/blob";
import matter from "gray-matter";
import { resolveSlugAndWrite, type ContentStore, type SaveResult, type StoredPost } from "./content-store.ts";
import { safeMatterOptions } from "./matter-options.ts";

interface FrontMatter {
  title: string;
  slug: string;
  date: string;
  description: string;
  tags?: string[];
  canonical?: string;
  cover?: string;
  coverAlt?: string;
  scatterpostId?: string;
}

function orUndefined(value: string | undefined): string | undefined {
  return value ? value : undefined;
}

function toStoredPost(slugFromPathname: string, raw: string): StoredPost {
  const { data, content } = matter(raw, safeMatterOptions);
  const frontMatter = data as Partial<FrontMatter>;
  return {
    slug: frontMatter.slug ?? slugFromPathname,
    scatterpostId: frontMatter.scatterpostId ?? slugFromPathname,
    title: frontMatter.title ?? slugFromPathname,
    date: frontMatter.date ?? new Date(0).toISOString(),
    description: frontMatter.description ?? "",
    tags: frontMatter.tags ?? [],
    canonical: orUndefined(frontMatter.canonical),
    cover: orUndefined(frontMatter.cover),
    coverAlt: orUndefined(frontMatter.coverAlt),
    bodyMarkdown: content.trim(),
  };
}

function toBlobContents(post: StoredPost): string {
  const frontMatter: FrontMatter = {
    title: post.title,
    slug: post.slug,
    date: post.date,
    description: post.description,
    tags: post.tags,
    scatterpostId: post.scatterpostId,
    ...(post.canonical ? { canonical: post.canonical } : {}),
    ...(post.cover ? { cover: post.cover } : {}),
    ...(post.coverAlt ? { coverAlt: post.coverAlt } : {}),
  };
  return matter.stringify(post.bodyMarkdown, frontMatter);
}

export class BlobStore implements ContentStore {
  private readonly prefix: string;
  private readonly token?: string;

  constructor(options: { prefix?: string; token?: string } = {}) {
    this.prefix = options.prefix ?? "posts/";
    this.token = options.token;
  }

  private pathnameFor(slug: string): string {
    return `${this.prefix}${slug}.md`;
  }

  private tokenOption(): { token: string } | Record<string, never> {
    return this.token ? { token: this.token } : {};
  }

  async list(): Promise<StoredPost[]> {
    const { blobs } = await list({ prefix: this.prefix, mode: "expanded", ...this.tokenOption() });
    const posts = await Promise.all(
      blobs
        .filter((blob) => blob.pathname.endsWith(".md"))
        .map(async (blob) => {
          const slug = blob.pathname.slice(this.prefix.length).replace(/\.md$/, "");
          const result = await get(blob.pathname, { access: "private", ...this.tokenOption() });
          const raw = result ? await new Response(result.stream).text() : "";
          return toStoredPost(slug, raw);
        }),
    );
    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async get(slug: string): Promise<StoredPost | null> {
    // Defence in depth behind the route's own `isValidSlug` check: the
    // slug is joined into a blob pathname below.
    if (slug.includes("/") || slug.includes("\\") || slug.includes("..") || slug.includes("\0")) {
      return null;
    }
    try {
      const result = await get(this.pathnameFor(slug), { access: "private", ...this.tokenOption() });
      if (!result) return null;
      const raw = await new Response(result.stream).text();
      return toStoredPost(slug, raw);
    } catch {
      return null;
    }
  }

  async save(post: StoredPost): Promise<SaveResult> {
    return resolveSlugAndWrite(
      post,
      (slug) => this.get(slug),
      async (slug, resolved) => {
        await put(this.pathnameFor(slug), toBlobContents(resolved), {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "text/markdown; charset=utf-8",
          ...this.tokenOption(),
        });
      },
    );
  }

  async delete(slug: string): Promise<void> {
    await del(this.pathnameFor(slug), this.tokenOption());
  }
}
