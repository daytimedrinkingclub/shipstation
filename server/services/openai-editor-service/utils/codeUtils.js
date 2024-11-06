const FileService = require("../../fileService");
const fileService = new FileService();

function extractUpdatedContent(responseText) {
  console.log(
    `Processing AI response. Response length: ${responseText.length} characters`
  );

  const explanationMatch = responseText.match(
    /<explanation>([\s\S]*?)<\/explanation>/
  );
  const codeMatch = responseText.match(
    /<updated_code>([\s\S]*?)<\/updated_code>/
  );

  if (!explanationMatch || !codeMatch) {
    console.error("Unexpected response format from AI");
    throw new Error("Invalid response format from AI");
  }

  return {
    updatedMessage: explanationMatch[1].trim(),
    updatedCode: codeMatch[1].trim(),
  };
}

async function saveUpdatedCode(filePath, updatedCode) {
  if (updatedCode) {
    console.log(`Saving updated code to ${filePath}`);
    await fileService.saveFile(filePath, updatedCode);
    console.log(`Updated code saved successfully`);
  } else {
    console.log(`No code updates to save`);
  }
}

module.exports = {
  extractUpdatedContent,
  saveUpdatedCode,
};
