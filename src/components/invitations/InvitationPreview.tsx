"use client";

type InvitationSection = { id: string; title: string; content: string };
export type InvitationPreviewData = {
  title?: string | null;
  host_name?: string | null;
  starts_at?: string | null;
  date?: string;
  time?: string;
  venue_name?: string | null;
  venue_address?: string | null;
  map_url?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  sections?: InvitationSection[] | null;
};

export default function InvitationPreview({
  invitation,
  mode = "draft",
}: {
  invitation: InvitationPreviewData;
  mode?: "draft" | "published";
}) {
  const startsAt = invitation.starts_at
    ? new Date(invitation.starts_at)
    : invitation.date && invitation.time
      ? new Date(`${invitation.date}T${invitation.time}`)
      : null;
  const validDate = startsAt && !Number.isNaN(startsAt.getTime());

  return (
    <aside className="overflow-hidden rounded-2xl border border-[#E9E2D8] bg-white shadow-sm">
      {mode === "draft" && (
        <div className="flex items-center justify-between border-b border-[#E9E2D8] bg-[#FAF8F5] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#302F2B]">Live preview</p>
            <p className="text-xs text-[#817B72]">Updates as you edit · Not published</p>
          </div>
          <span className="rounded-full bg-[#EFE7D8] px-3 py-1 text-xs font-medium text-[#80652F]">Draft</span>
        </div>
      )}
      <article className="mx-auto max-w-2xl overflow-hidden bg-white">
        {invitation.cover_image_url && (
          <div className="bg-[#F7F4EF]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={invitation.cover_image_url} alt={(invitation.title || "Invitation") + " event cover"} className="max-h-[420px] w-full object-contain" />
          </div>
        )}
        <div className="p-6 text-center sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A17D32]">You are invited</p>
          <h2 className="mt-3 break-words font-serif text-3xl text-[#302F2B] sm:text-4xl">{invitation.title?.trim() || "Your invitation title"}</h2>
          <p className="mt-3 text-sm text-[#817B72]">Hosted by {invitation.host_name?.trim() || "Host / organiser"}</p>
          {invitation.description?.trim() && <p className="mx-auto mt-6 max-w-lg whitespace-pre-wrap text-sm leading-7 text-[#514C45]">{invitation.description}</p>}
          <div className="my-7 rounded-2xl bg-[#F7F4EF] p-5 text-sm">
            <p className="font-semibold text-[#302F2B]">{validDate && startsAt ? startsAt.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" }) : "Event date and time"}</p>
            {invitation.venue_name?.trim() && <p className="mt-2 font-medium text-[#302F2B]">{invitation.venue_name}</p>}
            {invitation.venue_address?.trim() && <p className="mt-1 text-[#514C45]">{invitation.venue_address}</p>}
            {invitation.map_url?.trim() && (mode === "published" ? <a href={invitation.map_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[#9A762F] underline">Get directions</a> : <p className="mt-3 text-[#9A762F] underline">Get directions</p>)}
          </div>
          {!!invitation.sections?.length && (
            <div className="mt-8 space-y-4 text-left">
              {invitation.sections.map((section) => (
                <section key={section.id} className="rounded-2xl border border-[#E9E2D8] bg-[#FCFBF9] p-5">
                  <h3 className="font-serif text-xl text-[#302F2B]">{section.title || "Section title"}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#514C45]">{section.content || "Section details will appear here."}</p>
                </section>
              ))}
            </div>
          )}
          {mode === "published" && (
            <p className="mt-7 text-xs text-[#918A80]">An invitation shared with care · Lifebree</p>
          )}
        </div>
      </article>
    </aside>
  );
}
