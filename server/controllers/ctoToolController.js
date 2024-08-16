const axios = require("axios");

const fileService = require("../services/fileService");
const { codeAssitant } = require("../services/codeService");

const searchService = require("../services/searchService");
const { analyzeImages } = require("../services/analyzeImageService");
const { TOOLS } = require("../config/tools");

async function handleCTOToolUse({
  tool,
  projectFolderName,
  sendEvent,
  client,
}) {
  if (tool.name === TOOLS.SEARCH) {
    const searchQuery = tool.input.query;

    const searchResults = await searchService.performSearch(searchQuery);

    // Extract images from search results and remove trailing slashes
    const images = (searchResults.images || []).map((url) =>
      url.replace(/\/$/, "")
    );

    let messageContent = [
      {
        type: "text",
        text: `Here are relevant images found for the query "${searchQuery}". These images may be useful for designing and creating components for the website:`,
      },
    ];

    if (images.length > 0) {
      // Add images to the message content
      for (const imageUrl of images) {
        try {
          // Fetch the image
          const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
          });

          // Get the Content-Type from the response headers
          const contentType = response.headers["content-type"];

          // Only process if it's an image
          // Only process if it's an accepted image type
          if (
            contentType &&
            ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
              contentType
            )
          ) {
            const imageData = Buffer.from(response.data).toString("base64");

            messageContent.push({
              type: "image",
              source: {
                type: "base64",
                media_type: contentType,
                data: imageData,
              },
            });
          } else {
            console.error(
              `Unsupported media type ${contentType} for image ${imageUrl}`
            );
          }
        } catch (error) {
          console.error(`Error processing image ${imageUrl}:`, error);
        }
      }
    }

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: messageContent,
      },
    ];
  } else if (tool.name === TOOLS.IMAGE_FINDER) {
    const searchQuery = tool.input.query;

    const imageResults = await searchService.imageSearch(searchQuery);

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text:
              imageResults.length === 0
                ? "No relevant images found"
                : JSON.stringify(imageResults),
          },
        ],
      },
    ];
  } else if (tool.name === TOOLS.IMAGE_ANALYSIS) {
    const { image_urls, analysis_prompt } = tool.input;

    const analysisResults = await analyzeImages(image_urls, analysis_prompt);

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: analysisResults }],
      },
    ];
  } else if (tool.name === TOOLS.FILE_CREATOR) {
    const { file_name, file_comments } = tool.input;

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
      message: `Writing code for ${file_name}`,
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

// I need to add a functionality where we can find relevant images using TOOLS.IMAGE_FINDER to add them as placeholder images, this should be included in the prd file generation step, the image urls should be added to the prd file and then used in the code generation time for placeholders
