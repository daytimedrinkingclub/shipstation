const { searchTool, placeholderImageTool } = require("../config/tools");
const { AnthropicService } = require("../services/anthropicService");
const FileService = require("../services/fileService");
const searchService = require("../services/searchService");
const { TOOLS } = require("../config/tools");
const dbService = require("../services/dbService");

const fileService = new FileService();

async function refineCode(shipId, message, userId) {
  console.log(`Starting code refinement for shipId: ${shipId}`);

  const client = new AnthropicService({ userId });
  const filePath = `${shipId}/index.html`;

  console.log(`Reading current code from ${filePath}`);
  const currentCode = await fileService.getFile(filePath);
  console.log(
    `Current code read successfully. Length: ${currentCode.length} characters`
  );

  // Fetch existing conversation or create a new one
  let conversation = await dbService.getCodeRefiningConversation(shipId);
  let messages = conversation?.messages || [];

  // Prepare messages to be stored in the database
  const messagesToSaveInDB = messages;
  //   messagesToSaveInDB.push({ role: "user", content: message });

  const systemPrompt = `
    You are an AI assistant specialized in refining HTML code. Analyze the current HTML code and the user's request, then make precise changes to fulfill the request. Maintain the overall structure and style unless specifically asked to change it. Ensure your modifications don't break existing functionality or layout.

    Important rules:
    1. **Always return the entire HTML code**: When responding to a user's request, return the full HTML code, including unchanged sections. Do not omit or summarize any part of the code. 
    2. **No placeholder comments**: Do not add comments like: /* ... previous code remains unchanged ... */. Provide the complete and functional HTML code for the whole page.
    3. If the request is unclear or could cause issues, ask for clarification.
    4. **Never use ellipsis or placeholders**: Always include the entire HTML code, even parts that haven't changed. Do not use "..." or any other shorthand to represent unchanged code.
    5. **Do not use comments to indicate unchanged sections**: Never add comments like "<!-- Rest of the sections remain unchanged -->". Always include the full code for all sections.

    You have access to the following tools:
    1. **search_tool**: Use this to find relevant information for refining the code.
    2. **placeholder_image_tool**: Use this to find and update placeholder images in the code.

    Your response should be structured using XML tags as follows:

    <explanation>
    A brief explanation of the changes made. (Do no get very technical, user may not be a developer. Just explain what you did in simple terms.)
    </explanation>

    <updated_code>
    The complete updated HTML code.
    </updated_code>

    The <updated_code> section must contain the full HTML document, fully formatted and indented, incorporating all requested changes while preserving the original structure and content of unchanged parts. Ensure that all changes follow the requested updates and do not affect other aspects of the code unless instructed. Remember to include ALL code, even parts that haven't changed. Do not use any form of shorthand or placeholders to represent unchanged code.
    `;

  const userMessage = `Current HTML code:\n${currentCode}\n\nUser request: ${message}`;

  messages.push({ role: "user", content: userMessage });

  console.log(`Sending request to Anthropic API for code refinement`);
  const initialResponse = await client.sendMessage({
    system: systemPrompt,
    messages: messages,
    tools: [searchTool, placeholderImageTool],
  });
  console.log(`Received response from Anthropic API`, initialResponse);

  let currentMessage = initialResponse;
  messages.push({ role: currentMessage.role, content: currentMessage.content });

  while (currentMessage.stop_reason === "tool_use") {
    console.log("Tool use detected. Processing tool use...");
    const tool = currentMessage.content.find(
      (content) => content.type === "tool_use"
    );
    if (tool) {
      console.log(`Tool name: ${tool.name}`);
      const toolResult = await handleToolUse(tool, client);
      console.log("Tool result:", toolResult);
      messages.push({ role: "user", content: toolResult });
      console.log("Appended tool result to messages");
      currentMessage = await client.sendMessage({
        system: systemPrompt,
        messages,
        tools: [searchTool, placeholderImageTool],
      });
      console.log("Received new message from Anthropic API after tool use");
      messages.push({ role: "assistant", content: currentMessage.content });
      console.log("Appended new assistant message to messages");
    } else {
      console.log("No tool found in the message content. Breaking the loop.");
      break;
    }
  }

  const responseText = currentMessage.content[0].text;
  console.log(
    `Processing AI response. Response length: ${responseText.length} characters`
  );

  const explanationMatch = responseText.match(
    /<explanation>([\s\S]*?)<\/explanation>/
  );
  const codeMatch = responseText.match(
    /<updated_code>([\s\S]*?)<\/updated_code>/
  );

  if (!explanationMatch || !codeMatch) {
    console.error("Unexpected response format from AI");
    throw new Error("Invalid response format from AI");
  }

  console.log(
    `Successfully extracted explanation and updated code from AI response`
  );

  const updatedMessage = explanationMatch[1].trim();
  const updatedCode = codeMatch[1].trim();

  messagesToSaveInDB.push({
    role: "assistant",
    content: [{ type: "text", text: updatedMessage }],
  });

  console.log(`Updated code length: ${updatedCode.length} characters`);

  if (updatedCode) {
    console.log(`Saving updated code to ${filePath}`);
    await fileService.saveFile(filePath, updatedCode);
    console.log(`Updated code saved successfully`);
  } else {
    console.log(`No code updates to save`);
  }

  console.log(`Messages to save in DB:`, messagesToSaveInDB);

  // Save the conversation in the database
  await dbService.upsertCodeRefiningConversation(
    shipId,
    userId,
    messagesToSaveInDB
  );

  console.log(`Code refinement process completed for shipId: ${shipId}`);

  return {
    updatedMessage,
    updatedCode,
  };
}

async function handleToolUse(tool, client) {
  console.log(`Handling tool use for tool: ${tool.name}`);
  if (tool.name === TOOLS.SEARCH) {
    const searchQuery = tool.input.query;
    console.log(`Performing search with query: ${searchQuery}`);
    const searchResults = await searchService.performSearch(searchQuery);
    console.log(`Search results received. Count: ${searchResults.length}`);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: JSON.stringify(searchResults) }],
      },
    ];
  } else if (tool.name === TOOLS.PLACEHOLDER_IMAGE) {
    const searchQuery = tool.input.placeholder_image_requirements;
    console.log(`Searching for placeholder image with query: ${searchQuery}`);
    const imageResults = await searchService.performSearch(searchQuery);
    console.log(`Image search results received. Count: ${imageResults.length}`);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text:
              imageResults.length === 0
                ? "No relevant placeholder images found"
                : JSON.stringify(imageResults),
          },
        ],
      },
    ];
  }
  console.log(`No matching tool found for: ${tool.name}`);
  return [];
}

module.exports = {
  refineCode,
  handleToolUse,
};
