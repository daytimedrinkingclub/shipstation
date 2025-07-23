const {
  fileCreatorTool,
  taskAssignerTool,
  deployProjectTool,
  searchTool,
} = require("../config/tools");
const { handleCTOToolUse } = require("../tool-controllers/ctoToolController");
const { TOOLS } = require("../config/tools");
const ctoPrompt = require("./prompts/ctoPrompt");

require("dotenv").config();
const ScreenshotService = require("./screenshotService");
const AnalyzeAndRepairService = require("./analyzeAndRepairService");
const { postToDiscordWebhook } = require("./webhookService");
const { sendProjectDeployedEmail } = require("./emailService");
const { getUserProfile } = require("./dbService");

const screenshotService = new ScreenshotService();
const analyzeAndRepairService = new AnalyzeAndRepairService();
const FileService = require("./fileService");
const fileService = new FileService();

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
  assets,
  userId,
}) {
  console.log("ctoService received images:", images?.length);
  console.log("ctoService received assets:", assets?.length);
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
          assets,
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

    // Run analyze and repair after cto calls deploy tool
    // console.log("Starting analyze and repair process...");
    // try {
    //   const analyzeAndRepairResult =
    //     await analyzeAndRepairService.analyzeAndRepairSite(slug);
    //   console.log(
    //     "Analyze and repair process completed:",
    //     analyzeAndRepairResult
    //   );
    // } catch (error) {
    //   console.error("Error in analyze and repair process:", error);
    // }

    await screenshotService.saveScreenshot(slug);

    // Send websiteDeployed event after the repair
    sendEvent("websiteDeployed", {
      slug,
    });

    // Get common data for both webhook and email
    let userProfile = null;
    if (userId) {
      try {
        userProfile = await getUserProfile(userId);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
    
    // Get screenshot URL for both webhook and email
    const screenshotPath = `${slug}/screenshot.png`;
    const screenshotUrl = fileService.getPublicUrl(screenshotPath);
    const projectUrl = `${process.env.MAIN_URL}/site/${slug}`;

    // Discord webhook with screenshot
    const webhookPayload = {
      content: "New website deployed!",
      embeds: [
        {
          title: "Website Details",
          fields: [
            { name: "URL", value: projectUrl },
          ],
          image: {
            url: screenshotUrl
          }
        },
      ],
    };
    postToDiscordWebhook(webhookPayload, process.env.DISCORD_NEW_SHIP_WEBHOOK_URL);

    // Send project deployed email notification
    try {
      if (userProfile && userProfile.email) {
        await sendProjectDeployedEmail(
          userProfile.email, 
          projectUrl, 
          userName,
          screenshotUrl
        );
        console.log(`Project deployed email sent to ${userProfile.email}`);
      }
    } catch (emailError) {
      console.error('Error sending project deployed email:', emailError);
      // Don't fail the deployment if email sending fails
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
