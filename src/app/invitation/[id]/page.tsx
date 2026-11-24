"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QRCodeCanvas } from "qrcode.react";
import InvitationPreview from "@/components/invitations/InvitationPreview";

type InvitationSection = { id: string; title: string; content: string };
type Invite = {
  id: string;
  title: string;
  host_name: string;
  description: string | null;
  starts_at: string;
  venue_name: string | null;
  venue_address: string | null;
  map_url: string | null;
  cover_image_url: string | null;
  sections: InvitationSection[] | null;
};

export default function PublicInvitationPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState("yes");
  const [party, setParty] = useState("1");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      const { data, error: loadError } = await createClient()
        .from("invitations")
        .select("id,title,host_name,description,starts_at,venue_name,venue_address,map_url,cover_image_url,sections")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();

      if (!active) return;
      setUrl(window.location.href);
      if (loadError) setError(loadError.message);
      else setItem(data);
      setLoading(false);
    }

    void loadInvitation();
    return () => { active = false; };
  }, [id]);

  async function rsvp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: submitError } = await createClient().from("invitation_rsvps").insert({
      invitation_id: id,
      guest_name: name.trim(),
      guest_email: email.trim() || null,
      attending: attending === "yes",
      party_size: Number(party),
      message: message.trim() || null,
    });
    setBusy(false);
    if (submitError) setError(submitError.message);
    else setSent(true);
  }

  if (loading) return <main className="min-h-screen bg-[#F6F4F1] p-6 text-center">Loading invitation…</main>;
  if (!item) return <main className="min-h-screen bg-[#F6F4F1] p-6 text-center"><h1 className="text-xl font-semibold">Invitation unavailable</h1><p className="mt-2 text-sm">{error || "This invitation may be unpublished or unavailable."}</p></main>;

  return (
    <main className="min-h-screen bg-[#F6F4F1] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <InvitationPreview invitation={item} mode="published" />
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-[#E9E2D8] bg-white p-5">
          <button type="button" onClick={() => navigator.share ? void navigator.share({ title: item.title, url }) : void navigator.clipboard.writeText(url)} className="rounded-xl bg-[#302F2B] px-4 py-2.5 text-sm text-white">Share invitation</button>
          <div className="rounded-xl border p-2"><QRCodeCanvas value={url} size={104} includeMargin /><p className="text-[10px] text-[#817B72]">Scan to open</p></div>
        </div>
      </div>

      <section className="mx-auto mt-5 max-w-2xl rounded-3xl border bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Will you join us?</h2>
        {sent ? <p className="mt-4 rounded-xl bg-[#F2F5F0] p-4 text-sm">Thank you. Your response has been received.</p> : (
          <form onSubmit={rsvp} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Your name<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label>
            <label className="text-sm">Email (optional)<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label>
            <label className="text-sm">Your response<select value={attending} onChange={(event) => setAttending(event.target.value)} className="mt-1 w-full rounded-xl border p-3"><option value="yes">Happily accept</option><option value="no">Sorry, cannot attend</option></select></label>
            <label className="text-sm">Number attending<input type="number" min="1" max="20" value={party} onChange={(event) => setParty(event.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label>
            <label className="text-sm sm:col-span-2">Message (optional)<textarea maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1 w-full rounded-xl border p-3" rows={3} /></label>
            {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
            <button disabled={busy} className="rounded-xl bg-[#302F2B] px-5 py-3 text-sm text-white disabled:opacity-50 sm:col-span-2">{busy ? "Sending…" : "Send RSVP"}</button>
          </form>
        )}
      </section>
      <footer className="mx-auto mt-6 max-w-2xl text-center text-xs text-[#918A80]">An invitation shared with care · Lifebree</footer>
    </main>
  );
}
