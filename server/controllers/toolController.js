const fs = require("fs");
const aiService = require("../services/aiService");
const { saveFileToS3 } = require("../services/s3Service");

function toKebabCase(str) {
  return str.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

async function handleToolUse(tool) {
  if (tool.name === "code_writer_tool") {
    const { projectContext, files } = tool.input;
    let kebabCaseName = toKebabCase(projectContext.name);
    let folderIndex = 1;
    while (fs.existsSync(`websites/${kebabCaseName}`)) {
      kebabCaseName = `${toKebabCase(projectContext.name)}-${folderIndex}`;
      folderIndex++;
    }
    for (const file of files) {
      console.log(`Processing file with path: ${file}`);
      const content = await aiService.aiAssistance(
        { projectContext, files, fileToGenerate: file.path },
        "codeWriterPrompt"
      );

      await saveFileToS3(`websites/${kebabCaseName}/${file.path}`, content);
    }
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `Website deployed successfully, visit ${process.env.APP_BASE_URL}/${kebabCaseName}`,
          },
        ],
      },
    ];
  }
  return [];
}

module.exports = {
  handleToolUse,
};
