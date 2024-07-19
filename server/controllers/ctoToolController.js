const fileService = require("../services/fileService");
const { codeAssitant } = require("../services/codeService");
const searchService = require("../services/searchService");
const { TOOLS } = require("../config/tools");

async function handleCTOToolUse({
  tool,
  projectFolderName,
  sendEvent,
  client,
}) {
  if (tool.name === TOOLS.SEARCH) {
    const searchQuery = tool.input.query;
    console.log("Performing search with query:", searchQuery);
    const searchResults = await searchService.performSearch(searchQuery);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: JSON.stringify(searchResults) }],
      },
    ];
  } 
  else if (tool.name === TOOLS.IMAGE_FINDER) {
    const searchQuery = tool.input.query;
    console.log("Performing image search with query:", searchQuery);
    const imageResults = await searchService.imageSearch(searchQuery);
    console.log("imageResults:", imageResults);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: imageResults.length === 0 ? "No relevant images found" : JSON.stringify(imageResults)
          }
        ],
      },
    ];
  }
  else if (tool.name === TOOLS.FILE_CREATOR) {
    const { file_name, file_comments } = tool.input;
    console.log("projectFolderName:", projectFolderName);
    console.log("file_name:", file_name);
    console.log("file_comments:", file_comments);
    await fileService.saveFile(
      `${projectFolderName}/${file_name}`,
      file_comments
    );
    sendEvent("progress", {
      message: `Creating file ${file_name}`,
    });
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `File created successfully at ${projectFolderName}/${file_name}. Please assign the file immediately using task_assigner_tool`,
          },
        ],
      },
    ];
  } else if (tool.name === TOOLS.TASK_ASSIGNER) {
    const { file_name, task_guidelines } = tool.input;
    console.log("projectFolderName: in task_assigner_tool", projectFolderName);
    console.log("file_name: in task_assigner_tool", file_name);
    console.log("task_guidelines: in task_assigner_tool", task_guidelines);
    const fileContent = await fileService.readFile(
      `${projectFolderName}/${file_name}`
    );
    console.log("reading file: ", `${projectFolderName}/${file_name}`);
    const updatedFileContent =
      `Filename: ${projectFolderName}/${file_name}` +
      `\n\n` +
      "Guidelines: " +
      task_guidelines +
      `\n\n` +
      fileContent;

    sendEvent("progress", {
      message: `Generating code for ${file_name} 🔄`,
    });
    const resp = await codeAssitant({
      query: updatedFileContent,
      filePath: `${projectFolderName}/${file_name}`,
      client,
    });
    sendEvent("progress", {
      message: `Code generated for ${file_name} ✅`,
    });
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `${resp.description}`,
          },
        ],
      },
    ];
  } else if (tool.name === TOOLS.DEPLOY_PROJECT) {
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `Your project has been deployed on the link: https://shipstation.ai/${projectFolderName}`,
          },
        ],
      },
    ];
  }

  return [];
}

module.exports = {
  handleCTOToolUse,
};
