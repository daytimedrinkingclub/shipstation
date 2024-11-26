const { searchTool, placeholderImageTool } = require("../config/tools");
const { AnthropicService } = require("../services/anthropicService");
const FileService = require("../services/fileService");
const dbService = require("../services/dbService");
const {
  handleCodeRefinementToolUse,
} = require("../tool-controllers/codeRefinementToolController");
const { getCurrentDate } = require("../utils/date");
const fileService = new FileService();

const MAX_VERSIONS = 2; // Maximum number of versions to keep

async function refineCode(
  shipId,
  shipSlug,
  message,
  userId,
  assets,
  assetInfo,
  aiReferenceFiles
) {
  console.log(
    `Starting code refinement for shipSlug using Claude: ${shipSlug}`
  );

  const client = new AnthropicService({ userId });
  const filePath = `${shipSlug}/index.html`;

  const currentCode = await readCurrentCode(filePath);
  const newVersion = await saveNewVersion(shipId, shipSlug, currentCode);
  await dbService.updateCurrentCodeVersion(shipId, newVersion);

  const conversation = await dbService.getCodeRefiningConversation(shipId);

  let messages = Array.isArray(conversation?.messages)
    ? conversation.messages
        .slice(-6) // context of last 6 messages (3 pairs of user/assistant messages)
        .map((msg) =>
          msg.role === "user" ? { role: msg.role, content: msg.content } : msg
        )
    : [];

  let dbMessages = conversation?.messages || [];

  const aiReferenceFilesCount = aiReferenceFiles?.length;
  console.log("assets received", assets.length);
  console.log("aiReferenceFiles received", aiReferenceFilesCount);

  const messagesToSaveInDB = [
    ...dbMessages,
    { role: "user", content: message, assetInfo: assetInfo },
  ];

  const systemPrompt = getSystemPrompt(assets, assetInfo, aiReferenceFiles);

  let userMessageContent = [
    {
      type: "text",
      text: `Current HTML code:\n${currentCode}\n\nUser request: ${message}`,
    },
  ];

  // Add aiReferenceFiles to the user message content only if there are any
  if (aiReferenceFilesCount > 0) {
    aiReferenceFiles.forEach((file, index) => {
      userMessageContent.push(
        {
          type: "text",
          text: `Reference Image ${index + 1}: ${
            file.description || "No description provided"
          }`,
        },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: file.type,
            data: file.base64,
          },
        }
      );
    });

    userMessageContent.push({
      type: "text",
      text: "Please consider these reference images when making the requested changes.",
    });
  }

  messages.push({ role: "user", content: userMessageContent });

  console.log(`Sending request to Anthropic API for code refinement`);
  const initialResponse = await client.sendMessage({
    system: systemPrompt,
    messages: messages,
    tools: [searchTool, placeholderImageTool],
    tool_choice: { type: "auto" },
  });
  console.log(`Received response from Anthropic API`, initialResponse);

  let currentMessage = initialResponse;
  messages.push({ role: currentMessage.role, content: currentMessage.content });

  let finalResponse = "";

  while (true) {
    console.log(
      "codeRefinement: API call Stop Reason:",
      currentMessage.stop_reason
    );

    if (currentMessage.stop_reason === "end_turn") {
      const textContent = currentMessage.content.find(
        (content) => content.type === "text"
      );
      if (textContent && textContent.text) {
        finalResponse = textContent.text;
        break;
      }
    } else if (currentMessage.stop_reason === "tool_use") {
      const toolUses = currentMessage.content.filter(
        (content) => content.type === "tool_use"
      );
      if (toolUses.length > 0) {
        const toolResults = [];
        for (const toolUse of toolUses) {
          const toolResult = await handleCodeRefinementToolUse({
            tool: toolUse,
            client,
          });
          console.log("Tool result received");
          toolResults.push(...toolResult);
        }
        messages.push({ role: "user", content: toolResults });
        console.log("Messages updated with tool results");
      }
      console.log("Sending request to Anthropic API...");
      currentMessage = await client.sendMessage({
        system: systemPrompt,
        messages: messages,
        tools: [searchTool, placeholderImageTool],
        tool_choice: { type: "auto" },
      });
      console.log("Received response from Anthropic API", currentMessage);

      messages.push({ role: "assistant", content: currentMessage.content });
      console.log("Messages updated with assistant response");
    }
  }

  const { updatedMessage, updatedCode } = extractUpdatedContent(finalResponse);

  await saveUpdatedCode(filePath, updatedCode);
  await updateShipVersion(shipId);

  messagesToSaveInDB.push({
    role: "assistant",
    content: [{ type: "text", text: updatedMessage }],
  });

  await dbService.upsertCodeRefiningConversation(
    shipId,
    userId,
    messagesToSaveInDB
  );

  console.log(`Code refinement process completed for shipId: ${shipId}`);

  return { updatedMessage, updatedCode };
}

