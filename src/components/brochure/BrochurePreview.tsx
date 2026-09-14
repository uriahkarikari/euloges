import type { BrochurePrivacy, BrochureSection } from "@/types/brochure";

type Props = {
  name: string;
  dob: string;
  dod: string;
  bio: string;
  portraitUrl: string;
  sections: BrochureSection[];
  privacy: BrochurePrivacy;
  accessCode: string;
};

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  if (!name.trim()) {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function BrochurePreview({
  name,
  dob,
  dod,
  bio,
  portraitUrl,
  sections,
  privacy,
  accessCode,
}: Props) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A44C]">
          Live Preview
        </p>

        <h2 className="mt-2 text-xl font-semibold text-[#2F2F2F]">
          Memorial Preview
        </h2>

        <p className="mt-1 text-sm text-black/55">
          This is how the memorial is beginning to take shape.
        </p>
      </div>

      <div className="rounded-2xl bg-[#F6F4F1] p-6 sm:p-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A44C]">
            In Loving Memory
          </p>

          <div className="mx-auto mt-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-sm">
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt={name ? `${name} memorial portrait` : "Memorial portrait"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#EEEAE4]">
                {name ? (
                  <span className="text-3xl font-semibold text-black/30">
                    {getInitials(name)}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-[0.15em] text-black/30">
                    Portrait
                  </span>
                )}
              </div>
            )}
          </div>

          <h3 className="mt-5 text-3xl font-semibold text-[#2F2F2F]">
            {name || "A Life Remembered"}
          </h3>

          {(dob || dod) && (
            <p className="mt-3 text-sm text-black/50">
              {dob ? formatDate(dob) : ""}
              {dob && dod ? " — " : ""}
              {dod ? formatDate(dod) : ""}
            </p>
          )}
        </div>

        {bio && (
          <div className="mt-8">
            <h4 className="text-base font-semibold text-[#2F2F2F]">
              Biography
            </h4>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-black/70">
              {bio}
            </p>
          </div>
        )}

        {sections.length > 0 && (
          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <div key={section.id}>
                <h4 className="text-base font-semibold text-[#2F2F2F]">
                  {section.title || "Untitled Section"}
                </h4>

                {section.content && (
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-black/70">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-black/10 pt-5">
          <p className="text-xs text-black/45">
            Privacy: <span className="font-medium capitalize">{privacy}</span>
          </p>

          {privacy === "family" && accessCode && (
            <p className="mt-1 text-xs text-black/45">
              Family access protection enabled.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
