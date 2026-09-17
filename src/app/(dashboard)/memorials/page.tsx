"use client";

import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  listUserMemorials,
  type MemorialListItem,
} from "@/lib/memorialRepository";

export default function MemorialsPage() {
  const router = useRouter();
  const [memorials, setMemorials] = useState<MemorialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); 
  

  function createNewMemorial() {
    router.push(`/create-brochure?new=${Date.now()}`);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadMemorials() {
      try {
        const items = await listUserMemorials();

        if (!cancelled) {
          setMemorials(items);
        }
      } catch (error) {
        console.error("Unable to load memorials:", error);

        if (!cancelled) {
          setErrorMessage("Unable to load your memorials.");
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

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading memorials…</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Legacy Workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-[#2F2F2F]">
              Memorials
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage the memorials you have created on Euloges.
            </p>
          </div>

          <button
            type="button"
            onClick={createNewMemorial}
            className="rounded-xl bg-[#2F2F2F] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-black"
          >
            Create Memorial
          </button>
        </div>
      </section>

      {errorMessage && (
        <section className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {errorMessage}
        </section>
      )}

      {!errorMessage && memorials.length === 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#2F2F2F]">
            No memorials yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first memorial to begin preserving a life story.
          </p>

          <button
            type="button"
            onClick={createNewMemorial}
            className="mt-5 rounded-xl bg-[#2F2F2F] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-black"
          >
            Create Memorial
          </button>
        </section>
      )}

      {!errorMessage && memorials.length > 0 && (
        <section className="grid gap-4">
          {memorials.map((memorial) => (
            <article
              key={memorial.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {" "}
                  {memorial.portraitUrl ? (
                    <Image
                      src={memorial.portraitUrl}
                      alt={memorial.name || "Memorial portrait"}
                      fill
                      sizes="80px"
                      unoptimized={memorial.portraitUrl.startsWith(
                        "data:image/",
                      )}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No photo
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-[#2F2F2F]">
                      {memorial.name || "Untitled Memorial"}
                    </h2>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-gray-600">
                      {memorial.status}
                    </span>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-gray-600">
                      {memorial.privacy}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Updated {formatDate(memorial.updatedAt)}
                  </p>

                  {memorial.publishedAt && (
                    <p className="mt-1 text-xs text-gray-400">
                      Published {formatDate(memorial.publishedAt)}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/brochure/${memorial.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    View
                  </Link>

                  <Link
                    href={`/create-brochure?memorial=${memorial.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/brochure/${memorial.id}`}
                    className="rounded-lg bg-[#7A9B8E] px-3 py-2 text-sm text-white"
                  >
                    Moderate
                  </Link>
                  <Link
                    href={`/condolence-books?memorial=${memorial.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Book of Condolence
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
