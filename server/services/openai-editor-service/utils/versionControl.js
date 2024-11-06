const FileService = require("../../fileService");
const dbService = require("../../dbService");
const fileService = new FileService();

const MAX_VERSIONS = 2;

async function saveNewVersion(shipId, shipSlug, currentCode) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const versionFilePath = `${shipSlug}/versions/${shipSlug}-${timestamp}.html`;

  await fileService.saveFile(versionFilePath, currentCode);
  const newVersion = await dbService.saveCodeVersion(shipId, versionFilePath);

  const allVersions = await dbService.getAllCodeVersions(shipId);

  if (allVersions.length > MAX_VERSIONS) {
    const versionsToDelete = allVersions.slice(
      0,
      allVersions.length - MAX_VERSIONS
    );
    for (const version of versionsToDelete) {
      await dbService.deleteCodeVersion(shipId, version.version);
      await fileService.deleteFile(version.file_path);
    }
  }

  return newVersion;
}

async function undoCodeChange(shipId, shipSlug) {
  const currentVersion = await dbService.getCurrentCodeVersion(shipId);
  const allVersions = await dbService.getAllCodeVersions(shipId);

  if (allVersions.length < 1) {
    return { success: false, message: "No previous version available" };
  }

  const previousVersion = allVersions
    .filter((v) => v.version < currentVersion)
    .sort((a, b) => b.version - a.version)[0];

  if (!previousVersion) {
    return { success: false, message: "No previous version available" };
  }

  const filePath = `${shipSlug}/index.html`;
  const previousCode = await fileService.getFile(previousVersion.file_path);
  await fileService.saveFile(filePath, previousCode);
  await dbService.updateCurrentCodeVersion(shipId, previousVersion.version);

  return {
    success: true,
    message: "Undo operation completed successfully",
    code: previousCode,
  };
}

async function redoCodeChange(shipId, shipSlug) {
  const currentVersion = await dbService.getCurrentCodeVersion(shipId);
  const allVersions = await dbService.getAllCodeVersions(shipId);

  if (currentVersion >= allVersions[allVersions.length - 1].version) {
    return { success: false, message: "No next version available" };
  }

  const nextVersion = allVersions
    .filter((v) => v.version > currentVersion)
    .sort((a, b) => a.version - b.version)[0];

  const filePath = `${shipSlug}/index.html`;
  const nextCode = await fileService.getFile(nextVersion.file_path);
  await fileService.saveFile(filePath, nextCode);
  await dbService.updateCurrentCodeVersion(shipId, nextVersion.version);

  return {
    success: true,
    message: "Redo operation completed successfully",
    code: nextCode,
  };
}

module.exports = {
  saveNewVersion,
  undoCodeChange,
  redoCodeChange,
};
