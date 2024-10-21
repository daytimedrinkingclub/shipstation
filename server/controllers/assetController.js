const FileService = require("../services/fileService");
const fileService = new FileService();

exports.uploadAssets = async (req, res) => {
  const { shipId } = req.body;
  const files = req.files;
  const comments = req.body.comments || [];

  if (!shipId || !files || files.length === 0) {
    return res.status(400).json({ error: "Missing shipId or assets" });
  }

  try {
    const assets = files.map((file, index) => ({
      file: file,
      comment: comments[index] || "",
    }));

    const uploadedAssets = await fileService.uploadAssets(shipId, assets);

    res.status(200).json({
      message: "Assets uploaded successfully",
      assets: uploadedAssets,
    });
  } catch (error) {
    console.error("Error uploading assets:", error);
    res.status(500).json({ error: "Failed to upload assets" });
  }
};

exports.uploadTemporaryAssets = async (req, res) => {
  const files = req.files;
  const comments = req.body.comments || [];

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "Missing assets" });
  }

  try {
    const assets = files.map((file, index) => ({
      file: file,
      comment: comments[index] || "",
    }));

    const uploadedAssets = await fileService.uploadTemporaryAssets(assets);

    res.status(200).json({
      message: "Temporary assets uploaded successfully",
      assets: uploadedAssets,
    });
  } catch (error) {
    console.error("Error uploading temporary assets:", error);
    res.status(500).json({ error: "Failed to upload temporary assets" });
  }
};
