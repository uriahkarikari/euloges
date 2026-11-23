"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import FeedComposer from "@/components/feed/FeedComposer";
import PostCard from "@/components/feed/PostCard";
import SocialPostComposer from "@/components/feed/SocialPostComposer";
import SocialPostCard from "@/components/feed/SocialPostCard";
import { loadHomeFeed, type HomeFeedItem } from "@/lib/homeFeedRepository";
import { loadSocialFeed, type SocialChannel, type SocialPost } from "@/lib/socialFeedRepository";

type Channel = "For You" | "Legacy" | "Euloges" | "Lifestyle";
const channels: Channel[] = ["For You", "Legacy", "Euloges", "Lifestyle"];

const channelDetails: Record<Exclude<Channel, "For You">, { eyebrow: string; title: string; description: string; ideas: string[] }> = {
  Legacy: {
    eyebrow: "Stories across generations",
    title: "Keep the stories that shape your family.",
    description: "Build a home for family histories, personal stories, photographs, lessons and the voices of the people who came before us.",
    ideas: ["Record a grandparent’s story", "Collect family photographs and histories", "Preserve lessons for the next generation"],
  },
  Euloges: {
    eyebrow: "Remembering together",
    title: "Celebrate lives. Share remembrance.",
    description: "A dedicated space for memorials, tributes, condolences and the stories people share in honour of someone they love.",
    ideas: ["Create a memorial and funeral brochure", "Gather tributes and condolences", "Keep a loved one’s story accessible to family and friends"],
  },
  Lifestyle: {
    eyebrow: "Life as it happens",
    title: "Share the moments that make life yours.",
    description: "A place for everyday experiences, travel, food, hobbies, celebrations, milestones, photographs and the people you share them with.",
    ideas: ["Share a recent experience", "Celebrate a milestone", "Keep photographs and stories from a special day"],
  },
};

