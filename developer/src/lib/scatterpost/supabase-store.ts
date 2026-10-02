/**
 * `ContentStore` backed by the `posts` table (`supabase/posts.sql`). An
 * optional alternative to `BlobStore` for a founder who already runs
 * Supabase. Uses the service role key, so this module is only ever
 * imported from server code (route handlers, `scripts/pull.mjs`).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveSlugAndWrite, type ContentStore, type SaveResult, type StoredPost } from "./content-store.ts";

interface PostRow {
  slug: string;
  scatterpost_id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  canonical: string | null;
  cover: string | null;
  cover_alt: string | null;
  body_markdown: string;
}

function toStoredPost(row: PostRow): StoredPost {
  return {
    slug: row.slug,
    scatterpostId: row.scatterpost_id,
    title: row.title,
    date: row.date,
    description: row.description,
    tags: row.tags,
    canonical: row.canonical ?? undefined,
    cover: row.cover ?? undefined,
    coverAlt: row.cover_alt ?? undefined,
    bodyMarkdown: row.body_markdown,
  };
}

function toRow(post: StoredPost): PostRow {
  return {
    slug: post.slug,
    scatterpost_id: post.scatterpostId,
    title: post.title,
    date: post.date,
    description: post.description,
    tags: post.tags,
    canonical: post.canonical ?? null,
    cover: post.cover ?? null,
    cover_alt: post.coverAlt ?? null,
    body_markdown: post.bodyMarkdown,
  };
}

export class SupabaseStore implements ContentStore {
  private readonly client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }

  async list(): Promise<StoredPost[]> {
    const { data, error } = await this.client.from("posts").select("*").order("date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => toStoredPost(row as PostRow));
  }

  async get(slug: string): Promise<StoredPost | null> {
    const { data, error } = await this.client.from("posts").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? toStoredPost(data as PostRow) : null;
  }

  async save(post: StoredPost): Promise<SaveResult> {
    return resolveSlugAndWrite(
      post,
      (slug) => this.get(slug),
      async (slug, resolved) => {
        const { error } = await this.client
          .from("posts")
          .upsert({ ...toRow(resolved), slug, updated_at: new Date().toISOString() });
        if (error) throw error;
      },
    );
  }
}
