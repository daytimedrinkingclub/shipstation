const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

const WEBSITES_DIR = process.env.WEBSITES_PATH

module.exports = {
  async listWebsites() {
    try {
      const websites = await fs.readdir(WEBSITES_DIR);
      return { local: websites.filter(site => !site.startsWith('.')) };
    } catch (error) {
      console.error('Error listing websites:', error);
      return { local: [] };
    }
  },

  async getProjectDirectoryStructure(slug) {
    const basePath = path.join(WEBSITES_DIR, slug);
    
    const getStructure = async (currentPath) => {
      const items = await fs.readdir(currentPath);
      const structure = [];

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          structure.push({
            name: item,
            type: 'directory',
            children: await getStructure(fullPath)
          });
        } else {
          structure.push({
            name: item,
            type: 'file',
            size: stats.size
          });
        }
      }

      return structure;
    };

    try {
      return await getStructure(basePath);
    } catch (error) {
      console.error(`Error getting project structure for ${slug}:`, error);
      return [];
    }
  },

  async saveFile(filePath, content) {
    const fullPath = path.join(WEBSITES_DIR, filePath);
    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    } catch (error) {
      console.error(`Error saving file ${filePath}:`, error);
      throw error;
    }
  },

  async getFileContent(filePath) {
    const fullPath = path.join(WEBSITES_DIR, filePath);
    try {
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  },

  async fileExists(filePath) {
    const fullPath = path.join(WEBSITES_DIR, filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  },

  async createZipFromDirectory(slug) {
    const folderPath = path.join(WEBSITES_DIR, slug);
    const output = require('stream').PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.pipe(output);

    const addDirToArchive = async (dirPath, archivePath = '') => {
      const items = await fs.readdir(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = await fs.stat(fullPath);
        const itemArchivePath = path.join(archivePath, item);

        if (stats.isDirectory()) {
          archive.directory(fullPath, itemArchivePath);
        } else {
          const fileContent = await fs.readFile(fullPath);
          archive.append(fileContent, { name: itemArchivePath });
        }
      }
    };

    try {
      await addDirToArchive(folderPath);
      await archive.finalize();
      return output;
    } catch (error) {
      console.error(`Error creating zip for ${slug}:`, error);
      throw error;
    }
  },

  async getFileMetadata(filePath) {
    const fullPath = path.join(WEBSITES_DIR, filePath);
    try {
      const stats = await fs.stat(fullPath);
      return {
        ContentType: getMimeType(path.extname(filePath)),
        ContentLength: stats.size,
        LastModified: stats.mtime
      };
    } catch (error) {
      console.error(`Error getting metadata for ${filePath}:`, error);
      throw error;
    }
  },
};

function getMimeType(extension) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}