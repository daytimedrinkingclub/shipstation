const FileService = require("../services/fileService");
const fileService = new FileService();

exports.updateFile = async (req, res) => {
  const { filePath, content } = req.body;
  try {
    await fileService.saveFile(filePath, content);
    res.status(200).json({ message: "File updated successfully" });
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.downloadFolder = async (req, res) => {
  const slug = req.params.slug;

  try {
    const zipStream = await fileService.createZipFromDirectory(slug);

    if (!zipStream) {
      return res.status(404).send("Folder not found");
    }

    res.setHeader("Content-Disposition", `attachment; filename=${slug}.zip`);
    res.setHeader("Content-Type", "application/zip");

    zipStream.pipe(res);
  } catch (error) {
    console.error(`Error downloading folder ${slug}:`, error);
    res.status(500).send("An error occurred");
  }
};

exports.serveFile = async (req, res) => {
  const siteName = req.params.siteId;
  let filePath = req.path.slice(1);

  filePath = filePath.replace(new RegExp(`^${siteName}/`), "");

  if (filePath === "" || filePath.endsWith("/")) {
    filePath += "index.html";
  }

  const key = `${siteName}/${filePath}`;

  try {
    const fileInfo = await fileService.getFileStream(key);

    if (fileInfo.exists) {
      res.set("Content-Type", fileInfo.contentType);
      fileInfo.stream.pipe(res);
    } else {
      res.status(404).send("File not found");
    }
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    res.status(500).send("An error occurred");
  }
};
