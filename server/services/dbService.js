const { supabaseClient } = require("./supabaseService");

async function insertConversation(payload) {
  const { data, error } = await supabaseClient
    .from("conversations")
    .insert({ ...payload })
    .select()
    .single();

  if (error) {
    console.error("Error inserting conversation:", error);
    throw error;
  }

  return data;
}

async function insertMessage(message) {
  const { data, error } = await supabaseClient
    .from("messages")
    .insert([{ ...message }])
    .select()
    .single();

  if (error) {
    console.error("Error inserting message:", error);
    throw error;
  }

  return data;
}

async function insertShip(ship) {
  const { data, error } = await supabaseClient
    .from("ships")
    .insert([{ ...ship }])
    .select()
    .single();

  if (error) {
    console.error("Error inserting ship:", error);
    throw error;
  }

  return data;
}
async function updateShip(shipId, ship) {
  const { data, error } = await supabaseClient
    .from("ships")
    .update(ship)
    .eq("id", shipId);

  if (error) {
    console.error("Error updating ship:", error);
    throw error;
  }

  return data;
}

async function getConversation(conversationId) {
  const { data, error } = await supabaseClient
    .from("conversations")
    .select("*")
    .eq("id", conversationId);

  if (error) {
    console.error("Error getting conversation:", error);
    throw error;
  }

  return data;
}

async function updateConversation(conversationId, conversation) {
  const { data, error } = await supabaseClient
    .from("conversations")
    .update(conversation)
    .eq("id", conversationId);

  if (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }

  return data;
}

async function getUserProfile(userId) {
  const { data, error } = await supabaseClient
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error getting user:", error);
    throw error;
  }

  return data;
}

async function updateUserProfile(userId, profileData) {
  const { data, error } = await supabaseClient
    .from("user_profiles")
    .update(profileData)
    .eq("id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }

  return data;
}

async function insertPayment(paymentData) {
  const { data, error } = await supabaseClient
    .from("payments")
    .insert(paymentData);

  if (error) {
    console.error("Error inserting payment:", error);
    throw error;
  }

  return data;
}

async function getCodeRefiningConversation(shipId) {
  const { data, error } = await supabaseClient
    .from("code_refining_conversations")
    .select("*")
    .eq("ship_id", shipId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error getting code refining conversation:", error);
    throw error;
  }

  return data;
}

async function upsertCodeRefiningConversation(shipId, userId, messages) {
  const { data, error } = await supabaseClient
    .from("code_refining_conversations")
    .upsert(
      { ship_id: shipId, user_id: userId, messages, updated_at: new Date() },
      { onConflict: "ship_id" }
    )
    .select();

  if (error) {
    console.error("Error upserting code refining conversation:", error);
    throw error;
  }

  return data[0];
}

module.exports = {
  insertConversation,
  insertMessage,
  insertShip,
  updateShip,
  getConversation,
  updateConversation,
  getUserProfile,
  updateUserProfile,
  insertPayment,
  getCodeRefiningConversation,
  upsertCodeRefiningConversation,
};
