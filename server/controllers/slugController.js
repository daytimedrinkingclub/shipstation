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
      return res.status(400).json({ error: "Slug is already in use" });
    }

    // Move files
    console.log(`Attempting to move files from ${oldSlug} to ${newSlug}`);
    await fileService.moveFiles(oldSlug, newSlug);
    console.log("Files moved successfully");

    // Update the slug in the database
    await updateShipSlug(shipId, newSlug);

    res.status(200).json({ message: "Slug changed successfully", newSlug });
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
      .json({ error: "Failed to change slug", details: error.message });
  }
};
