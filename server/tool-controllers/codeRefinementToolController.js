const { TOOLS } = require("../config/tools");
const {
  getRandomHeadshots,
} = require("../services/images-services/headshotImageService");
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

  console.log(`No matching tool found for: ${tool.name}`);
  return [];
}

module.exports = {
  handleCodeRefinementToolUse,
};
