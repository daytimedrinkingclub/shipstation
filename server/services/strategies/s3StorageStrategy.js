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
const bucketName = process.env.BUCKET_NAME;
const externalS3Endpoint = process.env.S3_EXTERNAL_ENDPOINT;

class S3StorageStrategy {
  async saveFile(filePath, content) {
    const finalPath = `${WEBSITES_PATH}/${filePath}`;
    const params = {
      Bucket: bucketName,
      Key: finalPath,
      Body: content,
    };
    console.log(`Uploading to s3 with params: ${JSON.stringify(params)}`);
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
    const finalPath = `${WEBSITES_PATH}/${filePath}`;

    const params = {
      Bucket: bucketName,
      Key: finalPath,
    };
    try {
      const data = await s3Handler.send(new GetObjectCommand(params));
      // Convert the readable stream to a string
      const fileContent = await new Promise((resolve, reject) => {
        let content = "";
        data.Body.on("data", (chunk) => (content += chunk.toString()));
        data.Body.on("error", reject);
        data.Body.on("end", () => resolve(content));
      });
      return fileContent;
    } catch (err) {
      console.error(`Error getting file ${finalPath}:`, err);
      throw err;
    }
  }

  async createZipFromDirectory(directoryPath) {
    const prefix = `${WEBSITES_PATH}/${directoryPath}/`;
    console.log(`Attempting to create zip from S3 prefix: ${prefix}`);
    console.log(`WEBSITES_PATH: ${WEBSITES_PATH}`);
    console.log(`Full S3 prefix: ${prefix}`);
    console.log(`Bucket name: ${bucketName}`);

    const params = {
      Bucket: bucketName,
      Prefix: prefix,
    };

    try {
      console.log(
        `Listing objects in bucket: ${bucketName} with prefix: ${prefix}`
      );
      const data = await s3Handler.send(new ListObjectsV2Command(params));

      console.log(
        `ListObjectsV2Command response:`,
        JSON.stringify(data, null, 2)
      );

      if (!data.Contents || data.Contents.length === 0) {
        console.log(`No files found in the specified directory: ${prefix}`);
        throw new Error("No files found in the specified directory");
      }

      console.log(`Found ${data.Contents.length} objects in the directory`);

      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      const streamPassThrough = new (require("stream").PassThrough)();
      archive.pipe(streamPassThrough);

      for (const item of data.Contents) {
        console.log(`Processing file: ${item.Key}`);
        const fileParams = {
          Bucket: bucketName,
          Key: item.Key,
        };
        try {
          const { Body } = await s3Handler.send(
            new GetObjectCommand(fileParams)
          );

          if (Body) {
            const fileName = item.Key.replace(prefix, "");
            console.log(`Adding file to archive: ${fileName}`);
            archive.append(Body, { name: fileName });
          } else {
            console.log(`Empty body for file: ${item.Key}`);
          }
        } catch (fileError) {
          console.error(`Error processing file ${item.Key}:`, fileError);
          // Continue with the next file instead of stopping the whole process
        }
      }

      console.log("Finalizing archive");
      await archive.finalize();

      return streamPassThrough;
    } catch (err) {
      console.error(`Error creating zip from '${directoryPath}':`, err);
      if (err.$metadata) {
        console.error(
          `Error metadata:`,
          JSON.stringify(err.$metadata, null, 2)
        );
      }
      throw err;
    }
  }

  async getProjectDirectoryStructure(projectPath) {
    const prefix = `${WEBSITES_PATH}/${projectPath}`;
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: "/",
    };

    console.log(`Fetching directory structure for: ${params.Prefix}`);

    try {
      const data = await s3Handler.send(new ListObjectsV2Command(params));
      console.log(
        `ListObjectsV2Command response:`,
        JSON.stringify(data, null, 2)
      );

      const structure = [];

      for (const prefix of data.CommonPrefixes || []) {
        const dirName = prefix.Prefix.split("/").pop();
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
        if (fileName && content.Key !== prefix) {
          const filePath = content.Key.replace(`${WEBSITES_PATH}/`, "");
          structure.push({
            name: fileName,
            type: "file",
            path: filePath,
            lastModified: content.LastModified,
          });
        }
      }

      return structure;
    } catch (err) {
      console.error(
        `Error getting directory structure for '${projectPath}':`,
        err
      );
      if (err.$metadata) {
        console.error(
          `Error metadata:`,
          JSON.stringify(err.$metadata, null, 2)
        );
      }
      throw err;
    }
  }

  async getFileStream(filePath) {
    const fullPath = `${WEBSITES_PATH}/${filePath}`;
    const params = {
      Bucket: bucketName,
      Key: fullPath,
    };

    try {
      // Check if the file exists before attempting to stream it
      await s3Handler.send(new GetObjectCommand(params));

      const { Body, ContentType } = await s3Handler.send(
        new GetObjectCommand(params)
      );

      if (!Body) {
        throw new Error("S3 returned empty body");
      }

      // Convert the readable stream to a Node.js stream
      const stream = Body.transformToWebStream().getReader();
      const nodeStream = new Readable({
        async read() {
          try {
            const { done, value } = await stream.read();
            if (done) {
              this.push(null);
            } else {
              this.push(Buffer.from(value));
            }
          } catch (error) {
            this.destroy(error);
          }
        },
      });

      return {
        stream: nodeStream,
        contentType: ContentType || "application/octet-stream", // Fallback content type
      };
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        console.error(`File not found: ${fullPath}`);
        throw new Error(`File not found: ${filePath}`);
      } else {
        console.error(`Error fetching stream for ${fullPath}:`, error);
        throw new Error(`Error fetching file: ${filePath}`);
      }
    }
  }

  getPublicUrl(filePath) {
    if (externalS3Endpoint) {
      // External S3 case
      const finalPath = `${externalS3Endpoint}/${bucketName}/${WEBSITES_PATH}/${filePath}`;
      console.log(`Public URL: ${finalPath}`);
      return finalPath;
    } else {
      // Standard S3 case
      return `https://${bucketName}.s3.amazonaws.com/${WEBSITES_PATH}/${filePath}`;
    }
  }
}

module.exports = S3StorageStrategy;
