"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import InvitationPreview from "@/components/invitations/InvitationPreview";

type InvitationRecord = {
  title: string;
  host_name: string;
  starts_at: string;
  venue_name: string | null;
  venue_address: string | null;
  map_url: string | null;
  description: string | null;
  cover_image_url: string | null;
  sections: { id: string; title: string; content: string }[] | null;
};

export default function InvitationFullPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [invitation, setInvitation] = useState<InvitationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) {
          setError("Sign in to preview this invitation.");
          setLoading(false);
        }
        return;
      }

      const { data, error: queryError } = await supabase
        .from("invitations")
        .select("title,host_name,starts_at,venue_name,venue_address,map_url,description,cover_image_url,sections")
        .eq("id", id)
        .eq("creator_id", user.id)
        .maybeSingle();

      if (!active) return;
      if (queryError) setError(queryError.message);
      else if (!data) setError("This invitation is unavailable or you do not have permission to preview it.");
      else setInvitation(data);
      setLoading(false);
    }

    void loadPreview();
    return () => { active = false; };
  }, [id]);

  return (
    <main className="min-h-screen bg-[#F6F4F1] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <a href="/invitations" className="text-sm text-[#817B72] underline underline-offset-4">Back to invitations</a>
          <span className="rounded-full bg-[#EFE7D8] px-3 py-1 text-xs font-medium text-[#80652F]">Saved draft preview</span>
        </div>
        {loading ? (
          <p className="rounded-2xl border border-[#E9E2D8] bg-white p-6 text-sm text-[#817B72]">Loading preview…</p>
        ) : error ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-700">{error}</p>
        ) : invitation ? (
          <InvitationPreview invitation={invitation} />
        ) : null}
        <p className="mt-4 text-center text-xs text-[#918A80]">This preview shows the last saved version. Return to the editor to see unsaved changes live.</p>
      </div>
    </main>
  );
}
