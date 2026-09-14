import type { BrochureDraft } from "@/types/brochure";

import { saveBrochureDraft } from "@/lib/brochureStorage";

import {
  createBrochureInSupabase,
  saveBrochureToSupabase,
} from "@/lib/brochureSupabase";

/*
 * Supabase saves are deliberately serialized.
 *
 * This prevents rapid autosave calls from creating
 * multiple memorials while a local draft is being
 * migrated from "draft-001" to a Supabase UUID.
 */
let saveQueue: Promise<BrochureDraft | null> = Promise.resolve(null);

let remoteMemorialId: string | null = null;

function isLocalDraftId(id: string) {
  return id.startsWith("draft-");
}

function snapshotDraft(draft: BrochureDraft): BrochureDraft {
  return {
    ...draft,
    sections: draft.sections.map((section) => ({
      ...section,
    })),
  };
}

export function persistBrochureDraft(
  draft: BrochureDraft,
): Promise<BrochureDraft> {
  /*
   * Keep the current browser fallback immediately.
   * A network failure therefore does not erase
   * what the user has just entered.
   */
  saveBrochureDraft(draft);

  const snapshot = snapshotDraft(draft);

  const task = saveQueue.then(async () => {
    /*
     * Existing Supabase-backed memorial.
     */
    if (!isLocalDraftId(snapshot.id)) {
      remoteMemorialId = snapshot.id;

      const saved = await saveBrochureToSupabase(snapshot);

      saveBrochureDraft(saved);

      return saved;
    }

    /*
     * This browser session has already migrated
     * draft-001, but another autosave was queued
     * before React received the new UUID.
     */
    if (remoteMemorialId) {
      const saved = await saveBrochureToSupabase({
        ...snapshot,
        id: remoteMemorialId,
      });

      saveBrochureDraft(saved);

      return saved;
    }

    /*
     * First persistence of a local-only draft.
     * This creates exactly one Supabase memorial.
     */
    const created = await createBrochureInSupabase(snapshot);

    remoteMemorialId = created.id;

    saveBrochureDraft(created);

    return created;
  });

  /*
   * Keep the queue usable if one Supabase request fails.
   * The caller still receives the original rejection,
   * while later saves are allowed to continue.
   */
  saveQueue = task.catch(() => null);

  return task;
}

export function resetBrochurePersistenceState() {
  remoteMemorialId = null;
  saveQueue = Promise.resolve(null);
}
