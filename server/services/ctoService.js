const {
  fileCreatorTool,
  taskAssignerTool,
  deployProjectTool,
  searchTool,
} = require("../config/tools");
const { handleCTOToolUse } = require("../controllers/ctoToolController");
const { TOOLS } = require("../config/tools");
const ctoPrompt = require("./prompts/ctoPrompt");

require("dotenv").config();
const ScreenshotService = require("./screenshotService");
const AnalyzeAndRepairService = require("./analyzeAndRepairService");

const screenshotService = new ScreenshotService();
const analyzeAndRepairService = new AnalyzeAndRepairService();

async function ctoService({
  query,
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
}) {
  const systemPrompt = [
    {
      type: "text",
      text: ctoPrompt.prompt,
    },
  ];

  const messages = [{ role: "user", content: [{ type: "text", text: query }] }];

  try {
    let msg = await client.sendMessage({
      system: systemPrompt,
      messages,
      tools: [fileCreatorTool, taskAssignerTool, deployProjectTool, searchTool],
    });
    while (msg.stop_reason === "tool_use") {
      const tool = msg.content.find((content) => content.type === "tool_use");
      if (tool) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });

        console.log("Found cto tool use in response", tool.name);
        const toolResult = await handleCTOToolUse({
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
        });

        messages.push({ role: "user", content: toolResult });

        // Check if the deploy project tool was used, indicating website completion
        if (tool.name === TOOLS.DEPLOY_PROJECT) {
          console.log(
            "Website deployment tool used. Completing website creation."
          );
          break;
        }

        console.log(
          "ctoService: Sending request to Anthropic API with updated messages"
        );

        msg = await client.sendMessage({
          system: systemPrompt,
          tools: [fileCreatorTool, taskAssignerTool, deployProjectTool],
          messages,
        });

        console.log("Received response from Anthropic API");
      } else {
        console.log("No tool use found in response, breaking loop");
        break;
      }
    }

    const slug = projectFolderName;
    sendEvent("websiteDeployed", {
      slug,
    });

    // After website deployment, run analyze and repair
    console.log("Starting analyze and repair process...");
    try {
      const analyzeAndRepairResult =
        await analyzeAndRepairService.analyzeAndRepairSite(slug);
      console.log(
        "Analyze and repair process completed:",
        analyzeAndRepairResult
      );

      await screenshotService.saveScreenshot(slug);

      // use this to send event after analyzing and repairing, if needed

      // if (
      //   analyzeAndRepairResult.repairResult &&
      //   analyzeAndRepairResult.repairResult.repaired
      // ) {
      //   sendEvent("site_repaired", {
      //     slug: slug,
      //     issuesSummary: analyzeAndRepairResult.repairResult.issuesSummary,
      //   });
      // }
    } catch (error) {
      console.error("Error in analyze and repair process:", error);
    }

    return {
      message: `Website successfully built, deployed, and analyzed. Slug: ${slug}`,
      slug,
    };
  } catch (error) {
    console.error("Error in aiAssistance:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}

module.exports = {
  ctoService,
};
