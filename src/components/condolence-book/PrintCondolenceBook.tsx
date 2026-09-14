"use client";

import { QRCodeCanvas } from "qrcode.react";

import type { BrochureDraft } from "@/types/brochure";
import type { CondolenceEntry } from "@/types/condolenceBook";

type Props = {
  brochure: BrochureDraft;
  entries: CondolenceEntry[];
  bookUrl: string;
};

export default function PrintCondolenceBook({
  brochure,
  entries,
  bookUrl,
}: Props) {
  return (
    <main
      className="print-page mx-auto bg-white p-10 text-[#2F2F2F] shadow-sm"
      style={{
        width: "210mm",
        minHeight: "297mm",
      }}
    >
      <header className="border-b border-black/15 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A44C]">
          Euloges
        </p>

        <div className="mx-auto mt-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EEEAE4] shadow-sm">
          {brochure.portraitUrl ? (
            <img
              src={brochure.portraitUrl}
              alt={
                brochure.name
                  ? `${brochure.name} memorial portrait`
                  : "Memorial portrait"
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-3xl font-semibold text-black/25">
                {getInitials(brochure.name)}
              </span>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
          Book of Condolence
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          {brochure.name || "A Life Remembered"}
        </h1>

        {(brochure.dob || brochure.dod) && (
          <p className="mt-3 text-sm text-black/55">
            {brochure.dob ? formatDate(brochure.dob) : ""}

            {brochure.dob && brochure.dod ? " — " : ""}

            {brochure.dod ? formatDate(brochure.dod) : ""}
          </p>
        )}
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Messages of Condolence</h2>

        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-black/50">
            No approved condolence messages yet.
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="break-inside-avoid border-b border-black/10 pb-6 last:border-b-0"
              >
                <p className="whitespace-pre-wrap leading-8 text-black/75">
                  {entry.message}
                </p>

                <div className="mt-4">
                  <p className="font-semibold">{entry.name}</p>

                  {(entry.relationship || entry.location) && (
                    <p className="mt-1 text-sm text-black/50">
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

      <footer className="mt-14 flex items-end justify-between gap-8 border-t border-black/15 pt-8">
        <div>
          <p className="text-sm font-semibold">
            Continue the remembrance online
          </p>

          <p className="mt-2 max-w-md break-all text-xs leading-5 text-black/50">
            {bookUrl}
          </p>
        </div>

        {bookUrl && <QRCodeCanvas value={bookUrl} size={92} includeMargin />}
      </footer>
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
