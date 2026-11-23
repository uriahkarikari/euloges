import Link from "next/link";
import { formatGhs, pricingPlans } from "@/lib/pricing";

export const metadata = {
  title: "Plans & Pricing | Lifebree",
  description: "Choose a personal or family space to preserve life's stories and memories with Lifebree.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F6F4F1] text-[#2F2F2F]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          Lifebree<span className="text-[#C9A44C]">.</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/login" className="text-[#68645E] hover:text-[#2F2F2F]">Sign in</Link>
          <Link href="/signup" className="rounded-full bg-[#2F2F2F] px-5 py-3 font-medium text-white hover:bg-[#49443D]">Get started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-14 pt-16 text-center lg:pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A17D32]">Simple plans. Meaningful memories.</p>
        <h1 className="mt-6 font-serif text-5xl leading-tight tracking-tight sm:text-6xl">A place for every story.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#716C64]">
          Start with a personal collection or bring your family’s stories together.
          Choose the space that fits the memories you want to preserve.
        </p>
        <p className="mt-5 text-sm text-[#8A837A]">All prices are in Ghana cedis (GH₵) and billed monthly.</p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-2 xl:grid-cols-4 lg:px-10">
        {pricingPlans.map((plan) => (
          <article
            key={plan.id}
            className={`relative flex flex-col rounded-[1.75rem] border p-7 shadow-[0_18px_55px_rgba(47,47,47,0.05)] ${plan.highlighted ? "border-[#C9A44C] bg-white" : "border-[#E7E0D6] bg-white/75"}`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-7 rounded-full bg-[#C9A44C] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                Most popular
              </span>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A17D32]">{plan.name}</p>
              <p className="mt-5 text-4xl font-semibold tracking-tight">{formatGhs(plan.priceGhs)}<span className="ml-1 text-sm font-normal text-[#8A837A]">/ month</span></p>
              <p className="mt-3 min-h-10 text-sm leading-6 text-[#716C64]">{plan.audience}</p>
              <div className="mt-6 rounded-xl bg-[#F6F4F1] px-4 py-3">
                <p className="text-2xl font-semibold">{plan.storageGb} GB</p>
                <p className="mt-1 text-xs text-[#827C73]">{plan.id.startsWith("family") ? "Shared family storage" : "Personal storage"}</p>
              </div>
              <p className="mt-6 text-sm leading-7 text-[#716C64]">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-[#5F5A53]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span className="text-[#A17D32]" aria-hidden="true">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/signup"
              className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-medium transition ${plan.highlighted ? "bg-[#2F2F2F] text-white hover:bg-[#49443D]" : "border border-[#D8D0C4] text-[#2F2F2F] hover:bg-[#F6F4F1]"}`}
            >
              Get started
            </Link>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-[1.75rem] border border-[#E7E0D6] bg-white px-7 py-8 sm:px-10">
          <h2 className="font-serif text-2xl">A note about family spaces</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#716C64]">
            Family storage is a shared pool for content members choose to contribute.
            Joining a family space does not give its organiser access to another
            member’s private personal collection.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#716C64]">
            These are the initial monthly plan prices. Online subscription checkout,
            card and Mobile Money checkout, and additional-storage purchases, will be enabled
            once the payment and billing system is connected.
          </p>
        </div>
        <p className="mt-8 text-center text-xs text-[#999187]">
          Lifebree · Every life has a story worth keeping.
        </p>
      </section>
    </main>
  );
}
