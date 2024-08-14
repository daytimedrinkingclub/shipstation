const fileService = require("../services/fileService");
const { codeAssitant } = require("../services/codeService");
const searchService = require("../services/searchService");
const { TOOLS } = require("../config/tools");

const { captureScreenshots } = require("../services/screenshotService");
const { analyzeWebsite } = require("../services/imageAnalysisService");
const { repairWebsite } = require("../services/repairService");
const path = require("path");
const { saveDirectoryToS3 } = require("../services/s3Service");

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
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: JSON.stringify(searchResults) }],
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
  } else if (tool.name === TOOLS.DEPLOY_PROJECT) {
    const deployedUrl = `https://shipstation.ai/${projectFolderName}`;

    // Capture screenshots after deployment
    const screenshots = await captureScreenshots(
      deployedUrl,
      projectFolderName
    );

    // Analyze the screenshots
    const analysis = await analyzeWebsite(screenshots);

    // Repair the website if issues are detected
    let repairResults = [];
    let initialIssues = [...analysis.issues];
    if (analysis.issues.length > 0) {
      repairResults = await repairWebsite(projectFolderName, analysis, client);

      // Re-deploy the website after repairs
      const localDirectoryPath = path.join(
        process.env.WEBSITES_PATH,
        projectFolderName
      );
      await saveDirectoryToS3(localDirectoryPath, projectFolderName);

      // Capture new screenshots after repairs
      const updatedScreenshots = await captureScreenshots(
        deployedUrl,
        projectFolderName
      );

      // Re-analyze the website
      const updatedAnalysis = await analyzeWebsite(updatedScreenshots);

      analysis.issues = updatedAnalysis.issues;
    }
    // Prepare detailed report
    const repairStatus = {
      deployedUrl,
      initialIssues,
      repairsMade: repairResults.map((r) => r.description),
      remainingIssues: analysis.issues,
      isFullyRepaired: analysis.issues.length === 0,
    };

    // You might want to save this report to a database or send it to a logging service for creating dashbaord like vercel
    // but we skip it here

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `Your project has been deployed on the link: ${deployedUrl}. 
                 Initial issues detected: ${initialIssues.join(", ")}
                 Repairs made: ${repairResults
                   .map((r) => r.description)
                   .join(", ")}
                 Remaining issues after repair: ${analysis.issues.join(", ")}
                 The website is ${
                   repairStatus.isFullyRepaired
                     ? "fully repaired"
                     : "partially repaired"
                 }.`,
          },
          // {
          //   type: "json",
          //   text: JSON.stringify(repairStatus, null, 2),
          // },
        ],
      },
    ];
  }

  return [];
}

module.exports = {
  handleCTOToolUse,
};
