"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";

export default function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  function closeMenu() { setOpen(false); }
  function createMemorial() {
    closeMenu();
    router.push(`/create-brochure?new=${crypto.randomUUID()}`);
  }

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between border-b border-[#E9E2D8] bg-white px-4 py-3">
        <Link href="/home" onClick={closeMenu} className="text-xl font-semibold tracking-tight text-[#302F2B]">Lifebree<span className="text-[#C9A44C]">.</span></Link>
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="mobile-navigation" className="rounded-full border border-[#E4DED4] px-4 py-2 text-sm font-medium text-[#514C45]">{open ? "Close" : "Menu"}</button>
      </div>
      {open && (
        <nav id="mobile-navigation" className="border-b border-[#E9E2D8] bg-white px-4 py-4 shadow-sm">
          <div className="space-y-1 text-sm">
            <Link href="/home" onClick={closeMenu} className="block rounded-xl px-3 py-2.5 hover:bg-[#F7F4EF]">Home and channels</Link>
            <Link href="/memorials" onClick={closeMenu} className="block rounded-xl px-3 py-2.5 hover:bg-[#F7F4EF]">My Euloges</Link>
            <Link href="/analytics" onClick={closeMenu} className="block rounded-xl px-3 py-2.5 hover:bg-[#F7F4EF]">Insights</Link>
            <div className="my-3 border-t border-[#EEE9E1]" />
            <Link href="/create-brochure" onClick={closeMenu} className="block rounded-xl px-3 py-2.5 hover:bg-[#F7F4EF]">Create a brochure</Link>
            <button type="button" onClick={createMemorial} className="block w-full rounded-xl px-3 py-2.5 text-left hover:bg-[#F7F4EF]">Create a memorial</button>
            <p className="px-3 py-2 text-xs text-[#9A9389]">Invitations and event creation are coming in a later build.</p>
            <div className="mt-3 border-t border-[#EEE9E1] pt-3"><LogoutButton /></div>
          </div>
        </nav>
      )}
    </div>
  );
}
