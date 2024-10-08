import { supabase } from "@/lib/supabaseClient";

async function fetchGeneratedWebsites(page = 1, limit = 15, userId = null) {
  const offset = (page - 1) * limit;

  let query = supabase
    .from("ships")
    .select(
      `
      *,
      website_likes (id, user_id)
    `,
      { count: "exact" }
    )
    .eq("status", "completed")
    .order("likes_count", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: websites, count, error } = await query;

  if (error) {
    console.error("Error fetching generated websites:", error);
    throw error;
  }

  const formattedWebsites = websites.map((website) => ({
    ...website,
    likes_count: website.likes_count || 0,
    is_liked_by_user: userId
      ? website.website_likes.some((like) => like.user_id === userId)
      : false,
  }));

  return {
    websites: formattedWebsites,
    totalCount: count,
    hasMore: count > offset + limit,
    nextPage: page + 1,
  };
}

export { fetchGeneratedWebsites };
