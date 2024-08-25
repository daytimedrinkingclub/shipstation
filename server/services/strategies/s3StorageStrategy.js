const {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { Readable } = require("stream");
const archiver = require("archiver");
const { s3Handler } = require("../../config/awsConfig");
require("dotenv").config();

const WEBSITES_PATH = process.env.WEBSITES_PATH || "websites";
const bucketName = process.env.BUCKETEER_BUCKET_NAME;

class S3StorageStrategy {
  async saveFile(filePath, content) {
    const finalPath = `${WEBSITES_PATH}/${filePath}`;
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
      throw err;
    }
  }

  async saveDirectory(directoryPath, remotePath) {
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
          await this.saveFile(s3Path, fileContent);
          console.log(`File ${file} uploaded successfully to ${s3Path}`);
        } else if (stats.isDirectory()) {
          await this.saveDirectory(filePath, path.join(destinationPath, file));
        }
      });
      await Promise.all(uploadPromises);
    } catch (err) {
      console.error("Failed to upload directory:", err);
      throw err;
    }
  }

  async listFolders(prefix, sortBy = "modifiedAt", sortOrder = "desc") {
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: "/",
    };
    try {
      const data = await s3Handler.send(new ListObjectsV2Command(params));

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
      return sortedFolders;
    } catch (err) {
      console.error(`Error listing folders in '${prefix}':`, err);
      return [];
    }
  }

  async getFile(filePath) {
    const params = {
      Bucket: bucketName,
      Key: filePath,
    };
    try {
      const data = await s3Handler.send(new GetObjectCommand(params));
      return data.Body;
    } catch (err) {
      console.error(`Error getting file ${filePath}:`, err);
      throw err;
    }
  }

  async createZipFromDirectory(directoryPath) {
    const params = {
      Bucket: bucketName,
      Prefix: `${WEBSITES_PATH}/${directoryPath}`,
    };

    try {
      const data = await s3Handler.send(new ListObjectsV2Command(params));

      const archive = archiver("zip", {
        zlib: { level: 9 },
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
        const fileName = item.Key.replace(
          `${WEBSITES_PATH}/${directoryPath}/`,
          ""
        );

        archive.append(Readable.from(fileStream), { name: fileName });
      }

      await archive.finalize();

      return streamPassThrough;
    } catch (err) {
      console.error(`Error creating zip from '${directoryPath}':`, err);
      throw err;
    }
  }

  async getProjectDirectoryStructure(projectPath) {
    const params = {
      Bucket: bucketName,
      Prefix: `${WEBSITES_PATH}/${projectPath}`,
      Delimiter: "/",
    };

    try {
      const data = await s3Handler.send(new ListObjectsV2Command(params));
      const structure = [];

      for (const prefix of data.CommonPrefixes || []) {
        const dirName = prefix.Prefix.split("/").slice(-2)[0];
        const dirPath = prefix.Prefix.replace(`${WEBSITES_PATH}/`, "");
        structure.push({
          name: dirName,
          type: "directory",
          path: dirPath,
          children: await this.getProjectDirectoryStructure(dirPath),
        });
      }

      for (const content of data.Contents || []) {
        const fileName = content.Key.split("/").pop();
        if (fileName && content.Key !== `${WEBSITES_PATH}/${projectPath}`) {
          const filePath = content.Key.replace(`${WEBSITES_PATH}/`, "");
          structure.push({
            name: fileName,
            type: "file",
            path: filePath,
            lastModified: content.LastModified,
          });
        }
      }

      if (
        projectPath.split("/").length === 1 &&
        structure.length === 1 &&
        structure[0].type === "directory"
      ) {
        return structure[0].children;
      }

      return structure;
    } catch (err) {
      console.error(
        `Error getting directory structure for '${projectPath}':`,
        err
      );
      return [];
    }
  }

  async getFileStream(filePath) {
    const params = {
      Bucket: bucketName,
      Key: `${WEBSITES_PATH}/${filePath}`,
    };

    try {
      const { Body, ContentType } = await s3Handler.send(
        new GetObjectCommand(params)
      );
      return { stream: Body, contentType: ContentType };
    } catch (error) {
      console.error(`Error fetching ${filePath}: ${error}`);
      throw error;
    }
  }
}

module.exports = S3StorageStrategy;