async function readCurrentCode(filePath) {
  console.log(`Reading current code from ${filePath}`);
  const currentCode = await fileService.getFile(filePath);
  console.log(
    `Current code read successfully. Length: ${currentCode.length} characters`
  );
  return currentCode;
}

async function saveNewVersion(shipId, shipSlug, currentCode) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const versionFilePath = `${shipSlug}/versions/${shipSlug}-${timestamp}.html`;

  // Save the full current code
  await fileService.saveFile(versionFilePath, currentCode);
  const newVersion = await dbService.saveCodeVersion(shipId, versionFilePath);

  // Get all versions for this ship
  const allVersions = await dbService.getAllCodeVersions(shipId);

  // If we have more than MAX_VERSIONS, delete the oldest ones
  if (allVersions.length > MAX_VERSIONS) {
    const versionsToDelete = allVersions.slice(
      0,
      allVersions.length - MAX_VERSIONS
    );
    for (const version of versionsToDelete) {
      await dbService.deleteCodeVersion(shipId, version.version);
      await fileService.deleteFile(version.file_path);
    }
  }

  return newVersion;
}

function getSystemPrompt(assets, assetInfo, aiReferenceFiles) {
  const aiReferenceFilesCount = aiReferenceFiles?.length;

  let prompt = `
    Current date: ${getCurrentDate()}

    You are an AI assistant specialized in refining HTML code. Your task is to provide a COMPLETE, FULLY EXPANDED response with NO shortcuts or abbreviations.

    ABSOLUTELY FORBIDDEN PATTERNS (These will break the website):
    1. "[REST OF THE HTML REMAINS THE SAME]"
    2. "[Previous JavaScript code remains unchanged]"
    3. "[Previous code here]"
    4. "... existing code ..."
    5. "<!-- Rest of the code remains the same -->"
    6. "// Previous code continues"
    7. Any text inside square brackets []
    8. Any form of ellipsis (...)
    9. Any HTML or JavaScript comments indicating unchanged code
    10. Any placeholder text or shorthand notation
    11. "Rest of the HTML/CSS/JavaScript remains unchanged"
    12. Any variation of "code remains the same"

    MANDATORY RESPONSE RULES:
    1. You MUST write out EVERY SINGLE LINE of code, even if unchanged
    2. You MUST include ALL JavaScript functions in full
    3. You MUST include ALL CSS styles in full
    4. You MUST include ALL HTML elements in full
    5. You MUST maintain all existing functionality unless specifically asked to change it
    6. Your response MUST contain exactly two XML blocks:
       <explanation>Brief, non-technical explanation</explanation>
       <updated_code>Complete HTML document</updated_code>

    The <updated_code></updated_code> block MUST:
    1. Start with <!DOCTYPE html>
    2. End with </html></updated_code>
    3. Include EVERY SINGLE LINE of the original document
    4. Contain ALL JavaScript code, rewritten in full
    5. Contain ALL CSS styles, rewritten in full
    6. Contain ALL HTML elements, rewritten in full

    REMEMBER: NEVER use shortcuts. ALWAYS write out the entire code. If you see existing JavaScript functions, CSS styles, or HTML elements, you MUST include them in full in your response, even if they haven't changed.

    FORBIDDEN PATTERNS (These will break the website):
    1. "Previous JavaScript code remains unchanged"
    2. "... existing code ..."
    3. "<!-- Rest of the code remains the same -->"
    4. "[Previous code here]"
    5. Any form of placeholder or shorthand notation

    CRITICAL RULES:
    1. ALWAYS include the complete HTML document, including ALL:
       - HTML structure
       - JavaScript code (even if unchanged)
       - CSS styles
       - Content sections
    2. NEVER use comments or placeholders to indicate unchanged sections
    3. NEVER omit any part of the code, even if it hasn't changed
    4. The explanation should be brief and non-technical
    5. Keep existing functionality intact unless specifically requested to change it

    Example of the ONLY acceptable format:
    <explanation>
    Brief, non-technical explanation of changes
    </explanation>

    <updated_code>
    <!DOCTYPE html>
    <html>
    <head>
      <script>
      </script>
    </head>
    <body>
    [COMPLETE HTML DOCUMENT WITH ALL CODE]

    <script>
      // All JavaScript code must be included, even if unchanged
      function example() {
          console.log("Include all scripts");
      }
    </script>
    </body>
    </html></updated_code>
    `;

  if (assets.length > 0) {
    prompt += `\n\nUser Assets:
    The following assets have been provided by the user. You MUST incorporate these assets into the website as per their descriptions. This is a user requirement that should be fulfilled:

    ${assetInfo}

    ${assets
      .map(
        (asset) =>
          `- ${asset.fileName}: ${
            asset.comment || "No description provided"
          } (URL: ${asset.url})`
      )
      .join("\n    ")}

    When incorporating these assets:
    1. Use the provided URLs directly in the HTML code (e.g., in img src attributes).
    2. Place the assets in appropriate sections based on their descriptions.
    3. If an asset's purpose is not clear, use your best judgment to place it where it fits best in the context of the website.
    4. Ensure all assets are used in the HTML code.
    `;
  }

  if (aiReferenceFilesCount > 0) {
    prompt += `\n\nReference Images:
    The user has provided ${aiReferenceFilesCount} reference image${
      aiReferenceFilesCount > 1 ? "s" : ""
    } for this request. These images are intended to guide your changes. Please pay close attention to:
    1. The overall design style and elements shown in the reference images.
    2. Color schemes, layouts, and specific features highlighted in these images.
    3. Any text or annotations provided with the images.
    4. How these reference images relate to the user's specific request.

    Incorporate relevant aspects from these reference images into your code changes, ensuring they align with the user's request and the existing website structure.
    `;
  }

  prompt += `
    You have access to the following tools:
    1. **search_tool**: Use this to find relevant information for refining the code.
    2. **placeholder_image_tool**: Use this to find and update placeholder images in the code. You can also use this tool to find appropriate images, illustrations, or visual elements needed to complete user requests when specific images are required but not provided.

    IMPORTANT RULES FOR IMAGES:
    1. NEVER use hypothetical or placeholder URLs (e.g., "example.com/image.jpg" or "path/to/image.jpg")
    2. ALWAYS use the placeholder_image_tool to get actual, working image URLs
    3. Use Tailwind classes for responsive image handling:
       - Use 'w-full' for full-width responsive images
       - Add 'object-cover' or 'object-contain' as needed
       - Include 'aspect-ratio' classes when necessary
       - Always add meaningful 'alt' text for accessibility

    IMPORTANT: Only use these tools if absolutely necessary. If you have sufficient information to make the requested changes without using any tools, proceed directly with the code refinement. Do not use tools for routine updates or when the existing information is adequate.

     
    - Always include both opening and closing XML tags (<explanation></explanation> and <updated_code></updated_code>)
    - The explanation should be brief and non-technical
    - The updated_code section must contain ONLY the complete, properly formatted HTML document
    - Do not include any additional text, comments, explanations, or formatting outside of the XML tags
    - Do not include any text inside the <updated_code> </updated_code> tags, only the updated html code
    - Your entire response should consist of exactly two XML blocks: explanation and updated_code

    <updated_code>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Example Page</title>
    </head>
    <body>
    </body>
    </html>
    </updated_code> //this closing tag should always be present in your response, just after closing the html tag.

    Please ALWAYS close the <updated_code> </updated_code> tags, do not leave them open, if the closing tag is missing the response will be incomplete and the website will break. We need to avoid that.

    <explanation>
    A brief explanation of the changes made. (Do no get very technical, user may not be a developer. Just explain what you did in simple terms.)
    </explanation>

    The <updated_code> </updated_code> section must contain the full HTML document, fully formatted, incorporating all requested changes while preserving the original structure and content of unchanged parts. Ensure that all changes follow the requested updates and do not affect other aspects of the code unless instructed. Remember to include ALL code, even parts that haven't changed. Do not use any form of shorthand or placeholders to represent unchanged code.

    IMPORTANT:
    Please rewrite the whole code even if it is not changed, do not use any comments to indicate which parts are unchanged, this will break the website, we need to avoid that.
  `;

  return prompt;
}

