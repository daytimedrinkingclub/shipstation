const ScreenshotService = require("./server/services/screenshotService");
const { supabaseClient } = require("./server/services/supabaseService");

const screenshotService = new ScreenshotService();

async function generateAllScreenshots() {
  try {
    // Fetch all ships from the Supabase table
    const { data: ships, error } = await supabaseClient
      .from('ships')
      .select('slug')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching ships:", error);
      return;
    }

    console.log(`Found ${ships.length} ships. Generating screenshots...`);

    // Generate screenshots for each ship
    for (const ship of ships) {
      try {
        const filePath = await screenshotService.saveScreenshot(ship.slug);
        console.log(`Generated screenshot for ${ship.slug}: ${filePath}`);
      } catch (error) {
        console.error(`Error generating screenshot for ${ship.slug}:`, error);
      }
    }

    console.log("Finished generating all screenshots.");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the function to generate all screenshots
// generateAllScreenshots();

// Keep the original single screenshot generation for testing purposes
screenshotService.saveScreenshot("anuj-sharma-ZahGbgp6").then((filePath) => {
  console.log(filePath);
});
