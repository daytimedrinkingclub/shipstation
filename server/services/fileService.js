const S3StorageStrategy = require("./strategies/s3StorageStrategy");
const LocalStorageStrategy = require("./strategies/localStorageStrategy");
const SupabaseStorageStrategy = require("./strategies/supabaseStorageStrategy");

class FileService {
  constructor() {
    this.strategy = this.selectStorageStrategy();
  }

  selectStorageStrategy() {
    switch (process.env.STORAGE_STRATEGY) {
      case "s3":
        return new S3StorageStrategy();
      case "supabase":
        return new SupabaseStorageStrategy();
      case "local":
      default:
        return new LocalStorageStrategy();
    }
  }

  async saveFile(filePath, content) {
    return this.strategy.saveFile(filePath, content);
  }

  async saveDirectory(directoryPath, remotePath) {
    return this.strategy.saveDirectory(directoryPath, remotePath);
  }

  async listFolders(prefix, sortBy = "modifiedAt", sortOrder = "desc") {
    return this.strategy.listFolders(prefix, sortBy, sortOrder);
  }

  async getFile(filePath) {
    return this.strategy.getFile(filePath);
  }

  async getFileStream(filePath) {
    return this.strategy.getFileStream(filePath);
  }

  async createZipFromDirectory(directoryPath) {
    return this.strategy.createZipFromDirectory(directoryPath);
  }

  async getProjectDirectoryStructure(projectPath) {
    return this.strategy.getProjectDirectoryStructure(projectPath);
  }

  async deleteFile(filePath) {
    return this.strategy.deleteFile(filePath);
  }

  async uploadAssets(shipId, assets) {
    return this.strategy.uploadAssets(shipId, assets);
  }
}

module.exports = FileService;
