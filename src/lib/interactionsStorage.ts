import type { MemorialInteractions } from "@/types/interactions";

function storageKey(brochureId: string) {
  return `euloges_interactions_${brochureId}`;
}

export function loadInteractions(brochureId: string): MemorialInteractions {
  if (typeof window === "undefined") {
    return {
      candles: [],
      messages: [],
      analytics: {
        views: 0,
        qrScans: 0,
      },
    };
  }

  const raw = localStorage.getItem(storageKey(brochureId));

  if (!raw) {
    return {
      candles: [],
      messages: [],
      analytics: {
        views: 0,
        qrScans: 0,
      },
    };
  }

  try {
    const saved = JSON.parse(raw) as Partial<MemorialInteractions>;

    return {
      candles: saved.candles ?? [],
      messages: saved.messages ?? [],
      analytics: {
        views: saved.analytics?.views ?? 0,
        qrScans: saved.analytics?.qrScans ?? 0,
      },
    };
  } catch {
    return {
      candles: [],
      messages: [],
      analytics: {
        views: 0,
        qrScans: 0,
      },
    };
  }
}

export function saveInteractions(
  brochureId: string,
  interactions: MemorialInteractions,
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(storageKey(brochureId), JSON.stringify(interactions));
}
