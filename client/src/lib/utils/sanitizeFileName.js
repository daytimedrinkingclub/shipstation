export const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9-_\s.]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
};
