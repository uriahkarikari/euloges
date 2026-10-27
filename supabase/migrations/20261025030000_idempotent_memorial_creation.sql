-- Euloges: retry-safe creation and atomic memorial saves.
-- Review locally. Do not apply until the migration and client code are verified.

ALTER TABLE public.memorials
  ADD COLUMN creation_request_id uuid;

ALTER TABLE public.memorials
  ADD CONSTRAINT memorials_owner_creation_request_key
  UNIQUE (owner_id, creation_request_id);


-- Create a memorial and its initial sections as one transaction.
CREATE OR REPLACE FUNCTION public.create_memorial_idempotently(
  p_creation_request_id uuid,
  p_name text,
  p_date_of_birth date,
  p_date_of_death date,
  p_biography text,
  p_portrait_url text,
  p_privacy public.memorial_privacy,
  p_family_access_code text,
  p_status public.memorial_status,
  p_published_at timestamptz,
  p_sections jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_owner_id uuid;
  v_memorial_id uuid;
  v_section jsonb;
  v_position integer := 0;
BEGIN
  v_owner_id := auth.uid();

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_creation_request_id IS NULL THEN
    RAISE EXCEPTION 'Creation request ID is required';
  END IF;

  IF p_sections IS NULL
     OR pg_catalog.jsonb_typeof(p_sections) <> 'array' THEN
    RAISE EXCEPTION 'Sections must be a JSON array';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_catalog.jsonb_array_elements(p_sections) AS item(value)
     WHERE pg_catalog.jsonb_typeof(item.value) IS DISTINCT FROM 'object'
      OR pg_catalog.jsonb_typeof(item.value->'title') IS DISTINCT FROM 'string'
      OR pg_catalog.jsonb_typeof(item.value->'content') IS DISTINCT FROM 'string'
  ) THEN
    RAISE EXCEPTION 'Each section must be an object with string title and content fields';
  END IF;

  INSERT INTO public.memorials (
    owner_id,
    creation_request_id,
    name,
    date_of_birth,
    date_of_death,
    biography,
    portrait_url,
    privacy,
    family_access_code,
    status,
    published_at,
    updated_at
  )
  VALUES (
    v_owner_id,
    p_creation_request_id,
    COALESCE(NULLIF(pg_catalog.btrim(p_name), ''), 'Untitled Memorial'),
    p_date_of_birth,
    p_date_of_death,
    NULLIF(pg_catalog.btrim(p_biography), ''),
    NULLIF(p_portrait_url, ''),
    p_privacy,
    NULLIF(p_family_access_code, ''),
    p_status,
    p_published_at,
    pg_catalog.now()
  )
  ON CONFLICT (owner_id, creation_request_id) DO NOTHING
  RETURNING id INTO v_memorial_id;

  IF v_memorial_id IS NULL THEN
    SELECT id
      INTO v_memorial_id
      FROM public.memorials
     WHERE owner_id = v_owner_id
       AND creation_request_id = p_creation_request_id;

    IF v_memorial_id IS NULL THEN
      RAISE EXCEPTION 'Unable to recover existing memorial';
    END IF;

    RETURN v_memorial_id;
  END IF;

  FOR v_section IN
    SELECT value
      FROM pg_catalog.jsonb_array_elements(p_sections)
  LOOP
    INSERT INTO public.memorial_sections (
      memorial_id, title, content, position
    )
    VALUES (
      v_memorial_id,
      COALESCE(v_section->>'title', ''),
      COALESCE(v_section->>'content', ''),
      v_position
    );

    v_position := v_position + 1;
  END LOOP;

  RETURN v_memorial_id;
END;
$function$;


-- Update memorial metadata and replace sections atomically.
CREATE OR REPLACE FUNCTION public.save_memorial_atomically(
  p_memorial_id uuid,
  p_name text,
  p_date_of_birth date,
  p_date_of_death date,
  p_biography text,
  p_portrait_url text,
  p_privacy public.memorial_privacy,
  p_family_access_code text,
  p_status public.memorial_status,
  p_published_at timestamptz,
  p_sections jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_owner_id uuid;
  v_section jsonb;
  v_position integer := 0;
  v_updated_count integer;
  v_existing_owner uuid;
BEGIN
  v_owner_id := auth.uid();

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_sections IS NULL
     OR pg_catalog.jsonb_typeof(p_sections) <> 'array' THEN
    RAISE EXCEPTION 'Sections must be a JSON array';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_catalog.jsonb_array_elements(p_sections) AS item(value)
     WHERE pg_catalog.jsonb_typeof(item.value) IS DISTINCT FROM 'object'
      OR pg_catalog.jsonb_typeof(item.value->'title') IS DISTINCT FROM 'string'
      OR pg_catalog.jsonb_typeof(item.value->'content') IS DISTINCT FROM 'string'
  ) THEN
    RAISE EXCEPTION 'Each section must be an object with string title and content fields';
  END IF;

  SELECT owner_id
    INTO v_existing_owner
    FROM public.memorials
   WHERE id = p_memorial_id
   FOR UPDATE;

  IF v_existing_owner IS NULL OR v_existing_owner <> v_owner_id THEN
    RAISE EXCEPTION 'Memorial not found or access denied';
  END IF;

  UPDATE public.memorials
     SET name = COALESCE(NULLIF(pg_catalog.btrim(p_name), ''), 'Untitled Memorial'),
         date_of_birth = p_date_of_birth,
         date_of_death = p_date_of_death,
         biography = NULLIF(pg_catalog.btrim(p_biography), ''),
         portrait_url = NULLIF(p_portrait_url, ''),
         privacy = p_privacy,
         family_access_code = NULLIF(p_family_access_code, ''),
         status = p_status,
         published_at = p_published_at,
         updated_at = pg_catalog.now()
   WHERE id = p_memorial_id
     AND owner_id = v_owner_id;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count <> 1 THEN
    RAISE EXCEPTION 'Memorial not found or access denied';
  END IF;

  DELETE FROM public.memorial_sections
   WHERE memorial_id = p_memorial_id;

  FOR v_section IN
    SELECT value
      FROM pg_catalog.jsonb_array_elements(p_sections)
  LOOP
    INSERT INTO public.memorial_sections (
      memorial_id, title, content, position
    )
    VALUES (
      p_memorial_id,
      COALESCE(v_section->>'title', ''),
      COALESCE(v_section->>'content', ''),
      v_position
    );

    v_position := v_position + 1;
  END LOOP;
END;
$function$;


REVOKE ALL ON FUNCTION public.create_memorial_idempotently(
  uuid, text, date, date, text, text,
  public.memorial_privacy, text,
  public.memorial_status, timestamptz, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_memorial_idempotently(
  uuid, text, date, date, text, text,
  public.memorial_privacy, text,
  public.memorial_status, timestamptz, jsonb
) TO authenticated;


REVOKE ALL ON FUNCTION public.save_memorial_atomically(
  uuid, text, date, date, text, text,
  public.memorial_privacy, text,
  public.memorial_status, timestamptz, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.save_memorial_atomically(
  uuid, text, date, date, text, text,
  public.memorial_privacy, text,
  public.memorial_status, timestamptz, jsonb
) TO authenticated;
