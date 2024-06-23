const fs = require("fs").promises;
const path = require("path");

async function saveFile(filePath, content) {
  const generatedPath = `${filePath}`;
  try {
    await fs.mkdir(path.dirname(generatedPath), { recursive: true });
    await fs.writeFile(generatedPath, content, "utf8");
    console.log(`File saved: ${generatedPath}`);
  } catch (error) {
    console.error(`Error saving file ${generatedPath}:`, error);
    throw error;
  }
}

module.exports = {
  saveFile,
};
