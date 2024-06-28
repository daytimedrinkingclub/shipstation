const Anthropic = require("@anthropic-ai/sdk");
const { searchTool, productManagerTool, ctoTool } = require("../config/tools");
const { handleToolUse } = require("./toolController");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function processConversation(conversation, tools, sendEvent) {
  let currentMessage = await client.messages.create({
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
      const toolResult = await handleToolUse(tool, sendEvent);
      console.log("Received tool result:", toolResult);
      conversation.push({ role: "user", content: toolResult });

      console.log(
        "Sending request to Anthropic API with updated conversation:",
        JSON.stringify(conversation)
      );

      currentMessage = await client.messages.create({
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

  if (currentMessage.stop_reason === "end_turn") {
    conversation.push({
      role: currentMessage.role,
      content: currentMessage.content,
    });
    sendEvent("newMessage", {
      conversation,
    });
  }
}

function handleChat(io) {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
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

      await processConversation(conversation, tools, sendEvent);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

module.exports = {
  handleChat,
};
