import { createClient } from "@/lib/supabase/client";

export type SocialChannel = "legacy" | "lifestyle";
export type SocialPost = {
  id: string;
  authorId: string;
  authorName: string;
  channel: SocialChannel;
  content: string;
  mediaUrl: string | null;
  visibility: "public" | "private";
  createdAt: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedByMe: boolean;
  repostedByMe: boolean;
};

export type SocialComment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export async function loadSocialFeed(channel: SocialChannel): Promise<SocialPost[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("lifebree_posts")
    .select("id,author_id,author_name,channel,content,media_url,visibility,created_at")
    .eq("channel", channel)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;

  return Promise.all((data ?? []).map(async (row) => {
    const [likes, comments, reposts, myLike, myRepost] = await Promise.all([
      supabase.from("lifebree_post_likes").select("id", { count: "exact", head: true }).eq("post_id", row.id),
      supabase.from("lifebree_post_comments").select("id", { count: "exact", head: true }).eq("post_id", row.id),
      supabase.from("lifebree_post_reposts").select("id", { count: "exact", head: true }).eq("post_id", row.id),
      user ? supabase.from("lifebree_post_likes").select("id").eq("post_id", row.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      user ? supabase.from("lifebree_post_reposts").select("id").eq("post_id", row.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    for (const result of [likes, comments, reposts, myLike, myRepost]) if (result.error) throw result.error;
    return {
      id: row.id,
      authorId: row.author_id,
      authorName: row.author_name,
      channel: row.channel as SocialChannel,
      content: row.content,
      mediaUrl: row.media_url,
      visibility: row.visibility as "public" | "private",
      createdAt: row.created_at,
      likeCount: likes.count ?? 0,
      commentCount: comments.count ?? 0,
      repostCount: reposts.count ?? 0,
      likedByMe: !!myLike.data,
      repostedByMe: !!myRepost.data,
    };
  }));
}

export async function createSocialPost(input: { channel: SocialChannel; content: string; visibility: "public" | "private" }) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in to publish a post.");
  const { error } = await supabase.from("lifebree_posts").insert({
    author_id: user.id,
    channel: input.channel,
    content: input.content.trim(),
    visibility: input.visibility,
  });
  if (error) throw error;
}

export async function togglePostLike(postId: string, liked: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to like posts.");
  const result = liked
    ? await supabase.from("lifebree_post_likes").delete().eq("post_id", postId).eq("user_id", user.id)
    : await supabase.from("lifebree_post_likes").insert({ post_id: postId, user_id: user.id });
  if (result.error) throw result.error;
}

export async function togglePostRepost(postId: string, reposted: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to repost.");
  const result = reposted
    ? await supabase.from("lifebree_post_reposts").delete().eq("post_id", postId).eq("user_id", user.id)
    : await supabase.from("lifebree_post_reposts").insert({ post_id: postId, user_id: user.id });
  if (result.error) throw result.error;
}

export async function loadPostComments(postId: string): Promise<SocialComment[]> {
  const { data, error } = await createClient()
    .from("lifebree_post_comments")
    .select("id,author_name,content,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, authorName: row.author_name, content: row.content, createdAt: row.created_at }));
}

export async function addPostComment(postId: string, content: string) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Sign in to comment.");
  const { error } = await supabase.from("lifebree_post_comments").insert({
    post_id: postId,
    author_id: user.id,
    content: content.trim(),
  });
  if (error) throw error;
}

export async function sharePost(postId: string, channel: SocialChannel, content: string) {
  const url = `${window.location.origin}/home?channel=${channel}&post=${postId}`;
  if (navigator.share) {
    await navigator.share({ title: "A story on Lifebree", text: content, url });
  } else {
    await navigator.clipboard.writeText(url);
  }
}
