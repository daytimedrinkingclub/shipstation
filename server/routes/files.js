const express = require("express");
const router = express.Router();
const { saveFileToS3 } = require("../services/s3Service");
const { s3Handler } = require("../config/awsConfig");
const { GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

router.post("/update-file", async (req, res) => {
  const { filePath, content } = req.body;
  try {
    await saveFileToS3(filePath, content);
    res.status(200).json({ message: "File updated successfully" });
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.use("/site/:siteId", async (req, res, next) => {
  const siteName = req.params.siteId;
  let filePath = req.path.slice(1); // Get the path without the leading slash

  // Ensure filePath doesn't start with the siteName
  filePath = filePath.replace(new RegExp(`^${siteName}/`), "");

  // Default to index.html if filePath is empty or ends with a slash
  if (filePath === "" || filePath.endsWith("/")) {
    filePath += "index.html";
  }

  const key = `websites/${siteName}/${filePath}`;

  try {
    const params = {
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Key: key,
    };

    const headCommand = new HeadObjectCommand(params);
    const headObjectResponse = await s3Handler.send(headCommand);

    // Set the Content-Type based on the file extension
    const fileExtension = path.extname(filePath).toLowerCase();
    if (fileExtension === ".html") {
      res.set("Content-Type", "text/html");
    } else {
      res.set("Content-Type", headObjectResponse.ContentType);
    }

    const getCommand = new GetObjectCommand(params);
    const { Body } = await s3Handler.send(getCommand);
    Body.pipe(res);
  } catch (error) {
    console.error(`Error fetching ${key}: ${error}`);
    if (error.name === "NoSuchKey") {
      console.log(`File not found: ${key}`);
      return next();
    }
    res.status(500).send("An error occurred");
  }
});

module.exports = router;
