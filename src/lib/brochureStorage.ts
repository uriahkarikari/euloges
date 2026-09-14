import type { BrochureDraft } from "@/types/brochure";

const STORAGE_KEY = "euloges_brochure_draft";

export function saveBrochureDraft(draft: BrochureDraft) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadBrochureDraft(): BrochureDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const saved = JSON.parse(raw) as Partial<BrochureDraft>;

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
      status: saved.status ?? "draft",
      publishedAt: saved.publishedAt ?? null,
      updatedAt: saved.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearBrochureDraft() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
