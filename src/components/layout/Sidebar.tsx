"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

const navClass = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#625D55] transition hover:bg-[#F7F4EF] hover:text-[#302F2B]";

export default function Sidebar() {
  const router = useRouter();
  function createNewMemorial() {
    router.push(`/create-brochure?new=${crypto.randomUUID()}`);
  }

  return (
    <aside className="sticky top-4 rounded-2xl border border-[#E9E2D8] bg-white p-5 shadow-sm">
      <Link href="/home" className="block">
        <span className="text-2xl font-semibold tracking-tight text-[#302F2B]">Lifebree<span className="text-[#C9A44C]">.</span></span>
        <span className="mt-1 block text-xs text-[#918A80]">The Library of Life</span>
      </Link>

      <nav className="mt-8 space-y-1" aria-label="Main navigation">
        <Link href="/home" className={navClass}><span>⌂</span> Home</Link>
        <Link href="/memorials" className={navClass}><span>♡</span> My Euloges</Link>
        <Link href="/analytics" className={navClass}><span>▥</span> Insights</Link>
      </nav>

      <div className="mt-8 border-t border-[#EEE9E1] pt-6">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A17D32]">Create something</p>
        <div className="mt-3 space-y-1">
          <button type="button" onClick={() => router.push("/create-brochure")} className={navClass + " w-full text-left"}><span>＋</span> Create a brochure</button>
          <button type="button" onClick={createNewMemorial} className={navClass + " w-full text-left"}><span>✧</span> Create a memorial</button>
          <Link href="/invitations" className={navClass}><span>✉</span> Invitations</Link>
          <div className="rounded-xl px-3 py-2.5 text-sm text-[#A39D94]" title="Event creation is planned for a later frontend milestone"><span className="mr-3">✦</span> Create an event <span className="ml-1 text-[10px] uppercase tracking-wide">Soon</span></div>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-[#F7F4EF] p-4">
        <p className="text-sm font-semibold text-[#514C45]">Your stories, your choices.</p>
        <p className="mt-1 text-xs leading-5 text-[#817B72]">Share what you want. Preserve what matters. Keep control of your memories.</p>
      </div>

      <div className="mt-6 border-t border-[#EEE9E1] pt-5"><LogoutButton /></div>
    </aside>
  );
}
