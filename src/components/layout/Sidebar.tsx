"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import LogoutButton from "@/components/auth/LogoutButton";

export default function Sidebar() {
  const router = useRouter();

  function createNewMemorial() {
    router.push(`/create-brochure?new=${Date.now()}`);
  }
  return (
    <aside className="sticky top-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <Link href="/" className="block">
        <h1 className="text-2xl font-semibold text-[#2F2F2F]">Euloges</h1>

        <p className="mt-1 text-xs text-gray-400">Legacy Workspace</p>
      </Link>

      <nav className="mt-8 space-y-1 text-sm">
        <Link
          href="/"
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
          className="block rounded-lg px-3 py-2.5 hover:bg-gray-50"
        >
          Memorials
        </Link>

        {/* <button
          type="button"
          className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
        >
          Tributes
        </button> */}

        <Link
          href="/condolence-books"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-black/60 transition hover:bg-gray-50 hover:text-[#2F2F2F]"
        >
          <BookIcon />

          <span>Book of Condolence</span>
        </Link>

        {/* <button
          type="button"
          className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
        >
          Photos & Videos
        </button> */}

        {/* <button
          type="button"
          className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
        >
          Family Members
        </button> */}

        <Link
          href="/analytics"
          className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
        >
          Analytics
        </Link>

        {/* <button
          type="button"
          className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
        >
          Settings
        </button> */}
      </nav>

      <div className="mt-8 border-t border-gray-100 pt-5">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Memorial Progress
        </p>

        <div className="mt-3 space-y-2 text-xs text-gray-600">
          <p>✓ Basic information</p>
          <p>✓ Biography</p>
          <p>○ Gallery</p>
          <p>○ Publish memorial</p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-1/2 bg-[#7A9B8E]" />
        </div>

        <p className="mt-2 text-xs text-gray-400">50% complete</p>
      </div>
      <div className="mt-6 border-t border-gray-100 pt-5">
        <LogoutButton />
      </div>
    </aside>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4.5 5.5A2.5 2.5 0 0 1 7 3h11.5v16H7A2.5 2.5 0 0 0 4.5 21.5V5.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4.5 18.5A2.5 2.5 0 0 1 7 16h11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
