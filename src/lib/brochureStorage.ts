
import type { BrochureDraft } from "@/types/brochure";

const STORAGE_KEY = "euloges_brochure_draft";
const SESSION_STORAGE_PREFIX = "euloges_brochure_draft:";
const CREATION_REQUEST_PREFIX = "euloges_brochure_creation_request:";

function normalizeDraft(saved: Partial<BrochureDraft>): BrochureDraft {
  return {
    id: saved.id ?? "draft-001",
    name: saved.name ?? "",
    dob: saved.dob ?? "",
    dod: saved.dod ?? "",
    bio: saved.bio ?? "",
    portraitUrl: saved.portraitUrl ?? "",
    sections: saved.sections ?? [],
    privacy: saved.privacy ?? "public",
    accessCode: saved.accessCode ?? "",
    allowSearchIndexing: saved.allowSearchIndexing ?? false,
    status: saved.status ?? "draft",
    publishedAt: saved.publishedAt ?? null,
    updatedAt: saved.updatedAt ?? new Date().toISOString(),
  };
}

function readDraft(key: string): BrochureDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return normalizeDraft(JSON.parse(raw) as Partial<BrochureDraft>);
  } catch {
    return null;
  }
}

function writeDraft(key: string, draft: BrochureDraft): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.warn("Unable to save local memorial recovery copy:", error);
    return false;
  }
}

export function saveBrochureDraft(draft: BrochureDraft) {
  writeDraft(STORAGE_KEY, draft);
}

export function loadBrochureDraft(): BrochureDraft | null {
  return readDraft(STORAGE_KEY);
}

export function clearBrochureDraft() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Unable to clear local memorial draft:", error);
  }
}

export function saveBrochureDraftForSession(
  sessionKey: string,
  draft: BrochureDraft,
) {
  writeDraft(`${SESSION_STORAGE_PREFIX}${sessionKey}`, draft);
}

export function loadBrochureDraftForSession(
  sessionKey: string,
): BrochureDraft | null {
  return readDraft(`${SESSION_STORAGE_PREFIX}${sessionKey}`);
}

export function getOrCreateCreationRequestId(sessionKey: string): string {
  if (typeof window === "undefined") {
    throw new Error("Creation request IDs must be generated in the browser.");
  }

  const storageKey = `${CREATION_REQUEST_PREFIX}${sessionKey}`;

  try {
    const existing = localStorage.getItem(storageKey);

    if (
      existing &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        existing,
      )
    ) {
      return existing;
    }

    const requestId = crypto.randomUUID();
    localStorage.setItem(storageKey, requestId);
    return requestId;
  } catch (error) {
    // A stable ID is important for retries. Don't silently generate a new
    // ID on every call if browser storage is unavailable.
    throw new Error(
      "Unable to prepare safe memorial recovery in this browser. Check browser storage settings and try again.",
      { cause: error },
    );
  }
}
