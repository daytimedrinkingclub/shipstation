const { searchTool, productManagerTool, ctoTool } = require("../config/tools");
const { handleToolUse } = require("./toolController");
const {
  validateAnthropicKey,
  updateAnthropicKey,
  getAnthropicClient,
} = require("../services/anthropicService");

async function processConversation(
  conversation,
  tools,
  sendEvent,
  roomId,
  abortSignal
) {
  while (true) {
    if (abortSignal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    let currentMessage;
    try {
      currentMessage = await getAnthropicClient().messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        temperature: 0,
        system:
          "Your task is to deploy a website for the user and share them the deployed url",
        messages: conversation,
        tools,
      });
      sendEvent("newMessage", {
        conversation,
      });
    } catch (error) {
      console.error("Error creating message:", error);
      sendEvent("error", {
        error: "Error calling Anthropic API",
      });
      throw error;
    }

    if (currentMessage.stop_reason === "end_turn") {
      conversation.push({
        role: currentMessage.role,
        content: currentMessage.content,
      });
      sendEvent("newMessage", {
        conversation,
      });
      break;
    }

    while (currentMessage.stop_reason === "tool_use") {
      const tool = currentMessage.content.find(
        (content) => content.type === "tool_use"
      );
      if (tool) {
        conversation.push({
          role: currentMessage.role,
          content: currentMessage.content,
        });
        console.log("Found tool use in response:", tool);
        const toolResult = await handleToolUse(
          tool,
          sendEvent,
          roomId,
          conversation
        );
        console.log("Received tool result:", toolResult);
        conversation.push({ role: "user", content: toolResult });

        console.log(
          "Sending request to Anthropic API with updated conversation:",
          JSON.stringify(conversation)
        );
        currentMessage = await getAnthropicClient().messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 4000,
          temperature: 0,
          system:
            "Your task is to deploy a website for the user and share them the deployed url",
          messages: conversation,
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

function handleChat(io) {
  io.on("connection", (socket) => {
    console.log("New client connected");
    let abortController = new AbortController();

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("anthropicKey", (key) => {
      validateAnthropicKey(key).then((isValid) => {
        if (isValid) {
          console.log("Anthropic API key validated and set successfully");
          socket.emit("apiKeyStatus", {
            success: true,
            message: "API key validated and saved successfully",
          });
          updateAnthropicKey(key);
        } else {
          console.log("Invalid Anthropic API key provided");
          socket.emit("apiKeyStatus", {
            success: false,
            message: "Invalid API key. Please try again.",
          });
        }
      });
    });

    socket.on("sendMessage", async (data) => {
      const { conversation, roomId } = data;
      const tools = [searchTool, productManagerTool, ctoTool];

      const sendEvent = async (event, data) => {
        io.to(roomId).emit(event, {
          conversation,
          data,
        });
      };

      abortController = new AbortController();
      try {
        await processConversation(
          conversation,
          tools,
          sendEvent,
          roomId,
          abortController.signal
        );
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
  handleChat,
};
