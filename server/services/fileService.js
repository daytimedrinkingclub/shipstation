const fs = require("fs").promises;
const path = require("path");

async function saveFile(filePath, content) {
  const websitesPath = process.env.WEBSITES_PATH;
  const generatedPath = `${websitesPath}/${filePath}`;
  try {
    await fs.mkdir(path.dirname(generatedPath), { recursive: true });
    await fs.writeFile(generatedPath, content, "utf8");
    console.log(`File saved: ${generatedPath}`);
  } catch (error) {
    console.error(`Error saving file ${generatedPath}:`, error);
    throw error;
  }
}

async function readFile(filePath) {
  const websitesPath = process.env.WEBSITES_PATH;
  const generatedPath = `${websitesPath}/${filePath}`;
  try {
    const data = await fs.readFile(generatedPath, "utf8");
    console.log(`File read successfully: ${generatedPath}`);
    return data;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

module.exports = {
  readFile,
  saveFile,
};
