const fileService = require("../services/fileService");
const { codeAssitant } = require("../services/codeService");
const searchService = require("../services/aiSearchService");

async function handleToolUse(tool) {
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
    await fileService.saveFile(file_name, file_comments);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `File created successfully named ${file_name}. Please assign the file immediately using task_assigner_tool`,
          },
        ],
      },
    ];
  } else if (tool.name === "task_assigner_tool") {
    const { file_name, task_guidelines } = tool.input;
    const fileContent = await fileService.readFile(`${file_name}`);
    const updatedFileContent =
      `Filename: ${file_name}` +
      `\n\n` +
      task_guidelines +
      `\n\n` +
      fileContent;

    const resp = await codeAssitant(updatedFileContent, file_name);

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
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `Your project has been deployed on the link: https://shipstation.ai/${tool.input.directory}`,
          },
        ],
        exit: true,
      },
    ];
  }

  return [];
}

module.exports = {
  handleToolUse,
};
