const { TOOLS } = require("../config/tools");
const searchService = require("../services/searchService");

async function handleSiteContentToolUse({ tool, client }) {
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

  console.log(`No matching tool found for: ${tool.name}`);
  return [];
}

module.exports = {
  handleSiteContentToolUse,
};
