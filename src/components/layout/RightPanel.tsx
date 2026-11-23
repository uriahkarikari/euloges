import Link from "next/link";

const shortcuts = [
  { title: "My archives", description: "Your personal and shared collections", href: "/home" },
  { title: "Memorials", description: "Manage the Euloges you have created", href: "/memorials" },
  { title: "Insights", description: "Activity and engagement", href: "/analytics" },
];

export default function RightPanel() {
  return (
    <aside className="sticky top-4 space-y-4">
      <section className="rounded-2xl border border-[#E9E2D8] bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A17D32]">Your Lifebree</p>
        <h2 className="mt-2 font-serif text-2xl text-[#302F2B]">A home for every chapter.</h2>
        <p className="mt-3 text-sm leading-6 text-[#817B72]">Enjoy the present, bring people together and preserve the stories you want future generations to know.</p>
      </section>

      <section className="rounded-2xl border border-[#E9E2D8] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#514C45]">Your spaces</h3>
        <div className="mt-3 divide-y divide-[#F0ECE6]">
          {shortcuts.map((item) => (
            <Link key={item.title} href={item.href} className="block py-3 first:pt-0 last:pb-0">
              <span className="block text-sm font-medium text-[#514C45] hover:text-[#9A762F]">{item.title}</span>
              <span className="mt-1 block text-xs leading-5 text-[#918A80]">{item.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E9E2D8] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#514C45]">A thoughtful reminder</h3>
        <p className="mt-2 text-sm leading-6 text-[#817B72]">Not everything you share needs to become part of an archive. Choose what you want to keep for the future.</p>
      </section>
    </aside>
  );
}
