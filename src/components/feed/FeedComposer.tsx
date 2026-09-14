"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listUserMemorials,
  type MemorialListItem,
} from "@/lib/memorialRepository";
import { submitOwnerMemorialMemory } from "@/lib/memorialInteractionsSupabase";

type FeedComposerProps = {
  onMemoryPosted?: () => void | Promise<void>;
};

export default function FeedComposer({ onMemoryPosted }: FeedComposerProps) {
  const [memorials, setMemorials] = useState<MemorialListItem[]>([]);
  const [memorialId, setMemorialId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMemorials() {
      try {
        const items = await listUserMemorials();

        if (cancelled) {
          return;
        }

        const available = items.filter(
          (memorial) =>
            memorial.status === "published" && memorial.privacy === "public",
        );

        setMemorials(available);

        if (available.length > 0) {
          setMemorialId(available[0].id);
        }
      } catch (loadError) {
        console.error("Unable to load memorials:", loadError);

        if (!cancelled) {
          setError("Unable to load your memorials.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMemorials();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMemorial = useMemo(
    () => memorials.find((memorial) => memorial.id === memorialId),
    [memorialId, memorials],
  );

  async function handlePost() {
    setFeedback("");
    setError("");

    const trimmedMessage = message.trim();

    if (!memorialId) {
      setError("Choose a memorial first.");
      return;
    }

    if (!trimmedMessage) {
      setError("Write a memory before posting.");
      return;
    }

    try {
      setPosting(true);

      await submitOwnerMemorialMemory({
        memorialId,
        message: trimmedMessage,
        type: "memory",
      });

      setMessage("");
      await onMemoryPosted?.();
      setFeedback(
        selectedMemorial
          ? `Memory preserved for ${selectedMemorial.name}.`
          : "Memory preserved.",
      );
    } catch (postError) {
      console.error("Unable to preserve memory:", postError);

      setError(
        postError instanceof Error
          ? postError.message
          : "Unable to preserve this memory.",
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h1 className="font-semibold text-gray-800">In Memory of...</h1>

      {loading ? (
        <p className="mt-4 text-sm text-gray-400">Loading your memorials...</p>
      ) : memorials.length === 0 ? (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            You do not yet have a public published memorial available for
            memories.
          </p>
        </div>
      ) : (
        <>
          <label
            htmlFor="memory-memorial"
            className="mt-4 block text-xs font-medium uppercase tracking-wide text-gray-400"
          >
            Who are you remembering?
          </label>

          <select
            id="memory-memorial"
            value={memorialId}
            onChange={(event) => {
              setMemorialId(event.target.value);
              setFeedback("");
              setError("");
            }}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
          >
            {memorials.map((memorial) => (
              <option key={memorial.id} value={memorial.id}>
                {memorial.name}
              </option>
            ))}
          </select>

          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setFeedback("");
              setError("");
            }}
            placeholder="Share a memory, story or reflection..."
            className="mt-4 w-full resize-none rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#7A9B8E]"
            rows={3}
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-gray-400">Preserve a memory</span>

            <button
              type="button"
              onClick={() => void handlePost()}
              disabled={posting || !message.trim()}
              className="rounded-lg bg-[#2F2F2F] px-5 py-2 text-sm text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {posting ? "Preserving..." : "Post"}
            </button>
          </div>
        </>
      )}

      {feedback && <p className="mt-3 text-sm text-green-700">{feedback}</p>}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
