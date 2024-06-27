const searchService = require("../services/aiSearchService");
const fileService = require("../services/fileService");
const ctoService = require("../services/ctoService");

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
  } else if (tool.name === "product_manager_tool") {
    const {
      project_name,
      project_description,
      project_goal,
      project_branding_style,
    } = tool.input;
    await fileService.saveFile(
      `readme.md`, // change here
      `Project name : ${project_name}
      Project description : ${project_description}
      Project goal : ${project_goal}
      Project branding style : ${project_branding_style}`
    );
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `PRD file created successfully at readme.md`,
          },
        ],
      },
    ];
  } else if (tool.name === "cto_tool") {
    const { prd_file_path } = tool.input;
    const fileContent = await fileService.readFile(prd_file_path);
    const content = await ctoService.ctoService(fileContent);

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: content }],
      },
    ];
  }

  return [];
}

module.exports = {
  handleToolUse,
};
