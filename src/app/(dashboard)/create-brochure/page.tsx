"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { loadBrochureDraft, saveBrochureDraft } from "@/lib/brochureStorage";
import {
  persistBrochureDraft,
  resetBrochurePersistenceState,
} from "@/lib/brochurePersistence";

import BasicInfoCard from "@/components/brochure/BasicInfoCard";
import BrochurePreview from "@/components/brochure/BrochurePreview";
import SectionsBuilder from "@/components/brochure/SectionsBuilder";
import { loadBrochureFromSupabase } from "@/lib/brochureSupabase";


import type {
  BrochureDraft,
  BrochurePrivacy,
  BrochureSection,
} from "@/types/brochure";

import {
  deleteMemorialPortrait,
  uploadMemorialPortrait,
} from "@/lib/portraitStorage";

export default function CreateBrochurePage() {
  const searchParams = useSearchParams();
  const memorialToEdit = searchParams.get("memorial");
  const newMemorialRequest = searchParams.get("new");
  const isCreatingNew = Boolean(newMemorialRequest);
  const [brochureId, setBrochureId] = useState("draft-001");
  const router = useRouter();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [dod, setDod] = useState("");
  const [bio, setBio] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);

  const [sections, setSections] = useState<BrochureSection[]>([]);

  const [privacy, setPrivacy] = useState<BrochurePrivacy>("public");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const [accessCode, setAccessCode] = useState("");
