"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Interactions from "@/components/brochure/Interactions";
import MemorialHeader from "@/components/brochure/MemorialHeader";

import {
  approveMemorialMessage,
  canModerateMemorial,
  deleteMemorialMessage,
  toggleMemorialCandle,
  loadMemorialInteractions,
  recordMemorialEvent,
  submitMemorialMessage,
  hasVisitorLitCandle,
} from "@/lib/memorialInteractionsSupabase";

import { saveBrochureDraft } from "@/lib/brochureStorage";


import {
  loadBrochureFromSupabase,
  saveBrochureToSupabase,
} from "@/lib/brochureSupabase";

import type { BrochureDraft } from "@/types/brochure";
import type { MemorialInteractions } from "@/types/interactions";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default function PublicBrochurePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);

  const [brochure, setBrochure] = useState<BrochureDraft | null>(null);

  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [lightingCandle, setLightingCandle] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [candleLit, setCandleLit] = useState(false);
  const [canModerate, setCanModerate] = useState(false);

  const [interactions, setInteractions] = useState<MemorialInteractions>({
    candles: [],
    messages: [],
    analytics: {
      views: 0,
      qrScans: 0,
    },
  });

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<"condolence" | "tribute">(
    "condolence",
  );

  const [authorized, setAuthorized] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const countedVisit = useRef(false);

  /*
   * Load memorial and interactions.
   *
   * The zero-delay callback prevents synchronous state updates
   * directly inside the effect body, satisfying the current
   * React hooks lint rule.
   */

  useEffect(() => {
    let cancelled = false;

    async function loadMemorial() {
      if (!isValidUuid(id)) {
        if (!cancelled) {
          setBrochure(null);
          setLoaded(true);
          setLoading(false);
        }

        return;
      }
      try {
        const [
          saved,
          loadedInteractions,
          moderationAllowed,
          visitorHasLitCandle,
        ] = await Promise.all([
          loadBrochureFromSupabase(id),
          loadMemorialInteractions(id),
          canModerateMemorial(id),
          hasVisitorLitCandle(id),
        ]);

        if (cancelled) {
          return;
        }

        setBrochure(saved);

        if (!saved) {
          setLoaded(true);
          setLoading(false);
          return;
        }

        const previewRequested = searchParams.get("preview") === "1";

        setIsPreview(previewRequested);

        const requestedAction = searchParams.get("action");

        if (requestedAction === "tribute" || requestedAction === "condolence") {
          setMessageType(requestedAction);
        }

        setInteractions(loadedInteractions);
        setCanModerate(moderationAllowed);
        setCandleLit(visitorHasLitCandle);

        if (!countedVisit.current && saved.status === "published") {
          countedVisit.current = true;

          try {
            await recordMemorialEvent(id, "view");

            const fromQr = searchParams.get("source") === "qr";

            if (fromQr) {
              await recordMemorialEvent(id, "qr_scan");
            }
          } catch (error) {
            console.error("Unable to record memorial visit:", error);
          }
        }

        setLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error("Unable to load memorial:", error);

        if (!cancelled) {
          setLoaded(true);
          setLoading(false);
        }
      }
    }

    void loadMemorial();

    return () => {
      cancelled = true;
    };
  }, [id, searchParams]);

