const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getUserIdFromEmail(email) {
  try {
    const { data, error } = await supabaseClient
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data ? data.id : null;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
}

module.exports = { supabaseClient, getUserIdFromEmail };
