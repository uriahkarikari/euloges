"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QRCodeCanvas } from "qrcode.react";

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
    setUrl(window.location.href);
    let active = true;
    (async () => {
      const { data, error } = await createClient()
        .from("invitations")
        .select("id,title,host_name,description,starts_at,venue_name,venue_address,map_url,cover_image_url")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();
      if (!active) return;
      if (error) setError(error.message);
      else setItem(data);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [id]);

  async function rsvp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().from("invitation_rsvps").insert({
      invitation_id: id,
      guest_name: name.trim(),
      guest_email: email.trim() || null,
      attending: attending === "yes",
      party_size: Number(party),
      message: message.trim() || null,
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (loading) return <main className="min-h-screen bg-[#F6F4F1] p-6 text-center">Loading invitation…</main>;
  if (!item) return <main className="min-h-screen bg-[#F6F4F1] p-6 text-center"><h1 className="text-xl font-semibold">Invitation unavailable</h1><p className="mt-2 text-sm">{error || "This invitation may be unpublished or unavailable."}</p></main>;

  return (
    <main className="min-h-screen bg-[#F6F4F1] px-4 py-10">
      <article className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#E9E2D8] bg-white shadow-sm">
        {item.cover_image_url && (
          <div className="bg-[#F7F4EF]">
            <img src={item.cover_image_url} alt={item.title + " event invitation"} className="max-h-[620px] w-full object-contain" />
          </div>
        )}
        <div className="p-6 text-center sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A17D32]">You are invited</p>
          <h1 className="mt-3 font-serif text-3xl text-[#302F2B] sm:text-4xl">{item.title}</h1>
          <p className="mt-3 text-sm text-[#817B72]">Hosted by {item.host_name}</p>
          {item.description && <p className="mx-auto mt-6 max-w-lg whitespace-pre-wrap text-sm leading-7">{item.description}</p>}
          <div className="my-7 rounded-2xl bg-[#F7F4EF] p-5 text-sm">
            <p className="font-semibold">{new Date(item.starts_at).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</p>
            {item.venue_name && <p className="mt-2 font-medium">{item.venue_name}</p>}
            {item.venue_address && <p className="mt-1">{item.venue_address}</p>}
            {item.map_url && <a href={item.map_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[#9A762F] underline">Get directions</a>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => navigator.share ? navigator.share({ title: item.title, url }) : navigator.clipboard.writeText(url)} className="rounded-xl bg-[#302F2B] px-4 py-2.5 text-sm text-white">Share invitation</button>
            <div className="rounded-xl border p-2"><QRCodeCanvas value={url} size={104} includeMargin /><p className="text-[10px] text-[#817B72]">Scan to open</p></div>
          </div>
        </div>
      </article>

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
