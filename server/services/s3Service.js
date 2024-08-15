const {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { Readable } = require("stream");
const archiver = require("archiver");
const { s3Handler } = require("../config/awsConfig");
require("dotenv").config();

const bucketName = process.env.BUCKETEER_BUCKET_NAME;

async function saveFileToS3(bucketPath, content) {
  const finalPath = `websites/${bucketPath}`;
  const params = {
    Bucket: bucketName,
    Key: finalPath,
    Body: content,
  };
  try {
    await s3Handler.send(new PutObjectCommand(params));
    console.log(`Successfully uploaded to s3 on path: ${finalPath}`);
  } catch (err) {
    console.error(`Error uploading ${finalPath}:`, err);
  }
}
async function listFoldersInS3(
  prefix,
  sortBy = "modifiedAt",
  sortOrder = "desc"
) {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
    Delimiter: "/",
  };
  try {
    const data = await s3Handler.send(new ListObjectsV2Command(params));

    // Get folder details including LastModified
    const folderDetails = await Promise.all(
      data.CommonPrefixes.map(async (item) => {
        const folderName = item.Prefix.replace(prefix, "");
        const folderContentParams = {
          Bucket: bucketName,
          Prefix: item.Prefix,
          MaxKeys: 1,
        };
        const folderContent = await s3Handler.send(
          new ListObjectsV2Command(folderContentParams)
        );
        const modifiedAt =
          folderContent.Contents[0]?.LastModified || new Date(0);
        return { name: folderName, modifiedAt };
      })
    );

    // Sort folders based on sortBy and sortOrder
    folderDetails.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === "asc"
          ? a.modifiedAt - b.modifiedAt
          : b.modifiedAt - a.modifiedAt;
      }
    });

    const sortedFolders = folderDetails.map((folder) => folder.name);
    console.log(`Sorted folders in '${prefix}':`, sortedFolders);
    return JSON.stringify(sortedFolders); // Return sorted folders as a JSON array
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

async function createZipFromS3Directory(directoryPath) {
  const params = {
    Bucket: bucketName,
    Prefix: `websites/${directoryPath}`,
  };

  try {
    const data = await s3Handler.send(new ListObjectsV2Command(params));

    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level
    });

    const streamPassThrough = new (require("stream").PassThrough)();
    archive.pipe(streamPassThrough);

    for (const item of data.Contents) {
      const fileData = await s3Handler.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: item.Key,
        })
      );

      const fileStream = fileData.Body;
      const fileName = item.Key.replace(`websites/${directoryPath}/`, "");

      archive.append(Readable.from(fileStream), { name: fileName });
    }

    await archive.finalize();

    return streamPassThrough;
  } catch (err) {
    console.error(`Error creating zip from '${directoryPath}':`, err);
    throw err;
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

async function getProjectDirectoryStructure(s3Path) {
  const params = {
    Bucket: bucketName,
    Prefix: `websites/${s3Path}`,
    Delimiter: "/",
  };

  try {
    const data = await s3Handler.send(new ListObjectsV2Command(params));
    const structure = [];

    // Process directories
    for (const prefix of data.CommonPrefixes || []) {
      const dirName = prefix.Prefix.split("/").slice(-2)[0];
      const dirPath = prefix.Prefix.replace("websites/", "");
      structure.push({
        name: dirName,
        type: "directory",
        path: dirPath,
        children: await getProjectDirectoryStructure(dirPath),
      });
    }

    // Process files
    for (const content of data.Contents || []) {
      const fileName = content.Key.split("/").pop();
      if (fileName && content.Key !== `websites/${s3Path}`) {
        const filePath = content.Key.replace("websites/", "");
        structure.push({
          name: fileName,
          type: "file",
          path: filePath,
          lastModified: content.LastModified,
        });
      }
    }

    // If this is the top-level call, return the children of the first directory
    if (
      s3Path.split("/").length === 1 &&
      structure.length === 1 &&
      structure[0].type === "directory"
    ) {
      return structure[0].children;
    }

    return structure;
  } catch (err) {
    console.error(`Error getting directory structure for '${s3Path}':`, err);
    return [];
  }
}

module.exports = {
  saveFileToS3,
  saveDirectoryToS3,
  listFoldersInS3,
  getFileFromS3,
  createZipFromS3Directory,
  getProjectDirectoryStructure,
};
