"use client";

import { useEffect, useState } from "react";

import {
  loadOwnerAnalytics,
  type AnalyticsSummary,
} from "@/lib/analyticsRepository";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const data = await loadOwnerAnalytics();

        if (!cancelled) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Unable to load analytics:", error);

        if (!cancelled) {
          setError("Unable to load analytics.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-sm text-black/50">Loading analytics...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/40">
            Memorial insights
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#2F2F2F]">
            Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
            See how people are discovering and visiting your memorials.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/45">Total views</p>
            <p className="mt-2 text-3xl font-semibold text-[#2F2F2F]">
              {analytics.totalViews}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/45">QR scans</p>
            <p className="mt-2 text-3xl font-semibold text-[#2F2F2F]">
              {analytics.totalQrScans}
            </p>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#2F2F2F]">
              Memorial activity
            </h2>

            <p className="mt-1 text-sm text-black/45">
              Views and QR scans recorded for each memorial.
            </p>
          </div>

          {analytics.memorials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 p-8 text-center">
              <p className="text-sm text-black/50">
                Create a memorial to begin seeing analytics.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
              {analytics.memorials.map((memorial, index) => (
                <div
                  key={memorial.memorialId}
                  className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                    index !== analytics.memorials.length - 1
                      ? "border-b border-black/10"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-[#2F2F2F]">
                      {memorial.memorialName}
                    </p>
                  </div>

                  <div className="flex gap-8 text-sm">
                    <div>
                      <p className="text-black/40">Views</p>
                      <p className="mt-1 font-medium text-[#2F2F2F]">
                        {memorial.views}
                      </p>
                    </div>

                    <div>
                      <p className="text-black/40">QR scans</p>
                      <p className="mt-1 font-medium text-[#2F2F2F]">
                        {memorial.qrScans}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