function extractUpdatedContent(responseText) {
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

  return {
    updatedMessage: explanationMatch[1].trim(),
    updatedCode: codeMatch[1].trim(),
  };
}

async function saveUpdatedCode(filePath, updatedCode) {
  if (updatedCode) {
    console.log(`Saving updated code to ${filePath}`);
    await fileService.saveFile(filePath, updatedCode);
    console.log(`Updated code saved successfully`);
  } else {
    console.log(`No code updates to save`);
  }
}

async function updateShipVersion(shipId) {
  const currentVersion = await dbService.getCurrentCodeVersion(shipId);
  if (currentVersion) {
    const newVersion = currentVersion + 1;
    await dbService.updateCurrentCodeVersion(shipId, newVersion);
    console.log(`Updated current version for ship ${shipId} to ${newVersion}`);
  } else {
    console.error(`Failed to get latest version for ship ${shipId}`);
  }
}

async function undoCodeChange(shipId, shipSlug) {
  const currentVersion = await dbService.getCurrentCodeVersion(shipId);
  const allVersions = await dbService.getAllCodeVersions(shipId);

  console.log("allVersions", allVersions);
  console.log("currentVersion", currentVersion);

  if (allVersions.length < 1) {
    return { success: false, message: "No previous version available" };
  }

  // Find the latest version that's less than the current version
  const previousVersion = allVersions
    .filter((v) => v.version < currentVersion)
    .sort((a, b) => b.version - a.version)[0];

  if (!previousVersion) {
    return { success: false, message: "No previous version available" };
  }

  console.log("previousVersion", previousVersion);

  const filePath = `${shipSlug}/index.html`;

  // Check if the current version is not in our version history
  console.log(
    `Checking if current version ${currentVersion} is in version history`
  );
  const currentVersionInHistory = allVersions.find(
    (v) => v.version === currentVersion
  );
  console.log(
    `Current version in history: ${currentVersionInHistory ? "Yes" : "No"}`
  );
  if (!currentVersionInHistory) {
    console.log(
      `Current version ${currentVersion} not found in history. Creating backup.`
    );
    // Create a backup of the current version for potential redo
    const currentCode = await fileService.getFile(filePath);
    const newVersion = await saveNewVersion(shipId, shipSlug, currentCode);
    console.log(`Backup created with new version: ${newVersion}`);
  }

  const previousCode = await fileService.getFile(previousVersion.file_path);
  await fileService.saveFile(filePath, previousCode);

  // Update the current version in the database
  await dbService.updateCurrentCodeVersion(shipId, previousVersion.version);

  return {
    success: true,
    message: "Undo operation completed successfully",
    code: previousCode,
  };
}

async function redoCodeChange(shipId, shipSlug) {
  const currentVersion = await dbService.getCurrentCodeVersion(shipId);
  const allVersions = await dbService.getAllCodeVersions(shipId);

  if (currentVersion >= allVersions[allVersions.length - 1].version) {
    return { success: false, message: "No next version available" };
  }

  // Find the earliest version that's greater than the current version
  const nextVersion = allVersions
    .filter((v) => v.version > currentVersion)
    .sort((a, b) => a.version - b.version)[0];

  const filePath = `${shipSlug}/index.html`;
  const nextCode = await fileService.getFile(nextVersion.file_path);
  await fileService.saveFile(filePath, nextCode);

  // Update the current version in the database
  await dbService.updateCurrentCodeVersion(shipId, nextVersion.version);

  return {
    success: true,
    message: "Redo operation completed successfully",
    code: nextCode,
  };
}

module.exports = {
  refineCode,
  undoCodeChange,
  redoCodeChange,
};
