const { createClient } = require("@supabase/supabase-js");
const archiver = require("archiver");
const { Readable } = require("stream");
const mime = require("mime-types");
const path = require("path");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const BUCKET_NAME = process.env.BUCKET_NAME || "shipstation-websites";
const WEBSITES_PATH = process.env.WEBSITES_PATH || "websites";

class SupabaseStorageStrategy {
  _getFullPath(filePath) {
    return path.join(WEBSITES_PATH, filePath).replace(/\\/g, "/");
  }

  async saveFile(filePath, content) {
    try {
      const fullPath = this._getFullPath(filePath);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fullPath, content, {
          contentType: mime.lookup(filePath) || "application/octet-stream",
          upsert: true,
        });

      if (error) throw error;
      console.log(`File successfully uploaded to Supabase: ${fullPath}`);
    } catch (err) {
      console.error(`Error uploading file ${filePath}:`, err);
      throw err;
    }
  }

  async saveDirectory(directoryPath, remotePath) {
    try {
      const fullPath = this._getFullPath(
        path.join(remotePath || "", directoryPath, ".directory")
      );
      await this.saveFile(fullPath, "");
      console.log(`Directory marker created: ${fullPath}`);
    } catch (err) {
      console.error(`Error creating directory marker ${directoryPath}:`, err);
      throw err;
    }
  }

  async listFolders(prefix, sortBy = "name", sortOrder = "asc") {
    try {
      const fullPrefix = this._getFullPath(prefix);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(fullPrefix, {
          limit: 1000,
          offset: 0,
          sortBy: { column: sortBy, order: sortOrder },
        });

      if (error) throw error;

      const folders = data
        .filter(
          (item) =>
            item.metadata &&
            item.metadata.mimetype === "application/x-directory"
        )
        .map((item) => item.name);

      return folders;
    } catch (err) {
      console.error(`Error listing folders in '${prefix}':`, err);
      return [];
    }
  }

  async getFile(filePath) {
    try {
      const fullPath = this._getFullPath(filePath);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(fullPath);

      if (error) throw error;

      return await data.text();
    } catch (err) {
      console.error(`Error reading file ${filePath}:`, err);
      throw err;
    }
  }

  async createZipFromDirectory(directoryPath) {
    return new Promise(async (resolve, reject) => {
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      const streamPassThrough = new (require("stream").PassThrough)();
      archive.pipe(streamPassThrough);

      try {
        const fullPath = this._getFullPath(directoryPath);
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list(fullPath, {
            limit: 1000,
            offset: 0,
          });

        if (error) throw error;

        for (const item of data) {
          try {
            const { data: fileData, error: fileError } = await supabase.storage
              .from(BUCKET_NAME)
              .download(`${fullPath}/${item.name}`);

            if (fileError) throw fileError;

            // Convert Blob to Buffer
            const buffer = Buffer.from(await fileData.arrayBuffer());
            archive.append(buffer, { name: item.name });
          } catch (fileErr) {
            console.warn(`Skipping file ${item.name}: ${fileErr.message}`);
            // Continue with the next file instead of throwing an error
          }
        }

        archive.finalize();
      } catch (err) {
        reject(err);
      }

      archive.on("error", (err) => reject(err));
      archive.on("end", () => resolve(streamPassThrough));
    });
  }

  async getProjectDirectoryStructure(projectPath) {
    const getStructure = async (currentPath) => {
      const fullPath = this._getFullPath(currentPath);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(fullPath, {
          limit: 1000,
          offset: 0,
        });

      if (error) throw error;

      const structure = [];

      for (const item of data) {
        const itemPath = path.join(currentPath, item.name).replace(/\\/g, "/");
        if (
          item.metadata &&
          item.metadata.mimetype === "application/x-directory"
        ) {
          structure.push({
            name: item.name,
            type: "directory",
            path: itemPath,
            children: await getStructure(itemPath),
          });
        } else {
          structure.push({
            name: item.name,
            type: "file",
            path: itemPath,
            lastModified: item.metadata.lastModified
              ? new Date(item.metadata.lastModified)
              : null,
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
    try {
      const fullPath = this._getFullPath(filePath);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(fullPath);

      if (error) throw error;

      // Convert Blob to Buffer
      const buffer = Buffer.from(await data.arrayBuffer());
      const stream = Readable.from(buffer);
      const contentType = mime.lookup(filePath) || "application/octet-stream";
      return { stream, contentType, exists: true };
    } catch (error) {
      console.error(`Error accessing ${filePath}:`, error);
      return {
        exists: false,
        message: `Error accessing file: ${filePath}`,
        error,
      };
    }
  }

  async deleteFile(filePath) {
    try {
      const fullPath = this._getFullPath(filePath);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fullPath]);

      if (error) throw error;
      console.log(`File successfully deleted from Supabase: ${fullPath}`);
      return true;
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
      throw err;
    }
  }
}

module.exports = SupabaseStorageStrategy;
