const { supabaseClient } = require("./supabaseService");

async function insertConversation(conversation, shipstationUrl) {
  const { data, error } = await supabaseClient
    .from("conversations")
    .insert([{ conversation, shipstation_url: shipstationUrl }]);

  if (error) {
    console.error("Error inserting conversation:", error);
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

module.exports = {
  insertConversation,
  getConversation,
  updateConversation,
};
