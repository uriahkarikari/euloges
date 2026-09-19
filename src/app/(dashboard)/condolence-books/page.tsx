"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

import {
  closeCondolenceBook,
  getOrCreateCondolenceBook,
  openCondolenceBook,
  updateCondolenceEntryStatus,
} from "@/lib/condolenceBookRepository";

import { loadBrochureFromSupabase } from "@/lib/brochureSupabase";

import type {
  CondolenceBookData,
  CondolenceEntryStatus,
} from "@/types/condolenceBook";

import type { BrochureDraft } from "@/types/brochure";

export default function CondolenceBooksPage() {
  const [brochure, setBrochure] = useState<BrochureDraft | null>(null);

  const [bookData, setBookData] = useState<CondolenceBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const memorialId = searchParams.get("memorial");

  const [showQrCode, setShowQrCode] = useState(false);
  const [changingBookStatus, setChangingBookStatus] = useState(false);
  const [reviewingEntryId, setReviewingEntryId] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
async function hydratePage() {
  setLoading(true);

  if (!memorialId) {
    if (!cancelled) {
      setBrochure(null);
      setBookData(null);
      setLoading(false);
    }

    return;
  }

  try {
    const savedBrochure = await loadBrochureFromSupabase(memorialId);

    if (cancelled) {
      return;
    }

    if (!savedBrochure) {
      setBrochure(null);
      setBookData(null);
      return;
    }

    setBrochure(savedBrochure);

    const data = await getOrCreateCondolenceBook(savedBrochure.id);

    if (!cancelled) {
      setBookData(data);
    }
  } catch (error) {
    console.error("Unable to load Book of Condolence:", error);

    if (!cancelled) {
      alert("Unable to load the Book of Condolence.");
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

    void hydratePage();

    return () => {
      cancelled = true;
    };
  }, [memorialId]);

  const counts = useMemo(() => {
    if (!bookData) {
      return {
        pending: 0,
        approved: 0,
        denied: 0,
      };
    }

    return {
      pending: bookData.entries.filter((entry) => entry.status === "pending")
        .length,

      approved: bookData.entries.filter((entry) => entry.status === "approved")
        .length,

      denied: bookData.entries.filter((entry) => entry.status === "denied")
        .length,
    };
  }, [bookData]);

  function refreshBook(updated: CondolenceBookData) {
    setBookData(updated);
  }

  async function handleOpenBook() {
    if (!brochure || changingBookStatus) {
      return;
    }

    setChangingBookStatus(true);

    try {
      const updated = await openCondolenceBook(brochure.id);
      refreshBook(updated);
    } catch (error) {
      console.error("Unable to open Book of Condolence:", error);
      alert("Unable to open the Book of Condolence.");
    } finally {
      setChangingBookStatus(false);
    }
  }

  async function handleCloseBook() {
    if (!brochure || changingBookStatus) {
      return;
    }

    setChangingBookStatus(true);

    try {
      const updated = await closeCondolenceBook(brochure.id);
      refreshBook(updated);
    } catch (error) {
      console.error("Unable to close Book of Condolence:", error);
      alert("Unable to close the Book of Condolence.");
    } finally {
      setChangingBookStatus(false);
    }
  }

  async function shareCondolenceBook() {
    if (!brochure) {
      return;
    }

    const bookUrl = `${window.location.origin}/brochure/${brochure.id}/condolence-book`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: brochure.name
            ? `Book of Condolence for ${brochure.name}`
            : "Euloges Book of Condolence",

          text: brochure.name
            ? `Sign the Book of Condolence for ${brochure.name} on Euloges.`
            : "Sign this Book of Condolence on Euloges.",

          url: bookUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(bookUrl);

      alert("Book of Condolence link copied to your clipboard.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      alert("The Book of Condolence could not be shared.");
    }
  }

  async function copyBookLink() {
    if (!brochure) {
      return;
    }

    const bookUrl = `${window.location.origin}/brochure/${brochure.id}/condolence-book`;

    try {
      await navigator.clipboard.writeText(bookUrl);

      alert("Book of Condolence link copied to your clipboard.");
    } catch {
      alert("The Book of Condolence link could not be copied.");
    }
  }

  async function handleStatusChange(
    entryId: string,
    status: CondolenceEntryStatus,
  ) {
    if (!brochure || reviewingEntryId) {
      return;
    }

    setReviewingEntryId(entryId);

    try {
      const updated = await updateCondolenceEntryStatus(
        brochure.id,
        entryId,
        status,
      );

      refreshBook(updated);
    } catch (error) {
      console.error("Unable to review condolence entry:", error);
      alert("Unable to update this condolence message.");
    } finally {
      setReviewingEntryId(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-[#7A9B8E]" />

          <p className="text-sm text-black/50">Loading Book of Condolence…</p>
        </div>
      </section>
    );
  }

  if (!brochure || !bookData) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm text-black/50">
          No memorial has been created yet.
        </p>

        <Link
          href="/create-brochure"
          className="mt-4 inline-flex rounded-xl bg-[#2F2F2F] px-4 py-2.5 text-sm font-medium text-white"
        >
          Create Memorial
        </Link>
      </section>
    );
  }

  const isOpen = bookData.book.status === "open";

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
              Legacy Workspace
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[#2F2F2F]">
              Book of Condolence
            </h1>

            <p className="mt-2 text-sm leading-6 text-black/55">
              Manage condolence messages for{" "}
              <span className="font-medium text-[#2F2F2F]">
                {brochure.name || "this memorial"}
              </span>
              .
            </p>
          </div>

          <StatusBadge status={bookData.book.status} />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={counts.pending} />

        <StatCard label="Approved" value={counts.approved} />

        <StatCard label="Denied" value={counts.denied} />
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2F2F2F]">
              Book Status
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">
              {isOpen
                ? "The book is open. Visitors can submit condolence messages for review."
                : "The book is closed. Existing approved entries remain preserved, but new submissions are not accepted."}
            </p>
          </div>

          {isOpen ? (
            <button
              type="button"
              onClick={handleCloseBook}
              disabled={changingBookStatus}
              className="rounded-xl border border-black/15 px-5 py-3 text-sm font-medium text-[#2F2F2F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changingBookStatus ? "Closing..." : "Close Book"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenBook}
              disabled={changingBookStatus}
              className="rounded-xl bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changingBookStatus ? "Opening..." : "Open Book of Condolence"}
            </button>
          )}
        </div>

        {isOpen && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-black/10 pt-5">
            <Link
              href={`/brochure/${brochure.id}/condolence-book`}
              className="rounded-xl bg-[#7A9B8E] px-4 py-2.5 text-sm font-medium text-white"
            >
              View Book
            </Link>

            <button
              type="button"
              onClick={shareCondolenceBook}
              className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-medium text-[#2F2F2F]"
            >
              Share
            </button>

            <button
              type="button"
              onClick={() => setShowQrCode(true)}
              className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-medium text-[#2F2F2F]"
            >
              QR Code
            </button>

            <Link
              href={`/brochure/${brochure.id}/condolence-book/print`}
              className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-medium text-[#2F2F2F]"
            >
              Print
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        {" "}
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#2F2F2F]">
            Pending Messages
          </h2>

          <p className="mt-1 text-sm text-black/50">
            Approve or deny submissions before they appear publicly or in print.
          </p>
        </div>
        {bookData.entries.filter((entry) => entry.status === "pending")
          .length === 0 ? (
          <EmptyState text="No pending condolence messages." />
        ) : (
          <div className="space-y-4">
            {bookData.entries
              .filter((entry) => entry.status === "pending")
              .map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-black/10 bg-[#FAF9F7] p-5"
                >
                  <EntryHeader
                    name={entry.name}
                    relationship={entry.relationship}
                    location={entry.location}
                  />

                  <p className="mt-4 whitespace-pre-wrap leading-7 text-black/70">
                    {entry.message}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(entry.id, "approved")}
                      disabled={reviewingEntryId !== null}
                      className="rounded-xl bg-[#7A9B8E] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingEntryId === entry.id
                        ? "Approving..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(entry.id, "denied")}
                      disabled={reviewingEntryId !== null}
                      className="rounded-xl border border-black/15 px-4 py-2 text-sm font-medium text-black/60 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingEntryId === entry.id ? "Denying..." : "Deny"}
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2F2F2F]">
          Approved Messages
        </h2>

        <p className="mt-1 text-sm text-black/50">
          These entries will appear in the public and printed Book of
          Condolence.
        </p>

        <div className="mt-5">
          {bookData.entries.filter((entry) => entry.status === "approved")
            .length === 0 ? (
            <EmptyState text="No approved messages yet." />
          ) : (
            <div className="space-y-4">
              {bookData.entries
                .filter((entry) => entry.status === "approved")
                .map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-2xl border border-black/10 p-5"
                  >
                    <EntryHeader
                      name={entry.name}
                      relationship={entry.relationship}
                      location={entry.location}
                    />

                    <p className="mt-4 whitespace-pre-wrap leading-7 text-black/70">
                      {entry.message}
                    </p>
                  </article>
                ))}
            </div>
          )}
        </div>
      </section>

      {showQrCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowQrCode(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
              Euloges
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#2F2F2F]">
              Book of Condolence
            </h2>

            {brochure.name && (
              <p className="mt-2 text-sm text-black/55">
                In Memory of {brochure.name}
              </p>
            )}

            <div className="mx-auto mt-6 flex w-fit items-center justify-center rounded-2xl border border-black/10 bg-white p-4">
              <QRCodeCanvas
                value={`${window.location.origin}/brochure/${brochure.id}/condolence-book?source=qr`}
                size={200}
                includeMargin
              />
            </div>

            <p className="mx-auto mt-4 max-w-xs text-xs leading-5 text-black/45">
              Scan this code to open the Book of Condolence and leave a message.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={copyBookLink}
                className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-medium"
              >
                Copy Link
              </button>

              <button
                type="button"
                onClick={() => setShowQrCode(false)}
                className="rounded-xl bg-[#2F2F2F] px-4 py-2.5 text-sm font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/40">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold text-[#2F2F2F]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="w-fit rounded-full bg-black/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/55">
      {status}
    </span>
  );
}

function EntryHeader({
  name,
  relationship,
  location,
}: {
  name: string;
  relationship: string;
  location: string;
}) {
  return (
    <div>
      <p className="font-semibold text-[#2F2F2F]">{name}</p>

      {(relationship || location) && (
        <p className="mt-1 text-xs text-black/45">
          {relationship}

          {relationship && location ? " · " : ""}

          {location}
        </p>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-black/10 bg-[#FAF9F7] p-6 text-center">
      <p className="text-sm text-black/45">{text}</p>
    </div>
  );
}
