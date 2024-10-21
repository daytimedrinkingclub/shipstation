const { TOOLS } = require("../config/tools");
const searchService = require("../services/searchService");
const {
  getRandomHeadshots,
} = require("../services/images-services/headshotImageService");

async function handleCodeToolUse({ tool, client }) {
  if (tool.name === TOOLS.PLACEHOLDER_IMAGE) {
    const searchQuery = tool.input.placeholder_image_requirements;
    console.log("using placeholder_image_tool: ", searchQuery);

    const imageResults = await searchService.performSearch(
      (imageQuery = searchQuery)
    );

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
  } else if (tool.name === TOOLS.HEADSHOT) {
    const { profession, gender, count } = tool.input;
    console.log("using headshot_tool: ", profession, gender, count);

    const headshotUrls = getRandomHeadshots(profession, gender, count);

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: JSON.stringify(headshotUrls, null, 2),
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