const [publishing, setPublishing] = useState(false);
const [editingPublishedMemorial, setEditingPublishedMemorial] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [loadingMemorial, setLoadingMemorial] = useState(
    Boolean(memorialToEdit),

  );

  useEffect(() => {
    let cancelled = false;

    async function hydrateBrochure() {
      try {
        if (isCreatingNew) {
          resetBrochurePersistenceState();

          setBrochureId(`draft-${newMemorialRequest ?? Date.now()}`);
          setName("");
          setDob("");
          setDod("");
          setBio("");
          setPortraitUrl("");
          setSections([]);
          setPrivacy("public");
          setAccessCode("");
          setStatus("draft");
          setPublishedAt(null);
          setSavedAt("");

          return;
        }
        if (memorialToEdit) {
          const saved = await loadBrochureFromSupabase(memorialToEdit);

          if (!saved || cancelled) {
            return;
          }

          setBrochureId(saved.id);
          setName(saved.name);
          setDob(saved.dob);
          setDod(saved.dod);
          setBio(saved.bio);
          setPortraitUrl(saved.portraitUrl);
          setSections(saved.sections ?? []);
          setPrivacy(saved.privacy);
          setAccessCode(saved.accessCode);
          setStatus(saved.status);
          setPublishedAt(saved.publishedAt);
          setSavedAt(saved.updatedAt);

          saveBrochureDraft(saved);

          return;
        }

        const saved = loadBrochureDraft();

        if (saved && !cancelled) {
          setBrochureId(saved.id);
          setName(saved.name);
          setDob(saved.dob);
          setDod(saved.dod);
          setBio(saved.bio);
          setPortraitUrl(saved.portraitUrl);
          setSections(saved.sections ?? []);
          setPrivacy(saved.privacy);
          setAccessCode(saved.accessCode);
          setStatus(saved.status);
          setPublishedAt(saved.publishedAt);
          setSavedAt(saved.updatedAt);
        }
      } catch (error) {
        console.error("Unable to load memorial:", error);

        if (!cancelled) {
          alert("Unable to load this memorial.");
        }
      } finally {
        if (!cancelled) {
          setLoadingMemorial(false);
          setHydrated(true);
        }
      }
    }

    void hydrateBrochure();

    return () => {
      cancelled = true;
    };
  }, [memorialToEdit, isCreatingNew, newMemorialRequest]);

 useEffect(() => {
   if (!hydrated || loadingMemorial) {
     return;
   }

   const hasMemorialContent =
  Boolean(name.trim()) ||
  Boolean(dob.trim()) ||
  Boolean(dod.trim()) ||
  Boolean(bio.trim()) ||
  Boolean(portraitUrl.trim()) ||
  sections.length > 0;

if (isCreatingNew && !hasMemorialContent) {
  return;
}


   let cancelled = false;

   const timer = window.setTimeout(async () => {
     const draft: BrochureDraft = {
       id: brochureId,
       name,
       dob,
       dod,
       bio,
       portraitUrl,
       sections,
       privacy,
       accessCode,
       status,
       publishedAt,
       updatedAt: new Date().toISOString(),
     };

     try {
       const saved = await persistBrochureDraft(draft);

       if (cancelled) {
         return;
       }

       /*
        * First successful Supabase save converts:
        *
        * draft-001
        *      ↓
        * real Supabase UUID
        */
       if (saved.id !== brochureId) {
         setBrochureId(saved.id);
       }

       setSavedAt(saved.updatedAt);
     } catch (error) {
       /*
        * persistBrochureDraft already saved the current
        * version to localStorage before attempting Supabase.
        * Therefore a network/backend failure does not lose
        * the user's current work.
        */
       console.error("Supabase autosave failed:", error);

       if (!cancelled) {
         setSavedAt(draft.updatedAt);
       }
     }
   }, 300);

   return () => {
     cancelled = true;
     window.clearTimeout(timer);
   };
 }, [
   brochureId,
   name,
   dob,
   dod,
   bio,
   portraitUrl,
   sections,
   privacy,
   accessCode,
   status,
   publishedAt,
   hydrated,
   loadingMemorial,
   isCreatingNew,
 ]);

  function buildCurrentDraft(
    nextStatus: "draft" | "published" = status,
    nextPublishedAt: string | null = publishedAt,
  ): BrochureDraft {
    return {
      id: brochureId,
      name,
      dob,
      dod,
      bio,
      portraitUrl,
      sections,
      privacy,
      accessCode,
      status: nextStatus,
      publishedAt: nextPublishedAt,
      updatedAt: new Date().toISOString(),
    };
  }

  async function previewMemorial() {
    const draft = buildCurrentDraft();

    try {
      const saved = await persistBrochureDraft(draft);

      if (saved.id !== brochureId) {
        setBrochureId(saved.id);
      }

      setSavedAt(saved.updatedAt);

      window.open(
        `/brochure/${saved.id}?preview=1`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      console.error("Unable to preview memorial:", error);

      alert("Unable to save the memorial before previewing. Please try again.");
    }
  }

async function publishMemorial() {
  if (!name.trim() || publishing) {
    return;
  }

  setPublishing(true);

  const publicationTime = publishedAt ?? new Date().toISOString();

  const publishedDraft = buildCurrentDraft("published", publicationTime);

  try {
    const saved = await persistBrochureDraft(publishedDraft);

    if (saved.id !== brochureId) {
      setBrochureId(saved.id);
    }

    setStatus("published");
    setPublishedAt(saved.publishedAt ?? publicationTime);
    setSavedAt(saved.updatedAt);
  } catch (error) {
    console.error("Unable to publish memorial:", error);

    alert("Unable to publish the memorial. Please try again.");
  } finally {
    setPublishing(false);
  }
}

  function viewMemorial() {
    window.open(`/brochure/${brochureId}`, "_blank", "noopener,noreferrer");
  }

  async function shareMemorial() {
    const memorialUrl = `${window.location.origin}/brochure/${brochureId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: name ? `In Memory of ${name}` : "Euloges Memorial",
          text: name
            ? `View the memorial of ${name} on Euloges.`
            : "View this memorial on Euloges.",
          url: memorialUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(memorialUrl);

      alert("Memorial link copied to your clipboard.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      alert("The memorial could not be shared.");
    }
  }

  async function copyMemorialLink() {
    const memorialUrl = `${window.location.origin}/brochure/${brochureId}`;

    try {
      await navigator.clipboard.writeText(memorialUrl);
      alert("Memorial link copied to your clipboard.");
    } catch {
      alert("The memorial link could not be copied.");
    }
  }
function continueEditing() {
  setEditingPublishedMemorial(true);
}

function finishEditingPublishedMemorial() {
  setEditingPublishedMemorial(false);
}

  function openPrintVersion() {
    window.open(
      `/brochure/${brochureId}/print`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function finishMemorial() {
    router.push("/");
  }

  async function handlePortraitRemoved() {
    if (!portraitUrl) {
      return;
    }

    const previousPortraitUrl = portraitUrl;

    try {
      /*
       * Persist the memorial without a portrait first.
       * This ensures the database no longer references
       * the Storage object before we delete it.
       */
      const draftWithoutPortrait: BrochureDraft = {
        ...buildCurrentDraft(),
        portraitUrl: "",
        updatedAt: new Date().toISOString(),
      };

      const saved = await persistBrochureDraft(draftWithoutPortrait);

      setBrochureId(saved.id);
      setPortraitUrl("");
      setSavedAt(saved.updatedAt);

      /*
       * Now that the database no longer references the
       * portrait, remove the actual Storage object.
       *
       * Legacy base64/external URLs are safely ignored.
       */
      try {
        await deleteMemorialPortrait(previousPortraitUrl);
      } catch (error) {
        console.error(
          "Unable to remove memorial portrait from Storage:",
          error,
        );
      }
    } catch (error) {
      console.error("Unable to remove memorial portrait:", error);

      alert("Unable to remove the photograph. Please try again.");
    }
  }

  async function handlePortraitSelected(file: File) {
    try {
      /*
       * Ensure this memorial has a real Supabase UUID
       * before its portrait is uploaded.
       */
      const currentDraft = buildCurrentDraft();
      const saved = await persistBrochureDraft(currentDraft);

      if (saved.id !== brochureId) {
        setBrochureId(saved.id);
      }

      const previousPortraitUrl = portraitUrl;

      /*
       * Store the actual image in Supabase Storage.
       */
      const uploadedUrl = await uploadMemorialPortrait(saved.id, file);

      /*
       * Immediately persist the Storage URL.
       * Do not rely only on the debounced autosave.
       */
      const draftWithPortrait: BrochureDraft = {
        ...saved,
        portraitUrl: uploadedUrl,
        updatedAt: new Date().toISOString(),
      };

      const savedWithPortrait = await persistBrochureDraft(draftWithPortrait);

      setBrochureId(savedWithPortrait.id);
      setPortraitUrl(savedWithPortrait.portraitUrl);
      setSavedAt(savedWithPortrait.updatedAt);

      /*
       * Only remove the previous portrait after both
       * the new upload and database save succeeded.
       *
       * Legacy base64/external URLs are safely ignored
       * by deleteMemorialPortrait().
       */
      if (previousPortraitUrl && previousPortraitUrl !== uploadedUrl) {
        try {
          await deleteMemorialPortrait(previousPortraitUrl);
        } catch (error) {
          console.error("Unable to remove previous memorial portrait:", error);
        }
      }
    } catch (error) {
      console.error("Unable to upload memorial portrait:", error);

      alert("Unable to upload the photograph. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
          Euloges
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[#2F2F2F]">
          Create a Memorial
        </h1>

        <p className="mt-2 text-sm text-black/55">
          Preserve a life, story and memory for family and future generations.
        </p>

        {savedAt && (
          <p className="mt-2 text-xs text-black/40">
            Draft saved automatically.
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-black/40">Visibility</span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-black/35">Family (Private)</span>

            <button
              type="button"
              disabled
              aria-label="Memorial visibility is currently public"
              title="Secure family access coming soon"
              className="relative h-6 w-11 cursor-not-allowed rounded-full bg-[#7A9B8E] opacity-80"
            >
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
            </button>

            <span className="text-sm font-medium text-[#2F2F2F]">Public</span>
          </div>

          <span className="text-xs text-black/35">
            Secure family access coming soon
          </span>
        </div>
      </header>

      <BasicInfoCard
        name={name}
        dob={dob}
        dod={dod}
        bio={bio}
        portraitUrl={portraitUrl}
        setName={setName}
        setDob={setDob}
        setDod={setDod}
        setBio={setBio}
        onPortraitSelected={handlePortraitSelected}
        onPortraitRemoved={handlePortraitRemoved}
      />

      <SectionsBuilder sections={sections} setSections={setSections} />

      <BrochurePreview
        name={name}
        dob={dob}
        dod={dod}
        bio={bio}
        portraitUrl={portraitUrl}
        sections={sections}
        privacy={privacy}
        accessCode={accessCode}
      />
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
              Memorial Status
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-[#2F2F2F]">
                {status === "published"
                  ? "Memorial Published"
                  : "Ready to Publish?"}
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-black/40">
                  Visibility
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-black/35">
                    Family (Private)
                  </span>

                  <button
                    type="button"
                    disabled
                    aria-label="Memorial visibility is currently public"
                    title="Secure family access coming soon"
                    className="relative h-6 w-11 cursor-not-allowed rounded-full bg-[#7A9B8E] opacity-80"
                  >
                    <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                  </button>

                  <span className="text-sm font-medium text-[#2F2F2F]">
                    Public
                  </span>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  status === "published"
                    ? "bg-[#7A9B8E]/15 text-[#567568]"
                    : "bg-black/[0.05] text-black/50"
                }`}
              >
                {status === "published" ? "Published" : "Draft"}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
              {status === "published"
                ? "Your memorial has been marked as published. You can now view, share or print it."
                : "Preview the memorial first, then publish it when the family is ready."}
            </p>
          </div>

          {status === "draft" ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={previewMemorial}
                className="rounded-xl border border-black/15 px-5 py-3 text-sm font-medium text-[#2F2F2F] hover:bg-black/[0.03]"
              >
                Preview Memorial
              </button>

              <button
                type="button"
                onClick={publishMemorial}
                disabled={!name.trim() || publishing}
                className="rounded-xl bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {publishing ? "Publishing..." : "Publish Memorial"}
              </button>
            </div>
          ) : editingPublishedMemorial ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={previewMemorial}
                className="rounded-xl border border-black/15 px-5 py-3 text-sm font-medium text-[#2F2F2F] hover:bg-black/[0.03]"
              >
                Preview Changes
              </button>

              <button
                type="button"
                onClick={finishEditingPublishedMemorial}
                className="rounded-xl bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white"
              >
                Finish Editing
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#7A9B8E]/25 bg-[#7A9B8E]/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#567568]">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#2F2F2F]">
                      Memorial published successfully
                    </p>

                    <p className="mt-1 text-xs leading-5 text-black/55">
                      The memorial is ready to view, share and print.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={viewMemorial}
                  className="rounded-xl bg-[#2F2F2F] px-4 py-3 text-sm font-medium text-white"
                >
                  View Memorial
                </button>

                <button
                  type="button"
                  onClick={shareMemorial}
                  className="rounded-xl border border-black/15 px-4 py-3 text-sm font-medium text-[#2F2F2F]"
                >
                  Share Memorial
                </button>

                <button
                  type="button"
                  onClick={copyMemorialLink}
                  className="rounded-xl border border-black/15 px-4 py-3 text-sm font-medium text-[#2F2F2F]"
                >
                  Copy Link
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrCode(true)}
                  className="rounded-xl border border-black/15 px-4 py-3 text-sm font-medium text-[#2F2F2F]"
                >
                  Show QR Code
                </button>

                <button
                  type="button"
                  onClick={openPrintVersion}
                  className="rounded-xl border border-black/15 px-4 py-3 text-sm font-medium text-[#2F2F2F]"
                >
                  Print / PDF
                </button>

                <button
                  type="button"
                  onClick={continueEditing}
                  className="rounded-xl border border-black/15 px-4 py-3 text-sm font-medium text-[#2F2F2F]"
                >
                  Edit Memorial
                </button>
              </div>

              <div className="flex justify-end border-t border-black/10 pt-4">
                <button
                  type="button"
                  onClick={finishMemorial}
                  className="rounded-xl bg-[#7A9B8E] px-5 py-3 text-sm font-medium text-white"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
        {showQrCode && status === "published" && (
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
                Memorial QR Code
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/55">
                Scan this code to open the memorial.
              </p>

              <div className="mx-auto mt-6 flex w-fit items-center justify-center rounded-2xl border border-black/10 bg-white p-4">
                <QRCodeCanvas
                  value={`${window.location.origin}/brochure/${brochureId}?source=qr`}
                  size={200}
                  includeMargin
                />
              </div>

              {name && (
                <p className="mt-4 text-sm font-medium text-[#2F2F2F]">
                  In Memory of {name}
                </p>
              )}

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={copyMemorialLink}
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
      </section>
    </div>
  );
}
