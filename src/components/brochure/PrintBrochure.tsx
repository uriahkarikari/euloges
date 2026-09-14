"use client";

import { QRCodeCanvas } from "qrcode.react";
import type { BrochureDraft } from "@/types/brochure";

type Props = {
  brochure: BrochureDraft;
  publicUrl: string;
};

function formatDate(value: string) {
  if (!value) return "";

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

export default function PrintBrochure({ brochure, publicUrl }: Props) {
  return (
    <main
      className="print-page mx-auto bg-white p-10 text-[#2F2F2F] shadow-sm"
      style={{
        width: "210mm",
        minHeight: "297mm",
      }}
    >
      <header className="border-b border-black/15 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A44C]">
          In Loving Memory
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
              {brochure.name ? (
                <span className="text-3xl font-semibold text-black/30">
                  {getInitials(brochure.name)}
                </span>
              ) : (
                <span className="text-xs uppercase tracking-[0.15em] text-black/30">
                  Portrait
                </span>
              )}
            </div>
          )}
        </div>

        <h1 className="mt-5 text-4xl font-semibold">
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

      {brochure.bio && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Biography</h2>

          <p className="mt-4 whitespace-pre-wrap leading-8 text-black/75">
            {brochure.bio}
          </p>
        </section>
      )}

      {brochure.sections.map((section) => (
        <section key={section.id} className="mt-10">
          <h2 className="text-xl font-semibold">
            {section.title || "Memorial Section"}
          </h2>

          {section.content && (
            <p className="mt-4 whitespace-pre-wrap leading-8 text-black/75">
              {section.content}
            </p>
          )}
        </section>
      ))}

      <footer className="mt-14 flex items-end justify-between gap-8 border-t border-black/15 pt-8">
        <div>
          <p className="text-sm font-semibold">
            Continue the remembrance online
          </p>

          <p className="mt-2 max-w-md break-all text-xs leading-5 text-black/50">
            {publicUrl}
          </p>
        </div>

        {publicUrl && (
          <QRCodeCanvas value={publicUrl} size={92} includeMargin />
        )}
      </footer>
    </main>
  );
}
