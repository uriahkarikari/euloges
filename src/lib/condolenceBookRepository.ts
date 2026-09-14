import { createClient } from "@/lib/supabase/client";

import type {
  CondolenceBook,
  CondolenceBookData,
  CondolenceBookStatus,
  CondolenceEntry,
  CondolenceEntryStatus,
} from "@/types/condolenceBook";

type CondolenceBookRow = {
  id: string;
  memorial_id: string;
  status: CondolenceBookStatus;
  opened_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

type CondolenceEntryRow = {
  id: string;
  book_id: string;
  name: string;
  relationship: string | null;
  location: string | null;
  message: string;
  status: CondolenceEntryStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

type CreateEntryInput = {
  name: string;
  relationship: string;
  location: string;
  message: string;
};

function mapBook(row: CondolenceBookRow): CondolenceBook {
  return {
    id: row.id,
    memorialId: row.memorial_id,
    status: row.status,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEntry(row: CondolenceEntryRow): CondolenceEntry {
  return {
    id: row.id,
    bookId: row.book_id,
    name: row.name,
    relationship: row.relationship ?? "",
    location: row.location ?? "",
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  };
}

export async function loadCondolenceBook(
  memorialId: string,
): Promise<CondolenceBookData | null> {
  const supabase = createClient();

  const { data: bookRow, error: bookError } = await supabase
    .from("condolence_books")
    .select(
      `
        id,
        memorial_id,
        status,
        opened_at,
        closed_at,
        created_at,
        updated_at
      `,
    )
    .eq("memorial_id", memorialId)
    .maybeSingle();

  if (bookError) {
    throw bookError;
  }

  if (!bookRow) {
    return null;
  }

  const { data: entryRows, error: entriesError } = await supabase
    .from("condolence_entries")
    .select(
      `
        id,
        book_id,
        name,
        relationship,
        location,
        message,
        status,
        created_at,
        reviewed_at,
        reviewed_by
      `,
    )
    .eq("book_id", bookRow.id)
    .order("created_at", { ascending: false });

  if (entriesError) {
    throw entriesError;
  }

  return {
    book: mapBook(bookRow as CondolenceBookRow),

    entries: (entryRows ?? []).map((row) =>
      mapEntry(row as CondolenceEntryRow),
    ),
  };
}

export async function createCondolenceBook(
  memorialId: string,
): Promise<CondolenceBookData> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to create a condolence book.");
  }

  const { data, error } = await supabase
    .from("condolence_books")
    .insert({
      memorial_id: memorialId,
      status: "closed",
    })
    .select(
      `
        id,
        memorial_id,
        status,
        opened_at,
        closed_at,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error) {
    /*
     * Another request may have created the one-per-memorial
     * condolence book between our initial lookup and this insert.
     *
     * In that case, return the existing book instead of treating
     * the unique constraint as a user-facing error.
     */
    if (error.code === "23505") {
      const existing = await loadCondolenceBook(memorialId);

      if (existing) {
        return existing;
      }
    }

    throw error;
  }

  return {
    book: mapBook(data as CondolenceBookRow),
    entries: [],
  };
}

export async function getOrCreateCondolenceBook(
  memorialId: string,
): Promise<CondolenceBookData> {
  const existing = await loadCondolenceBook(memorialId);

  if (existing) {
    return existing;
  }

  return createCondolenceBook(memorialId);
}

export async function setCondolenceBookStatus(
  memorialId: string,
  status: CondolenceBookStatus,
): Promise<CondolenceBookData> {
  const supabase = createClient();

  const existing = await getOrCreateCondolenceBook(memorialId);
  const now = new Date().toISOString();

  const update: {
    status: CondolenceBookStatus;
    opened_at?: string;
    closed_at?: string | null;
    updated_at: string;
  } = {
    status,
    updated_at: now,
  };

  if (status === "open") {
    update.opened_at = existing.book.openedAt ?? now;
    update.closed_at = null;
  }

  if (status === "closed") {
    update.closed_at = now;
  }

  if (status === "archived") {
    update.closed_at = existing.book.closedAt ?? now;
  }

  const { error } = await supabase
    .from("condolence_books")
    .update(update)
    .eq("id", existing.book.id);

  if (error) {
    throw error;
  }

  const refreshed = await loadCondolenceBook(memorialId);

  if (!refreshed) {
    throw new Error("Unable to reload the condolence book.");
  }

  return refreshed;
}

export async function openCondolenceBook(
  memorialId: string,
): Promise<CondolenceBookData> {
  return setCondolenceBookStatus(memorialId, "open");
}

export async function closeCondolenceBook(
  memorialId: string,
): Promise<CondolenceBookData> {
  return setCondolenceBookStatus(memorialId, "closed");
}

export async function archiveCondolenceBook(
  memorialId: string,
): Promise<CondolenceBookData> {
  return setCondolenceBookStatus(memorialId, "archived");
}

export async function addCondolenceEntry(
  memorialId: string,
  input: CreateEntryInput,
): Promise<CondolenceBookData> {
  const supabase = createClient();

  const data = await loadCondolenceBook(memorialId);

  if (!data) {
    throw new Error("This condolence book does not exist.");
  }

  if (data.book.status !== "open") {
    throw new Error("This condolence book is not currently open.");
  }

  const name = input.name.trim();
  const relationship = input.relationship.trim();
  const location = input.location.trim();
  const message = input.message.trim();

  if (!name || !message) {
    throw new Error("Name and condolence message are required.");
  }

  const { error } = await supabase.from("condolence_entries").insert({
    book_id: data.book.id,
    name,
    relationship,
    location,
    message,
    status: "pending",
  });

  if (error) {
    throw error;
  }
  /*
   * A public visitor cannot read their new pending entry because
   * RLS intentionally exposes only approved entries publicly.
   */
  const refreshed = await loadCondolenceBook(memorialId);

  if (!refreshed) {
    throw new Error("Unable to reload the condolence book.");
  }

  return refreshed;
}

export async function updateCondolenceEntryStatus(
  memorialId: string,
  entryId: string,
  status: CondolenceEntryStatus,
): Promise<CondolenceBookData> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to review condolence entries.");
  }

  const { error } = await supabase
    .from("condolence_entries")
    .update({
      status,
      reviewed_at: status === "pending" ? null : now,
      reviewed_by: status === "pending" ? null : user.id,
    })
    .eq("id", entryId);

  if (error) {
    throw error;
  }

  const refreshed = await loadCondolenceBook(memorialId);

  if (!refreshed) {
    throw new Error("Unable to reload the condolence book.");
  }

  return refreshed;
}

export async function deleteCondolenceEntry(
  memorialId: string,
  entryId: string,
): Promise<CondolenceBookData> {
  const supabase = createClient();

  const { error } = await supabase
    .from("condolence_entries")
    .delete()
    .eq("id", entryId);

  if (error) {
    throw error;
  }

  const refreshed = await loadCondolenceBook(memorialId);

  if (!refreshed) {
    throw new Error("Unable to reload the condolence book.");
  }

  return refreshed;
}