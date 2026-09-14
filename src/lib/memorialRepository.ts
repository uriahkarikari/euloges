import { createClient } from "@/lib/supabase/client";

export type MemorialStatus = "draft" | "published" | "archived";
export type MemorialPrivacy = "public" | "family";

export type MemorialListItem = {
  id: string;
  name: string;
  status: "draft" | "published" | "archived";
  privacy: "public" | "family";
  portraitUrl: string;
  publishedAt: string | null;
  updatedAt: string;
};

export type CreateMemorialInput = {
  name: string;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  biography?: string | null;
  portraitUrl?: string | null;
  privacy?: MemorialPrivacy;
};

export type UpdateMemorialInput = {
  name?: string;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  biography?: string | null;
  portraitUrl?: string | null;
  privacy?: MemorialPrivacy;
  status?: MemorialStatus;
  publishedAt?: string | null;
};

export type MemorialRecord = {
  id: string;
  owner_id: string;
  slug: string | null;
  name: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  biography: string | null;
  portrait_url: string | null;
  privacy: MemorialPrivacy;
  status: MemorialStatus;
  family_access_code: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function createMemorial(
  input: CreateMemorialInput,
): Promise<MemorialRecord> {
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

  const { data, error } = await supabase
    .from("memorials")
    .insert({
      owner_id: user.id,
      name: input.name.trim(),
      date_of_birth: input.dateOfBirth || null,
      date_of_death: input.dateOfDeath || null,
      biography: input.biography?.trim() || null,
      portrait_url: input.portraitUrl || null,
      privacy: input.privacy ?? "public",
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as MemorialRecord;
}

export async function getMemorial(id: string): Promise<MemorialRecord | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as MemorialRecord | null;
}

export async function updateMemorial(
  id: string,
  input: UpdateMemorialInput,
): Promise<MemorialRecord> {
  const supabase = createClient();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    updates.name = input.name.trim();
  }

  if (input.dateOfBirth !== undefined) {
    updates.date_of_birth = input.dateOfBirth || null;
  }

  if (input.dateOfDeath !== undefined) {
    updates.date_of_death = input.dateOfDeath || null;
  }

  if (input.biography !== undefined) {
    updates.biography = input.biography?.trim() || null;
  }

  if (input.portraitUrl !== undefined) {
    updates.portrait_url = input.portraitUrl || null;
  }

  if (input.privacy !== undefined) {
    updates.privacy = input.privacy;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  if (input.publishedAt !== undefined) {
    updates.published_at = input.publishedAt;
  }

  const { data, error } = await supabase
    .from("memorials")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as MemorialRecord;
}

export async function publishMemorial(id: string): Promise<MemorialRecord> {
  return updateMemorial(id, {
    status: "published",
    publishedAt: new Date().toISOString(),
  });
}

export async function unpublishMemorial(id: string): Promise<MemorialRecord> {
  return updateMemorial(id, {
    status: "draft",
    publishedAt: null,
  });
}

export async function listUserMemorials(): Promise<MemorialListItem[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to view memorials.");
  }

  const { data, error } = await supabase
    .from("memorials")
    .select(
      `
        id,
        name,
        status,
        privacy,
        portrait_url,
        published_at,
        updated_at
      `,
    )
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    privacy: row.privacy,
    portraitUrl: row.portrait_url ?? "",
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }));
}
