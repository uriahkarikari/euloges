import { createClient } from "@/lib/supabase/client";

import type { BrochureDraft, BrochureSection } from "@/types/brochure";



type MemorialRow = {
  id: string;
  owner_id: string;
  name: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  biography: string | null;
  portrait_url: string | null;
  privacy: "public" | "family";
  allow_search_indexing: boolean;
  family_access_code: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type MemorialSectionRow = {
  id: string;
  memorial_id: string;
  title: string;
  content: string;
  position: number;
  created_at: string;
  updated_at: string;
};

function mapMemorialToBrochure(
  memorial: MemorialRow,
  sections: MemorialSectionRow[],
): BrochureDraft {
  return {
    id: memorial.id,
    name: memorial.name,
    dob: memorial.date_of_birth ?? "",
    dod: memorial.date_of_death ?? "",
    bio: memorial.biography ?? "",
    portraitUrl: memorial.portrait_url ?? "",

    sections: sections
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
      })),

    privacy: memorial.privacy,
    accessCode: memorial.family_access_code ?? "",
    allowSearchIndexing: memorial.allow_search_indexing ?? false,

    status: memorial.status === "published" ? "published" : "draft",

    publishedAt: memorial.published_at,

    updatedAt: memorial.updated_at,
  };
}


export async function createBrochureInSupabase(
  draft: BrochureDraft,
  creationRequestId: string,
): Promise<BrochureDraft> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to create a memorial.");
  }

  const { data: memorialId, error: creationError } = await supabase.rpc(
    "create_memorial_idempotently",
    {
      p_creation_request_id: creationRequestId,
      p_name: draft.name.trim() || "Untitled Memorial",
      p_date_of_birth: draft.dob || null,
      p_date_of_death: draft.dod || null,
      p_biography: draft.bio.trim() || null,
      p_portrait_url: draft.portraitUrl || null,
      p_privacy: draft.privacy,
      p_family_access_code: draft.accessCode || null,
      p_status: draft.status,
      p_published_at: draft.publishedAt,
      p_sections: draft.sections.map((section) => ({
        title: section.title,
        content: section.content,
      })),
     p_allow_search_indexing: draft.allowSearchIndexing ?? false,
    },
  );

  if (creationError) {
    throw creationError;
  }

  if (typeof memorialId !== "string" || !memorialId) {
    throw new Error("Memorial creation returned no memorial ID.");
  }

  const saved = await loadOwnerBrochureFromSupabase(memorialId);

  if (!saved) {
    throw new Error("Created memorial could not be reloaded.");
  }

  return saved;
}

export async function loadBrochureFromSupabase(
  id: string,
): Promise<BrochureDraft | null> {
  const supabase = createClient();

  const { data: memorial, error: memorialError } = await supabase
    .from("memorials")
    .select(`
      id,
      owner_id,
      name,
      date_of_birth,
      date_of_death,
      biography,
      portrait_url,
      privacy,
      allow_search_indexing,
      status,
      published_at,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (memorialError) {
    throw memorialError;
  }

  if (!memorial) {
    return null;
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("memorial_sections")
    .select("*")
    .eq("memorial_id", id)
    .order("position", {
      ascending: true,
    });

  if (sectionsError) {
    throw sectionsError;
  }

  return mapMemorialToBrochure(
    {
      ...memorial,
      family_access_code: null,
    } as MemorialRow,
    (sections ?? []) as MemorialSectionRow[],
  );
}

export async function loadOwnerBrochureFromSupabase(
  id: string,
): Promise<BrochureDraft | null> {
  const supabase = createClient();

  const { data: memorial, error: memorialError } = await supabase
    .from("memorials")
    .select(`
      id,
      owner_id,
      name,
      date_of_birth,
      date_of_death,
      biography,
      portrait_url,
      privacy,
      allow_search_indexing,
      family_access_code,
      status,
      published_at,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (memorialError) {
    throw memorialError;
  }

  if (!memorial) {
    return null;
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("memorial_sections")
    .select("*")
    .eq("memorial_id", id)
    .order("position", {
      ascending: true,
    });

  if (sectionsError) {
    throw sectionsError;
  }

  return mapMemorialToBrochure(
    memorial as MemorialRow,
    (sections ?? []) as MemorialSectionRow[],
  );
}

export async function saveBrochureToSupabase(
  draft: BrochureDraft,
): Promise<BrochureDraft> {
  const supabase = createClient();

  const { error } = await supabase.rpc("save_memorial_atomically", {
    p_memorial_id: draft.id,
    p_name: draft.name.trim() || "Untitled Memorial",
    p_date_of_birth: draft.dob || null,
    p_date_of_death: draft.dod || null,
    p_biography: draft.bio.trim() || null,
    p_portrait_url: draft.portraitUrl || null,
    p_privacy: draft.privacy,
    p_family_access_code: draft.accessCode || null,
    p_status: draft.status,
    p_published_at: draft.publishedAt,
    p_sections: draft.sections.map((section) => ({
      title: section.title,
      content: section.content,
    })),
    p_allow_search_indexing: draft.allowSearchIndexing ?? false,
  });

  if (error) {
    throw error;
  }

  const saved = await loadOwnerBrochureFromSupabase(draft.id);

  if (!saved) {
    throw new Error("Saved memorial could not be reloaded.");
  }

  return saved;
}
