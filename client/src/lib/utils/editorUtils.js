import { supabase } from "@/lib/supabaseClient";

export async function getLatestShipIdForUser(userId) {
  try {
    const { data, error } = await supabase
      .from("ships")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching ship:", error);
      return null;
    }

    return data ? data.id : null;
  } catch (error) {
    console.error("Error fetching ship using user id:", error);
    return null;
  }
}

export async function getShipSlugFromId(shipId) {
  try {
    const { data, error } = await supabase
      .from("ships")
      .select("slug")
      .eq("id", shipId)
      .single();

    if (error) {
      console.error("Error fetching ship slug:", error);
      return null;
    }

    return data ? data.slug : null;
  } catch (error) {
    console.error("Error fetching ship slug using id:", error);
    return null;
  }
}

export async function getLatestShipInfoForUser(userId) {
  try {
    const shipId = await getLatestShipIdForUser(userId);
    if (!shipId) {
      return null;
    }

    const shipSlug = await getShipSlugFromId(shipId);
    if (!shipSlug) {
      return null;
    }

    console.log("shipId", shipId);
    console.log("shipSlug", shipSlug);

    return { id: shipId, slug: shipSlug };
  } catch (error) {
    console.error("Error fetching latest ship info:", error);
    return null;
  }
}
