const { createClient } = require("@supabase/supabase-js");
const archiver = require("archiver");
const { Readable } = require("stream");
const mime = require("mime-types");
const path = require("path");
require("dotenv").config();

const { updateShipAssets } = require("../dbService");

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

  async listFolders(prefix, sortBy = "created_at", sortOrder = "desc") {
    try {
      console.log(
        `listFolders called with prefix: "${prefix}", sortBy: ${sortBy}, sortOrder: ${sortOrder}`
      );

      const fullPrefix = this._getFullPath(prefix);
      console.log(`Full prefix: ${fullPrefix}`);

      const options = {
        limit: 1000,
        offset: 0,
      };

      // Only add sortBy if it's a valid option
      if (["name", "created_at", "updated_at"].includes(sortBy)) {
        options.sortBy = { column: sortBy, order: sortOrder };
      } else {
        console.warn(
          `Invalid sortBy value: ${sortBy}. Falling back to default sorting.`
        );
      }

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(fullPrefix, options);

      if (error) throw error;

      // Extract only the names from the data
      const folders = data.map((item) => item.name);

      // Return the data in the expected format
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
        await this.addToArchive(archive, fullPath, "");

        archive.finalize();
      } catch (err) {
        reject(err);
      }

      archive.on("error", (err) => reject(err));
      archive.on("end", () => resolve(streamPassThrough));
    });
  }

  async addToArchive(archive, fullPath, relativePath) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(fullPath, {
          limit: 1000,
          offset: 0,
        });

      if (error) {
        console.warn(`Error listing ${fullPath}: ${error.message}`);
        return;
      }

      for (const item of data) {
        const itemFullPath = `${fullPath}/${item.name}`;
        const itemRelativePath = path
          .join(relativePath, item.name)
          .replace(/\\/g, "/");

        if (
          item.metadata &&
          item.metadata.mimetype === "application/x-directory"
        ) {
          // It's a directory, recurse into it
          await this.addToArchive(archive, itemFullPath, itemRelativePath);
        } else {
          // It's a file, try to add it to the archive
          try {
            const { data: fileData, error: fileError } = await supabase.storage
              .from(BUCKET_NAME)
              .download(itemFullPath);

            if (fileError) {
              console.warn(`Skipping file ${item.name}: ${fileError.message}`);
              continue;
            }

            const buffer = Buffer.from(await fileData.arrayBuffer());
            archive.append(buffer, { name: itemRelativePath });
          } catch (fileErr) {
            console.warn(
              `Error processing file ${item.name}: ${fileErr.message}`
            );
          }
        }
      }
    } catch (err) {
      console.error(`Error processing directory ${fullPath}: ${err.message}`);
    }
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

  async uploadAssets(shipId, assets) {
    try {
      const uploadedAssets = [];
      for (const asset of assets) {
        const fileName = `${Date.now()}-${asset.file.originalname}`;
        const fullPath = this._getFullPath(`${shipId}/assets/${fileName}`);

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fullPath, asset.file.buffer, {
            contentType: asset.file.mimetype,
            upsert: true,
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fullPath);

        uploadedAssets.push({
          url: publicUrlData.publicUrl,
          comment: asset.comment,
          fileName: asset.file.originalname,
        });
      }

      // Update the ships table with the new assets
      await updateShipAssets(shipId, uploadedAssets);

      return uploadedAssets;
    } catch (err) {
      console.error(`Error uploading assets for ship ${shipId}:`, err);
      throw err;
    }
  }

  async uploadTemporaryAssets(assets) {
    try {
      const uploadedAssets = [];
      for (const asset of assets) {
        const fileName = `${Date.now()}-${asset.file.originalname}`;
        const fullPath = `temporary-assets/${fileName}`;

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fullPath, asset.file.buffer, {
            contentType: asset.file.mimetype,
            upsert: true,
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fullPath);

        uploadedAssets.push({
          url: publicUrlData.publicUrl,
          comment: asset.comment,
          fileName: asset.file.originalname,
        });
      }

      return uploadedAssets;
    } catch (err) {
      console.error("Error uploading temporary assets:", err);
      throw err;
    }
  }

  async moveFiles(oldSlug, newSlug) {
    try {
      const oldPath = this._getFullPath(oldSlug);
      const newPath = this._getFullPath(newSlug);

      console.log("oldPath", oldPath);
      console.log("newPath", newPath);

      await this.copyFolder(oldPath, newPath);

      // After successful copy, delete the old folder
      await this.deleteFolder(oldPath);

      console.log(`Successfully moved files and folders from ${oldSlug} to ${newSlug}`);
    } catch (err) {
      console.error(`Error moving files and folders from ${oldSlug} to ${newSlug}:`, err);
      throw err;
    }
  }

  async copyFolder(sourcePath, destPath) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(sourcePath, { sortBy: { column: "name", order: "asc" } });

    if (error) throw error;

    for (const item of data) {
      const sourceItemPath = `${sourcePath}/${item.name}`;
      const destItemPath = `${destPath}/${item.name}`;

      if (item.id === null && item.metadata === null) {
        // This is a folder, recurse
        await this.copyFolder(sourceItemPath, destItemPath);
      } else {
        // This is a file, copy it
        await this.copyFile(sourceItemPath, destItemPath);
      }
    }
  }

  async copyFile(sourcePath, destPath) {
    const { data, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(sourcePath);

    if (downloadError) throw downloadError;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(destPath, data, {
        contentType: mime.lookup(sourcePath) || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) throw uploadError;
  }

  async deleteFolder(folderPath) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath, { sortBy: { column: "name", order: "asc" } });

    if (error) throw error;

    for (const item of data) {
      const itemPath = `${folderPath}/${item.name}`;
      if (item.id === null && item.metadata === null) {
        // This is a folder, recurse
        await this.deleteFolder(itemPath);
      } else {
        // This is a file, delete it
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([itemPath]);
        if (deleteError) throw deleteError;
      }
    }

    // After deleting all contents, delete the folder itself
    const { error: deleteFolderError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([folderPath]);
    if (deleteFolderError) throw deleteFolderError;
  }

  getPublicUrl(filePath) {
    const fullPath = this._getFullPath(filePath);
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fullPath);
    return data.publicUrl;
  }
}

module.exports = SupabaseStorageStrategy;
