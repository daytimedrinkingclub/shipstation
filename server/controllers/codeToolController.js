const { TOOLS } = require("../config/tools");
const searchService = require("../services/searchService");

async function handleCodeToolUse({ tool, client }) {
  if (tool.name === TOOLS.PLACEHOLDER_IMAGE) {
    console.log("Using placeholder image tool");
    const searchQuery = tool.input.placeholder_image_requirements;

    const imageResults = await searchService.performSearch(
      (imageQuery = searchQuery)
    );

    console.log(imageResults);

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

  // Handle other code-specific tools here if needed

  return [];
}

module.exports = {
  handleCodeToolUse,
};
