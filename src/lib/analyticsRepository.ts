import { createClient } from "@/lib/supabase/client";

export type MemorialAnalyticsRow = {
  memorialId: string;
  memorialName: string;
  views: number;
  qrScans: number;
};

export type AnalyticsSummary = {
  totalViews: number;
  totalQrScans: number;
  memorials: MemorialAnalyticsRow[];
};

type MemorialRow = {
  id: string;
  name: string;
};

type EventRow = {
  memorial_id: string;
  event_type: string;
};

export async function loadOwnerAnalytics(): Promise<AnalyticsSummary> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to view analytics.");
  }

  const { data: memorials, error: memorialsError } = await supabase
    .from("memorials")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (memorialsError) {
    throw memorialsError;
  }

  const typedMemorials = (memorials ?? []) as MemorialRow[];

  if (typedMemorials.length === 0) {
    return {
      totalViews: 0,
      totalQrScans: 0,
      memorials: [],
    };
  }

  const memorialIds = typedMemorials.map((memorial) => memorial.id);

  const { data: events, error: eventsError } = await supabase
    .from("memorial_events")
    .select("memorial_id, event_type")
    .in("memorial_id", memorialIds);

  if (eventsError) {
    throw eventsError;
  }

  const typedEvents = (events ?? []) as EventRow[];

  let totalViews = 0;
  let totalQrScans = 0;

  const counts = new Map<
    string,
    {
      views: number;
      qrScans: number;
    }
  >();

  for (const memorial of typedMemorials) {
    counts.set(memorial.id, {
      views: 0,
      qrScans: 0,
    });
  }

  for (const event of typedEvents) {
    const memorialCounts = counts.get(event.memorial_id);

    if (!memorialCounts) {
      continue;
    }

    if (event.event_type === "view") {
      memorialCounts.views += 1;
      totalViews += 1;
    }

    if (event.event_type === "qr_scan") {
      memorialCounts.qrScans += 1;
      totalQrScans += 1;
    }
  }

  return {
    totalViews,
    totalQrScans,

    memorials: typedMemorials.map((memorial) => {
      const memorialCounts = counts.get(memorial.id) ?? {
        views: 0,
        qrScans: 0,
      };

      return {
        memorialId: memorial.id,
        memorialName: memorial.name || "Untitled Memorial",
        views: memorialCounts.views,
        qrScans: memorialCounts.qrScans,
      };
    }),
  };
}
