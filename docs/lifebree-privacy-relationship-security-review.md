# Lifebree privacy and relationship system — security review

**Status:** design review in progress  
**Target base:** `lifebree-integrated-release`  
**Production impact:** none. No migration has been applied and no production data or policies have been changed.

## 1. Decisions already agreed

### Relationship model
- Friendship is mutual and exists only after the recipient accepts a request.
- Following is one-way and does not create a friendship.
- Blocking is one-way as an action, but its access effect is mutual: either direction of a block prevents the two accounts from interacting through the social graph or seeing one another's audience-restricted content.
- Blocking removes existing follows and friendship requests/accepted friendships in both directions.
- Unblocking does not automatically restore former follows or friendships.

### Audience choices
1. **Public** — anyone, including signed-out visitors, subject to the resource's own publication rules.
2. **Friends only** — accepted mutual friends.
3. **Following** — accounts the content owner follows.
4. **Followers** — accounts following the content owner.
5. **Selected friends** — selected members of the owner's accepted-friend list.
6. **Only me** — the owner only.

The terms Following and Followers must retain these exact directions. Default visibility must remain private / owner-only unless the product's existing feature has a more restrictive family or invitation rule.

### Existing Euloges boundaries
- A social audience is an additional gate, never a replacement for a feature's existing authorization.
- Memorial status, memorial privacy, family access, invited access, guest links/codes, and unauthenticated guest workflows must remain intact.
- Personal Archive and Family Archive ownership/access remain separate. Joining a shared archive does not grant access to another member's private personal archive.
- A share link does not independently grant access.
- Reposts cannot widen the source post's audience.
- This work must not change invitation publication or guest RSVP permissions.

## 2. Review of the existing PR #9 migration

Source reviewed: PR #9, branch `lifebree-social-relationships-foundation`, migration `20261124100000_add_lifebree_social_relationships.sql`. This migration is **not approved for deployment or merge** in its current form.

### Critical: authorization oracle exposed to clients
`public.lifebree_can_view_audience(owner_id, audience, resource_type, resource_id)` is SECURITY DEFINER and executable by both anon and authenticated. A caller can supply arbitrary owner IDs and resource identifiers and use the boolean response to probe relationship state. For non-selected audiences, the function does not prove that the resource exists or belongs to the supplied owner. For public audiences, a non-null owner ID is enough to return true.

The helper functions `lifebree_is_blocked_between` and `lifebree_are_friends` are also SECURITY DEFINER and executable by authenticated users with arbitrary account IDs. They expose relationship/block-state oracles.

**Required correction:** do not expose generic relationship or audience predicates as public RPCs. Authorization helpers must accept a resource identifier, resolve its owner from a trusted resource table, and be kept in a non-API-exposed schema. Prefer narrow per-resource helpers or explicit policy expressions where the owner can be derived safely. Never accept a client-supplied owner ID as authority.

### Critical: selected-audience ownership is not enforced
The audience table accepts a client-supplied `owner_id` and generic `resource_type/resource_id`. The SQL comments defer resource-owner validation to future feature code, but no owner-validated RPC exists. A forged row could associate an arbitrary account with another user's resource if a future write path is added carelessly.

**Required correction:** no direct table writes. A single owner-validated transaction/RPC per supported resource family must load the resource, derive its owner, verify the caller is that owner, validate audience type, validate every selected member is an accepted friend and not blocked, and atomically replace the audience and member rows. Unsupported resource types must be rejected, not accepted as free-form labels.

### High: helpers and schema exposure
The current migration grants execute on graph inspection helpers to authenticated users. Revoking PUBLIC/anon alone does not make these helpers private.

**Required correction:** keep internal authorization functions outside PostgREST-exposed schemas, restrict schema usage and function execute grants to the minimum necessary, and test actual API reachability as anon and authenticated. Write RPCs may be exposed only when they derive the actor from `auth.uid()`, validate all inputs, and perform one narrowly scoped operation.

### High: existing content policies are not integrated
The current feed migration allows public posts to be read publicly and private posts only by their author. Likes, comments and reposts are visible only with public posts. PR #9 does not change these policies, which is safe as a non-integrated foundation, but it also means the six audiences are not yet enforced on feed content.

**Required correction:** introduce resource-specific RLS policies only after the source row, owner, comments, likes, reposts, media and storage access paths have been mapped and tested. Private post engagement must not leak through child tables or storage URLs.

