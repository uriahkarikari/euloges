-- Lifebree-wide social graph and reusable audience authorization foundation.
-- This migration deliberately does not alter existing memorial privacy rules.
-- Euloges integration will use this graph only after its current family/invited
-- access policies have been audited and explicitly preserved.

create table if not exists public.lifebree_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lifebree_friendships_distinct_users check (requester_id <> recipient_id)
);
create unique index if not exists lifebree_friendships_pair_unique
  on public.lifebree_friendships (least(requester_id, recipient_id), greatest(requester_id, recipient_id));
create index if not exists lifebree_friendships_recipient_status_idx
  on public.lifebree_friendships (recipient_id, status);
create index if not exists lifebree_friendships_requester_status_idx
  on public.lifebree_friendships (requester_id, status);

create table if not exists public.lifebree_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint lifebree_follows_distinct_users check (follower_id <> followed_id)
);
create index if not exists lifebree_follows_followed_idx on public.lifebree_follows(followed_id);

create table if not exists public.lifebree_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint lifebree_blocks_distinct_users check (blocker_id <> blocked_id)
);

-- Selected audiences are scoped to a typed content resource. The owning feature
-- remains responsible for validating that the resource exists and is owned by
-- the supplied owner_id when it creates the audience record.
create table if not exists public.lifebree_content_audiences (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('post','memorial','tribute','legacy_story','archive_item')),
  resource_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  audience text not null check (audience in ('public','friends','following','followers','selected_friends','only_me')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(resource_type, resource_id)
);
create index if not exists lifebree_content_audiences_owner_idx on public.lifebree_content_audiences(owner_id);
create table if not exists public.lifebree_content_audience_members (
  audience_id uuid not null references public.lifebree_content_audiences(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (audience_id, member_id)
);
create index if not exists lifebree_audience_members_member_idx on public.lifebree_content_audience_members(member_id);

alter table public.lifebree_friendships enable row level security;
alter table public.lifebree_follows enable row level security;
alter table public.lifebree_blocks enable row level security;
alter table public.lifebree_content_audiences enable row level security;
alter table public.lifebree_content_audience_members enable row level security;

drop policy if exists "Users view their friendship requests" on public.lifebree_friendships;
create policy "Users view their friendship requests" on public.lifebree_friendships
for select to authenticated using ((select auth.uid()) in (requester_id, recipient_id));

drop policy if exists "Users view follow relationships involving them" on public.lifebree_follows;
create policy "Users view follow relationships involving them" on public.lifebree_follows
for select to authenticated using ((select auth.uid()) in (follower_id, followed_id));

drop policy if exists "Users view blocks they created" on public.lifebree_blocks;
create policy "Users view blocks they created" on public.lifebree_blocks
for select to authenticated using (blocker_id = (select auth.uid()));

drop policy if exists "Owners view their content audiences" on public.lifebree_content_audiences;
create policy "Owners view their content audiences" on public.lifebree_content_audiences
for select to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "Owners manage selected audience members" on public.lifebree_content_audience_members;
create policy "Owners manage selected audience members" on public.lifebree_content_audience_members
for select to authenticated using (
  exists (select 1 from public.lifebree_content_audiences a
          where a.id = audience_id and a.owner_id = (select auth.uid()))
);

-- Security-definer routines avoid recursive RLS evaluation when checking the graph.
create or replace function public.lifebree_is_blocked_between(p_user_a uuid, p_user_b uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.lifebree_blocks b
    where (b.blocker_id = p_user_a and b.blocked_id = p_user_b)
       or (b.blocker_id = p_user_b and b.blocked_id = p_user_a)
  );
$$;

create or replace function public.lifebree_are_friends(p_user_a uuid, p_user_b uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select p_user_a is not null and p_user_b is not null
     and p_user_a <> p_user_b
     and not public.lifebree_is_blocked_between(p_user_a, p_user_b)
     and exists (
       select 1 from public.lifebree_friendships f
       where f.status = 'accepted'
         and ((f.requester_id = p_user_a and f.recipient_id = p_user_b)
           or (f.requester_id = p_user_b and f.recipient_id = p_user_a))
     );
$$;

create or replace function public.lifebree_can_view_audience(
  p_owner_id uuid,
  p_audience text,
  p_resource_type text default null,
  p_resource_id uuid default null
)
returns boolean
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
begin
  if p_owner_id is null then return false; end if;
  if v_viewer is null then return p_audience = 'public'; end if;
  if v_viewer = p_owner_id then return true; end if;
  if public.lifebree_is_blocked_between(v_viewer, p_owner_id) then return false; end if;

  case p_audience
    when 'public' then return true;
    when 'only_me' then return false;
    when 'friends' then return public.lifebree_are_friends(v_viewer, p_owner_id);
    when 'following' then
      return exists (select 1 from public.lifebree_follows f
                     where f.follower_id = p_owner_id and f.followed_id = v_viewer);
    when 'followers' then
      return exists (select 1 from public.lifebree_follows f
                     where f.follower_id = v_viewer and f.followed_id = p_owner_id);
    when 'selected_friends' then
      return p_resource_type is not null and p_resource_id is not null
        and public.lifebree_are_friends(v_viewer, p_owner_id)
        and exists (
          select 1
          from public.lifebree_content_audiences a
          join public.lifebree_content_audience_members m on m.audience_id = a.id
          where a.owner_id = p_owner_id
            and a.resource_type = p_resource_type
            and a.resource_id = p_resource_id
            and a.audience = 'selected_friends'
            and m.member_id = v_viewer
        );
    else return false;
  end case;
end;
$$;

-- Request a friendship. Duplicate, reversed or blocked requests are rejected.
create or replace function public.lifebree_send_friend_request(p_recipient_id uuid)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare v_id uuid; v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if p_recipient_id is null or p_recipient_id = v_actor then raise exception 'Invalid recipient'; end if;
  if public.lifebree_is_blocked_between(v_actor, p_recipient_id) then raise exception 'This relationship is unavailable'; end if;
  if public.lifebree_are_friends(v_actor, p_recipient_id) then raise exception 'You are already friends'; end if;
  if exists (select 1 from public.lifebree_friendships f
             where f.status = 'pending'
               and ((f.requester_id = v_actor and f.recipient_id = p_recipient_id)
                 or (f.requester_id = p_recipient_id and f.recipient_id = v_actor))) then
    raise exception 'A friendship request already exists';
  end if;
  insert into public.lifebree_friendships(requester_id, recipient_id)
  values (v_actor, p_recipient_id) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.lifebree_respond_friend_request(p_request_id uuid, p_accept boolean)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  update public.lifebree_friendships
     set status = case when p_accept then 'accepted' else 'declined' end,
         updated_at = pg_catalog.now()
   where id = p_request_id and recipient_id = v_actor and status = 'pending';
  if not found then raise exception 'Pending request not found'; end if;
end;
$$;

create or replace function public.lifebree_remove_friend(p_friend_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  delete from public.lifebree_friendships
   where status = 'accepted'
     and ((requester_id = v_actor and recipient_id = p_friend_id)
       or (requester_id = p_friend_id and recipient_id = v_actor));
end;
$$;

create or replace function public.lifebree_follow(p_user_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if p_user_id is null or p_user_id = v_actor then raise exception 'Invalid account'; end if;
  if public.lifebree_is_blocked_between(v_actor, p_user_id) then raise exception 'This relationship is unavailable'; end if;
  insert into public.lifebree_follows(follower_id, followed_id)
  values (v_actor, p_user_id) on conflict do nothing;
end;
$$;

create or replace function public.lifebree_unfollow(p_user_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from public.lifebree_follows where follower_id = auth.uid() and followed_id = p_user_id;
end;
$$;

create or replace function public.lifebree_block_user(p_user_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if p_user_id is null or p_user_id = v_actor then raise exception 'Invalid account'; end if;
  insert into public.lifebree_blocks(blocker_id, blocked_id) values (v_actor, p_user_id)
  on conflict do nothing;
  delete from public.lifebree_follows
   where (follower_id = v_actor and followed_id = p_user_id)
      or (follower_id = p_user_id and followed_id = v_actor);
  delete from public.lifebree_friendships
   where (requester_id = v_actor and recipient_id = p_user_id)
      or (requester_id = p_user_id and recipient_id = v_actor);
end;
$$;

create or replace function public.lifebree_unblock_user(p_user_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from public.lifebree_blocks where blocker_id = auth.uid() and blocked_id = p_user_id;
end;
$$;

-- No direct writes to relationship or audience tables: use the checked RPCs.
revoke all on public.lifebree_friendships, public.lifebree_follows, public.lifebree_blocks,
  public.lifebree_content_audiences, public.lifebree_content_audience_members from anon, authenticated;
grant select on public.lifebree_friendships, public.lifebree_follows, public.lifebree_blocks,
  public.lifebree_content_audiences, public.lifebree_content_audience_members to authenticated;

revoke all on function public.lifebree_is_blocked_between(uuid,uuid) from public, anon;
revoke all on function public.lifebree_are_friends(uuid,uuid) from public, anon;
revoke all on function public.lifebree_can_view_audience(uuid,text,text,uuid) from public, anon;
revoke all on function public.lifebree_send_friend_request(uuid) from public, anon;
revoke all on function public.lifebree_respond_friend_request(uuid,boolean) from public, anon;
revoke all on function public.lifebree_remove_friend(uuid) from public, anon;
revoke all on function public.lifebree_follow(uuid) from public, anon;
revoke all on function public.lifebree_unfollow(uuid) from public, anon;
revoke all on function public.lifebree_block_user(uuid) from public, anon;
revoke all on function public.lifebree_unblock_user(uuid) from public, anon;

grant execute on function public.lifebree_is_blocked_between(uuid,uuid) to authenticated;
grant execute on function public.lifebree_are_friends(uuid,uuid) to authenticated;
grant execute on function public.lifebree_can_view_audience(uuid,text,text,uuid) to anon, authenticated;
grant execute on function public.lifebree_send_friend_request(uuid) to authenticated;
grant execute on function public.lifebree_respond_friend_request(uuid,boolean) to authenticated;
grant execute on function public.lifebree_remove_friend(uuid) to authenticated;
grant execute on function public.lifebree_follow(uuid) to authenticated;
grant execute on function public.lifebree_unfollow(uuid) to authenticated;
grant execute on function public.lifebree_block_user(uuid) to authenticated;
grant execute on function public.lifebree_unblock_user(uuid) to authenticated;
