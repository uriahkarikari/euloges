export default function RightPanel() {
  return (
    <aside className="sticky top-4 space-y-4">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Legacy Assistant
        </p>

        <h2 className="mt-2 font-semibold text-gray-800">
          Build a complete remembrance
        </h2>

        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <p>✓ Add basic information</p>
          <p>○ Add photographs</p>
          <p>○ Create life timeline</p>
          <p>○ Review funeral programme</p>
          <p>○ Publish and share QR</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-sm">Live & remembrance</h3>

        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <p>🕯 Memorial programmes</p>
          <p>📖 Recent tributes</p>
          <p>🌿 Community remembrance</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-400">Future</p>

        <p className="mt-2 text-sm text-gray-600">
          Biography assistance, timeline generation and memorial-book creation
          will live here.
        </p>
      </section>
    </aside>
  );
}
