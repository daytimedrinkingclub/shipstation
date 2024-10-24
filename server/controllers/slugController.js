const FileService = require("../services/fileService");
const {
  checkSlugAvailability,
  updateShipSlug,
} = require("../services/dbService");

const fileService = new FileService();

exports.changeSlug = async (req, res) => {
  const { shipId, oldSlug, newSlug } = req.body;

  try {
    // Check if the new slug is available
    const isAvailable = await checkSlugAvailability(newSlug);
    if (!isAvailable) {
      return res.status(400).json({ error: "This slug is already in use. Please try another one." });
    }

    // Move files
    console.log(`Attempting to move files from ${oldSlug} to ${newSlug}`);
    await fileService.moveFiles(oldSlug, newSlug);
    console.log("Files moved successfully");

    // Update the slug in the database
    await updateShipSlug(shipId, newSlug);

    res.status(200).json({ success: true, message: "Slug changed successfully", newSlug });
  } catch (error) {
    console.error("Error changing slug:", error);
    if (error.__isStorageError) {
      console.error(
        "Storage API Error:",
        error.message,
        "Status:",
        error.status
      );
    }
    res
      .status(500)
      .json({ success: false, error: "Failed to change slug", details: error.message });
  }
};
