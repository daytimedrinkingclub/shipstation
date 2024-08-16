const {
  getDataForPortfolioTool,
  getDataForLandingPageTool,
  ctoTool,
  searchTool,
  productManagerTool,
  startShippingPortfolioTool,
  startShippingLandingPageTool,
  TOOLS,
  imageFinderTool,
  imageAnalysisTool,
} = require("../config/tools");
const {
  handleOnboardingToolUse,
} = require("../controllers/onboardingToolController");
const { AnthropicService } = require("../services/anthropicService");
const { getUserProfile, insertMessage } = require("../services/dbService");
const { SHIP_TYPES, DEFAULT_MESSAGES } = require("./constants");

async function processConversation({
  client,
  sendEvent,
  roomId,
  abortSignal,
  userId,
  shipType,
  message,
}) {
  while (true) {
    if (abortSignal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    let currentMessage;

    let messages = [];
    let tools = [];

    if (shipType) {
      if (shipType === SHIP_TYPES.PORTFOLIO) {
        tools.push(getDataForPortfolioTool);
        tools.push(startShippingPortfolioTool);
        messages = DEFAULT_MESSAGES[shipType];
      }
      if (shipType === SHIP_TYPES.LANDING_PAGE) {
        tools.push(getDataForLandingPageTool);
        tools.push(startShippingLandingPageTool);
        messages = DEFAULT_MESSAGES[shipType];
      }
      if (shipType === SHIP_TYPES.PROMPT) {
        tools.push(ctoTool);
        tools.push(productManagerTool);
        tools.push(searchTool);
        tools.push(imageAnalysisTool);
        messages = [{ role: "user", content: message }];
      }
    }

    try {
      // insertMessage({
      //   chat_id: roomId,
      //   role: "user",
      //   content: messages[0].content,
      // });
      currentMessage = await client.sendMessage({
        system:
          "Your task is to deploy a website for the user and share them the deployed url. Use the search tool to get the initial data and pass it on to product manager tool",
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
      console.log("startProject", data);
      const { roomId, userId, apiKey, shipType, message } = data;
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
        });
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Website creation aborted");
          sendEvent("creationAborted", {
            message: "Website creation was aborted",
          });
        } else {
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
