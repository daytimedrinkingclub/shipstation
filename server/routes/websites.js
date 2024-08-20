const express = require("express");
const router = express.Router();
const {
  listFoldersInS3,
  getProjectDirectoryStructure,
  createZipFromS3Directory,
} = require("../services/s3Service");
const { serializeDom } = require("../utils/domUtlis");
const fs = require("fs").promises;
const path = require("path");
const { PORT } = require("../config/app");

router.get("/all-websites", async (req, res) => {
  const s3Websites = await listFoldersInS3("websites/");
  let localWebsites = [];
  try {
    localWebsites = await fs.readdir("websites");
  } catch (err) {
    if (err.code === "ENOENT") {
      localWebsites = [];
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  res.json({
    s3: JSON.parse(s3Websites).filter((website) => !website.startsWith(".")),
    local: localWebsites,
  });
});

router.get("/project-structure/:slug", async (req, res) => {
  const slug = req.params.slug;
  console.log(slug);
  try {
    const structure = await getProjectDirectoryStructure(slug);
    res.json(structure);
  } catch (error) {
    console.error(`Error fetching project structure for ${slug}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/download/:slug", async (req, res) => {
  const slug = req.params.slug;
  const folderPath = `websites/${slug}`;

  try {
    const zipStream = await createZipFromS3Directory(slug);

    if (!zipStream) {
      return res.status(404).send("Folder not found");
    }

    res.setHeader("Content-Disposition", `attachment; filename=${slug}.zip`);
    res.setHeader("Content-Type", "application/zip");

    zipStream.pipe(res);
  } catch (error) {
    console.error(`Error downloading folder ${folderPath}:`, error);
    res.status(500).send("An error occurred");
  }
});

router.get("/:websiteId", async (req, res) => {
  const websiteId = req.params.websiteId;
  const websitePath = path.join(__dirname, "websites", websiteId);

  try {
    // Check if the directory exists
    const websiteExists = await fs
      .access(websitePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!websiteExists) {
      return res.status(404).send("Website not found");
    }

    const serializedHtml = await serializeDom(
      path.join(websitePath, "index.html"),
      `http://localhost:${PORT}/${websiteId}`
    );

    res.send(serializedHtml);
  } catch (error) {
    console.error(error);
    res.status(404).send("Website not found");
  }
});

module.exports = router;
