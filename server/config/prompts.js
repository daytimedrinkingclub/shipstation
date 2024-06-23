const fs = require("fs");
const path = require("path");

const systemPrompt = fs.readFileSync(
  path.join(__dirname, "prompts", "systemPrompt.txt"),
  "utf8"
);
const codeWriterPrompt = fs.readFileSync(
  path.join(__dirname, "prompts", "codeWriterPrompt.txt"),
  "utf8"
);

function getPrompt(promptName) {
  switch (promptName) {
    case "systemPrompt":
      return systemPrompt;
    case "codeWriterPrompt":
      return codeWriterPrompt;
    default:
      throw new Error(`Unknown prompt name: ${promptName}`);
  }
}

module.exports = {
  systemPrompt,
  getPrompt,
};
