# Euloges / Lifebree production database reconciliation

## Target project

- Supabase project ref: `oqecxzcnpceqxvsylhcp`
- This is the existing Euloges project.
- SegUah BookSwap remains in its separate project. Do not run any Euloges migration against the BookSwap project.

## Read-only production observations (2026-11-23)

The Euloges project contains the existing memorial tables and data. Its migration ledger currently records:

- `20261009190000_add_legacy_profiles`
- `20261025030000_idempotent_memorial_creation`

The live `public.memorials` schema also contains `allow_search_indexing boolean not null default false`. The live database has the 12-argument overloads of `create_memorial_idempotently` and `save_memorial_atomically`, both SECURITY INVOKER with an empty search_path. These correspond to the repository migration `20261110190000_add_memorial_search_indexing.sql`, but that version is absent from the migration ledger returned by Supabase.

This is migration-history/schema drift. It is not safe to infer whether the search-indexing migration was applied manually, through a different deployment path, or whether migration history was later altered. Do not blindly push the file or mark it applied without reconciling its complete effects.

## Reconciliation procedure

1. Take/verify a current Supabase backup before any production DDL.
2. Compare the complete live definitions of the affected columns, constraints, indexes, functions, function grants, triggers and policies with the exact SQL in `20261110190000_add_memorial_search_indexing.sql`.
3. Confirm the exact migration ledger schema/version representation and the Supabase CLI's expected migration workflow for this project.
4. If every statement's effect is present and equivalent, prepare a reviewed migration-history repair/baseline step for the missing version. Do not re-run the DDL merely to make the ledger look complete.
5. If any effect is absent or differs, prepare an idempotent forward-only corrective migration. Do not edit or delete existing memorial data.
6. Test the proposed sequence against a disposable database restored from a backup or a separate staging project before production.
7. Apply only after a final diff, backup verification and explicit deployment approval.

## Existing migration state

The repository migrations for invitations, invitation image storage, social feeds and post-media storage are not present in the production schema and are not recorded as applied. They remain pending.

The social-relationships migration is also pending and must not be deployed in its current form.

## Social-relationships migration review blockers

The current `20261124100000_add_lifebree_social_relationships.sql` needs a security revision before deployment:

- `lifebree_can_view_audience` is an exposed SECURITY DEFINER function that accepts caller-supplied owner/resource identifiers. Authenticated callers can potentially use it as a relationship/audience oracle for arbitrary accounts and resource IDs.
- The generic audience table permits resource types beyond those with implemented owner-validation workflows. The comments defer validation to owning features, but no owner-validated audience-write RPC exists yet.
- The internal SECURITY DEFINER graph helpers should not be directly callable by ordinary clients unless a specific use case requires it. Keep helper execution privileges as narrow as possible while ensuring RLS policy evaluation works.
- Selected-friend audience membership needs a server-side check that the audience belongs to the authenticated owner, the resource belongs to that owner, and each selected member is an accepted friend and not blocked.
- The final Euloges authorization rule must remain the intersection of existing memorial status/privacy/family/invitation/guest rules and the new social audience. Do not replace existing Euloges policies.

## Deployment boundaries

- Do not drop, truncate, recreate or overwrite existing Euloges memorial tables.
- Do not modify the SegUah BookSwap Supabase project.
- Do not deploy the pending migrations until staging tests cover anonymous visitors, owners, family/invited guests, accepted friends, pending friends, followers, followed accounts, selected friends, unrelated accounts and both sides of a block.
- No production database changes were made during this audit.
