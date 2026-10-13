"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listUserMemorials,
  type MemorialListItem,
} from "@/lib/memorialRepository";

type LegacySection = "overview" | "stories" | "media" | "family";

const navigation: { id: LegacySection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "stories", label: "Life Stories" },
  { id: "media", label: "Photos & Voice" },
  { id: "family", label: "Family Contributions" },
];

export default function LegacyPage() {
  const [section, setSection] = useState<LegacySection>("overview");
  const [memorials, setMemorials] = useState<MemorialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMemorials() {
      try {
        const records = await listUserMemorials();

        if (!cancelled) {
          setMemorials(records);
        }
      } catch (error) {
        console.error("Unable to load Legacy records:", error);

        if (!cancelled) {
          setError(
            "We couldn't load your existing memorial records. Please try again.",
          );
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

  return (
    <div className="space-y-5 pb-8">
      <section className="overflow-hidden rounded-2xl bg-[#292c36] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7cba7]">
            Euloges · Legacy
          </p>
          <Link
            href="/workspace"
            className="rounded-lg border border-white/25 px-3 py-2 text-sm transition hover:bg-white/10"
          >
            Tribute & Funeral →
          </Link>
        </div>

        <h1 className="mt-8 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          A life is more than a moment.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
          Preserve the stories, memories and experiences that help a life
          continue to be known across generations.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSection("stories")}
            className="rounded-xl bg-[#e7cba7] px-4 py-3 text-sm font-semibold text-[#292c36] transition hover:bg-[#f0d9bc]"
          >
            Explore Life Stories
          </button>
          <Link
            href="/preserve"
            className="rounded-xl border border-white/25 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
          >
            Open Preserve Journey
          </Link>
        </div>
      </section>

      <nav
        aria-label="Legacy sections"
        className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm"
      >
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            aria-current={section === item.id ? "page" : undefined}
            className={`shrink-0 rounded-xl px-3 py-2.5 text-sm transition sm:px-4 ${
              section === item.id
                ? "bg-[#292c36] font-medium text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {section === "overview" && (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              title="Life Stories"
              description="Revisit the memorial biographies already associated with your account."
              action="View stories"
              onClick={() => setSection("stories")}
            />
            <FeatureCard
              title="Photos & Voice"
              description="A dedicated media library is planned. Persistent Legacy media management is not yet available."
              onClick={() => setSection("media")}
            />
            <FeatureCard
              title="Family Contributions"
              description="A future space for family members to contribute memories through controlled access."
              onClick={() => setSection("family")}
            />
            <FeatureCard
              title="Tribute & Funeral"
              description="Return to your existing memorial, condolence-book and ceremony workspace."
              href="/workspace"
            />
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#292c36]">
                  Your existing memorials
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Records loaded from your account, not sample Legacy data.
                </p>
              </div>
              <Link
                href="/memorials"
                className="text-sm font-medium text-[#596d63] hover:underline"
              >
                Manage memorials →
              </Link>
            </div>

            <MemorialList
              memorials={memorials}
              loading={loading}
              error={error}
            />
          </section>
        </>
      )}

      {section === "stories" && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-[#292c36]">Life Stories</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            These are your existing memorial records. A separate Legacy story
            editor and its own saved-memory collection have not yet been built.
          </p>
          <div className="mt-5">
            <MemorialList
              memorials={memorials}
              loading={loading}
              error={error}
            />
          </div>
          <Link
            href="/memorials"
            className="mt-5 inline-block rounded-xl bg-[#292c36] px-4 py-3 text-sm font-medium text-white hover:bg-black"
          >
            Manage all memorials
          </Link>
        </section>
      )}

      {section === "media" && (
        <ComingSoon
          title="Photos & Voice"
          description="A dedicated library for photographs, voice recordings and the stories behind them."
          detail="Persistent media uploads, storage and playback are not connected to this workspace yet."
        />
      )}

      {section === "family" && (
        <ComingSoon
          title="Family Contributions"
          description="A future shared space for relatives to contribute memories and personal stories."
          detail="Invitations, contribution permissions and saved family submissions are not implemented yet."
        />
      )}
    </div>
  );
}

function FeatureCard({
  title,
  description,
  action,
  onClick,
  href,
}: {
  title: string;
  description: string;
  action?: string;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <>
      <h2 className="font-semibold text-[#292c36]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      {action && (
        <span className="mt-4 inline-block text-sm font-semibold text-[#596d63]">
          {action} →
        </span>
      )}
      {href && (
        <span className="mt-4 inline-block text-sm font-semibold text-[#596d63]">
          Open workspace →
        </span>
      )}
    </>
  );

  const className =
    "block rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-gray-200 hover:shadow-md";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function MemorialList({
  memorials,
  loading,
  error,
}: {
  memorials: MemorialListItem[];
  loading: boolean;
  error: string;
}) {
  if (loading) {
    return (
      <p className="mt-5 text-sm text-gray-500">Loading your memorials…</p>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
      >
        {error}
      </p>
    );
  }

  if (memorials.length === 0) {
    return (
      <div className="mt-5 rounded-xl bg-gray-50 p-5">
        <h3 className="font-medium text-[#292c36]">No memorials found yet</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          When you create a memorial, it will appear here. No sample records
          have been added.
        </p>
        <Link
          href="/create-brochure?new=1"
          className="mt-4 inline-block text-sm font-semibold text-[#596d63] hover:underline"
        >
          Create a memorial →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 divide-y divide-gray-100">
      {memorials.map((memorial) => (
        <article
          key={memorial.id}
          className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
        >
          <div className="min-w-0">
            <h3 className="truncate font-medium text-[#292c36]">
              {memorial.name || "Untitled memorial"}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {memorial.status} · {memorial.privacy} · Updated{" "}
              {new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(memorial.updatedAt))}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/create-brochure?memorial=${memorial.id}`}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Edit
            </Link>
            {memorial.status === "published" && (
              <Link
                href={`/brochure/${memorial.id}`}
                className="rounded-lg bg-[#292c36] px-3 py-2 text-sm text-white hover:bg-black"
              >
                View
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function ComingSoon({
  title,
  description,
  detail,
}: {
  title: string;
  description: string;
  detail: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8265]">
        In development
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-[#292c36]">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
        {description}
      </p>
      <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-500">
        {detail}
      </div>
      <Link
        href="/workspace"
        className="mt-6 inline-block text-sm font-semibold text-[#596d63] hover:underline"
      >
        Return to Tribute & Funeral →
      </Link>
    </section>
  );
}
