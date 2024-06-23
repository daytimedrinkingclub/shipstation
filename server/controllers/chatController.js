const Anthropic = require("@anthropic-ai/sdk");
const { codeWriterTool, searchTool } = require("../config/tools");
const { handleToolUse } = require("./toolController");
const { systemPrompt } = require("../config/prompts");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function processConversation(conversation, tools) {
  let currentMessage = await client.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4000,
    temperature: 0,
    system: systemPrompt,
    messages: conversation,
    tools, // Ensure tools are passed here
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
      const toolResult = await handleToolUse(tool, conversation);
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
        system: systemPrompt,
        messages: conversation,
        tools,
      });

      console.log("Received response from Anthropic API:", currentMessage);
    } else {
      console.log("No tool use found in response, breaking loop");
      break;
    }
  }

  conversation.push({
    role: currentMessage.role,
    content: currentMessage.content,
  });
  console.log(
    "Finished processConversation, final conversation:",
    conversation
  );
  return currentMessage;
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
      const tools = [searchTool, codeWriterTool];
      const finalMessage = await processConversation(conversation, tools);
      io.to(roomId).emit("newMessage", {
        conversation,
        response: finalMessage.content,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

module.exports = {
  handleChat,
};
