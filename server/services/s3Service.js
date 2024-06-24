const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../config/awsConfig");
require("dotenv").config();

const bucketName = process.env.BUCKETEER_BUCKET_NAME;

async function saveFileToS3(bucketPath, content) {
  const params = {
    Bucket: bucketName,
    Key: bucketPath,
    Body: content,
  };
  try {
    await s3Client.send(new PutObjectCommand(params));
    console.log(`Successfully uploaded ${bucketPath}`);
  } catch (err) {
    console.error(`Error uploading ${bucketPath}:`, err);
  }
}

async function saveDirectoryToS3(directoryPath, remotePath) {
  let destinationPath = remotePath || directoryPath;
  const fs = require("fs").promises;
  const path = require("path");
  try {
    const files = await fs.readdir(directoryPath);
    const uploadPromises = files.map(async (file) => {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        const fileContent = await fs.readFile(filePath);
        const s3Path = path.join(destinationPath, file);
        await saveFileToS3(s3Path, fileContent);
        console.log(`File ${file} uploaded successfully to ${s3Path}`);
      } else if (stats.isDirectory()) {
        await saveDirectoryToS3(filePath, path.join(destinationPath, file));
      }
    });
    await Promise.all(uploadPromises);
  } catch (err) {
    console.error("Failed to upload directory:", err);
  }
}

module.exports = { saveFileToS3, saveDirectoryToS3 };
