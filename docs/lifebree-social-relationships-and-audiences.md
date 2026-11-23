# Lifebree social relationships and audience permissions

## Scope of this foundation

This migration introduces the shared social graph and a reusable audience authorization function. It does not yet connect the new rules to memorial, tribute, condolence, Legacy or Lifestyle records. That integration is deliberately deferred until each existing feature's RLS policies and guest/family access paths are audited.

## Relationship model

- Friendship is mutual and only exists after the recipient accepts a request.
- Following is directional and does not imply friendship.
- Blocking is directional, removes both-direction follow relationships and any friendship/request between the two accounts, and prevents future relationship actions while the block exists.
- Block checks apply in either direction to audience evaluation.
- A blocked user is not notified through this foundation; notification delivery is a later feature.

## Audience model

The canonical audience values are:

- `public`: anyone, including signed-out visitors, subject to the owning feature's own publication/access checks.
- `friends`: accepted mutual friendships.
- `following`: accounts the content owner follows.
- `followers`: accounts that follow the content owner.
- `selected_friends`: explicitly selected accepted friends for this resource.
- `only_me`: the owner only.

The UI should explain these labels in plain language. "Following" and "Followers" must not be interchanged.

Selected audiences are stored per typed resource in `lifebree_content_audiences` and `lifebree_content_audience_members`. Resource owners must be validated by the owning feature when audience rows are created. Do not let clients write these tables directly.

## Authorization

`lifebree_can_view_audience(owner_id, audience, resource_type, resource_id)` centralizes the relationship decision. It denies access when either account has blocked the other. It does not replace feature-specific checks.

For example, an Euloges memorial still needs its memorial status, existing privacy mode, owner/family/invitation rules, and any guest access conditions to pass. The final Euloges policy must be the intersection of those conditions and the social audience decision, not a replacement for them.

A link share never grants access by itself. Reposts must retain the source content's audience restrictions; a repost cannot widen the source audience.

## RPC surface

Use the security-definer RPCs for relationship writes:
- `lifebree_send_friend_request`
- `lifebree_respond_friend_request`
- `lifebree_remove_friend`
- `lifebree_follow` / `lifebree_unfollow`
- `lifebree_block_user` / `lifebree_unblock_user`

Direct writes to relationship and audience tables are revoked from anon/authenticated roles. This foundation intentionally does not include profile discovery, follow approval/private accounts, notifications, audience editor UI, or content integration.

## Required next integration work

1. Audit every existing RLS policy and public/guest access route for memorials, legacy_profiles, memorial_tributes, condolence_books, condolence_entries, candles, sections and events.
2. Decide how the existing Euloges `public/family` memorial privacy and legacy `private/invited/public` visibility map to the new audiences. Preserve existing family access codes/invites and unauthenticated guest workflows.
3. Add an owner-validated RPC for setting an audience and selected members.
4. Add friendship/follow/block management UI and profile privacy controls.
5. Integrate Lifestyle and Legacy posts with the shared authorization function, then Euloges only after policy tests pass.
6. Test anon, owner, accepted friend, pending friend, follower, followed account, selected friend, unrelated account and both sides of a block.

## Deployment

The migration is not applied to Supabase. Do not apply it until the SQL has been reviewed and tested against a disposable/staging database, including RLS tests.
