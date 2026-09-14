"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);

      alert("Unable to sign out. Please try again.");

      setIsSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSigningOut}
      className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-[#2F2F2F] transition hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
