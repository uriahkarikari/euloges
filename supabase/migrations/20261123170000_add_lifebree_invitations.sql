-- Lifebree invitations: standalone invitations and guest RSVPs.
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  host_name text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_name text,
  venue_address text,
  map_url text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  allow_guest_messages boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invitations_creator_created_idx on public.invitations(creator_id, created_at desc);
create index if not exists invitations_public_start_idx on public.invitations(starts_at) where status = 'published';
create table if not exists public.invitation_rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_name text not null,
  guest_email text,
  attending boolean not null,
  party_size integer not null default 1 check (party_size between 1 and 20),
  message text,
  created_at timestamptz not null default now()
);
create index if not exists invitation_rsvps_invitation_idx on public.invitation_rsvps(invitation_id, created_at desc);
alter table public.invitations enable row level security;
alter table public.invitation_rsvps enable row level security;
create policy "Creators manage their invitations" on public.invitations for all to authenticated
using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));
create policy "Anyone can view published invitations" on public.invitations for select to anon, authenticated using (status = 'published');
create policy "Creators view invitation RSVPs" on public.invitation_rsvps for select to authenticated
using (exists (select 1 from public.invitations i where i.id = invitation_id and i.creator_id = (select auth.uid())));
create policy "Guests can RSVP to published invitations" on public.invitation_rsvps for insert to anon, authenticated
with check (length(trim(guest_name)) between 1 and 120 and party_size between 1 and 20 and exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published'));
grant select, insert, update, delete on public.invitations to authenticated;
grant select on public.invitations to anon;
grant select on public.invitation_rsvps to authenticated;
grant insert on public.invitation_rsvps to anon, authenticated;
