# Euloges integration plan: legacy + funeral/condolence app

## Goal
Unify the funeral brochure, condolence-book, and tribute workflows from the original Euloges app with the broader legacy and generational-continuity experience.

## Repositories
- Integration target: https://github.com/uriahkarikari/euloges
- Legacy reference: https://github.com/uriahkarikari/Euloges-

## Integration approach
Use the current `euloges` repository as the production target and the legacy repository as the source of additional features. Do not replace the target wholesale.

The legacy app already includes condolence-book routes, remembrance creation and drafts, legacy pages, stewardship, continuity management, ceremony programmes, trust/provenance workflows, and a Supabase Auth ↔ Prisma User bridge. It also uses Prisma 7 with PostgreSQL, whereas the current target uses Supabase-backed repositories and browser/local persistence for parts of the funeral brochure and condolence flows.

## Recommended phases
1. **Baseline and safety**
   - Keep this integration on a dedicated branch until local checks pass.
   - Preserve the target's existing public brochure URLs, authentication routes, dashboard flows, print layouts, and Supabase repository code.
   - Record the deployed Vercel project and environment settings before changing the app root.

2. **Move to the legacy application architecture**
   - Migrate the legacy app's `apps/web/src` routes/components/server modules into the target root's `src/` only after path aliases and route overlap are reconciled.
   - Update the target root `package.json`/lockfile for Prisma 7, `@prisma/adapter-pg`, `pg`, `dotenv`, `tsx`, and `prisma` as appropriate.
   - Add the legacy Prisma schema, config and all migrations to the target repository in the correct root-relative locations.
   - Keep Supabase Auth as the login provider; the legacy app bridges the authenticated Supabase identity to its Prisma User records.

3. **Resolve overlapping functionality**
   - Map existing brochure creation/public URLs into the legacy public legacy/remembrance model.
   - Preserve current funeral brochure, print brochure, condolence book, and tributes experiences as existing workflows while introducing the legacy equivalents.
   - Use a migration/adapter layer rather than dropping or silently replacing existing data tables or storage.
   - Avoid exposing legacy/management features until permission checks and the user-to-legacy membership relationship are verified.

4. **Database and environment**
   - Confirm the intended production PostgreSQL database and the current Supabase project before applying any schema migrations.
   - Configure `DATABASE_URL` and `DIRECT_URL` only in local/Vercel environment settings; never commit secrets.
   - Review schema migrations against the existing live database before deploying. Do not run destructive resets in production.

5. **Verification**
   - Install dependencies and run Prisma generate, lint, typecheck/build.
   - Test sign-up, email login, Google login/callback, sign-out, public brochure, print brochure, condolence book submission/visibility/moderation, remembrance drafts, legacy creation/viewing, stewardship invitation/acceptance, continuity designation, and access denial.
   - Check deployed routes and Vercel build logs before merging to `main`.

## Important blockers / verification needed
The GitHub connector can read and write repository files, branches and pull requests, but cannot run npm builds or test against the live database. Before this plan is converted into code, the full migration should be performed in a local clone or a build-enabled coding environment where TypeScript, Prisma generation, and end-to-end routes can actually be validated.

## Architecture decision
Prefer the legacy app's domain model and layout for the unified platform because it already includes the new continuity features and a unified Supabase Auth/Prisma identity strategy. However, port over any current-app workflows that are not represented in the legacy app, rather than replacing them blindly.
