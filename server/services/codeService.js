const {
  codeWriterTool,
  placeholderImageTool,
  headshotTool,
  stockImagesTool,
} = require("../config/tools");
const { handleCodeToolUse } = require("../controllers/codeToolController");
const codePrompt = require("./prompts/codePrompt");
const { SHIP_TYPES } = require("./constants");
require("dotenv").config();

const { WebDesignAnalysisService } = require("./webDesignAnalysisService");

const FileService = require("../services/fileService");
const buildSiteFromAnalysisPrompt = require("./prompts/buildSiteFromAnalysisPrompt");
const { createUserBuildSitePrompt } = require("./prompts/userBuildSitePrompt");
const fileService = new FileService();

async function codeAssistant({
  query,
  filePath,
  client,
  shipType,
  name,
  portfolioType,
  designChoice,
  selectedDesign,
  customDesignPrompt,
  images,
}) {
  console.log("codeAssistant received:", {
    name: name,
    images: images?.length,
    portfolioType: portfolioType,
    designChoice: designChoice,
    selectedDesign: selectedDesign,
    customDesignPrompt: customDesignPrompt,
  });

  try {
    let finalResponse = null;
    let analysisResult = null;

    let messages = [];

    console.log(
      `Received code write request for ${shipType} with ${
        images ? images.length : 0
      } images`
    );

    const webDesignAnalysisService = new WebDesignAnalysisService(client);

    // Check if images are available and not null
    if (images && images.length > 0) {
      try {
        analysisResult = await webDesignAnalysisService.analyzeWebDesign(
          images,
          shipType
        );
      } catch (error) {
        console.error("Error analyzing web design:", error);
        // Continue without the analysis if there's an error
      }
    }

    let systemPrompt;
    let buildPrompt;

    switch (shipType) {
      case SHIP_TYPES.LANDING_PAGE:
        systemPrompt = codePrompt.landingPagePrompt;
        break;
      case SHIP_TYPES.PORTFOLIO:
        systemPrompt = codePrompt.portfolioPrompt;
        break;
      case SHIP_TYPES.EMAIL_TEMPLATE:
        systemPrompt = codePrompt.emailTemplatePrompt;
        break;
      default:
        throw new Error(`Unsupported ship type: ${shipType}`);
    }

    buildPrompt = await createUserBuildSitePrompt(
      shipType,
      analysisResult?.analysis || null,
      name,
      portfolioType,
      designChoice,
      selectedDesign,
      customDesignPrompt,
      images
    );

    messages.push({
      role: "user",
      content: buildPrompt,
    });

    while (true) {
      console.log("Sending request to Anthropic API...");
      const currentMessage = await client.sendMessage({
        system: systemPrompt,
        messages: messages,
        tools: [stockImagesTool, headshotTool],
        tool_choice: { type: "auto" },
      });
      console.log(
        "codeService: API call Stop Reason:",
        currentMessage.stop_reason
      );

      if (currentMessage.stop_reason === "end_turn") {
        const textContent = currentMessage.content.find(
          (content) => content.type === "text"
        );
        if (textContent && textContent.text) {
          finalResponse = textContent.text;
          break;
        }
      } else if (currentMessage.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: currentMessage.content });
        const toolUses = currentMessage.content.filter(
          (content) => content.type === "tool_use"
        );
        if (toolUses.length > 0) {
          const toolResults = [];
          for (const toolUse of toolUses) {
            const toolResult = await handleCodeToolUse({
              tool: toolUse,
              client,
            });
            console.log("Tool result received");
            toolResults.push(...toolResult);
          }
          messages.push({ role: "user", content: toolResults });
          console.log("Messages updated with tool results");
        }
      } else {
        messages.push({ role: "assistant", content: currentMessage.content });
      }

      console.log("Messages updated with assistant response");
    }

    if (finalResponse) {
      // Remove comments before <!DOCTYPE html>
      finalResponse = finalResponse
        .replace(/^[\s\S]*?(?=<!DOCTYPE html>)/i, "")
        .replace(/<\/html>\s*[\s\S]*$/i, "</html>");

      await fileService.saveFile(filePath, finalResponse);
      console.log(`Code successfully written to file: ${filePath}`);
      return {
        description: `Code generated and saved to ${filePath}`,
        status: `Website generation completed. Code successfully written to file: ${filePath}. The website should be immediately deployed by using the deploy_project_tool to avoid an infinite loop.`,
      };
    } else {
      throw new Error("No valid response received from Anthropic API");
    }
  } catch (error) {
    console.error("Error in codeAssistant:", error);
    throw error;
  }
}

module.exports = {
  codeAssistant,
};
