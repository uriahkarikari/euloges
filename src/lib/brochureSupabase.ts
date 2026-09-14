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

    status: memorial.status === "published" ? "published" : "draft",

    publishedAt: memorial.published_at,

    updatedAt: memorial.updated_at,
  };
}

export async function createBrochureInSupabase(
  draft: BrochureDraft,
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

  const { data: memorial, error: memorialError } = await supabase
    .from("memorials")
    .insert({
      owner_id: user.id,
      name: draft.name.trim() || "Untitled Memorial",
      date_of_birth: draft.dob || null,
      date_of_death: draft.dod || null,
      biography: draft.bio.trim() || null,
      portrait_url: draft.portraitUrl || null,
      privacy: draft.privacy,
      family_access_code: draft.accessCode || null,
      status: draft.status,
      published_at: draft.publishedAt,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (memorialError) {
    throw memorialError;
  }

  const sectionRows = draft.sections.map((section, position) => ({
    memorial_id: memorial.id,
    title: section.title,
    content: section.content,
    position,
  }));

  if (sectionRows.length > 0) {
    const { error: sectionError } = await supabase
      .from("memorial_sections")
      .insert(sectionRows);

    if (sectionError) {
      throw sectionError;
    }
  }

  return loadBrochureFromSupabase(memorial.id).then((result) => {
    if (!result) {
      throw new Error("Created memorial could not be reloaded.");
    }

    return result;
  });
}

export async function loadBrochureFromSupabase(
  id: string,
): Promise<BrochureDraft | null> {
  const supabase = createClient();

  const { data: memorial, error: memorialError } = await supabase
    .from("memorials")
    .select("*")
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

  const now = new Date().toISOString();

  const { data: memorial, error: memorialError } = await supabase
    .from("memorials")
    .update({
      name: draft.name.trim() || "Untitled Memorial",
      date_of_birth: draft.dob || null,
      date_of_death: draft.dod || null,
      biography: draft.bio.trim() || null,
      portrait_url: draft.portraitUrl || null,
      privacy: draft.privacy,
      family_access_code: draft.accessCode || null,
      status: draft.status,
      published_at: draft.publishedAt,
      updated_at: now,
    })
    .eq("id", draft.id)
    .select()
    .single();

  if (memorialError) {
    throw memorialError;
  }

  await replaceBrochureSections(draft.id, draft.sections);

  const { data: sections, error: sectionsError } = await supabase
    .from("memorial_sections")
    .select("*")
    .eq("memorial_id", draft.id)
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

async function replaceBrochureSections(
  memorialId: string,
  sections: BrochureSection[],
) {
  const supabase = createClient();

  const { error: deleteError } = await supabase
    .from("memorial_sections")
    .delete()
    .eq("memorial_id", memorialId);

  if (deleteError) {
    throw deleteError;
  }

  if (sections.length === 0) {
    return;
  }

  const rows = sections.map((section, position) => ({
    memorial_id: memorialId,
    title: section.title,
    content: section.content,
    position,
  }));

  const { error: insertError } = await supabase
    .from("memorial_sections")
    .insert(rows);

  if (insertError) {
    throw insertError;
  }
}
