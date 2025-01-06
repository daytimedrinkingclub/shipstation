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
  try {
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
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
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

async function upsertCodeRefiningConversation(shipId, messages) {
  const { data, error } = await supabaseClient
    .from("code_refining_conversations")
    .upsert(
      { ship_id: shipId, messages, updated_at: new Date() },
      { onConflict: "ship_id" }
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
      .eq("ship_id", shipId)
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
    .insert({ ship_id: shipId, version: newVersion, file_path: filePath });

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
    .eq("ship_id", shipId)
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
    .eq("ship_id", shipId)
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
    .eq("id", shipId)
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
    .eq("id", shipId);

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
    .eq("ship_id", shipId)
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
    .eq("ship_id", shipId)
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
      .eq("id", shipId)
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

async function getDesignPresetPrompt(shipType, designName) {
  const { data, error } = await supabaseClient
    .from("design_presets")
    .select("additive_prompt")
    .eq("site_type", shipType)
    .eq("design_name", designName)
    .single();

  if (error) {
    console.error("Error fetching design preset:", error);
    throw error;
  }

  return data;
}

async function likeWebsite(userId, shipId) {
  try {
    const { data, error } = await supabaseClient
      .from("website_likes")
      .insert({ user_id: userId, ship_id: shipId });

    if (error) {
      if (error.code === "23505") {
        throw new Error("Already liked");
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error liking website:", error);
    throw error;
  }
}

async function unlikeWebsite(userId, shipId) {
  try {
    const { data, error } = await supabaseClient
      .from("website_likes")
      .delete()
      .match({ user_id: userId, ship_id: shipId });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error unliking website:", error);
    throw error;
  }
}

async function updateShipPrompt(shipId, prompt) {
  try {
    const { data, error } = await supabaseClient
      .from("ships")
      .upsert(
        { id: shipId, prompt: prompt },
        { onConflict: "id", returning: "minimal" }
      );

    if (error) {
      console.error("Error upserting ship prompt:", error);
      throw error;
    }

    console.log(`Successfully upserted prompt for ship ${shipId}`);
    return { success: true };
  } catch (error) {
    console.error("Error upserting ship prompt:", error);
    throw error;
  }
}

async function checkSlugAvailability(slug) {
  const { data, error } = await supabaseClient
    .from("ships")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error && error.code === "PGRST116") {
    // PGRST116 means no rows returned, so the slug is available
    return true;
  } else if (error) {
    console.error("Error checking slug availability:", error);
    throw error;
  }

  return false;
}

async function updateShipSlug(shipId, newSlug) {
  const { data, error } = await supabaseClient
    .from("ships")
    .update({ slug: newSlug })
    .eq("id", shipId);

  if (error) {
    console.error("Error updating ship slug:", error);
    throw error;
  }

  return data;
}

async function createUser(email) {
  try {
    const tempPassword = Math.random().toString(36).slice(-12);

    const { data: authData, error: authError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw authError;
    }

    return authData.user;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
}

const getUserProfileByPaddleCustomerId = async (paddleCustomerId) => {
    const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('paddle_customer_id', paddleCustomerId)
        .single();

    if (error) throw error;
    return data;
};

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
  getDesignPresetPrompt,
  likeWebsite,
  unlikeWebsite,
  updateShipPrompt,
  checkSlugAvailability,
  updateShipSlug,
  createUser,
  getUserProfileByPaddleCustomerId,
};
