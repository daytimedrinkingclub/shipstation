const {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { s3Handler } = require("../config/awsConfig");
require("dotenv").config();

const bucketName = process.env.BUCKETEER_BUCKET_NAME;

async function saveFileToS3(bucketPath, content) {
  const params = {
    Bucket: bucketName,
    Key: bucketPath,
    Body: content,
  };
  try {
    await s3Handler.send(new PutObjectCommand(params));
    console.log(`Successfully uploaded ${bucketPath}`);
  } catch (err) {
    console.error(`Error uploading ${bucketPath}:`, err);
  }
}

async function listFoldersInS3(prefix) {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
    Delimiter: "/",
  };
  try {
    const data = await s3Handler.send(new ListObjectsV2Command(params));
    // Strip the prefix from each folder name
    const folders = data.CommonPrefixes.map((item) =>
      item.Prefix.replace(prefix, "")
    );
    console.log(`Folders in '${prefix}':`, folders);
    return JSON.stringify(folders); // Return folders as a JSON array
  } catch (err) {
    console.error(`Error listing folders in '${prefix}':`, err);
    return JSON.stringify([]); // Return an empty JSON array in case of error
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

async function getFileFromS3(bucketPath) {
  const params = {
    Bucket: bucketName,
    Key: bucketPath,
  };
  const data = await s3Handler.send(new GetObjectCommand(params));
  console.log("data", data?.Body);
  return data?.Body;
}

module.exports = {
  saveFileToS3,
  saveDirectoryToS3,
  listFoldersInS3,
  getFileFromS3,
};
