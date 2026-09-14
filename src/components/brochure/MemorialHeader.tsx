type Props = {
  name: string;
  dob: string;
  dod: string;
  portraitUrl: string;
  views: number;
  qrScans: number;
  candles: number;
};

function formatDate(value: string) {
  if (!value) return "";

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

export default function MemorialHeader({
  name,
  dob,
  dod,
  portraitUrl,
  views,
  qrScans,
  candles,
}: Props) {
  return (
    <header className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A44C]">
        In Loving Memory
      </p>

      <div className="mx-auto mt-5 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-sm">
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

      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#2F2F2F] sm:text-5xl">
        {name || "A Life Remembered"}
      </h1>

      {(dob || dod) && (
        <p className="mt-4 text-sm text-black/55">
          {dob ? formatDate(dob) : ""}
          {dob && dod ? " — " : ""}
          {dod ? formatDate(dod) : ""}
        </p>
      )}

      <div className="mx-auto mt-7 flex max-w-lg flex-wrap justify-center gap-3 text-xs text-black/60">
        <span className="rounded-full bg-black/[0.04] px-4 py-2">
          {views} views
        </span>

        <span className="rounded-full bg-black/[0.04] px-4 py-2">
          {qrScans} QR visits
        </span>

        <span className="rounded-full bg-black/[0.04] px-4 py-2">
          {candles} candles
        </span>
      </div>
    </header>
  );
}
