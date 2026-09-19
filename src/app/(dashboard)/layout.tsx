// src/app/(dashboard)/layout.tsx

import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import MobileNav from "@/components/layout/MobileNav";

import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

      return (
  <div className="min-h-screen bg-[#F6F4F1]">
    <MobileNav />

    <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_300px] gap-4 px-4 py-4">        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="min-w-0">{children}</main>

        <div className="hidden xl:block">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
