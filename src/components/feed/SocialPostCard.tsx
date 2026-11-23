"use client";

import { useState } from "react";
import {
  addPostComment,
  loadPostComments,
  sharePost,
  togglePostLike,
  togglePostRepost,
  type SocialComment,
  type SocialPost,
} from "@/lib/socialFeedRepository";

export default function SocialPostCard({ post, onChanged }: { post: SocialPost; onChanged: () => void }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likes, setLikes] = useState(post.likeCount);
  const [reposted, setReposted] = useState(post.repostedByMe);
  const [reposts, setReposts] = useState(post.repostCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const date = new Date(post.createdAt);
  const timestamp = Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  async function handleLike() {
    setError("");
    setBusy(true);
    try {
      await togglePostLike(post.id, liked);
      setLiked(!liked);
      setLikes((value) => Math.max(0, value + (liked ? -1 : 1)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update like.");
    } finally { setBusy(false); }
  }

  async function handleRepost() {
    setError("");
    setBusy(true);
    try {
      await togglePostRepost(post.id, reposted);
      setReposted(!reposted);
      setReposts((value) => Math.max(0, value + (reposted ? -1 : 1)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to repost.");
    } finally { setBusy(false); }
  }

  async function toggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments.length === 0) {
      try { setComments(await loadPostComments(post.id)); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load comments."); }
    }
  }

  async function submitComment() {
    if (!comment.trim()) return;
    setBusy(true);
    setError("");
    try {
      await addPostComment(post.id, comment);
      setComment("");
      setComments(await loadPostComments(post.id));
      onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to add comment.");
    } finally { setBusy(false); }
  }

  return (
    <article className="rounded-2xl border border-[#E9E2D8] bg-white p-5 shadow-sm">
      {post.visibility === "private" && <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#9A762F]">Private · Only you</p>}
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[#302F2B]">{post.authorName}</p>
          <p className="mt-1 text-xs text-[#918A80]">{post.channel === "legacy" ? "Legacy" : "Lifestyle"} · {timestamp}</p>
        </div>
        <span className="rounded-full bg-[#F7F4EF] px-3 py-1 text-[10px] text-[#817B72]">{post.channel}</span>
      </header>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#514C45]">{post.content}</p>
      {post.mediaUrl && <img src={post.mediaUrl} alt="" className="mt-4 max-h-[480px] w-full rounded-xl object-contain bg-[#F7F4EF]" />}
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#817B72]">
        <span>{likes} {likes === 1 ? "like" : "likes"}</span>
        <span>{comments.length || post.commentCount} comments</span>
        <span>{reposts} reposts</span>
      </div>
      <div className="mt-3 grid grid-cols-4 border-t border-[#EEE9E1] pt-3">
        <button type="button" disabled={busy || post.visibility !== "public"} onClick={() => void handleLike()} className={`rounded-lg py-2 text-xs transition hover:bg-[#F7F4EF] ${liked ? "font-semibold text-[#A17D32]" : "text-[#625D55]"} disabled:opacity-40`}>{liked ? "♥ Liked" : "♡ Like"}</button>
        <button type="button" onClick={() => void toggleComments()} className="rounded-lg py-2 text-xs text-[#625D55] transition hover:bg-[#F7F4EF]">Comment</button>
        <button type="button" disabled={busy || post.visibility !== "public"} onClick={() => void handleRepost()} className={`rounded-lg py-2 text-xs transition hover:bg-[#F7F4EF] ${reposted ? "font-semibold text-[#A17D32]" : "text-[#625D55]"} disabled:opacity-40`}>{reposted ? "✓ Reposted" : "↻ Repost"}</button>
        <button type="button" onClick={() => void sharePost(post.id, post.channel, post.content).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to share post."))} className="rounded-lg py-2 text-xs text-[#625D55] transition hover:bg-[#F7F4EF]">Share</button>
      </div>
      {commentsOpen && (
        <div className="mt-3 border-t border-[#EEE9E1] pt-4">
          <div className="space-y-3">
            {comments.map((entry) => <div key={entry.id} className="rounded-xl bg-[#FAF8F5] p-3"><p className="text-xs font-semibold text-[#514C45]">{entry.authorName}</p><p className="mt-1 whitespace-pre-wrap text-sm text-[#625D55]">{entry.content}</p></div>)}
            {comments.length === 0 && <p className="text-xs text-[#918A80]">No comments yet. Start the conversation.</p>}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} placeholder="Write a comment…" className="min-w-0 flex-1 rounded-xl border border-[#E5DED3] px-3 py-2 text-sm outline-none focus:border-[#B99A5A]" />
            <button type="button" disabled={busy || !comment.trim() || post.visibility !== "public"} onClick={() => void submitComment()} className="rounded-xl bg-[#302F2B] px-4 py-2 text-xs text-white disabled:opacity-40">Reply</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
    </article>
  );
}
