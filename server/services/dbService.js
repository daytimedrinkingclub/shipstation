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
    .eq("ship_slug", shipId)
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
      { ship_slug: shipId, user_id: userId, messages, updated_at: new Date() },
      { onConflict: "ship_slug" }
    )
    .select();

  if (error) {
    console.error("Error upserting code refining conversation:", error);
    throw error;
  }

  return data[0];
}

async function saveCodeVersion(shipId, filePath) {
  // Get the latest version number for the ship
  const { data: latestVersionData, error: latestVersionError } =
    await supabaseClient
      .from("code_versions")
      .select("version")
      .eq("ship_slug", shipId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

  if (latestVersionError && latestVersionError.code !== "PGRST116") {
    console.error("Error getting latest version:", latestVersionError);
    throw latestVersionError;
  }

  const latestVersion = latestVersionData ? latestVersionData.version : 0;
  const newVersion = latestVersion + 1;

  // Insert the new version into the database
  const { data, error } = await supabaseClient
    .from("code_versions")
    .insert({ ship_slug: shipId, version: newVersion, file_path: filePath });

  if (error) {
    console.error("Error saving code version:", error);
    throw error;
  }

  return newVersion;
}

async function getCodeVersion(shipId, version) {
  const { data, error } = await supabaseClient
    .from("code_versions")
    .select("file_path")
    .eq("ship_slug", shipId)
    .eq("version", version)
    .single();

  if (error) {
    console.error("Error getting code version:", error);
    return null;
  }

  return data;
}

async function getLatestCodeVersion(shipId) {
  const { data, error } = await supabaseClient
    .from("code_versions")
    .select("version")
    .eq("ship_slug", shipId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error getting latest code version:", error);
    return null;
  }

  return data;
}

async function getCurrentCodeVersion(shipId) {
  const { data, error } = await supabaseClient
    .from("ships")
    .select("current_version")
    .eq("slug", shipId)
    .single();

  if (error) {
    console.error("Error getting current code version:", error);
    return null;
  }

  return data.current_version;
}

async function updateCurrentCodeVersion(shipId, version) {
  const { data, error } = await supabaseClient
    .from("ships")
    .update({ current_version: version })
    .eq("slug", shipId);

  if (error) {
    console.error("Error updating current code version:", error);
    throw error;
  }

  return data;
}

async function getAllCodeVersions(shipId) {
  const { data, error } = await supabaseClient
    .from("code_versions")
    .select("*")
    .eq("ship_slug", shipId)
    .order("version", { ascending: true });

  if (error) {
    console.error("Error getting all code versions:", error);
    throw error;
  }

  return data;
}

async function deleteCodeVersion(shipId, version) {
  const { data, error } = await supabaseClient
    .from("code_versions")
    .delete()
    .eq("ship_slug", shipId)
    .eq("version", version);

  if (error) {
    console.error("Error deleting code version:", error);
    throw error;
  }

  return data;
}

async function updateShipAssets(shipId, newAssets) {
  // First, get the current assets
  const { data: currentData, error: fetchError } = await supabaseClient
    .from("ships")
    .select("assets")
    .eq("slug", shipId)
    .single();

  if (fetchError) {
    console.error("Error fetching current assets:", fetchError);
    throw fetchError;
  }

  // Combine current assets with new assets
  let updatedAssets = currentData.assets || [];
  if (Array.isArray(updatedAssets)) {
    updatedAssets = [...updatedAssets, ...newAssets];
  } else if (typeof updatedAssets === "string") {
    try {
      updatedAssets = [...JSON.parse(updatedAssets), ...newAssets];
    } catch (parseError) {
      console.error("Error parsing current assets:", parseError);
      updatedAssets = newAssets;
    }
  } else {
    updatedAssets = newAssets;
  }

  // Update the ships table with the combined assets
  const { data, error } = await supabaseClient
    .from("ships")
    .update({ assets: JSON.stringify(updatedAssets) })
    .eq("slug", shipId);

  if (error) {
    console.error("Error updating ship assets:", error);
    throw error;
  }

  return updatedAssets;
}

async function fetchAssets(shipId) {
  try {
    console.log(`Fetching assets for shipId: ${shipId}`);
    const { data, error } = await supabaseClient
      .from("ships")
      .select("assets")
      .eq("slug", shipId)
      .single();

    if (error) {
      console.error(`Error fetching assets from database: ${error.message}`);
      throw error;
    }

    let parsedAssets = [];
    if (data && data.assets) {
      if (Array.isArray(data.assets)) {
        parsedAssets = data.assets;
      } else if (typeof data.assets === "string") {
        try {
          const parsed = JSON.parse(data.assets);
          parsedAssets = Array.isArray(parsed) ? parsed : [];
        } catch (parseError) {
          console.error("Error parsing assets JSON:", parseError);
        }
      }
    }

    return parsedAssets;
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}

async function getShipPrompt(shipId) {
  try {
    const { data, error } = await supabaseClient
      .from("ships")
      .select("prompt")
      .eq("slug", shipId)
      .single();

    if (error) {
      console.error(`Error fetching prompt from database: ${error.message}`);
      throw error;
    }

    if (!data || !data.prompt) {
      console.log(`No prompt found for shipId: ${shipId}`);
      return null;
    }

    return data.prompt;
  } catch (error) {
    console.error("Error fetching ship prompt:", error);
    throw error;
  }
}

async function getDesignPreset(shipType, designName) {
  const { data, error } = await supabaseClient
    .from("design_presets")
    .select("additive_prompt, color_palette, fonts")
    .eq("site_type", shipType)
    .eq("design_name", designName)
    .single();

  if (error) {
    console.error("Error fetching design preset:", error);
    throw error;
  }

  return data;
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
  saveCodeVersion,
  getCodeVersion,
  getLatestCodeVersion,
  getCurrentCodeVersion,
  updateCurrentCodeVersion,
  getAllCodeVersions,
  deleteCodeVersion,
  updateShipAssets,
  fetchAssets,
  getShipPrompt,
  getDesignPreset,
};
