import { supabase } from "@/lib/supabaseClient";

export const fetchGeneratedWebsites = async (pageNumber = 1, pageSize = 15) => {
  try {
    const { data, error } = await supabase
      .from("ships")
      .select("prompt, slug, portfolio_type, id")
      .order("id", { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    if (error) {
      console.error(error);
      throw error;
    }

    return {
      websites: data,
      hasMore: data.length === pageSize,
    };
  } catch (error) {
    console.error("Error fetching generated websites:", error);
    throw error;
  }
};
