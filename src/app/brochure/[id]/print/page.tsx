
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import PrintCondolenceBook from "@/components/condolence-book/PrintCondolenceBook";

import { loadBrochureFromSupabase } from "@/lib/brochureSupabase";
import { loadCondolenceBook } from "@/lib/condolenceBookRepository";

import type { BrochureDraft } from "@/types/brochure";
import type { CondolenceBookData } from "@/types/condolenceBook";

export default function CondolenceBookPrintPage() {
  const params = useParams<{ id: string }>();
  const memorialId = params.id;

  const [loading, setLoading] = useState(true);

  const [brochure, setBrochure] = useState<BrochureDraft | null>(null);

  const [bookData, setBookData] = useState<CondolenceBookData | null>(null);

  const [bookUrl, setBookUrl] = useState("");

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

        setBookUrl(
          `${window.location.origin}/brochure/${memorialId}/condolence-book`,
        );
      } catch (error) {
        console.error("Unable to load printable Book of Condolence:", error);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F4F1] px-6 py-16 text-center">
        <p className="text-sm text-black/60">
          Loading printable Book of Condolence...
        </p>
      </main>
    );
  }

  if (!brochure || !bookData) {
    return (
      <main className="min-h-screen bg-[#F6F4F1] px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Book of Condolence not found</h1>

        <p className="mt-3 text-sm text-black/60">
          No Book of Condolence matching this memorial was found.
        </p>
      </main>
    );
  }

  return (
    <div className="print-shell min-h-screen bg-[#EEEAE4] py-8">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] justify-end gap-2 px-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-xl border border-black/15 bg-white px-5 py-3 text-sm font-medium text-[#2F2F2F]"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white"
        >
          Print / Save as PDF
        </button>
      </div>

      <PrintCondolenceBook
        brochure={brochure}
        entries={approvedEntries}
        bookUrl={bookUrl}
      />
    </div>
  );
}

