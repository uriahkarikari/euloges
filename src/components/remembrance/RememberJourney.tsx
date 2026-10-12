"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type JourneyMode = "find" | "begin" | "organise" | null;

type FirstAction =
  | "memory"
  | "tribute"
  | "photo"
  | "voice"
  | "condolence"
  | "programme"
  | "legacy";

const firstActions: {
  id: FirstAction;
  title: string;
  description: string;
}[] = [
  {
    id: "memory",
    title: "Preserve a memory",
    description: "Record something you remember about their life.",
  },
  {
    id: "tribute",
    title: "Write a tribute",
    description: "Prepare a formal reflection on their life and impact.",
  },
  {
    id: "photo",
    title: "Add a photograph",
    description: "Preserve an image and the story around it.",
  },
  {
    id: "voice",
    title: "Add a voice memory",
    description: "Preserve remembrance in someone's own voice.",
  },
  {
    id: "condolence",
    title: "Open a Book of Condolence",
    description:
      "Create a place for people or institutions to express condolence.",
  },
  {
    id: "programme",
    title: "Create a ceremony programme",
    description: "Prepare a digital programme or remembrance brochure.",
  },
  {
    id: "legacy",
    title: "Begin their Legacy",
    description: "Start assembling the wider record of their life.",
  },
];

export default function RememberJourney() {
  const [mode, setMode] = useState<JourneyMode>(null);

  return (
    <main className="min-h-screen bg-[#f4efe8] text-[#312d29]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[-0.01em] text-[#6c6258]"
          >
            ← Euloges
          </Link>

          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8265]">
            Remember
          </span>
        </header>

        {!mode ? (
          <RememberEntrance onChoose={setMode} />
        ) : (
          <div className="mt-10">
            <button
              type="button"
              onClick={() => setMode(null)}
              className="text-sm font-semibold text-[#756a5e]"
            >
              ← Back
            </button>

            {mode === "find" && <FindLegacy />}

            {mode === "begin" && <BeginRemembrance />}

            {mode === "organise" && <OrganiseRemembrance />}
          </div>
        )}
      </div>
    </main>
  );
}

