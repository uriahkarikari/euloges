"use client";
import Image from "next/image";

import { useEffect, useMemo, useState } from "react";

import { useParams } from "next/navigation";


import {
  addCondolenceEntry,
  loadCondolenceBook,
} from "@/lib/condolenceBookRepository";

import { loadBrochureFromSupabase } from "@/lib/brochureSupabase";


import type { BrochureDraft } from "@/types/brochure";

import type { CondolenceBookData } from "@/types/condolenceBook";

export default function CondolenceBookPage() {
  const params = useParams<{ id: string }>();
  const memorialId = params.id;

  const [loading, setLoading] = useState(true);

  const [brochure, setBrochure] = useState<BrochureDraft | null>(null);

  const [bookData, setBookData] = useState<CondolenceBookData | null>(null);

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

useEffect(() => {
  let cancelled = false;

  async function hydratePage() {
    try {
      const [savedBrochure, savedBook] = await Promise.all([
        loadBrochureFromSupabase(memorialId),
        loadCondolenceBook(memorialId),
      ]);

      if (cancelled) {
        return;
      }

      setBrochure(savedBrochure);
      setBookData(savedBook);
    } catch (error) {
      console.error("Unable to load Book of Condolence:", error);
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

  const approvedEntries = useMemo(() => {
    if (!bookData) {
      return [];
    }

    return bookData.entries.filter((entry) => entry.status === "approved");
  }, [bookData]);

  async function submitCondolence() {
    if (!bookData || bookData.book.status !== "open" || submitting) {
      return;
    }

    if (!name.trim() || !relationship.trim() || !message.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const updated = await addCondolenceEntry(memorialId, {
        name,
        relationship,
        location,
        message,
      });

      setBookData(updated);

      setName("");
      setRelationship("");
      setLocation("");
      setMessage("");
      setSubmitted(true);
    } catch (error) {
      console.error("Unable to submit condolence:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit your condolence.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F4F1] px-4">
        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
            Euloges
          </p>

          <p className="mt-3 text-sm text-black/50">
            Loading Book of Condolence...
          </p>
        </div>
      </main>
    );
  }

  if (!brochure || !bookData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F4F1] px-4">
        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
            Euloges
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-[#2F2F2F]">
            Book of Condolence Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/55">
            No Book of Condolence matching this memorial was found.
          </p>
        </div>
      </main>
    );
  }

  const isOpen = bookData.book.status === "open";

  return (
    <main className="min-h-screen bg-[#F6F4F1] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-3xl border border-black/10 bg-white p-7 text-center shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A44C]">
            Euloges
          </p>

          <div className="relative mx-auto mt-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EEEAE4] shadow-sm">
            {" "}
            {brochure.portraitUrl ? (
              <Image
                src={brochure.portraitUrl}
                alt={
                  brochure.name
                    ? `${brochure.name} memorial portrait`
                    : "Memorial portrait"
                }
                fill
                sizes="144px"
                unoptimized={brochure.portraitUrl.startsWith("data:image/")}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-3xl font-semibold text-black/25">
                  {getInitials(brochure.name)}
                </span>
              </div>
            )}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#7A9B8E]">
            Book of Condolence
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#2F2F2F] sm:text-4xl">
            {brochure.name || "A Life Remembered"}
          </h1>

          {(brochure.dob || brochure.dod) && (
            <p className="mt-3 text-sm text-black/50">
              {brochure.dob ? formatDate(brochure.dob) : ""}

              {brochure.dob && brochure.dod ? " — " : ""}

              {brochure.dod ? formatDate(brochure.dod) : ""}
            </p>
          )}

          <div className="mt-5">
            <span className="inline-flex rounded-full bg-black/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/55">
              {isOpen ? "Open for Condolences" : "Closed"}
            </span>
          </div>
        </header>

        {isOpen && (
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A9B8E]">
                Sign the Book
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#2F2F2F]">
                Leave a Message of Condolence
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/55">
                Your message will be submitted to the family for review before
                it appears in the Book of Condolence.
              </p>
            </div>

            {submitted && (
              <div className="mt-5 rounded-2xl border border-[#7A9B8E]/20 bg-[#7A9B8E]/10 p-4">
                <p className="text-sm font-medium text-[#567568]">
                  Thank you. Your condolence has been submitted for review.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-4">
              <div>
                <label
                  htmlFor="condolence-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Your name
                </label>

                <input
                  id="condolence-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#7A9B8E]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="condolence-relationship"
                    className="mb-2 block text-sm font-medium"
                  >
                    Relationship
                  </label>

                  <input
                    id="condolence-relationship"
                    type="text"
                    value={relationship}
                    onChange={(event) => setRelationship(event.target.value)}
                    placeholder="e.g. Friend, Colleague"
                    className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#7A9B8E]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="condolence-location"
                    className="mb-2 block text-sm font-medium"
                  >
                    Location <span className="text-black/35">(optional)</span>
                  </label>

                  <input
                    id="condolence-location"
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="e.g. Accra, Ghana"
                    className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#7A9B8E]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="condolence-message"
                  className="mb-2 block text-sm font-medium"
                >
                  Condolence message
                </label>

                <textarea
                  id="condolence-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  placeholder="Write your message..."
                  className="w-full resize-y rounded-xl border border-black/15 px-4 py-3 leading-7 outline-none focus:border-[#7A9B8E]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={submitCondolence}
                  disabled={
                    submitted ||
                    submitting ||
                    !name.trim() ||
                    !relationship.trim() ||
                    !message.trim()
                  }
                  className={
                    submitted
                      ? "rounded-xl bg-[#7A9B8E] px-5 py-3 text-sm font-medium text-white"
                      : "rounded-xl bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  }
                >
                  {submitted
                    ? "✓ Submitted"
                    : submitting
                      ? "Submitting..."
                      : "Submit Condolence"}
                </button>
                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {!isOpen && (
          <section className="rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-[#2F2F2F]">
              This Book of Condolence is currently closed.
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/55">
              Approved messages remain preserved below.
            </p>
          </section>
        )}

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A44C]">
              Messages of Condolence
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#2F2F2F]">
              Remembering {brochure.name || "this life"}
            </h2>
          </div>

          {approvedEntries.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[#FAF9F7] p-8 text-center">
              <p className="text-sm text-black/45">
                No approved condolence messages yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {approvedEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="border-b border-black/10 pb-5 last:border-b-0 last:pb-0"
                >
                  <p className="whitespace-pre-wrap leading-7 text-black/75">
                    {entry.message}
                  </p>

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-[#2F2F2F]">
                      {entry.name}
                    </p>

                    {(entry.relationship || entry.location) && (
                      <p className="mt-1 text-xs text-black/45">
                        {entry.relationship}

                        {entry.relationship && entry.location ? " · " : ""}

                        {entry.location}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-black/35">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function getInitials(name: string) {
  if (!name.trim()) {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
