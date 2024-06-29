const { supabaseClient } = require("./supabaseService");

async function insertConversation(conversation, shipstationUrl) {
  const { data, error } = await supabaseClient
    .from("conversations")
    .insert([{ conversation, shipstationUrl }]);

  if (error) {
    console.error("Error inserting conversation:", error);
    throw error;
  }

  return data;
}

module.exports = {
  insertConversation,
};