export default function DashboardPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>("For You");
  const [feed, setFeed] = useState<HomeFeedItem[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialError, setSocialError] = useState("");

  const refreshFeed = useCallback(async () => {
    try {
      setError("");
      setFeed(await loadHomeFeed());
    } catch (loadError) {
      console.error("Unable to load Euloges feed:", loadError);
      setError("Unable to load remembrance activity right now.");
    }
  }, []);

  const refreshSocialFeed = useCallback(async (channel: SocialChannel) => {
    setSocialLoading(true);
    setSocialError("");
    try {
      setSocialFeed(await loadSocialFeed(channel));
    } catch (loadError) {
      console.error("Unable to load Lifebree social feed:", loadError);
      setSocialError(loadError instanceof Error ? loadError.message : "Unable to load this feed.");
    } finally {
      setSocialLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initialLoad() {
      try {
        const items = await loadHomeFeed();
        if (!cancelled) setFeed(items);
      } catch (loadError) {
        console.error("Unable to load Euloges feed:", loadError);
        if (!cancelled) setError("Unable to load remembrance activity right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void initialLoad();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (activeChannel === "Legacy" || activeChannel === "Lifestyle") {
      void refreshSocialFeed(activeChannel.toLowerCase() as SocialChannel);
    }
  }, [activeChannel, refreshSocialFeed]);

  const showEulogesFeed = activeChannel === "Euloges" || activeChannel === "For You";

  return (
    <div className="min-h-screen space-y-4">
      <section className="overflow-hidden rounded-2xl border border-[#E9E2D8] bg-white shadow-sm">
        <div className="border-b border-[#EEE9E1] px-5 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A17D32]">The Library of Life</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#302F2B]">Your Lifebree</h1>
              <p className="mt-1 text-sm text-[#817B72]">Experience life. Share your stories. Preserve what matters.</p>
            </div>
            <Link href="/create-brochure" className="rounded-full bg-[#302F2B] px-4 py-2 text-sm font-medium text-white hover:bg-black">Create a brochure</Link>
          </div>
          <div className="mt-5 flex gap-6 overflow-x-auto" role="tablist" aria-label="Lifebree channels">
            {channels.map((channel) => (
              <button key={channel} type="button" role="tab" aria-selected={activeChannel === channel} onClick={() => setActiveChannel(channel)} className={`relative shrink-0 border-b-2 px-1 pb-3 text-sm font-medium transition ${activeChannel === channel ? "border-[#A17D32] text-[#302F2B]" : "border-transparent text-[#89837A] hover:text-[#302F2B]"}`}>
                {channel}
              </button>
            ))}
          </div>
        </div>

        {activeChannel === "For You" ? (
          <div className="p-5">
            <div className="rounded-xl bg-[#F7F4EF] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A17D32]">A life, in all its chapters</p>
              <h2 className="mt-2 max-w-xl font-serif text-3xl leading-tight text-[#302F2B]">The moments we live. The stories we share. The legacies we leave.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#746E65]">Move between the experiences that make up a life. Explore what is happening, celebrate the present and keep meaningful stories for the future.</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["Lifestyle", "Legacy", "Euloges"] as const).map((channel) => (
                <button key={channel} type="button" onClick={() => setActiveChannel(channel)} className="rounded-xl border border-[#EAE4DA] p-4 text-left transition hover:border-[#C9A44C] hover:bg-[#FCFAF7]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A17D32]">{channel}</span>
                  <span className="mt-2 block text-sm font-semibold text-[#302F2B]">{channel === "Lifestyle" ? "Share life as it happens" : channel === "Legacy" ? "Preserve stories for tomorrow" : "Remember and celebrate lives"}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#817B72]">{channel === "Lifestyle" ? "Experiences, interests and milestones." : channel === "Legacy" ? "Family histories and personal archives." : "Memorials, tributes and condolences."}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A17D32]">{channelDetails[activeChannel].eyebrow}</p>
            <h2 className="mt-2 max-w-2xl font-serif text-3xl leading-tight text-[#302F2B]">{channelDetails[activeChannel].title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#746E65]">{channelDetails[activeChannel].description}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {channelDetails[activeChannel].ideas.map((idea) => <div key={idea} className="rounded-xl bg-[#F7F4EF] p-3 text-sm text-[#625D55]">{idea}</div>)}
            </div>
          </div>
        )}
      </section>

      {(activeChannel === "Legacy" || activeChannel === "Lifestyle") && (
        <section className="space-y-4">
          <SocialPostComposer channel={activeChannel.toLowerCase() as SocialChannel} onPosted={() => void refreshSocialFeed(activeChannel.toLowerCase() as SocialChannel)} />
          {socialLoading && <div className="rounded-2xl border border-[#E9E2D8] bg-white p-6 text-sm text-[#918A80]">Loading {activeChannel.toLowerCase()} stories…</div>}
          {socialError && <div role="alert" className="rounded-2xl border border-red-100 bg-white p-5 text-sm text-red-600">{socialError}</div>}
          {!socialLoading && !socialError && socialFeed.length === 0 && <div className="rounded-2xl border border-[#E9E2D8] bg-white p-6 text-center"><p className="text-sm font-medium text-[#514C45]">Your {activeChannel.toLowerCase()} feed is ready.</p><p className="mt-1 text-xs text-[#918A80]">Be the first to share a story.</p></div>}
          {!socialLoading && socialFeed.map((post) => <SocialPostCard key={post.id} post={post} onChanged={() => void refreshSocialFeed(activeChannel.toLowerCase() as SocialChannel)} />)}
        </section>
      )}

      {showEulogesFeed && (
        <section className="space-y-4">
          {activeChannel === "For You" && <div className="flex items-center justify-between px-1"><h2 className="text-sm font-semibold text-[#514C45]">From Euloges</h2><button type="button" onClick={() => setActiveChannel("Euloges")} className="text-xs font-medium text-[#9A762F] hover:underline">Open Euloges</button></div>}
          {activeChannel === "Euloges" && <FeedComposer onMemoryPosted={refreshFeed} />}
          {loading && <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400">Loading remembrance activity...</div>}
          {error && <div role="alert" className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600">{error}</div>}
          {!loading && !error && feed.length === 0 && <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"><p className="text-sm text-gray-500">No public remembrance stories have been shared yet.</p></div>}
          {!loading && !error && feed.map((item) => <PostCard key={item.id} memorialId={item.memorialId} memorialName={item.memorialName} contributorName={item.contributorName} content={item.content} type={item.type} createdAt={item.createdAt} candles={item.candles} contributions={item.contributions} />)}
        </section>
      )}
    </div>
  );
}
