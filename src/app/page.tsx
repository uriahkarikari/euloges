
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Digital Memorials",
    description:
      "Create a lasting space for someone's story, photographs, biography and the moments that made their life meaningful.",
  },
  {
    number: "02",
    title: "Funeral Brochures",
    description:
      "Create beautifully organised, printable memorial brochures that families can share and preserve.",
  },
  {
    number: "03",
    title: "Tributes & Condolences",
    description:
      "Give family and friends a place to express their love, share memories and offer words of comfort.",
  },
  {
    number: "04",
    title: "A Living Remembrance",
    description:
      "Light a candle, revisit cherished memories and return to a place where a life continues to be celebrated.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create",
    description: "Begin with a name, a photograph and the story of a life.",
  },
  {
    number: "02",
    title: "Personalise",
    description: "Add biographies, photographs and meaningful memories.",
  },
  {
    number: "03",
    title: "Share",
    description: "Publish the memorial and invite family and friends to remember.",
  },
];

export default function PublicHomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F6F4F1] text-[#2F2F2F]">
      {/* Navigation */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" aria-label="Euloges home">
          <span className="text-2xl font-semibold tracking-tight">
            Euloges<span className="text-[#C9A44C]">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm text-[#68645E] md:flex">
          <a href="#about" className="transition hover:text-[#2F2F2F]">
            Our purpose
          </a>
          <a href="#features" className="transition hover:text-[#2F2F2F]">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-[#2F2F2F]">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-[#2F2F2F] transition hover:text-[#A17D32] sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#49443D]"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-20">
        <div className="relative z-10">
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.28em] text-[#A17D32]">
            Remember · Honour · Preserve
          </p>

          <h1 className="max-w-2xl text-5xl font-medium leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
            Every life leaves a story worth{" "}
            <span className="font-serif italic text-[#A17D32]">
              remembering.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-[#716C64] sm:text-lg">
            Euloges gives families a meaningful place to preserve the stories,
            photographs and memories of those they love — and to share their
            legacy with the people who matter.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-[#2F2F2F] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#49443D]"
            >
              Create a memorial <span aria-hidden="true">→</span>
            </Link>

            <a
              href="#about"
              className="rounded-full border border-[#D8D0C4] px-7 py-4 text-sm font-medium text-[#2F2F2F] transition hover:bg-white"
            >
              Discover Euloges
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3 text-xs text-[#827C73]">
            <span className="h-px w-10 bg-[#C9A44C]" />
            A place for stories that deserve to live on.
          </div>
        </div>

        {/* Editorial memorial composition */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#D8A7B1]/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-8 h-52 w-52 rounded-full bg-[#C9A44C]/15 blur-3xl" />

          <div className="relative rounded-[2rem] border border-white/80 bg-white/65 p-5 shadow-[0_30px_90px_rgba(47,47,47,0.08)] sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-tight">
                Euloges<span className="text-[#C9A44C]">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A9388]">
                A life remembered
              </span>
            </div>

            <div className="my-7 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8DFD3] via-[#F1EAE1] to-[#D8C9B9]">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/70 bg-white/25">
                <svg
                  viewBox="0 0 100 100"
                  className="h-20 w-20"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#A17D32"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M62 31H42C35 31 32 36 32 43V57C32 65 37 69 44 69H62M33 50H56"
                    stroke="#A17D32"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A17D32]">
                Forever in our hearts
              </p>
              <h2 className="mt-3 font-serif text-3xl text-[#2F2F2F]">
                A beautiful life.
              </h2>
              <p className="mt-2 text-sm text-[#8A837A]">
                A story that continues.
              </p>
            </div>

            <div className="mt-7 flex justify-center gap-3 border-t border-[#EAE5DD] pt-5">
              <span className="rounded-full bg-[#F6F4F1] px-4 py-2 text-xs text-[#716C64]">
                Memories
              </span>
              <span className="rounded-full bg-[#F6F4F1] px-4 py-2 text-xs text-[#716C64]">
                Tributes
              </span>
              <span className="rounded-full bg-[#F6F4F1] px-4 py-2 text-xs text-[#716C64]">
                Legacy
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose */}
      <section
        id="about"
        className="border-y border-[#E7E0D6] bg-white px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A17D32]">
              More than a memorial
            </p>
            <h2 className="mt-6 max-w-xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              Some stories are too important to be forgotten.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-base leading-8 text-[#716C64]">
              Remembering someone should not end with a ceremony or a printed
              programme. Their experiences, relationships, achievements and
              the memories they leave behind deserve a place that can be
              revisited and shared across generations.
            </p>
            <p className="mt-5 text-base leading-8 text-[#716C64]">
              Euloges brings these moments together in a thoughtful digital
              space, giving families and friends a way to celebrate a life and
              preserve its story.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A17D32]">
            What you can do
          </p>
          <h2 className="mt-5 text-4xl font-medium tracking-tight sm:text-5xl">
            A thoughtful way to remember.
          </h2>
          <p className="mt-5 leading-8 text-[#716C64]">
            Everything families need to create, share and preserve a meaningful
            digital remembrance.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="border-t border-[#D9CFBF] pt-6"
            >
              <span className="text-xs tracking-widest text-[#A17D32]">
                {feature.number}
              </span>
              <h3 className="mt-7 text-xl font-medium">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#777168]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-[#EDE8E0] px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A17D32]">
              A simple process
            </p>
            <h2 className="mt-5 text-4xl font-medium tracking-tight sm:text-5xl">
              Create a place for remembrance.
            </h2>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number}>
                <p className="font-serif text-4xl text-[#C9A44C]">
                  {step.number}
                </p>
                <h3 className="mt-6 text-2xl font-medium">{step.title}</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#716C64]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
        <div className="rounded-[2rem] bg-[#2F2F2F] px-7 py-12 text-white sm:px-14 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D8B96F]">
            Remember with confidence
          </p>
          <h2 className="mt-6 max-w-2xl text-3xl font-medium leading-tight sm:text-4xl">
            Every family should have a choice in how memories are shared.
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-8 text-white/65">
            Euloges supports public and family-private memorials, giving
            families control over who can access their remembrance pages.
          </p>
        </div>
      </section>

      {/* Final call to action */}
      <section className="border-t border-[#E7E0D6] bg-white px-6 py-24 text-center lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A17D32]">
          Begin a remembrance
        </p>
        <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
          Give their story a place to live on.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-[#716C64]">
          Create a digital memorial and bring together the memories, stories
          and people that make a life unforgettable.
        </p>
        <Link
          href="/signup"
          className="mt-9 inline-flex rounded-full bg-[#2F2F2F] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#49443D]"
        >
          Create a memorial <span className="ml-2">→</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#F6F4F1] px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="text-xl font-semibold">
              Euloges<span className="text-[#C9A44C]">.</span>
            </Link>
            <p className="mt-2 text-xs text-[#827C73]">
              Honouring lives. Preserving memories.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-[#716C64]">
            <Link href="/login" className="hover:text-[#2F2F2F]">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-[#2F2F2F]">
              Get started
            </Link>
            <Link href="/contact" className="hover:text-[#2F2F2F]">
              Contact
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-[#E7E0D6] pt-6 text-xs text-[#999187]">
          © {new Date().getFullYear()} Euloges. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
