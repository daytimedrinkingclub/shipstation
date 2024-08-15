const axios = require("axios");
const mime = require("mime-types");

const fileService = require("../services/fileService");
const { codeAssitant } = require("../services/codeService");
const {
  analyzeAndRepairWebsite,
} = require("../services/analyzeAndRepairService");
const searchService = require("../services/searchService");
const { analyzeImage } = require("../services/analyzeImageService");
const { TOOLS } = require("../config/tools");

async function handleCTOToolUse({
  tool,
  projectFolderName,
  sendEvent,
  client,
}) {
  if (tool.name === TOOLS.SEARCH) {
    const searchQuery = tool.input.query;
    console.log("Performing search with query:", searchQuery);
    const searchResults = await searchService.performSearch(searchQuery);

    console.log(
      "Search results structure:",
      JSON.stringify(searchResults, null, 2)
    );

    // Extract images from search results
    const images = searchResults.images || [];

    console.log("Extracted images:", images);

    let messageContent = [
      {
        type: "text",
        text: `Here are relevant images found for the query "${searchQuery}". Use these images as inspiration when designing and creating components for the website:`,
      },
    ];

    if (images.length > 0) {
      // Add images to the message content
      for (const image of images) {
        try {
          // Guess the media type from the URL
          const mediaType = mime.lookup(image) || "image/png"; // Default to png if can't determine

          // Fetch the image
          const response = await axios.get(image, {
            responseType: "arraybuffer",
          });
          const imageData = Buffer.from(response.data, "binary").toString(
            "base64"
          );

          messageContent.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageData,
            },
          });
        } catch (error) {
          console.error(`Error processing image ${image}:`, error);
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
    console.log("Performing image search with query:", searchQuery);
    const imageResults = await searchService.imageSearch(searchQuery);
    console.log("imageResults:", imageResults);
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
    console.log("image_analysis_tool is being used");
    const { image_url, analysis_prompt } = tool.input;
    console.log("Performing image analysis on:", image_url);
    console.log("analysis_prompt:", analysis_prompt);
    const analysisResults = await analyzeImage(image_url, analysis_prompt);

    // Process the analysis results
    const processedResults = {
      isAppropriate:
        analysisResults.analysis.includes("appropriate") &&
        !analysisResults.analysis.includes("inappropriate"),
      quality: analysisResults.analysis.includes("high quality")
        ? "high"
        : "low",
      description: analysisResults.analysis,
    };

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: JSON.stringify(processedResults) }],
      },
    ];
  } else if (tool.name === TOOLS.FILE_CREATOR) {
    const { file_name, file_comments } = tool.input;
    console.log("projectFolderName:", projectFolderName);
    console.log("file_name:", file_name);
    console.log("file_comments:", file_comments);
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
    console.log("projectFolderName: in task_assigner_tool", projectFolderName);
    console.log("file_name: in task_assigner_tool", file_name);
    console.log("task_guidelines: in task_assigner_tool", task_guidelines);
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
  } else if (tool.name === TOOLS.ANALYZE_AND_REPAIR) {
    const { project_folder } = tool.input;
    await analyzeAndRepairWebsite(project_folder, client);
    sendEvent("progress", {
      message: `Analyzed and repaired website for ${project_folder}`,
    });
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `Website analyzed and repaired successfully for ${project_folder}`,
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
