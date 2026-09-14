export type CondolenceBookStatus = "closed" | "open" | "archived";

export type CondolenceEntryStatus = "pending" | "approved" | "denied";

export type CondolenceEntry = {
  id: string;

  bookId: string;

  name: string;

  relationship: string;

  location: string;

  message: string;

  status: CondolenceEntryStatus;

  createdAt: string;

  reviewedAt: string | null;

  reviewedBy: string | null;
};

export type CondolenceBook = {
  id: string;

  memorialId: string;

  status: CondolenceBookStatus;

  openedAt: string | null;

  closedAt: string | null;

  createdAt: string;

  updatedAt: string;
};

export type CondolenceBookData = {
  book: CondolenceBook;

  entries: CondolenceEntry[];
};
