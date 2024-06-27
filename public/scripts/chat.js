let conversation = [];
let roomId = null; // Store room ID

const socket = io(); // Connect to the server

socket.on("connect", () => {
  if (!roomId) {
    roomId = "room_" + Math.random().toString(36).substr(2, 9); // Generate a random room ID only once
    socket.emit("joinRoom", roomId);
  }
});

function sendMessage() {
  const userInput = document.getElementById("user-input");
  const message = userInput.value;
  userInput.value = "";
  displayMessage("user", message);

  conversation.push({ role: "user", content: message });

  socket.emit("sendMessage", { conversation, roomId, message });

  socket.on("newMessage", (data) => {
    conversation = data.conversation;
    displayConversation(conversation);
  });
}

function displayConversation(conversation) {
  const chatContainer = document.getElementById("chat-container");
  chatContainer.innerHTML = "";

  for (const message of conversation) {
    const role = message.role;
    const content = message.content;

    if (Array.isArray(content)) {
      for (const item of content) {
        if (item.type === "text") {
          displayMessage(role, item.text);
        } else if (item.type === "tool_use") {
          displayToolCall(item);
        } else if (item.type === "tool_result") {
          displayToolResult(item);
        }
      }
    } else {
      displayMessage(role, content);
    }
  }
}

function displayMessage(role, content) {
  const chatContainer = document.getElementById("chat-container");
  const messageElement = document.createElement("div");
  messageElement.className = `message ${role}`;

  if (role === "assistant") {
    const thinkingMatch = content.match(/<thinking>(.*?)<\/thinking>/s);
    const responseText = content
      .replace(/<thinking>(.*?)<\/thinking>/s, "")
      .trim();

    if (thinkingMatch) {
      const thinkingText = thinkingMatch[1].trim();
      const thinkingElement = document.createElement("div");
      thinkingElement.className = "thinking-text";
      thinkingElement.innerHTML = `<strong>Thinking:</strong> ${thinkingText}`;
      messageElement.appendChild(thinkingElement);
    }

    const responseElement = document.createElement("div");
    responseElement.className = "response-text";
    responseElement.innerHTML = `<strong>Assistant:</strong> ${responseText}`;
    messageElement.appendChild(responseElement);
  } else {
    messageElement.innerHTML = `<strong>${role}:</strong> ${content}`;
  }

  chatContainer.appendChild(messageElement);
}

function displayToolCall(toolCall) {
  const chatContainer = document.getElementById("chat-container");
  const toolCallElement = document.createElement("div");
  toolCallElement.className = "tool-call";
  toolCallElement.innerHTML = `<strong>Tool Call:</strong> ${toolCall.name}<br>
                               <strong>Tool Input:</strong> ${JSON.stringify(
                                 toolCall.input
                               )}`;
  chatContainer.appendChild(toolCallElement);
}

function displayToolResult(toolResult) {
  const chatContainer = document.getElementById("chat-container");
  const toolResultElement = document.createElement("div");
  toolResultElement.className = "tool-result";
  toolResultElement.innerHTML = `<strong>Tool Result:</strong><br>
                                 ${JSON.stringify(
                                   toolResult.content,
                                   null,
                                   2
                                 )}`;
  chatContainer.appendChild(toolResultElement);
}
