const S3StorageStrategy = require("./strategies/s3StorageStrategy");
const LocalStorageStrategy = require("./strategies/localStorageStrategy");

class FileService {
  constructor() {
    this.strategy =
      process.env.USE_S3_STORAGE === "true"
        ? new S3StorageStrategy()
        : new LocalStorageStrategy();
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
}

module.exports = FileService;
