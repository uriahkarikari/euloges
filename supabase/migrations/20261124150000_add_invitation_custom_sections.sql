-- Add reusable, ordered custom content sections to Lifebree invitations.
-- Existing invitations receive an empty array and remain unchanged.
alter table public.invitations
  add column if not exists sections jsonb not null default '[]'::jsonb;

alter table public.invitations
  drop constraint if exists invitations_sections_must_be_array;

alter table public.invitations
  add constraint invitations_sections_must_be_array
  check (jsonb_typeof(sections) = 'array');
