const {
  getDataForPortfolioTool,
  getDataForLandingPageTool,
  ctoTool,
} = require("../config/tools");
const {
  handleOnboardingToolUse,
} = require("../controllers/onboardingToolController");
const { AnthropicService } = require("../services/anthropicService");
const { getUserProfile } = require("../services/dbService");
const { SHIP_TYPES } = require("./constants");

async function processConversation({
  client,
  shipType,
  sendEvent,
  roomId,
  abortSignal,
  userId,
}) {
  while (true) {
    if (abortSignal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    let currentMessage;

    const messages = DEFAULT_MESSAGES[shipType];
    const tools = [ctoTool];

    if (shipType === SHIP_TYPES.PORTFOLIO) {
      tools.push(getDataForPortfolioTool);
      tools.push(startShippingPortfolioTool);
    }
    if (shipType === SHIP_TYPES.LANDING_PAGE) {
      tools.push(getDataForLandingPageTool);
      tools.push(startShippingLandingPageTool);
    }

    try {
      currentMessage = await client.sendMessage({
        system:
          "Your task is to deploy a website for the user and share them the deployed url",
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
        console.log("Found tool use in response:", tool);
        const toolResult = await handleOnboardingToolUse({
          tool,
          sendEvent,
          roomId,
          messages,
          userId,
          client,
        });
        console.log("Received tool result:", toolResult);
        messages.push({ role: "user", content: toolResult });

        console.log(
          "Sending request to Anthropic API with updated conversation:",
          JSON.stringify(messages)
        );
        currentMessage = client.sendMessage({
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

    socket.on("anthropicKey", (key) => {
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
      const { roomId, userId, shipType, apiKey } = data;
      const clientParams = { userId };
      if (apiKey) {
        // using own anthropic key
        clientParams.apiKey = apiKey;
      } else {
        const profile = await getUserProfile(userId);
        const { available_ships } = profile;
        if (available_ships <= 0) {
          // todo add check for !client.isCustomKey
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
          abortSignal,
          userId,
          shipType,
        });
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
