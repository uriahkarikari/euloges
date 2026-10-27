import type { BrochureDraft } from "@/types/brochure";

import {
  saveBrochureDraft,
  saveBrochureDraftForSession,
} from "@/lib/brochureStorage";

import {
  createBrochureInSupabase,
  saveBrochureToSupabase,
} from "@/lib/brochureSupabase";

type PersistenceState = {
  queue: Promise<BrochureDraft | null>;
  remoteMemorialId: string | null;
  latestSaveVersion: number;
};

const states = new Map<string, PersistenceState>();

let activeSessionKey: string | null = null;
let nextSaveVersion = 0;

function isLocalDraftId(id: string) {
  return id.startsWith("draft-");
}

function snapshotDraft(draft: BrochureDraft): BrochureDraft {
  return {
    ...draft,
    sections: draft.sections.map((section) => ({ ...section })),
  };
}

function getState(sessionKey: string): PersistenceState {
  let state = states.get(sessionKey);

  if (!state) {
    state = {
      queue: Promise.resolve(null),
      remoteMemorialId: null,
      latestSaveVersion: 0,
    };

    states.set(sessionKey, state);
  }

  return state;
}

export function activateBrochurePersistence(sessionKey: string) {
  activeSessionKey = sessionKey;
}

/**
 * The optional session key keeps existing callers compatible.
 * The editor should always supply its stable session key.
 */
export function persistBrochureDraft(
  draft: BrochureDraft,
  sessionKey = `memorial:${draft.id}`,
  creationRequestId?: string,
): Promise<BrochureDraft> {
  const snapshot = snapshotDraft(draft);
  const state = getState(sessionKey);
  const version = ++nextSaveVersion;

  state.latestSaveVersion = version;

  // Preserve local recovery immediately, but only for the
  // currently active editor session.
  saveBrochureDraftForSession(sessionKey, snapshot);

  if (activeSessionKey === sessionKey) {
    saveBrochureDraft(snapshot);
  }

  const task = state.queue.then(async () => {
    let saved: BrochureDraft;

    if (!isLocalDraftId(snapshot.id)) {
      saved = await saveBrochureToSupabase(snapshot);
      state.remoteMemorialId = saved.id;
    } else if (state.remoteMemorialId) {
      saved = await saveBrochureToSupabase({
        ...snapshot,
        id: state.remoteMemorialId,
      });
    } else {
      if (!creationRequestId) {
        throw new Error(
          "A creation request ID is required to create a new memorial.",
        );
      }

      saved = await createBrochureInSupabase(
        snapshot,
        creationRequestId,
      );

      state.remoteMemorialId = saved.id;

      // Apply the latest local snapshot even if creation was a retry
      // that recovered a memorial created by an earlier request.
      saved = await saveBrochureToSupabase({
        ...snapshot,
        id: saved.id,
      });
    }

    // A late response must not replace the recovery draft
    // belonging to another session or an older save.
    if (state.latestSaveVersion === version) {
      saveBrochureDraftForSession(sessionKey, saved);

      if (activeSessionKey === sessionKey) {
        saveBrochureDraft(saved);
      }
    }

    return saved;
  });

  // Let subsequent saves continue after a failed request.
  state.queue = task.catch(() => null);

  return task;
}

export function resetBrochurePersistenceState() {
  activeSessionKey = null;
}
