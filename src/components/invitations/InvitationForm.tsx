"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Invitation = {
  id: string;
  title?: string;
  host_name?: string;
  starts_at?: string;
  venue_name?: string | null;
  venue_address?: string | null;
  map_url?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function InvitationForm({ invitation }: { invitation?: Invitation }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(invitation?.title ?? "");
  const [host, setHost] = useState(invitation?.host_name ?? "");
  const [date, setDate] = useState(invitation?.starts_at ? new Date(invitation.starts_at).toISOString().slice(0, 10) : "");
  const [time, setTime] = useState(invitation?.starts_at ? new Date(invitation.starts_at).toISOString().slice(11, 16) : "10:00");
  const [venue, setVenue] = useState(invitation?.venue_name ?? "");
  const [address, setAddress] = useState(invitation?.venue_address ?? "");
  const [map, setMap] = useState(invitation?.map_url ?? "");
  const [description, setDescription] = useState(invitation?.description ?? "");
  const [cover, setCover] = useState(invitation?.cover_image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(invitation?.cover_image_url ?? "");
  const field = "w-full rounded-xl border border-[#E5DED3] bg-white px-3 py-2.5 text-sm text-[#302F2B]";

  function chooseImage(file?: File) {
    setError("");
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("The image must be 10 MB or smaller.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setCover("");
  }

  async function save(status: "draft" | "published") {
    setError("");
    if (!title.trim() || !host.trim() || !date || !time) {
      setError("Add an invitation title, host, date and time.");
      return;
    }
    if (map && !/^https:\/\//i.test(map)) {
      setError("The map link must begin with https://");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in again.");
      setSaving(false);
      return;
    }

    const invitationId = invitation?.id ?? crypto.randomUUID();
    let uploadedPath: string | null = null;
    let coverUrl = cover.trim() || null;

    if (imageFile) {
      const extension = imageFile.type === "image/jpeg" ? "jpg" : imageFile.type === "image/png" ? "png" : "webp";
      uploadedPath = `${user.id}/${invitationId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("invitation-images").upload(uploadedPath, imageFile, {
        contentType: imageFile.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }
      coverUrl = supabase.storage.from("invitation-images").getPublicUrl(uploadedPath).data.publicUrl;
    }

    const payload = {
      title: title.trim(),
      host_name: host.trim(),
      starts_at: new Date(date + "T" + time).toISOString(),
      venue_name: venue.trim() || null,
      venue_address: address.trim() || null,
      map_url: map.trim() || null,
      description: description.trim() || null,
      cover_image_url: coverUrl,
      status,
      updated_at: new Date().toISOString(),
    };

    const result = invitation
      ? await supabase.from("invitations").update(payload).eq("id", invitation.id).select("id").single()
      : await supabase.from("invitations").insert({ ...payload, id: invitationId, creator_id: user.id }).select("id").single();

    if (result.error) {
      if (uploadedPath) await supabase.storage.from("invitation-images").remove([uploadedPath]);
      setError(result.error.message);
      setSaving(false);
      return;
    }

    if (imageFile && invitation?.cover_image_url?.includes("/invitation-images/")) {
      const oldPath = invitation.cover_image_url.split("/invitation-images/")[1];
      if (oldPath) await supabase.storage.from("invitation-images").remove([decodeURIComponent(oldPath)]);
    }

    setSaving(false);
    router.push("/invitations");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-[#E9E2D8] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 rounded-2xl border border-dashed border-[#D9CDBB] bg-[#FAF8F5] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#302F2B]">Event flyer or photo</p>
            <p className="mt-1 text-xs text-[#817B72]">Upload a JPG, PNG or WebP image (maximum 10 MB). Optional.</p>
          </div>
          <button type="button" onClick={() => fileInput.current?.click()} className="rounded-xl border border-[#D9CDBB] bg-white px-4 py-2 text-sm font-medium text-[#514C45]">
            {preview ? "Change image" : "Choose image"}
          </button>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => chooseImage(event.target.files?.[0])} />
        </div>
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="Invitation image preview" className="max-h-80 w-full rounded-xl object-contain bg-white" />
            <button type="button" onClick={() => { setImageFile(null); setPreview(""); setCover(""); if (fileInput.current) fileInput.current.value = ""; }} className="mt-2 text-xs text-red-700 underline">
              Remove image
            </button>
          </div>
        )}
        {!imageFile && cover && !preview && <p className="mt-3 text-xs text-[#817B72]">An image URL is currently saved for this invitation.</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Invitation title", title, setTitle, "e.g. Bernard & Priscilla’s Wedding"],
          ["Host / organiser", host, setHost, "Who is inviting guests?"],
          ["Venue name", venue, setVenue, "Venue or location"],
          ["Venue address", address, setAddress, "Street, town, region"],
          ["Google Maps / directions link", map, setMap, "https://maps.google.com/..."],
        ].map(([label, value, setter, placeholder]) => (
          <label key={label as string} className="text-sm font-medium text-[#514C45]">
            {label as string}
            <input className={field + " mt-1"} value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} placeholder={placeholder as string} />
          </label>
        ))}
        <label className="text-sm font-medium text-[#514C45]">Date
          <input type="date" className={field + " mt-1"} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-[#514C45]">Start time
          <input type="time" className={field + " mt-1"} value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-[#514C45] sm:col-span-2">A message for your guests
          <textarea className={field + " mt-1 min-h-28"} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a welcome message or useful details..." />
        </label>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button disabled={saving} onClick={() => save("draft")} className="rounded-xl border px-4 py-2.5 text-sm">{saving ? "Saving…" : "Save draft"}</button>
        <button disabled={saving} onClick={() => save("published")} className="rounded-xl bg-[#302F2B] px-5 py-2.5 text-sm text-white">{saving ? "Saving…" : "Publish invitation"}</button>
      </div>
      <p className="mt-3 text-xs text-[#918A80]">Published invitations are accessible to anyone with the link. Guests do not need a Lifebree account.</p>
    </div>
  );
}
