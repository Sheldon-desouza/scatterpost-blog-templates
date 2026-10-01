-- SupabaseStore's table (src/lib/scatterpost/supabase-store.ts). An
-- optional alternative to the default Vercel Blob store. Run this once
-- against the Supabase project named by SUPABASE_URL if you set
-- CONTENT_STORE=supabase.

create table if not exists posts (
  slug text primary key,
  scatterpost_id text not null,
  title text not null,
  date timestamptz not null,
  description text not null default '',
  tags text[] not null default '{}',
  canonical text,
  cover text,
  body_markdown text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_scatterpost_id_idx on posts (scatterpost_id);

-- Row Level Security is ON, with NO policies, and every client grant is
-- revoked: this table is read and written only with the service role key
-- from the server (see src/lib/scatterpost/supabase-store.ts), which
-- bypasses RLS, so nothing in this template changes. Supabase exposes
-- every table in the public schema over its REST API, and new tables get
-- anon and authenticated grants by default; without this, anyone holding
-- the project's public anon key could insert, overwrite or delete posts.
-- Do not add a policy for anon or authenticated unless you mean readers
-- of this Supabase project to write to your blog.

alter table posts enable row level security;
revoke all on posts from anon, authenticated;