async function lightCandle() {
  if (!id || lightingCandle) {
    return;
  }

  setLightingCandle(true);

  try {
    const result = await toggleMemorialCandle(id);

    if (result.action === "lit") {
      setCandleLit(true);

      setInteractions((current) => ({
        ...current,
        candles: [
          ...current.candles,
          {
            id: result.candleId,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } else {
      setCandleLit(false);

      setInteractions((current) => ({
        ...current,
        candles: current.candles.filter(
          (candle) => candle.id !== result.candleId,
        ),
      }));
    }
  } catch (error) {
    console.error("Unable to toggle candle:", error);

    alert("Unable to update the candle. Please try again.");
  } finally {
    setLightingCandle(false);
  }
}
async function submitMessage(): Promise<boolean> {
  if (!id || !name.trim() || !message.trim() || submittingMessage) {
    return false;
  }

  setSubmittingMessage(true);

  try {
    await submitMemorialMessage({
      memorialId: id,
      name,
      message,
      type: messageType,
    });

    setMessage("");

    alert(
      messageType === "tribute"
        ? "Your tribute has been submitted for review."
        : "Your condolence has been submitted for review.",
    );

    return true;
  } catch (error) {
    console.error("Unable to submit message:", error);

    alert("Unable to submit your message. Please try again.");

    return false;
  } finally {
    setSubmittingMessage(false);
  }
}


  async function approveMessage(messageId: string) {
    try {
      const approved = await approveMemorialMessage(messageId);

      setInteractions((current) => ({
        ...current,
        messages: current.messages.map((item) =>
          item.id === messageId ? approved : item,
        ),
      }));
    } catch (error) {
      console.error("Unable to approve message:", error);

      alert("Unable to approve the message.");
    }
  }

  async function deleteMessage(messageId: string) {
    try {
      await deleteMemorialMessage(messageId);

      setInteractions((current) => ({
        ...current,
        messages: current.messages.filter((item) => item.id !== messageId),
      }));
    } catch (error) {
      console.error("Unable to delete message:", error);

      alert("Unable to delete the message.");
    }
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading memorial…
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F4F1] px-6 py-16 text-center">
        <p className="text-sm text-black/60">
          Loading printable Book of Condolence...
        </p>
      </main>
    );
  }

  if (!brochure) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Memorial not found
      </div>
    );
  }

  if (brochure.status === "draft" && !isPreview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4F1] px-4">
        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
            Euloges
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-[#2F2F2F]">
            Memorial Not Published
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/55">
            This memorial is still being prepared and is not yet available for
            public viewing.
          </p>
        </div>
      </div>
    );
  }

  if (brochure.privacy === "family" && !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4F1] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Euloges
          </p>

          <h1 className="mt-2 text-xl font-semibold">Private Memorial</h1>

          <p className="mt-2 text-sm text-gray-500">
            This family has chosen to keep the memorial private.
          </p>

          <input
            type="password"
            placeholder="Enter family access code"
            value={inputCode}
            onChange={(event) => {
              setInputCode(event.target.value);
              setAccessError("");
            }}
            className="mt-5 w-full rounded-lg border border-gray-200 p-2.5"
          />

          {accessError && (
            <p className="mt-2 text-xs text-red-600">{accessError}</p>
          )}

          <button
            type="button"
            onClick={() => {
              if (inputCode === brochure.accessCode) {
                setAuthorized(true);
                setAccessError("");
              } else {
                setAccessError("The access code is incorrect.");
              }
            }}
            className="mt-3 w-full rounded-lg bg-[#2F2F2F] px-4 py-2.5 text-white"
          >
            View Memorial
          </button>
        </div>
      </div>
    );
  }

  async function publishFromPreview() {
  if (!brochure) {
    return;
  }

  const now = new Date().toISOString();

  const publishedDraft: BrochureDraft = {
    ...brochure,
    status: "published",
    publishedAt: brochure.publishedAt ?? now,
    updatedAt: now,
  };

  try {
    const saved = await saveBrochureToSupabase(publishedDraft);

    saveBrochureDraft(saved);
    setBrochure(saved);

    window.history.replaceState({}, "", `/brochure/${saved.id}`);

    setIsPreview(false);
  } catch (error) {
    console.error("Unable to publish memorial:", error);

    alert("Unable to publish the memorial. Please try again.");
  }
}

  async function saveDraftAndReturn() {
    if (!brochure) {
      return;
    }

    const draft: BrochureDraft = {
      ...brochure,
      status: "draft",
      publishedAt: null,
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = await saveBrochureToSupabase(draft);

      saveBrochureDraft(saved);

      router.push("/create-brochure");
    } catch (error) {
      console.error("Unable to save draft:", error);

      alert("Unable to save the draft. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F4F1]">
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:py-14">
        {isPreview && brochure.status === "draft" && (
          <div className="rounded-2xl border border-[#C9A44C]/30 bg-[#C9A44C]/10 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#7A6329]">
                  Preview Mode
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7A6329]/80">
                  This memorial has not been published yet.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveDraftAndReturn}
                  className="rounded-xl border border-[#C9A44C]/40 bg-white px-4 py-2 text-sm font-medium text-[#7A6329]"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={publishFromPreview}
                  className="rounded-xl bg-[#2F2F2F] px-4 py-2 text-sm font-medium text-white"
                >
                  Publish Memorial
                </button>
              </div>
            </div>
          </div>
        )}
        {canModerate && (
          <div className="mb-4">
            <Link
              href="/memorials"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              <span aria-hidden="true">←</span>
              Back to Memorials
            </Link>
          </div>
        )}

        <MemorialHeader
          name={brochure.name}
          dob={brochure.dob}
          dod={brochure.dod}
          portraitUrl={brochure.portraitUrl}
          views={interactions.analytics.views}
          qrScans={interactions.analytics.qrScans}
          candles={interactions.candles.length}
        />

        {brochure.bio && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Biography</h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">
              {brochure.bio}
            </p>
          </section>
        )}

        {brochure.sections.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {section.title || "Memorial Section"}
            </h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">
              {section.content}
            </p>
          </section>
        ))}

        <Interactions
          interactions={interactions}
          name={name}
          message={message}
          messageType={messageType}
          setName={setName}
          setMessage={setMessage}
          setMessageType={setMessageType}
          onLightCandle={lightCandle}
          lightingCandle={lightingCandle}
          submittingMessage={submittingMessage}
          onSubmitMessage={submitMessage}
          candleLit={candleLit}
          onShare={() => {
            const memorialUrl = `${window.location.origin}/brochure/${id}`;

            if (navigator.share) {
              void navigator.share({
                title: brochure.name
                  ? `Remembering ${brochure.name}`
                  : "Euloges Memorial",
                text: brochure.name
                  ? `Remember ${brochure.name} on Euloges.`
                  : "View this memorial on Euloges.",
                url: memorialUrl,
              });

              return;
            }

            void navigator.clipboard.writeText(memorialUrl);

            alert("Memorial link copied to your clipboard.");
          }}
        />

        {canModerate && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Prototype Family Tools
              </p>

              <h2 className="mt-1 text-lg font-semibold">Moderate Messages</h2>

              <p className="mt-2 text-xs text-gray-500">
                Review submitted tributes and condolences before they appear
                publicly.
              </p>
            </div>

            {interactions.messages.length === 0 ? (
              <p className="mt-5 text-sm text-gray-500">
                No messages to review.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {interactions.messages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <p className="text-sm font-medium">{item.name}</p>

                      <span className="text-xs capitalize text-gray-400">
                        {item.type}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">{item.message}</p>

                    <div className="mt-4 flex gap-2">
                      {!item.approved && (
                        <button
                          type="button"
                          onClick={() => approveMessage(item.id)}
                          className="rounded-lg bg-[#7A9B8E] px-3 py-1.5 text-xs text-white"
                        >
                          Approve
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteMessage(item.id)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="border-t border-gray-200 pt-7 text-center">
          <p className="text-sm text-gray-400">
            This memorial was preserved on Euloges.
          </p>
        </footer>
      </main>
    </div>
  );
}
