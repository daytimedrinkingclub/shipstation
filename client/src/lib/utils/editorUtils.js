import { supabase } from "@/lib/supabaseClient";

export async function getLatestShipIdForUser(userId) {
  try {
    const { data, error } = await supabase
      .from("ships")
      .select("slug")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching ship:", error);
      return null;
    }

    return data ? data.slug : null;
  } catch (error) {
    console.error("Error fetching ship using user id:", error);
    return null;
  }
}
