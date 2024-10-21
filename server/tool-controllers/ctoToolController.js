const axios = require("axios");

const { codeAssistant } = require("../services/codeService");

const searchService = require("../services/searchService");
const { analyzeImages } = require("../services/analyzeImageService");
const { TOOLS } = require("../config/tools");

const FileService = require("../services/fileService");
const fileService = new FileService();

async function handleCTOToolUse({
  tool,
  projectFolderName,
  sendEvent,
  client,
  shipType,
  name,
  portfolioType,
  designChoice,
  selectedDesign,
  customDesignPrompt,
  images,
  assets,
}) {
  if (tool.name === TOOLS.SEARCH) {
    const searchQuery = tool.input.query;

    const searchResults = await searchService.performSearch(searchQuery);

    // Extract images from search results and remove trailing slashes
    const images = (searchResults.images || [])
      .filter((image) => image && image.url && typeof image.url === "string")
      .map((image) => ({
        url: image.url.replace(/\/$/, ""),
        description: image.description || "No description available",
      }));

    let messageContent = [
      {
        type: "text",
        text: `Here are relevant images found for the query "${searchQuery}". These images may be useful for designing and creating components for the website:`,
      },
    ];

    if (images.length > 0) {
      for (const image of images) {
        try {
          const response = await axios.get(image.url, {
            responseType: "arraybuffer",
            timeout: 5000,
          });

          const contentType = response.headers["content-type"];
          const acceptedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
          ];

          if (contentType && acceptedTypes.includes(contentType)) {
            const imageData = Buffer.from(response.data);

            // Additional check for image validity
            if (imageData.length > 0) {
              const base64Data = imageData.toString("base64");

              // Verify the base64 data
              if (base64Data && base64Data.length > 0) {
                messageContent.push({
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: contentType,
                    data: base64Data,
                  },
                });
              } else {
                console.error(`Invalid base64 data for ${image.url}`);
              }
            } else {
              console.error(`Empty image data for ${image.url}`);
            }
          } else {
            console.error(
              `Unsupported media type ${contentType} for image ${image.url}`
            );
          }
        } catch (error) {
          console.error(`Error processing image ${image.url}:`, error.message);
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

    const imageResults = await searchService.performSearch(searchQuery);

    const formattedImageResults = imageResults.images
      ? imageResults.images.map((image) => ({
          url: image.url.replace(/\/$/, ""),
          description: image.description || "No description available",
        }))
      : [];

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text:
              formattedImageResults.length === 0
                ? "No relevant images found"
                : JSON.stringify(formattedImageResults, null, 2),
          },
        ],
      },
    ];
  } else if (tool.name === TOOLS.PLACEHOLDER_IMAGE) {
    console.log("using placeholder image tool");
    const searchQuery = tool.input.placeholder_image_requirements;

    const imageResults = await searchService.performSearch(searchQuery);

    const formattedImageResults = imageResults.images
      ? imageResults.images.map((image) => ({
          url: image.url.replace(/\/$/, ""),
          description: image.description || "No description available",
        }))
      : [];

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text:
              formattedImageResults.length === 0
                ? "No relevant placeholder images found"
                : JSON.stringify(formattedImageResults, null, 2),
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

    const fileContent = await fileService.getFile(
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
    const resp = await codeAssistant({
      query: updatedFileContent,
      filePath: `${projectFolderName}/${file_name}`,
      client,
      shipType,
      name,
      portfolioType,
      designChoice,
      selectedDesign,
      customDesignPrompt,
      images,
      assets,
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
            text: `${resp.status} + ${resp.description}`,
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
