-- Euloges: legacy profile foundation
-- Extends existing memorials without replacing them.

CREATE TABLE public.legacy_profiles (
    memorial_id uuid PRIMARY KEY
        REFERENCES public.memorials(id) ON DELETE CASCADE,

    known_as text,
    associated_place text,

    entry_mode text NOT NULL
        CHECK (entry_mode IN ('preserve', 'remember')),

    life_state text NOT NULL
        CHECK (life_state IN ('living', 'deceased', 'unknown')),

    phase text NOT NULL
        CHECK (phase IN ('living', 'remembrance', 'continuing')),

    legacy_status text NOT NULL DEFAULT 'founding'
        CHECK (legacy_status IN ('founding', 'established', 'continuing')),

    visibility text NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('private', 'invited', 'public')),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.legacy_profiles IS
    'Legacy-specific metadata associated with existing Euloges memorials.';

-- Enable row-level security.
ALTER TABLE public.legacy_profiles ENABLE ROW LEVEL SECURITY;

-- Owners can view their own legacy profiles.
CREATE POLICY legacy_profiles_owner_select
ON public.legacy_profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.memorials m
        WHERE m.id = legacy_profiles.memorial_id
          AND m.owner_id = (SELECT auth.uid())
    )
);

-- Owners can create a legacy profile for their own memorial.
CREATE POLICY legacy_profiles_owner_insert
ON public.legacy_profiles
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.memorials m
        WHERE m.id = legacy_profiles.memorial_id
          AND m.owner_id = (SELECT auth.uid())
    )
);

-- Owners can update their own legacy profiles.
CREATE POLICY legacy_profiles_owner_update
ON public.legacy_profiles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.memorials m
        WHERE m.id = legacy_profiles.memorial_id
          AND m.owner_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.memorials m
        WHERE m.id = legacy_profiles.memorial_id
          AND m.owner_id = (SELECT auth.uid())
    )
);

-- Owners can delete their own legacy profiles.
CREATE POLICY legacy_profiles_owner_delete
ON public.legacy_profiles
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.memorials m
        WHERE m.id = legacy_profiles.memorial_id
          AND m.owner_id = (SELECT auth.uid())
    )
);

-- Public visibility requires both the legacy profile and
-- its associated memorial to be public and published.
CREATE POLICY legacy_profiles_public_select
ON public.legacy_profiles
FOR SELECT
TO anon, authenticated
USING (
    visibility = 'public'
    AND EXISTS (
        SELECT 1
        FROM public.memorials m
        WHERE m.id = legacy_profiles.memorial_id
          AND m.status = 'published'::public.memorial_status
          AND m.privacy = 'public'::public.memorial_privacy
    )
);
