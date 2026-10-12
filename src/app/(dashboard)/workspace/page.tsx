"use client";

import { useCallback, useEffect, useState } from "react";
import FeedComposer from "@/components/feed/FeedComposer";
import PostCard from "@/components/feed/PostCard";
import { loadHomeFeed, type HomeFeedItem } from "@/lib/homeFeedRepository";

export default function DashboardPage() {
  const [feed, setFeed] = useState<HomeFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshFeed = useCallback(async () => {
    try {
      setError("");

      const items = await loadHomeFeed();

      setFeed(items);
    } catch (loadError) {
      console.error("Unable to load home feed:", loadError);
      setError("Unable to load the Euloges feed.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const items = await loadHomeFeed();

        if (!cancelled) {
          setFeed(items);
        }
      } catch (loadError) {
        console.error("Unable to load home feed:", loadError);

        if (!cancelled) {
          setError("Unable to load the Euloges feed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <FeedComposer onMemoryPosted={refreshFeed} />

      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400 shadow-sm">
          Loading memories...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && feed.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No memories have been shared yet.
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        feed.map((item) => (
          <PostCard
            key={item.id}
            memorialId={item.memorialId}
            memorialName={item.memorialName}
            contributorName={item.contributorName}
            content={item.content}
            type={item.type}
            createdAt={item.createdAt}
            candles={item.candles}
            contributions={item.contributions}
          />
        ))}
    </div>
  );
}
