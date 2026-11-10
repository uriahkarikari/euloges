
import Link from "next/link";

const phone = "+233256481007";
const whatsapp = "https://wa.me/233256481007?text=Hello%20Euloges%2C%20I%20need%20some%20assistance.";

export const metadata = {
  title: "Contact Euloges",
  description:
    "Contact Euloges for assistance with digital memorials, funeral brochures and preserving cherished memories.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F6F4F1] px-6 py-10 text-[#2F2F2F]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-xl font-semibold">
          Euloges<span className="text-[#C9A44C]">.</span>
        </Link>

        <section className="py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A17D32]">
            Get in touch
          </p>

          <h1 className="mt-5 text-4xl font-medium tracking-tight sm:text-5xl">
            We're here to help.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-[#716C64]">
            Whether you need help creating a memorial, have a question
            about Euloges or simply want to know more about our platform,
            we'd be happy to hear from you.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E7E0D6] bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">WhatsApp</span>
                <span className="rounded-full bg-[#E9F3EC] px-3 py-1 text-xs text-[#427653]">
                  Preferred
                </span>
              </div>

              <p className="mt-6 text-xl font-medium">{phone}</p>

              <p className="mt-2 text-sm leading-6 text-[#827C73]">
                Send us a message and we'll be happy to assist.
              </p>

              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#2F2F2F] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#49443D]"
              >
                Chat on WhatsApp →
              </a>
            </div>

            <div className="rounded-2xl border border-[#E7E0D6] bg-white p-7">
              <span className="text-lg font-medium">Phone</span>

              <p className="mt-6 text-xl font-medium">{phone}</p>

              <p className="mt-2 text-sm leading-6 text-[#827C73]">
                Prefer a conversation? Give us a call.
              </p>

              <a
                href={`tel:${phone}`}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-[#D8D0C4] px-5 py-3 text-sm font-medium text-[#2F2F2F] transition hover:bg-[#F6F4F1]"
              >
                Call Euloges →
              </a>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#E7E0D6] py-7 text-sm text-[#827C73]">
          <Link href="/" className="hover:text-[#2F2F2F]">
            ← Back to Euloges
          </Link>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} Euloges. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
