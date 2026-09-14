import type {
  CondolenceBookData,
  CondolenceEntry,
  CondolenceEntryStatus,
} from "@/types/condolenceBook";

function storageKey(memorialId: string) {
  return `euloges_condolence_book_${memorialId}`;
}

export function createDefaultCondolenceBook(
  memorialId: string,
): CondolenceBookData {
  const now = new Date().toISOString();

  return {
    book: {
      id: `condolence-book-${memorialId}`,
      memorialId,
      status: "closed",
      openedAt: null,
      closedAt: null,
      createdAt: now,
      updatedAt: now,
    },

    entries: [],
  };
}

export function loadCondolenceBook(memorialId: string): CondolenceBookData {
  if (typeof window === "undefined") {
    return createDefaultCondolenceBook(memorialId);
  }

  const raw = localStorage.getItem(storageKey(memorialId));

  if (!raw) {
    return createDefaultCondolenceBook(memorialId);
  }

  try {
    const saved = JSON.parse(raw) as Partial<CondolenceBookData>;

    const fallback = createDefaultCondolenceBook(memorialId);

    return {
      book: {
        id: saved.book?.id ?? fallback.book.id,

        memorialId,

        status: saved.book?.status ?? fallback.book.status,

        openedAt: saved.book?.openedAt ?? null,

        closedAt: saved.book?.closedAt ?? null,

        createdAt: saved.book?.createdAt ?? fallback.book.createdAt,

        updatedAt: saved.book?.updatedAt ?? fallback.book.updatedAt,
      },

      entries:
        saved.entries?.map((entry) => ({
          id: entry.id,

          bookId: entry.bookId ?? fallback.book.id,

          name: entry.name ?? "",

          relationship: entry.relationship ?? "",

          location: entry.location ?? "",

          message: entry.message ?? "",

          status: entry.status ?? "pending",

          createdAt: entry.createdAt ?? new Date().toISOString(),

          reviewedAt: entry.reviewedAt ?? null,

          reviewedBy: entry.reviewedBy ?? null,
        })) ?? [],
    };
  } catch {
    return createDefaultCondolenceBook(memorialId);
  }
}

export function saveCondolenceBook(
  memorialId: string,
  data: CondolenceBookData,
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(storageKey(memorialId), JSON.stringify(data));
}

export function openCondolenceBook(memorialId: string) {
  const data = loadCondolenceBook(memorialId);

  const now = new Date().toISOString();

  const updated: CondolenceBookData = {
    ...data,

    book: {
      ...data.book,

      status: "open",

      openedAt: data.book.openedAt ?? now,

      closedAt: null,

      updatedAt: now,
    },
  };

  saveCondolenceBook(memorialId, updated);

  return updated;
}

export function closeCondolenceBook(memorialId: string) {
  const data = loadCondolenceBook(memorialId);

  const now = new Date().toISOString();

  const updated: CondolenceBookData = {
    ...data,

    book: {
      ...data.book,

      status: "closed",

      closedAt: now,

      updatedAt: now,
    },
  };

  saveCondolenceBook(memorialId, updated);

  return updated;
}

export function archiveCondolenceBook(memorialId: string) {
  const data = loadCondolenceBook(memorialId);

  const now = new Date().toISOString();

  const updated: CondolenceBookData = {
    ...data,

    book: {
      ...data.book,

      status: "archived",

      closedAt: data.book.closedAt ?? now,

      updatedAt: now,
    },
  };

  saveCondolenceBook(memorialId, updated);

  return updated;
}

type CreateEntryInput = {
  name: string;
  relationship: string;
  location: string;
  message: string;
};

export function addCondolenceEntry(
  memorialId: string,
  input: CreateEntryInput,
) {
  const data = loadCondolenceBook(memorialId);

  if (data.book.status !== "open") {
    return data;
  }

  const now = new Date().toISOString();

  const entry: CondolenceEntry = {
    id: crypto.randomUUID(),

    bookId: data.book.id,

    name: input.name.trim(),

    relationship: input.relationship.trim(),

    location: input.location.trim(),

    message: input.message.trim(),

    status: "pending",

    createdAt: now,

    reviewedAt: null,

    reviewedBy: null,
  };

  const updated: CondolenceBookData = {
    ...data,

    book: {
      ...data.book,
      updatedAt: now,
    },

    entries: [entry, ...data.entries],
  };

  saveCondolenceBook(memorialId, updated);

  return updated;
}

export function updateCondolenceEntryStatus(
  memorialId: string,
  entryId: string,
  status: CondolenceEntryStatus,
  reviewedBy = "Memorial Creator",
) {
  const data = loadCondolenceBook(memorialId);

  const now = new Date().toISOString();

  const updated: CondolenceBookData = {
    ...data,

    book: {
      ...data.book,
      updatedAt: now,
    },

    entries: data.entries.map((entry) =>
      entry.id === entryId
        ? {
            ...entry,

            status,

            reviewedAt: status === "pending" ? null : now,

            reviewedBy: status === "pending" ? null : reviewedBy,
          }
        : entry,
    ),
  };

  saveCondolenceBook(memorialId, updated);

  return updated;
}

export function deleteCondolenceEntry(memorialId: string, entryId: string) {
  const data = loadCondolenceBook(memorialId);

  const now = new Date().toISOString();

  const updated: CondolenceBookData = {
    ...data,

    book: {
      ...data.book,
      updatedAt: now,
    },

    entries: data.entries.filter((entry) => entry.id !== entryId),
  };

  saveCondolenceBook(memorialId, updated);

  return updated;
}
