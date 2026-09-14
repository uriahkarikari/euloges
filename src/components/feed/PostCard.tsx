"use client";

import Link from "next/link";

type Props = {
  memorialId: string;
  memorialName: string;
  contributorName: string;
  content: string;
  type: "memory" | "story" | "reflection" | "tribute" | "condolence";
  createdAt: string;
  candles: number;
  contributions: number;
};

export default function PostCard({
  memorialId,
  memorialName,
  contributorName,
  content,
  type,
  createdAt,
  candles,
  contributions,
}: Props) {
  const createdDate = new Date(createdAt);

  const formattedDate = Number.isNaN(createdDate.getTime())
    ? "Recently"
    : createdDate.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  async function handleShare() {
    const url = `${window.location.origin}/brochure/${memorialId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `In memory of ${memorialName}`,
          text: content,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);
      alert("Memorial link copied.");
    } catch (error) {
      console.error("Unable to share memorial:", error);
    }
  }

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/brochure/${memorialId}`}
            className="font-semibold text-[#2F2F2F] transition hover:underline"
          >
            {memorialName}
          </Link>

          <p className="mt-1 text-xs text-black/50">
            {typeLabel} by {contributorName} · {formattedDate}
          </p>
        </div>
      </div>

      <p className="mt-5 whitespace-pre-wrap leading-7 text-black/75">
        {content}
      </p>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-black/10 pt-4 text-xs text-black/55">
        <span>{contributions} contributions</span>
        <span>{candles} candles</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/brochure/${memorialId}?action=tribute`}
          aria-label="Tribute"
          title="Tribute"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#625B53] transition hover:bg-[#EEE8DE] hover:text-[#211F1B]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path
              d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <Link
          href={`/brochure/${memorialId}?action=condolence`}
          aria-label="Condolence"
          title="Condolence"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#625B53] transition hover:bg-[#EEE8DE] hover:text-[#211F1B]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path
              d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M8 9h8M8 13h5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        <button
          type="button"
          onClick={() => void handleShare()}
          aria-label="Share"
          title="Share"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#625B53] transition hover:bg-[#EEE8DE] hover:text-[#211F1B]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path
              d="M18 8a3 3 0 1 0-2.8-4A3 3 0 0 0 18 8ZM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="m8.6 16.5 6.8-3.5M8.6 8.5l6.8 3.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </article>
  );
}
