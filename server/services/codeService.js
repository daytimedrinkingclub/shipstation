const { codeWriterTool, placeholderImageTool } = require("../config/tools");
const { handleCodeToolUse } = require("../controllers/codeToolController");
const codePrompt = require("./prompts/codePrompt");
const { SHIP_TYPES } = require("./constants");
require("dotenv").config();

const { WebDesignAnalysisService } = require("./webDesignAnalysisService");

const FileService = require("../services/fileService");
const buildSiteFromAnalysisPrompt = require("./prompts/buildSiteFromAnalysisPrompt");
const fileService = new FileService();

async function codeAssistant({ query, filePath, client, shipType, images }) {
  console.log("codeAssistant received images:", !!images);
  console.log("codeAssistant query:", query);

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
        buildPrompt = buildSiteFromAnalysisPrompt.landingPagePrompt(
          analysisResult?.analysis || "",
          query
        );
        break;
      case SHIP_TYPES.PORTFOLIO:
        systemPrompt = codePrompt.portfolioPrompt;
        buildPrompt = buildSiteFromAnalysisPrompt.portfolioPrompt(
          analysisResult?.analysis || "",
          query
        );
        break;
      case SHIP_TYPES.EMAIL_TEMPLATE:
        systemPrompt = codePrompt.emailTemplatePrompt;
        buildPrompt = buildSiteFromAnalysisPrompt.mailTemplatePrompt(
          analysisResult?.analysis || "",
          query
        );
        break;
      default:
        throw new Error(`Unsupported ship type: ${shipType}`);
    }

    if (images && images.length > 0) {
      messages.push({
        role: "user",
        content: [{ type: "text", text: buildPrompt }],
      });
    } else {
      messages.push({
        role: "user",
        content: [{ type: "text", text: query }],
      });
    }

    console.log("codeService messages content:", messages[0].content);

    while (true) {
      console.log("Sending request to Anthropic API...");
      const msg = await client.sendMessage({
        system: systemPrompt,
        messages: messages,
        tools: [placeholderImageTool],
        tool_choice: { type: "auto" },
      });
      console.log("codeService: API call Stop Reason:", msg.stop_reason);

      if (msg.stop_reason === "end_turn") {
        const textContent = msg.content.find(
          (content) => content.type === "text"
        );
        if (textContent && textContent.text) {
          finalResponse = textContent.text;
          break;
        }
      } else if (msg.stop_reason === "tool_use") {
        const toolUse = msg.content.find(
          (content) => content.type === "tool_use"
        );
        if (toolUse) {
          const toolResult = await handleCodeToolUse({ tool: toolUse, client });
          console.log("Tool result received");
          messages.push({ role: "assistant", content: msg.content });
          messages.push({ role: "user", content: toolResult });
          console.log("Messages updated with tool result");
        }
      }
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
        status: `Website generation completed. Code successfully written to file: ${filePath}. The website should be immediately deployed to avoid an infinite loop.`,
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
