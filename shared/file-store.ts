/**
 * `ContentStore` backed by Markdown files under `content/posts`. Works
 * for local dev, and for a deployment that commits each new post back to
 * its own repository. Does not work on Vercel's read-only production
 * filesystem for posts written at request time; use `BlobStore` or
 * `SupabaseStore` there instead (see each template's `src/lib/site.ts`
 * for the `CONTENT_STORE` switch).
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
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
  scatterpostId?: string;
}

function orUndefined(value: string | undefined): string | undefined {
  return value ? value : undefined;
}

function toStoredPost(slugFromFilename: string, raw: string): StoredPost {
  const { data, content } = matter(raw, safeMatterOptions);
  const frontMatter = data as Partial<FrontMatter>;
  return {
    slug: frontMatter.slug ?? slugFromFilename,
    scatterpostId: frontMatter.scatterpostId ?? slugFromFilename,
    title: frontMatter.title ?? slugFromFilename,
    date: frontMatter.date ?? new Date(0).toISOString(),
    description: frontMatter.description ?? "",
    tags: frontMatter.tags ?? [],
    canonical: orUndefined(frontMatter.canonical),
    cover: orUndefined(frontMatter.cover),
    bodyMarkdown: content.trim(),
  };
}

function toFileContents(post: StoredPost): string {
  const frontMatter: FrontMatter = {
    title: post.title,
    slug: post.slug,
    date: post.date,
    description: post.description,
    tags: post.tags,
    scatterpostId: post.scatterpostId,
    // `canonical` and `cover` are only added when present: gray-matter's
    // YAML dumper throws on an explicit `undefined` value.
    ...(post.canonical ? { canonical: post.canonical } : {}),
    ...(post.cover ? { cover: post.cover } : {}),
  };
  return matter.stringify(post.bodyMarkdown, frontMatter);
}

export class FileStore implements ContentStore {
  private readonly dir: string;

  constructor(dir: string = path.join(process.cwd(), "content", "posts")) {
    this.dir = dir;
  }

  private pathFor(slug: string): string {
    return path.join(this.dir, `${slug}.md`);
  }

  async list(): Promise<StoredPost[]> {
    let entries: string[];
    try {
      entries = await readdir(this.dir);
    } catch {
      return [];
    }
    const posts = await Promise.all(
      entries
        .filter((entry) => entry.endsWith(".md"))
        .map(async (entry) => {
          const raw = await readFile(path.join(this.dir, entry), "utf8");
          return toStoredPost(entry.replace(/\.md$/, ""), raw);
        }),
    );
    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async get(slug: string): Promise<StoredPost | null> {
    // Defence in depth behind the route's own `isValidSlug` check: the slug
    // is joined into a file path below, so a separator or `..` never is.
    // (Deliberately looser than `isValidSlug`, so `save`'s collision check
    // still sees every file this store itself wrote.)
    if (slug.includes("/") || slug.includes("\\") || slug.includes("..") || slug.includes("\0")) {
      return null;
    }
    try {
      const raw = await readFile(this.pathFor(slug), "utf8");
      return toStoredPost(slug, raw);
    } catch {
      return null;
    }
  }

  async save(post: StoredPost): Promise<SaveResult> {
    await mkdir(this.dir, { recursive: true });
    return resolveSlugAndWrite(
      post,
      (slug) => this.get(slug),
      async (slug, resolved) => {
        await writeFile(this.pathFor(slug), toFileContents(resolved), "utf8");
      },
    );
  }
}