### Additional correctness and abuse considerations
- The unique friendship-pair index prevents a second request after a declined request. Define an explicit re-request policy and implement it transactionally.
- Request and follow RPCs should return generic errors where account-existence disclosure is unnecessary; add abuse/rate controls before public discovery and notifications.
- Relationship list queries must not accidentally expose private follower/following or block data beyond the intended account.
- A block must take effect across feed rows, profile discovery, comments, likes, reposts, media, search, notifications and future content surfaces—not only the top-level post.
- A repost must resolve authorization against the original post on every read. A repost cannot turn a private source into a public copy.
- All security-definer functions require a fixed empty search_path, schema-qualified object references, explicit grants, and tests for ownership/actor spoofing.
- Avoid broad blanket revokes or edits to existing Euloges functions/policies as part of this feature.

## 3. Target authorization architecture

### Layer A — relationship graph
Tables for friendships, follows and blocks are private implementation data with RLS enabled. Clients use narrowly scoped RPCs for writes:
- send friendship request;
- accept/decline a request addressed to the caller;
- remove an accepted friendship involving the caller;
- follow/unfollow as the caller;
- block/unblock as the caller.

Every write derives the actor from `auth.uid()`. The client never supplies the actor ID. Self-relations and blocked relations are rejected. Blocking and relationship cleanup occur in one transaction. Unblocking does not restore deleted relationships.

### Layer B — resource-specific audience metadata
Audience metadata is keyed by a real resource and its owner is derived from that resource. The generic client-supplied `owner_id` pattern from PR #9 is not accepted.

For every supported resource, an owner-only operation must:
1. Load and lock the resource row.
2. Derive the actual owner from the resource row.
3. Verify the caller is that owner.
4. Validate one of the six canonical audiences.
5. For selected friends, verify every selected account is an accepted friend and neither side is blocked.
6. Replace the audience and member list atomically.
7. Reject nonexistent resources and unsupported resource types.

No client direct INSERT/UPDATE/DELETE access is granted to audience tables.

### Layer C — read authorization
For signed-out visitors, only explicitly public content that also passes the owning feature's publication rules is visible.

For signed-in visitors:
- the owner may read their own resource;
- otherwise a block in either direction denies access;
- the selected audience rule must pass;
- then all existing feature-specific requirements must also pass.

The audience helper must not accept a caller-supplied owner ID. It must resolve the resource and owner from trusted tables. Keep internal helper functions in a schema not exposed through the Supabase REST API. Confirm this with API-level tests, not just SQL grants.

### Layer D — feature-by-feature rollout
1. **Lifestyle and Legacy posts:** migrate top-level post read policy first, then comments, likes, reposts, and media/storage access.
2. **Legacy profiles and memorials:** map the exact existing privacy/status/family/invited/guest paths before adding a social gate. The final condition is an intersection, not an OR that broadens access.
3. **Tributes, condolence books/entries, candles, events and sections:** review each table's ownership and guest flow before changing any policy.
4. **Archives:** keep Personal Archive private ownership separate from Family Archive membership and permissions.
5. **Invitations:** leave existing public published invitation and guest RSVP policies unchanged in this workstream.

## 4. Required test strategy

Use a disposable local/staging database only. Do not apply the current PR #9 migration to production.

Test identities:
- anonymous visitor;
- resource owner;
- accepted friend;
- pending requester;
- follower;
- followed account;
- selected friend;
- unrelated signed-in account;
- account blocked by owner;
- account that blocked owner.

Test every audience against every identity, including both block directions. Also test:
- forged owner ID and forged resource ID;
- nonexistent resource;
- selected member who is not a friend;
- selected member who becomes blocked or unfriended;
- owner attempts to set another user's resource audience;
- direct table writes as anon/authenticated;
- direct RPC invocation and PostgREST schema exposure;
- comments, likes, reposts, media and storage URLs for inaccessible source content;
- memorial owner, family member, invited guest, access-code guest, anonymous visitor and unrelated account;
- existing invitation RSVP as signed-out guest.

Tests must assert both allowed and denied outcomes. A UI hiding a button is not a security test; the database/API must reject unauthorized reads and writes.

## 5. Work sequence

1. Keep PR #9 draft and unapplied as a historical proposal; do not merge it.
2. Finish inventory of live/local table definitions and RLS policies for every Euloges resource, including the production schema snapshot already exported for read-only review.
3. Design a new migration with private, resource-derived authorization and owner-validated audience writes.
4. Add SQL tests and API-level authorization tests before adding UI.
5. Implement feed audience enforcement first, then Legacy/Euloges only after their existing permission paths are proven preserved.
6. Build relationship management and audience selector UI after the database contract is stable.
7. Apply only to local/disposable environment until the complete test matrix passes and a separate production migration plan is approved.

## 6. Explicit non-goals for this review branch

- No production SQL or storage changes.
- No modification of current memorial, legacy, condolence, invitation or archive RLS policies.
- No social UI rollout.
- No migration deployment.
- No changes to BookSwap or its Supabase project.
