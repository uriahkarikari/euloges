-- Lifebree social publishing foundation for Legacy and Lifestyle.
create table if not exists public.lifebree_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Lifebree member',
  channel text not null check (channel in ('legacy','lifestyle')),
  content text not null check (char_length(btrim(content)) between 1 and 5000),
  media_url text,
  visibility text not null default 'private' check (visibility in ('public','private')),
  repost_of_id uuid references public.lifebree_posts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lifebree_posts_channel_created_idx on public.lifebree_posts(channel, created_at desc);
create index if not exists lifebree_posts_author_created_idx on public.lifebree_posts(author_id, created_at desc);
create index if not exists lifebree_posts_repost_idx on public.lifebree_posts(repost_of_id) where repost_of_id is not null;

create table if not exists public.lifebree_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.lifebree_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id,user_id)
);
create index if not exists lifebree_post_likes_post_idx on public.lifebree_post_likes(post_id);

create table if not exists public.lifebree_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.lifebree_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Lifebree member',
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists lifebree_post_comments_post_created_idx on public.lifebree_post_comments(post_id, created_at);

create table if not exists public.lifebree_post_reposts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.lifebree_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id,user_id)
);
create index if not exists lifebree_post_reposts_post_idx on public.lifebree_post_reposts(post_id);

-- Resolve display names from trusted Auth metadata, not client-submitted labels.
create or replace function public.set_lifebree_post_author_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(
    nullif(pg_catalog.btrim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(pg_catalog.btrim(u.raw_user_meta_data->>'name'), ''),
    split_part(u.email, '@', 1),
    'Lifebree member'
  )
  into new.author_name
  from auth.users u
  where u.id = new.author_id;
  return new;
end;
$$;

drop trigger if exists lifebree_posts_set_author_name on public.lifebree_posts;
create trigger lifebree_posts_set_author_name
before insert on public.lifebree_posts
for each row execute function public.set_lifebree_post_author_name();

drop trigger if exists lifebree_comments_set_author_name on public.lifebree_post_comments;
create trigger lifebree_comments_set_author_name
before insert on public.lifebree_post_comments
for each row execute function public.set_lifebree_post_author_name();

alter table public.lifebree_posts enable row level security;
alter table public.lifebree_post_likes enable row level security;
alter table public.lifebree_post_comments enable row level security;
alter table public.lifebree_post_reposts enable row level security;

create policy "Public posts and own private posts are visible"
on public.lifebree_posts for select to authenticated
using (visibility = 'public' or author_id = (select auth.uid()));
create policy "Anyone can view public posts"
on public.lifebree_posts for select to anon
using (visibility = 'public');
create policy "Users create their own posts"
on public.lifebree_posts for insert to authenticated
with check (author_id = (select auth.uid()));
create policy "Authors update their own posts"
on public.lifebree_posts for update to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));
create policy "Authors delete their own posts"
on public.lifebree_posts for delete to authenticated
using (author_id = (select auth.uid()));

create policy "Likes visible with visible posts"
on public.lifebree_post_likes for select to anon, authenticated
using (exists (select 1 from public.lifebree_posts p where p.id = post_id and p.visibility = 'public'));
create policy "Users like public posts"
on public.lifebree_post_likes for insert to authenticated
with check (user_id = (select auth.uid()) and exists (select 1 from public.lifebree_posts p where p.id = post_id and p.visibility = 'public'));
create policy "Users remove their own likes"
on public.lifebree_post_likes for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Comments visible with public posts"
on public.lifebree_post_comments for select to anon, authenticated
using (exists (select 1 from public.lifebree_posts p where p.id = post_id and p.visibility = 'public'));
create policy "Signed-in users comment on public posts"
on public.lifebree_post_comments for insert to authenticated
with check (author_id = (select auth.uid()) and exists (select 1 from public.lifebree_posts p where p.id = post_id and p.visibility = 'public'));
create policy "Authors remove their comments"
on public.lifebree_post_comments for delete to authenticated
using (author_id = (select auth.uid()));

create policy "Reposts visible with public posts"
on public.lifebree_post_reposts for select to anon, authenticated
using (exists (select 1 from public.lifebree_posts p where p.id = post_id and p.visibility = 'public'));
create policy "Signed-in users repost public posts"
on public.lifebree_post_reposts for insert to authenticated
with check (user_id = (select auth.uid()) and exists (select 1 from public.lifebree_posts p where p.id = post_id and p.visibility = 'public'));
create policy "Users undo their own reposts"
on public.lifebree_post_reposts for delete to authenticated
using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.lifebree_posts to authenticated;
grant select on public.lifebree_posts to anon;
grant select, insert, delete on public.lifebree_post_likes to authenticated;
grant select on public.lifebree_post_likes to anon;
grant select, insert, delete on public.lifebree_post_comments to authenticated;
grant select on public.lifebree_post_comments to anon;
grant select, insert, delete on public.lifebree_post_reposts to authenticated;
grant select on public.lifebree_post_reposts to anon;
