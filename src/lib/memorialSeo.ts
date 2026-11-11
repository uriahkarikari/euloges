import { createClient } from "@/lib/supabase/server";

export type MemorialSeoRecord = {
  id: string;
  name: string;
  biography: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  portrait_url: string | null;
  privacy: "public" | "family";
  status: "draft" | "published" | "archived";
  allow_search_indexing: boolean;
};

export async function getMemorialSeoRecord(
  id: string,
): Promise<MemorialSeoRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memorials")
    .select(`
      id,
      name,
      biography,
      date_of_birth,
      date_of_death,
      portrait_url,
      privacy,
      status,
      allow_search_indexing
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Unable to load memorial SEO data:", error);
    return null;
  }

  return data as MemorialSeoRecord | null;
}

export function canIndexMemorial(
  memorial: MemorialSeoRecord,
): boolean {
  return (
    memorial.status === "published" &&
    memorial.privacy === "public" &&
    memorial.allow_search_indexing === true
  );
}
