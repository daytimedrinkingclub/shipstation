const { TOOLS } = require("../config/tools");
const searchService = require("../services/searchService");

async function handleCodeRefinementToolUse({ tool, client }) {
  if (tool.name === TOOLS.SEARCH) {
    console.log("Using search_tool");
    const searchQuery = tool.input.query;

    const searchResults = await searchService.performSearch(searchQuery);

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: JSON.stringify(searchResults, null, 2),
          },
        ],
      },
    ];
  }

  if (tool.name === TOOLS.PLACEHOLDER_IMAGE) {
    console.log("Using placeholder_image_tool");
    const searchQuery = tool.input.placeholder_image_requirements;

    const imageResults = await searchService.performSearch(searchQuery);

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text:
              imageResults.length === 0
                ? "No relevant placeholder images found"
                : JSON.stringify(imageResults, null, 2),
          },
        ],
      },
    ];
  }

  // Handle other code refinement-specific tools here if needed

  console.log(`No matching tool found for: ${tool.name}`);
  return [];
}

module.exports = {
  handleCodeRefinementToolUse,
};
