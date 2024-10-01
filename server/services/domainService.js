const { supabaseClient } = require("./supabaseService");

async function getGreenlockConfig() {
  const { data, error } = await supabaseClient
    .from("greenlock_config")
    .select("config")
    .single();

  if (error) {
    console.error("Error fetching Greenlock config:", error);
    return { sites: [] };
  }

  return data.config;
}

async function updateGreenlockConfig(config) {
  console.log("Updating Greenlock config:", config);
  const { error } = await supabaseClient
    .from("greenlock_config")
    .upsert({ id: 1, config });

  if (error) {
    console.error("Error updating Greenlock config:", error);
    throw error;
  }
  console.log("Greenlock config updated successfully");
}

async function checkGreenlockConfig() {
  const config = await getGreenlockConfig();
  console.log("Current Greenlock config:", config);
  return config;
}

async function getDomainMapping(domain) {
  const { data, error } = await supabaseClient
    .from("custom_domains")
    .select("ship_slug")
    .eq("domain", domain)
    .single();

  if (error) {
    console.error("Error fetching domain mapping:", error);
    return null;
  }

  return data ? { shipSlug: data.ship_slug } : null;
}

async function addDomainMapping(domain, shipId, shipSlug) {
  const { data, error } = await supabaseClient
    .from("custom_domains")
    .insert({ domain, ship_id: shipId, ship_slug: shipSlug });

  if (error) {
    console.error("Error adding domain mapping:", error);
    throw error;
  }

  return data;
}

module.exports = {
  getDomainMapping,
  addDomainMapping,
  getGreenlockConfig,
  updateGreenlockConfig,
  checkGreenlockConfig,
};
