const fileService = require("../services/fileService");
const { codeAssitant } = require("../services/codeService");
const searchService = require("../services/aiSearchService");

async function handleToolUse(tool, projectFolderName, sendEvent) {
  if (tool.name === "ai_research_assistant") {
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
  } else if (tool.name === "file_creator") {
    const { file_name, file_comments } = tool.input;
    console.log("projectFolderName: in file_creator", projectFolderName);
    console.log("file_name: in file_creator", file_name);
    console.log("file_comments: in file_creator", file_comments);
    await fileService.saveFile(
      `${projectFolderName}/${file_name}`,
      file_comments
    );
    sendEvent("progress", {
      message: `${file_name} created.`,
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
  } else if (tool.name === "task_assigner_tool") {
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
      message: `Generating code for ${file_name}`,
    });
    const resp = await codeAssitant(
      updatedFileContent,
      `${projectFolderName}/${file_name}`
    );
    sendEvent("progress", {
      message: `Code generated for ${file_name}`,
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
  } else if (tool.name === "deploy_project_tool") {
    sendEvent("websiteDeployed", {
      deployedUrl: `https://shipstation.ai/${projectFolderName}`,
    });
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
  handleToolUse,
};