function RememberEntrance({
  onChoose,
}: {
  onChoose: (mode: JourneyMode) => void;
}) {
  return (
    <>
      <section className="mx-auto mt-20 max-w-3xl text-center sm:mt-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#987b58]">
          Remembrance begins somewhere
        </p>

        <h1 className="mt-5 text-4xl font-medium tracking-[-0.05em] sm:text-5xl lg:text-6xl">
          Who are you carrying with you?
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#766d64] sm:text-lg">
          Remember someone whose life continues through the people, stories,
          memories and communities they left behind.
        </p>
      </section>

      <section className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
        <EntranceCard
          number="01"
          title="Find their Legacy"
          description="Their Legacy may already exist. Find it, remember them and contribute what you know."
          action="Find someone"
          onClick={() => onChoose("find")}
        />

        <div className="rounded-[1.5rem] border border-[#ddd4c8] bg-[#fffdf9] p-6 text-left">
          <p className="text-xs font-semibold text-[#aa8b65]">02</p>

          <h2 className="mt-5 text-xl font-medium tracking-[-0.03em]">
            Begin a Remembrance
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#786f66]">
            Start preserving the life of someone who has died and whose Legacy
            has not yet been created.
          </p>

          <p className="mt-7 text-sm font-semibold text-[#554a3f]">
            Legacy creation coming soon
          </p>

          <p className="mt-3 text-xs leading-5 text-[#85796d]">
            This journey will become available when Legacy creation and secure
            record persistence are connected.
          </p>
        </div>

        <EntranceCard
          number="03"
          title="Organise Remembrance"
          description="Help a family or institution open a condolence book, prepare a ceremony or gather remembrance."
          action="Organise"
          onClick={() => onChoose("organise")}
        />
      </section>

      <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-6 text-[#8a8177]">
        You do not need to know everything about a life before you begin.
        Remembrance can start with one name, one memory or one act of care.
      </p>
    </>
  );
}

function FindLegacy() {
  const [query, setQuery] = useState("");

  type LegacySearchResult = {
    slug: string;
    name: string;
    years: string;
    description: string;
  };

  const results = useMemo<LegacySearchResult[]>(() => {
    return [];
  }, [query]);

  return (
    <section className="mx-auto max-w-4xl">
      <PageIntroduction
        eyebrow="Find someone"
        title="Their Legacy may already be here."
        description="Search before beginning a new remembrance. One human life should not become several disconnected records."
      />

      <div className="mt-8 rounded-[1.5rem] border border-[#ddd4c8] bg-[#fffdf9] p-5 sm:p-7">
        <label className="text-xs font-semibold text-[#655b50]">Name</label>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name..."
          className="mt-2 w-full rounded-[1rem] border border-[#d8cec1] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#aaa197] focus:border-[#9e8d78]"
        />

        <p className="mt-3 text-xs text-[#91877c]">
          Legacy search will be available when the Legacy directory is
          connected.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {results.map((legacy) => (
          <article
            key={legacy.slug}
            className="rounded-[1.4rem] border border-[#ddd4c8] bg-[#fffdf9] p-5 sm:p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b7c58]">
                  Remembrance Legacy
                </p>

                <h2 className="mt-2 text-xl font-medium">{legacy.name}</h2>

                <p className="mt-1 text-sm text-[#7e746a]">{legacy.years}</p>

                <p className="mt-3 text-sm leading-6 text-[#756b61]">
                  {legacy.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2"></div>
            </div>
          </article>
        ))}
        {results.length === 0 && (
          <div className="rounded-[1.4rem] border border-dashed border-[#d6ccbf] p-7 text-center">
            <p className="text-sm font-semibold">No matching Legacy found.</p>

            <p className="mt-2 text-sm text-[#80766c]">
              You can return and choose “Begin a Remembrance” to start
              preserving their story.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function BeginRemembrance() {
  const [personName, setPersonName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [relationship, setRelationship] = useState("");
  const [firstAction, setFirstAction] = useState<FirstAction>("memory");

  const selectedAction = firstActions.find(
    (action) => action.id === firstAction,
  );

  return (
    <section className="mx-auto max-w-5xl">
      <PageIntroduction
        eyebrow="Begin a remembrance"
        title="Start with the person, not the profile."
        description="You do not need a complete biography. Begin with what you know and what you are here to preserve."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="rounded-[1.5rem] border border-[#ddd4c8] bg-[#fffdf9] p-5 sm:p-7">
          <h2 className="text-lg font-medium">Who are you remembering?</h2>

          <div className="mt-6 space-y-4">
            <Field label="Their name">
              <input
                value={personName}
                onChange={(event) => setPersonName(event.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Year of birth">
                <input
                  value={birthYear}
                  onChange={(event) => setBirthYear(event.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Year of death">
                <input
                  value={deathYear}
                  onChange={(event) => setDeathYear(event.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Your relationship to them">
              <input
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
                placeholder="e.g. Daughter, friend, colleague"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-8 border-t border-[#e5ddd2] pt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#987a58]">
              What would you like to preserve first?
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {firstActions.map((action) => (
                <ChoiceCard
                  key={action.id}
                  selected={firstAction === action.id}
                  title={action.title}
                  description={action.description}
                  onClick={() => setFirstAction(action.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[1.5rem] border border-[#d8cec1] bg-[#eee7dd] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#907250]">
            Beginning
          </p>

          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">
            {personName || "A life worth remembering"}
          </h2>

          {(birthYear || deathYear) && (
            <p className="mt-2 text-sm text-[#756b60]">
              {birthYear || "—"} – {deathYear || "—"}
            </p>
          )}

          {relationship && (
            <p className="mt-4 text-sm text-[#685f56]">
              Remembered by: <strong>{relationship}</strong>
            </p>
          )}

          <div className="mt-6 rounded-[1rem] bg-[#fffaf4] p-4">
            <p className="text-xs font-semibold text-[#66594b]">
              First act of remembrance
            </p>

            <p className="mt-2 text-sm font-medium">{selectedAction?.title}</p>

            <p className="mt-1 text-xs leading-5 text-[#7d7268]">
              {selectedAction?.description}
            </p>
          </div>

          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-full bg-[#bcb3aa] px-5 py-3 text-sm font-semibold text-white"
          >
            Begin Remembrance Legacy
          </button>

          <p className="mt-3 text-xs leading-5 text-[#85796d]">
            Creation is deliberately disabled in this frontend prototype. We
            will connect this action when Legacy persistence, identity and
            stewardship are available in the backend.
          </p>
        </aside>
      </div>
    </section>
  );
}

function OrganiseRemembrance() {
  const [personName, setPersonName] = useState("");
  const [organisingAs, setOrganisingAs] = useState("Family");

  const slug = slugify(personName);
  const ready = personName.trim().length > 1;

  return (
    <section className="mx-auto max-w-5xl">
      <PageIntroduction
        eyebrow="Organise remembrance"
        title="Sometimes the immediate need comes first."
        description="A family or institution may need to receive condolences or prepare a ceremony before a complete Legacy has been assembled."
      />

      <div className="mt-8 rounded-[1.5rem] border border-[#ddd4c8] bg-[#fffdf9] p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Who are you remembering?">
            <input
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
              placeholder="Their name"
              className={inputClass}
            />
          </Field>

          <Field label="You are organising as">
            <select
              value={organisingAs}
              onChange={(event) => setOrganisingAs(event.target.value)}
              className={inputClass}
            >
              <option>Family</option>
              <option>Institution</option>
              <option>Church / faith community</option>
              <option>Friends / community</option>
              <option>Funeral service provider</option>
            </select>
          </Field>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#987a58]">
            What needs to happen now?
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <RapidActionCard
              title="Open a Book of Condolence"
              description="Receive individual and institutional messages through an official digital book."
              ready={ready}
              href={`/condolence-books?name=${encodeURIComponent(personName.trim())}&organisingAs=${encodeURIComponent(organisingAs)}`}
            />

            <RapidActionCard
              title="Create a Ceremony Programme"
              description="Prepare the programme, brochure and QR experience for a remembrance ceremony."
              ready={ready}
              href={`/create-brochure?new=1&name=${encodeURIComponent(personName.trim())}&organisingAs=${encodeURIComponent(organisingAs)}`}
            />
          </div>
        </div>

        <div className="mt-7 rounded-[1rem] bg-[#f4efe8] p-4">
          <p className="text-xs font-semibold text-[#655a4f]">
            Organising as {organisingAs}
          </p>

          <p className="mt-1 text-xs leading-5 text-[#81776c]">
            These links open existing frontend prototypes. They do not yet
            create a persisted Legacy or grant authority. Backend identity and
            stewardship will govern that later.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[#ddd4c8] bg-[#2d2925] p-6 text-[#f5efe7] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c8ae8d]">
          The longer journey
        </p>

        <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">
          The ceremony is not the destination.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d0c7bd]">
          Condolence books, programmes, Tributes and gathered memories can
          eventually become part of the enduring Legacy of the person being
          remembered.
        </p>
      </div>
    </section>
  );
}

function EntranceCard({
  number,
  title,
  description,
  action,
  onClick,
}: {
  number: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[1.5rem] border border-[#ddd4c8] bg-[#fffdf9] p-6 text-left transition hover:-translate-y-0.5 hover:border-[#c5b6a3]"
    >
      <p className="text-xs font-semibold text-[#aa8b65]">{number}</p>

      <h2 className="mt-5 text-xl font-medium tracking-[-0.03em]">{title}</h2>

      <p className="mt-3 text-sm leading-6 text-[#786f66]">{description}</p>

      <p className="mt-7 text-sm font-semibold text-[#554a3f]">
        {action} <span className="transition group-hover:ml-1">→</span>
      </p>
    </button>
  );
}

function ChoiceCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1rem] border p-4 text-left transition ${
        selected
          ? "border-[#8e7658] bg-[#f2ebe2]"
          : "border-[#ddd4c8] bg-white hover:border-[#c5b7a6]"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs leading-5 text-[#7b7167]">{description}</p>
    </button>
  );
}

function RapidActionCard({
  title,
  description,
  ready,
  href,
}: {
  title: string;
  description: string;
  ready: boolean;
  href: string;
}) {
  const content = (
    <>
      <h3 className="text-lg font-medium">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-[#796f65]">{description}</p>

      <p className="mt-5 text-xs font-semibold text-[#655849]">
        {ready ? "Continue →" : "Enter the person's name first"}
      </p>
    </>
  );

  if (!ready) {
    return (
      <div className="rounded-[1.2rem] border border-[#ddd4c8] bg-[#f8f4ee] p-5 opacity-70">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-[1.2rem] border border-[#d1c5b6] bg-[#fbf7f1] p-5 transition hover:border-[#a89378]"
    >
      {content}
    </Link>
  );
}

function PageIntroduction({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#987a58]">
        {eyebrow}
      </p>

      <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
        {title}
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#786f66] sm:text-base">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#655b50]">{label}</span>

      <div className="mt-2">{children}</div>
    </label>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const inputClass =
  "w-full rounded-[1rem] border border-[#d8cec1] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#aaa197] focus:border-[#9e8d78]";
