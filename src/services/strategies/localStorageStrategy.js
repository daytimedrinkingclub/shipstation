const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const archiver = require("archiver");
const { Readable } = require("stream");
const mime = require("mime-types");
require("dotenv").config();

const WEBSITES_PATH = process.env.WEBSITES_PATH || "websites";

class LocalStorageStrategy {
  async saveFile(filePath, content) {
    try {
      const fullPath = path.join(WEBSITES_PATH, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
      console.log(`File successfully written locally: ${filePath}`);
    } catch (err) {
      console.error(`Error writing file ${filePath}:`, err);
      throw err;
    }
  }

  async saveDirectory(directoryPath, remotePath) {
    try {
      const fullPath = path.join(
        WEBSITES_PATH,
        remotePath || "",
        directoryPath
      );
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`Directory created: ${fullPath}`);
    } catch (err) {
      console.error(`Error creating directory ${directoryPath}:`, err);
      throw err;
    }
  }

  async listFolders(prefix, sortBy = "modifiedAt", sortOrder = "desc") {
    try {
      const fullPath = path.join(WEBSITES_PATH, prefix);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const folderEntries = entries.filter((entry) => entry.isDirectory());

      const folders = await Promise.all(
        folderEntries.map(async (entry) => ({
          name: entry.name,
          modifiedAt: (await fs.stat(path.join(fullPath, entry.name))).mtime,
        }))
      );

      folders.sort((a, b) => {
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

      return folders.map((folder) => folder.name);
    } catch (err) {
      console.error(`Error listing folders in '${prefix}':`, err);
      return [];
    }
  }

  async getFile(filePath) {
    try {
      const fullPath = path.join(WEBSITES_PATH, filePath);
      return await fs.readFile(fullPath, "utf-8");
    } catch (err) {
      console.error(`Error reading file ${filePath}:`, err);
      throw err;
    }
  }

  async createZipFromDirectory(directoryPath) {
    return new Promise((resolve, reject) => {
      const fullPath = path.join(WEBSITES_PATH, directoryPath);
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      const streamPassThrough = new (require("stream").PassThrough)();
      archive.pipe(streamPassThrough);

      archive.directory(fullPath, false);

      archive.finalize();

      archive.on("error", (err) => reject(err));
      archive.on("end", () => resolve(streamPassThrough));
    });
  }

  async getProjectDirectoryStructure(projectPath) {
    const getStructure = async (currentPath) => {
      const fullPath = path.join(WEBSITES_PATH, currentPath);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const structure = [];

      for (const entry of entries) {
        const entryFullPath = path.join(fullPath, entry.name);
        const relativePath = path.relative(WEBSITES_PATH, entryFullPath);

        if (entry.isDirectory()) {
          structure.push({
            name: entry.name,
            type: "directory",
            path: relativePath,
            children: await getStructure(relativePath),
          });
        } else {
          const stats = await fs.stat(entryFullPath);
          structure.push({
            name: entry.name,
            type: "file",
            path: relativePath,
            lastModified: stats.mtime,
          });
        }
      }

      return structure;
    };

    try {
      const structure = await getStructure(projectPath);
      if (structure.length === 1 && structure[0].type === "directory") {
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
    const fullPath = path.join(WEBSITES_PATH, filePath);
    try {
      await fs.access(fullPath, fs.constants.F_OK);
      const stream = fsSync.createReadStream(fullPath);
      const contentType = mime.lookup(fullPath) || "application/octet-stream";
      return { stream, contentType, exists: true };
    } catch (error) {
      if (error.code === "ENOENT") {
        return { exists: false, message: `File not created yet: ${filePath}` };
      } else {
        console.error(`Error accessing ${filePath}:`, error);
        return {
          exists: false,
          message: `Error accessing file: ${filePath}`,
          error,
        };
      }
    }
  }
}

module.exports = LocalStorageStrategy;
