const {
  getDataForPortfolioTool,
  getDataForLandingPageTool,
  ctoTool,
  searchTool,
  productManagerTool,
  startShippingPortfolioTool,
  startShippingLandingPageTool,
  TOOLS,
  imageAnalysisTool,
  startShippingEmailTemplateTool,
} = require("../config/tools");
const {
  handleOnboardingToolUse,
} = require("../tool-controllers/onboardingToolController");
const { AnthropicService } = require("../services/anthropicService");
const { getUserProfile, updateUserProfile } = require("../services/dbService");
const { SHIP_TYPES, DEFAULT_MESSAGES } = require("./constants");
const {
  undoCodeChange,
  redoCodeChange,
  refineCode,
} = require("../services/openai-editor-service/codeRefinementService");
const { generateSiteContent } = require("./siteContentService");
const ScreenshotService = require("./screenshotService");
const { updatePrompt } = require("./promptUpdateService");

const screenshotService = new ScreenshotService();

async function processConversation({
  client,
  sendEvent,
  roomId,
  abortSignal,
  userId,
  shipType,
  name,
  portfolioType,
  designChoice,
  selectedDesign,
  customDesignPrompt,
  images,
  assets,
}) {
  console.log("Entered processConversation function");
  console.log("processConversation received images:", images?.length);
  console.log("processConversation received assets:", assets?.length);

  while (true) {
    if (abortSignal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    let currentMessage;
    let messages = [];
    let tools = [];

    if (shipType) {
      if (shipType === SHIP_TYPES.PORTFOLIO) {
        tools.push(ctoTool);
        tools.push(startShippingPortfolioTool);
      } else if (shipType === SHIP_TYPES.LANDING_PAGE) {
        tools.push(ctoTool);
        tools.push(startShippingLandingPageTool);
      } else if (shipType === SHIP_TYPES.EMAIL_TEMPLATE) {
        tools.push(ctoTool);
        tools.push(startShippingEmailTemplateTool);
      } else if (shipType === SHIP_TYPES.PROMPT) {
        tools.push(ctoTool);
        tools.push(productManagerTool);
        tools.push(searchTool);
        tools.push(imageAnalysisTool);
      }
    }

    let content = [
      {
        type: "text",
        text: `Generate a ${portfolioType} portfolio for ${name}. This portfolio should showcase ${name}'s work and skills in the field of ${portfolioType}.`,
      },
    ];

    if (portfolioType) {
      const portfolioPrompt = `
      Based on the portfolio type "${portfolioType}", create a comprehensive portfolio website for ${name}. Use your knowledge to generate appropriate placeholder content and sections typically found in a ${portfolioType.toLowerCase()} portfolio. Consider the following:
      
      1. Identify and include key sections relevant to a ${portfolioType.toLowerCase()} portfolio (e.g., About, Projects, Skills).
      2. Generate placeholder content for each section that aligns with the ${portfolioType.toLowerCase()} field.
      3. Include any specific elements or features commonly found in ${portfolioType.toLowerCase()} portfolios.
      
      Your task is to create a complete, professional portfolio website using this limited information. Use your best judgment to fill in any gaps with realistic, industry-appropriate placeholder data. The goal is to produce a functional, appealing portfolio that can be easily customized later with real data.
      
      Proceed to build the portfolio site incorporating these elements and your expertise in web development and ${portfolioType.toLowerCase()} portfolios.`;

      content.push({ type: "text", text: portfolioPrompt });
    }

    // Add images to the content if available
    if (images && images.length > 0) {
      images.forEach((img, index) => {
        content.push(
          {
            type: "text",
            text: `Image ${index + 1}: ${img.comment || "No caption provided"}`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: img.mediaType,
              data: img.base64,
            },
          }
        );
      });
    }

    messages = [{ role: "user", content: content }];

    const systemPrompt = (() => {
      switch (shipType) {
        case SHIP_TYPES.PORTFOLIO:
          return "Your task is to create a portfolio website for the user. Analyze the user's requirements and use the start_shipping_portfolio_tool to begin the project. Then, coordinate with the cto_tool to develop and deploy the website.";
        case SHIP_TYPES.LANDING_PAGE:
          return "Your task is to create a landing page for the user. Analyze the user's requirements and use the start_shipping_landing_page_tool to begin the project. Then, coordinate with the cto_tool to develop and deploy the website.";
        case SHIP_TYPES.EMAIL_TEMPLATE:
          return "Your task is to create an email template for the user. Analyze the user's requirements and use the start_shipping_email_template_tool to begin the project. Then, coordinate with the cto_tool to develop and deploy the email template.";
        default:
          throw new Error(`Unsupported ship type: ${shipType}`);
      }
    })();

    try {
      currentMessage = await client.sendMessage({
        system: systemPrompt,
        messages,
        tools,
      });
      sendEvent("newMessage", {
        conversation: currentMessage.content,
      });
    } catch (error) {
      console.error("Error creating message:", error);
      sendEvent("error", {
        error: "Error calling Anthropic API",
      });
      throw error;
    }

    console.log("message in onboardingService", currentMessage);
    if (currentMessage.stop_reason === "end_turn") {
      messages.push({
        role: currentMessage.role,
        content: currentMessage.content,
      });
      sendEvent("needMoreInfo", {
        message: currentMessage.content[0].text,
      });
      break;
    }

    while (currentMessage.stop_reason === "tool_use") {
      const tool = currentMessage.content.find(
        (content) => content.type === "tool_use"
      );
      if (tool) {
        messages.push({
          role: currentMessage.role,
          content: currentMessage.content,
        });

        const toolResult = await handleOnboardingToolUse({
          tool,
          sendEvent,
          roomId,
          messages,
          userId,
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

        if (tool.name === TOOLS.CTO) {
          console.log("Project creation completed");
          return;
        }

        currentMessage = await client.sendMessage({
          system:
            "Your task is to deploy a website for the user and share them the deployed url",
          messages,
          tools,
        });
        console.log("Received response from Anthropic API:", currentMessage);
      } else {
        console.log("No tool use found in response, breaking loop");
        break;
      }
    }
  }
}

function handleOnboardingSocketEvents(io) {
  io.on("connection", (socket) => {
    console.log("New client connected");
    let abortController = new AbortController();

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("anthropicKey", ({ anthropicKey: key }) => {
      AnthropicService.validateKey(key).then((isValid) => {
        if (isValid) {
          console.log("Anthropic API key validated");
          socket.emit("apiKeyStatus", {
            success: true,
            message: "API key is valid, generating website!",
            key,
          });
        } else {
          console.log("Invalid Anthropic API key provided");
          socket.emit("apiKeyStatus", {
            success: false,
            message: "Invalid API key. Please try again.",
          });
        }
      });
    });

    socket.on("startProject", async (data) => {
      const {
        roomId,
        userId,
        apiKey,
        shipType,
        name,
        portfolioType,
        designChoice,
        selectedDesign,
        customDesignPrompt,
        images,
        assets,
      } = data;
      console.log(
        "startProject",
        roomId,
        userId,
        apiKey,
        shipType,
        name,
        portfolioType
      );
      console.log("Images:", images?.length);
      console.log("Assets:", assets?.length);

      const clientParams = { userId };
      if (apiKey) {
        // using own anthropic key
        clientParams.apiKey = apiKey;
      } else {
        const profile = await getUserProfile(userId);
        const { available_ships } = profile;
        console.log("available_ships", available_ships);
        console.log("apiKey", !!apiKey);
        if (available_ships <= 0 || !!apiKey) {
          socket.emit("showPaymentOptions", {
            error: "Please select an option to proceed!",
          });
          return;
        }
      }

      const client = new AnthropicService(clientParams);

      const sendEvent = async (event, data) => {
        io.to(roomId).emit(event, data);
      };

      abortController = new AbortController();
      try {
        console.log("Starting processConversation...");
        await processConversation({
          client,
          sendEvent,
          roomId,
          abortSignal: abortController.signal,
          userId,
          shipType,
          name,
          portfolioType,
          designChoice,
          selectedDesign,
          customDesignPrompt,
          images,
          assets,
        });
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Website creation aborted");
          sendEvent("creationAborted", {
            message: "Website creation was aborted",
          });
          console.error("Error in processConversation:", error);
        }
      }
    });

    socket.on("chatMessage", async (data) => {
      const {
        shipId,
        shipSlug,
        message,
        assets,
        assetInfo,
        aiReferenceFiles,
        userId,
      } = data;
      console.log("Received chat message:", message, "\nfor ship:", shipSlug);
      console.log("Message:", message);
      console.log("Assets:", assets.length, assetInfo);
      console.log("AI Reference Files:", aiReferenceFiles.length);

      try {
        const result = await refineCode(
          shipId,
          shipSlug,
          message,
          assets,
          assetInfo,
          aiReferenceFiles
        );

        socket.emit("chatResponse", { message: result.updatedMessage });

        if (result.updatedCode) {
          socket.emit("codeUpdate", result.updatedCode);
          await screenshotService.saveScreenshot(shipSlug);

          // decrement available ships after successful codeUpdate
          const userProfile = await getUserProfile(userId);
          if (userProfile.available_ships > 0) {
            await updateUserProfile(userId, {
              available_ships: userProfile.available_ships - 1,
            });
          }

          await updatePrompt(shipId, userId, [
            { role: "user", content: message },
            { role: "assistant", content: result.updatedMessage },
          ]);
        }
      } catch (error) {
        console.error("Error processing chat message:", error);
        socket.emit("chatResponse", {
          message: "An error occurred while processing your message.",
        });
      }
    });

    socket.on("undoCodeChange", async (data) => {
      const { shipId, shipSlug } = data;
      console.log("Received undo request for ship:", shipId);

      try {
        const result = await undoCodeChange(shipId, shipSlug);

        if (result.success) {
          socket.emit("undoResult", { success: true, message: result.message });
          socket.emit("codeUpdate", result.code);
        } else {
          socket.emit("undoResult", {
            success: false,
            message: result.message,
          });
        }
      } catch (error) {
        console.error("Error processing undo request:", error);
        socket.emit("undoResult", {
          success: false,
          message: "An error occurred while processing your undo request.",
        });
      }
    });

    socket.on("redoCodeChange", async (data) => {
      const { shipId, shipSlug } = data;
      console.log("Received redo request for ship:", shipId);

      try {
        const result = await redoCodeChange(shipId, shipSlug);

        if (result.success) {
          socket.emit("redoResult", { success: true, message: result.message });
          socket.emit("codeUpdate", result.code);
        } else {
          socket.emit("redoResult", {
            success: false,
            message: result.message,
          });
        }
      } catch (error) {
        console.error("Error processing redo request:", error);
        socket.emit("redoResult", {
          success: false,
          message: "An error occurred while processing your redo request.",
        });
      }
    });

    socket.on("generateSiteContent", async (data) => {
      const { userMessage, type, portfolioType } = data;
      console.log("Received generateSiteContent request");

      try {
        const result = await generateSiteContent(
          socket.userId,
          userMessage,
          type,
          portfolioType
        );

        socket.emit("siteContentGenerated", {
          sections: result.sections,
          socials: result.socials,
          design: result.design,
        });
      } catch (error) {
        console.error("Error generating site content:", error);
        socket.emit("siteContentGenerationError", {
          message: "An error occurred while generating site content.",
        });
      }
    });

    socket.on("abortWebsiteCreation", () => {
      abortController.abort();
      console.log("Aborting website creation");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

module.exports = {
  handleOnboardingSocketEvents,
};
