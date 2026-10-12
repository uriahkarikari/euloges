
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] text-[#211f1b]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.22em] text-[#6f6253]"
          >
            EULOGES
          </Link>

          <Link
            href="/login"
            className="text-sm text-[#746d64] transition hover:text-[#211f1b]"
          >
            Sign in
          </Link>
        </header>

        <section className="flex flex-1 items-center py-16">
          <div className="w-full">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a7a53]">
                Begin with a person
              </p>

              <h1 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Whose story brings
                <br />
                you here?
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#6d655c]">
                A Legacy can begin during life or continue after someone has
                died. Either way, Euloges begins with the person—not the event.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <Link
                href="/preserve"
                className="group flex min-h-[290px] flex-col justify-between rounded-[2rem] border border-[#d9d1c6] bg-[#fffdf9] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#947758]">
                    During life
                  </p>

                  <h2 className="mt-5 text-3xl font-medium tracking-[-0.03em]">
                    Preserve Someone
                  </h2>

                  <p className="mt-4 max-w-sm leading-7 text-[#6e675e]">
                    Begin preserving a life while stories can still be told,
                    questions can still be asked and voices can still be heard.
                  </p>
                </div>

                <div className="mt-10 flex items-center text-sm font-semibold">
                  Begin preserving
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/remember"
                className="group flex min-h-[290px] flex-col justify-between rounded-[2rem] border border-[#d9d1c6] bg-[#ece6dd] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#826b51]">
                    In remembrance
                  </p>

                  <h2 className="mt-5 text-3xl font-medium tracking-[-0.03em]">
                    Remember Someone
                  </h2>

                  <p className="mt-4 max-w-sm leading-7 text-[#625c54]">
                    Gather stories, photographs, voices and memories around
                    someone whose life continues to matter.
                  </p>
                </div>

                <div className="mt-10 flex items-center text-sm font-semibold">
                  Begin remembering
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#ddd5ca] py-6 text-sm text-[#857d73]">
          A Legacy begins with a person and continues through generations.
        </footer>
      </div>
    </main>
  );
}
