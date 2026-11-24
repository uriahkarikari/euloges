"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import InvitationForm from "@/components/invitations/InvitationForm";

type InvitationSection = { id: string; title: string; content: string };
type InvitationRecord = {
  id: string;
  title: string;
  host_name: string;
  starts_at: string;
  venue_name: string | null;
  venue_address: string | null;
  map_url: string | null;
  description: string | null;
  cover_image_url: string | null;
  sections: InvitationSection[] | null;
};

export default function EditInvitationPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<InvitationRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      const { data, error: loadError } = await createClient()
        .from("invitations")
        .select("id,title,host_name,starts_at,venue_name,venue_address,map_url,description,cover_image_url,sections")
        .eq("id", id)
        .single();

      if (!active) return;
      if (loadError) setError(loadError.message);
      else setItem(data);
    }

    void loadInvitation();
    return () => { active = false; };
  }, [id]);

  if (error) return <p role="alert" className="bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!item) return <p className="text-sm text-[#817B72]">Loading invitation…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-semibold">Edit invitation</h1>
      <InvitationForm invitation={item} />
    </div>
  );
}
