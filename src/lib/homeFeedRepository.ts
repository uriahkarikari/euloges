import { createClient } from "@/lib/supabase/client";

export type HomeFeedItem = {
  id: string;
  memorialId: string;
  memorialName: string;
  portraitUrl: string;
  contributorName: string;
  content: string;
  type: "memory" | "story" | "reflection" | "tribute" | "condolence";
  createdAt: string;
  candles: number;
  contributions: number;
};

type FeedRow = {
  id: string;
  memorial_id: string;
  name: string | null;
  message: string;
  message_type: "memory" | "story" | "reflection" | "tribute" | "condolence";
  created_at: string;
  memorials:
    | {
        name: string;
        portrait_url: string | null;
      }
    | {
        name: string;
        portrait_url: string | null;
      }[]
    | null;
};

export async function loadHomeFeed(): Promise<HomeFeedItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("memorial_tributes")
    .select(
      `
        id,
        memorial_id,
        name,
        message,
        message_type,
        created_at,
        memorials!inner (
        name,
        portrait_url,
        status,
        privacy
      )
      `,
    )
    .eq("approved", true)
    .eq("memorials.status", "published")
    .eq("memorials.privacy", "public")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FeedRow[];

  return Promise.all(
    rows.map(async (row) => {
      const memorial = Array.isArray(row.memorials)
        ? row.memorials[0]
        : row.memorials;

      const [candleResult, contributionResult] = await Promise.all([
        supabase
          .from("memorial_candles")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("memorial_id", row.memorial_id),

        supabase
          .from("memorial_tributes")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("memorial_id", row.memorial_id)
          .eq("approved", true),
      ]);

      if (candleResult.error) {
        throw candleResult.error;
      }

      if (contributionResult.error) {
        throw contributionResult.error;
      }

      return {
        id: row.id,
        memorialId: row.memorial_id,
        memorialName: memorial?.name ?? "Memorial",
        portraitUrl: memorial?.portrait_url ?? "",
        contributorName: row.name?.trim() || "Family",
        content: row.message,
        type: row.message_type,
        createdAt: row.created_at,
        candles: candleResult.count ?? 0,
        contributions: contributionResult.count ?? 0,
      };
    }),
  );
}
