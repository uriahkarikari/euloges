export default function RightPanel() {
  return (
    <aside className="sticky top-4 space-y-4">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Legacy Workspace
        </p>

        <h2 className="mt-2 font-semibold text-gray-800">
          Preserve a life with care
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Create and manage memorials, preserve stories and receive memories
          from family, friends and community.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800">
          Remembrance tools
        </h3>

        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <p>🕯 Light a memorial candle</p>
          <p>💬 Share tributes and condolences</p>
          <p>📖 Create a Book of Condolence</p>
          <p>▦ Share memorials by link or QR</p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800">
          A living remembrance
        </h3>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          A memorial can continue gathering stories and expressions of
          remembrance after it has been published.
        </p>
      </section>
    </aside>
  );
}
