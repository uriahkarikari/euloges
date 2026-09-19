"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import LogoutButton from "@/components/auth/LogoutButton";

export default function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  function createNewMemorial() {
    setOpen(false);
    router.push(`/create-brochure?new=${Date.now()}`);
  }

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <Link href="/" onClick={closeMenu}>
          <span className="text-xl font-semibold text-[#2F2F2F]">Euloges</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-navigation"
          className="border-b border-gray-100 bg-white px-4 py-3 shadow-sm"
        >
          <div className="space-y-1 text-sm">
            <Link
              href="/"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 hover:bg-gray-50"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={createNewMemorial}
              className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
            >
              Create Memorial
            </button>

            <Link
              href="/memorials"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 hover:bg-gray-50"
            >
              Memorials
            </Link>

            <Link
              href="/memorials"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 hover:bg-gray-50"
            >
              Book of Condolence
            </Link>

            <Link
              href="/analytics"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 hover:bg-gray-50"
            >
              Analytics
            </Link>

            <div className="mt-3 border-t border-gray-100 pt-3">
              <LogoutButton />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
