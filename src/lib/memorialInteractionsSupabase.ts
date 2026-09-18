import { createClient } from "@/lib/supabase/client";

import type {
  Candle,
  MemorialInteractions,
  MemorialMessage,
} from "@/types/interactions";

type CandleRow = {
  id: string;
  memorial_id: string;
  name: string | null;
  message: string | null;
  created_at: string;
};

type TributeRow = {
  id: string;
  memorial_id: string;
  name: string | null;
  relationship: string | null;
  message: string;
  approved: boolean;
  created_at: string;
  message_type: "memory" | "story" | "reflection" | "tribute" | "condolence";
};

function mapCandle(row: CandleRow): Candle {
  return {
    id: row.id,
    createdAt: row.created_at,
  };
}

function mapMessage(row: TributeRow): MemorialMessage {
  return {
    id: row.id,
    name: row.name ?? "Anonymous",
    message: row.message,
    type: row.message_type,
    createdAt: row.created_at,
    approved: row.approved,
  };
}

export async function loadMemorialInteractions(
  memorialId: string,
): Promise<MemorialInteractions> {
  const supabase = createClient();

  const [
    { data: candles, error: candlesError },
    { data: messages, error: messagesError },
  ] = await Promise.all([
    supabase
      .from("memorial_candles")
      .select("*")
      .eq("memorial_id", memorialId)
      .order("created_at", { ascending: true }),

    supabase
      .from("memorial_tributes")
      .select("*")
      .eq("memorial_id", memorialId)
      .order("created_at", { ascending: true }),
  ]);

  if (candlesError) {
    throw candlesError;
  }

  if (messagesError) {
    throw messagesError;
  }

  const typedCandles = (candles ?? []) as CandleRow[];
  const typedMessages = (messages ?? []) as TributeRow[];

  return {
    candles: typedCandles.map(mapCandle),
    messages: typedMessages.map(mapMessage),

    /*
     * Public memorial visitors can record analytics events,
     * but analytics are not publicly readable.
     *
     * Owner-facing analytics will be loaded separately later.
     */
    analytics: {
      views: 0,
      qrScans: 0,
    },
  };
}

export async function toggleMemorialCandle(
  memorialId: string,
): Promise<CandleToggleResult> {
  const supabase = createClient();
  const visitorId = getCandleVisitorId();

  const { data, error } = await supabase.rpc("toggle_memorial_candle", {
    p_memorial_id: memorialId,
    p_visitor_id: visitorId,
  });

  if (error) {
    throw error;
  }

  const result = data?.[0] as
    | {
        action: "lit" | "extinguished";
        candle_id: string;
      }
    | undefined;

  if (!result) {
    throw new Error("Candle toggle returned no result.");
  }

  return {
    action: result.action,
    candleId: result.candle_id,
  };
}

export async function hasVisitorLitCandle(
  memorialId: string,
): Promise<boolean> {
  const supabase = createClient();
  const visitorId = getCandleVisitorId();

  const { data, error } = await supabase
    .from("memorial_candles")
    .select("id")
    .eq("memorial_id", memorialId)
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data !== null;
}

export async function submitMemorialMessage(input: {
  memorialId: string;
  name: string;
  message: string;
  type: "memory" | "story" | "reflection" | "tribute" | "condolence";
}): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("memorial_tributes").insert({
    memorial_id: input.memorialId,
    name: input.name.trim(),
    message: input.message.trim(),
    message_type: input.type,
    approved: false,
  });

  if (error) {
    throw error;
  }
}

export async function approveMemorialMessage(
  messageId: string,
): Promise<MemorialMessage> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("memorial_tributes")
    .update({
      approved: true,
    })
    .eq("id", messageId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapMessage(data as TributeRow);
}

const CANDLE_VISITOR_ID_KEY = "euloges_candle_visitor_id";

function getCandleVisitorId(): string {
  const existing = window.localStorage.getItem(CANDLE_VISITOR_ID_KEY);

  if (existing) {
    return existing;
  }

  const visitorId = crypto.randomUUID();

  window.localStorage.setItem(CANDLE_VISITOR_ID_KEY, visitorId);

  return visitorId;
}

export type CandleToggleResult = {
  action: "lit" | "extinguished";
  candleId: string;
};

export async function deleteMemorialMessage(messageId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("memorial_tributes")
    .delete()
    .eq("id", messageId);

  if (error) {
    throw error;
  }
}

export async function recordMemorialEvent(
  memorialId: string,
  eventType: "view" | "qr_scan",
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("memorial_events").insert({
    memorial_id: memorialId,
    event_type: eventType,
    metadata: {},
  });

  if (error) {
    throw error;
  }
}

export async function canModerateMemorial(
  memorialId: string,
): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("memorials")
    .select("owner_id")
    .eq("id", memorialId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.owner_id === user.id;
}

export async function submitOwnerMemorialMemory(input: {
  memorialId: string;
  message: string;
  type?: "memory" | "story" | "reflection" | "tribute";
  name?: string;
}): Promise<MemorialMessage> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to preserve a memory.");
  }

  const { data: memorial, error: memorialError } = await supabase
    .from("memorials")
    .select("owner_id, status, privacy")
    .eq("id", input.memorialId)
    .maybeSingle();

  if (memorialError) {
    throw memorialError;
  }

  if (!memorial || memorial.owner_id !== user.id) {
    throw new Error("You do not have permission to post to this memorial.");
  }

  /*
   * Current memorial_tributes RLS permits contributions to
   * published public memorials. We retain that boundary here
   * rather than weakening the policy for the home composer.
   */
  if (memorial.status !== "published" || memorial.privacy !== "public") {
    throw new Error(
      "This memorial must be published and public before memories can be posted from Home.",
    );
  }

  const message = input.message.trim();

  if (!message) {
    throw new Error("Write a memory before posting.");
  }

  /*
   * RLS requires new contributions to begin unapproved.
   * Because this is the memorial owner posting from their
   * authenticated workspace, we immediately approve it in
   * a second owner-authorized operation.
   */
  const { data: created, error: insertError } = await supabase
    .from("memorial_tributes")
    .insert({
      memorial_id: input.memorialId,
      name: input.name?.trim() || "Family",
      message,
      message_type: input.type ?? "memory",
      approved: false,
    })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  const { data: approved, error: approveError } = await supabase
    .from("memorial_tributes")
    .update({
      approved: true,
    })
    .eq("id", created.id)
    .select("*")
    .single();

  if (approveError) {
    throw approveError;
  }

  return mapMessage(approved as TributeRow);
}