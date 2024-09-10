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
} = require("../controllers/onboardingToolController");
const { AnthropicService } = require("../services/anthropicService");
const { getUserProfile } = require("../services/dbService");
const { SHIP_TYPES, DEFAULT_MESSAGES } = require("./constants");

async function processConversation({
  client,
  sendEvent,
  roomId,
  abortSignal,
  userId,
  shipType,
  message,
  images,
}) {
  console.log("processConversation received images:", !!images);
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
      }
      if (shipType === SHIP_TYPES.LANDING_PAGE) {
        tools.push(ctoTool);
        tools.push(startShippingLandingPageTool);
      }
      if (shipType === SHIP_TYPES.EMAIL_TEMPLATE) {
        tools.push(ctoTool);
        tools.push(startShippingEmailTemplateTool);
      }
      if (shipType === SHIP_TYPES.PROMPT) {
        tools.push(ctoTool);
        tools.push(productManagerTool);
        tools.push(searchTool);
        tools.push(imageAnalysisTool);
      }
    }

    let content = [{ type: "text", text: message }];

    // Add images to the content if available
    if (images && images.length > 0) {
      images.forEach((img, index) => {
        content.push(
          {
            type: "text",
            text: `Image ${index + 1}: ${img.caption || "No caption provided"}`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: img.mediaType,
              data: img.file,
            },
          }
        );
      });
    }

    messages = [{ role: "user", content: content }];

    try {
      // insertMessage({
      //   chat_id: roomId,
      //   role: "user",
      //   content: messages[0].content,
      // });
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
          images,
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
      const { roomId, userId, apiKey, shipType, message, images } = data;
      console.log("startProject", roomId, userId, apiKey, shipType, message);
      images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`);
        console.log("Image file data available:", !!img.file);
        console.log(`File type: ${img.mediaType || "Unknown"}`);
        console.log(`Caption: ${img.caption}`);
      });

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
        await processConversation({
          client,
          sendEvent,
          roomId,
          abortSignal: abortController.signal,
          userId,
          shipType,
          socket,
          message,
          images,
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
