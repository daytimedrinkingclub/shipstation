const { TOOLS } = require("../config/tools");
const searchService = require("../services/searchService");
const {
  getRandomHeadshots,
} = require("../services/images-services/headshotImageService");
const PDFParserService = require("../services/pdfParserService");

const pdfParserService = new PDFParserService();

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
  } else if (tool.name === TOOLS.PDF_PARSER) {
    const { pdf_url } = tool.input;
    console.log("using pdf_parser_tool");

    try {
      const parsedText = await pdfParserService.parsePDF(pdf_url);
      return [
        {
          type: "tool_result",
          tool_use_id: tool.id,
          content: [
            {
              type: "text",
              text: parsedText,
            },
          ],
        },
      ];
    } catch (error) {
      console.error("Error parsing PDF:", error);
      return [
        {
          type: "tool_result",
          tool_use_id: tool.id,
          content: [
            {
              type: "text",
              text: "Error parsing PDF. Please check the URL and try again.",
            },
          ],
        },
      ];
    }
  }

  // Handle other code-specific tools here if needed

  return [];
}

module.exports = {
  handleCodeToolUse,
};
