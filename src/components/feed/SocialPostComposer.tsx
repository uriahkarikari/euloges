"use client";

import { useState } from "react";
import { createSocialPost, type SocialChannel } from "@/lib/socialFeedRepository";

export default function SocialPostComposer({ channel, onPosted }: { channel: SocialChannel; onPosted: () => void }) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">(channel === "legacy" ? "private" : "public");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit() {
    setError("");
    setNotice("");
    if (!content.trim()) return;
    setPosting(true);
    try {
      await createSocialPost({ channel, content, visibility });
      setContent("");
      setNotice("Your post has been published.");
      onPosted();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to publish this post.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#E9E2D8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-[#302F2B]">{channel === "legacy" ? "Preserve a story" : "Share a moment"}</h2>
        <span className="text-xs text-[#918A80]">{channel === "legacy" ? "Legacy" : "Lifestyle"}</span>
      </div>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={5000}
        rows={4}
        placeholder={channel === "legacy" ? "Share a family story, a lesson, a memory or a piece of history..." : "What would you like to share about life today?"}
        className="mt-4 w-full resize-y rounded-xl border border-[#E5DED3] bg-[#FCFBF9] p-3 text-sm text-[#302F2B] outline-none focus:border-[#B99A5A]"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="text-xs text-[#817B72]">
          Who can see this?
          <select value={visibility} onChange={(event) => setVisibility(event.target.value as "public" | "private")} className="ml-2 rounded-lg border border-[#E5DED3] bg-white px-2 py-1.5 text-xs text-[#514C45]">
            <option value="private">Only me</option>
            <option value="public">Public</option>
          </select>
        </label>
        <button type="button" onClick={() => void submit()} disabled={posting || !content.trim()} className="rounded-full bg-[#302F2B] px-5 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
          {posting ? "Publishing…" : channel === "legacy" ? "Preserve story" : "Post"}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {notice && <p className="mt-3 text-sm text-green-700">{notice}</p>}
    </section>
  );
}
