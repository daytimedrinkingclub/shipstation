const { searchTool, placeholderImageTool } = require("../../config/tools");
const { getCurrentDate } = require("../../utils/date");

class AIService {
  constructor(client) {
    this.client = client;
  }

  async analyzeRequest(
    message,
    currentCode,
    { assets, assetInfo, aiReferenceFiles }
  ) {
    // Prepare message content similar to original implementation
    let userMessageContent = [
      {
        type: "text",
        text: `Current HTML code:\n${currentCode}\n\nUser request: ${message}`,
      },
    ];

    // Handle reference images like in original
    if (aiReferenceFiles?.length > 0) {
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
    }

    const messages = [{ role: "user", content: userMessageContent }];
    const systemPrompt = this.getSystemPrompt(
      assets,
      assetInfo,
      aiReferenceFiles
    );

    let finalResponse = "";

    // Initial request to AI
    console.log("Sending request to Anthropic API for code refinement");
    let currentMessage = await this.client.sendMessage({
      system: systemPrompt,
      messages: messages,
    });

    messages.push({
      role: currentMessage.role,
      content: currentMessage.content,
    });

    // Handle tool usage and responses similar to original implementation
    while (true) {
      console.log("AI call Stop Reason:", currentMessage.stop_reason);

      if (currentMessage.stop_reason === "end_turn") {
        const textContent = currentMessage.content.find(
          (content) => content.type === "text"
        );
        if (textContent?.text) {
          finalResponse = textContent.text;
          break;
        }
      } else if (currentMessage.stop_reason === "tool_use") {
        await this.handleToolUse(currentMessage, messages);
        currentMessage = await this.client.sendMessage({
          system: systemPrompt,
          messages: messages,
        });
        messages.push({ role: "assistant", content: currentMessage.content });
      }
    }

    const result = this.parseAIResponse(finalResponse);
    return result.modifications;
  }

  async handleToolUse(message, messages) {
    const toolUses = message.content.filter(
      (content) => content.type === "tool_use"
    );

    if (toolUses.length > 0) {
      const toolResults = [];
      for (const toolUse of toolUses) {
        const result = await handleCodeRefinementToolUse({
          tool: toolUse,
          client: this.client,
        });
        toolResults.push(...result);
      }
      messages.push({ role: "user", content: toolResults });
    }
  }

  parseAIResponse(response) {
    try {
      const { explanation, modifications } =
        this.extractUpdatedContent(response);

      console.log("*************************************");
      console.log("*   Parsed AI response:", { explanation, modifications });
      console.log("*************************************");

      // Validate the modifications array
      if (!Array.isArray(modifications)) {
        throw new Error("Invalid modifications format - expected array");
      }

      // Validate each modification object
      modifications.forEach((mod, index) => {
        if (!mod.type || !mod.selector) {
          throw new Error(
            `Invalid modification at index ${index} - missing required fields`
          );
        }

        // Validate modification type
        if (!["add", "update", "remove", "style"].includes(mod.type)) {
          throw new Error(
            `Invalid modification type at index ${index}: ${mod.type}`
          );
        }

        // Validate required fields based on type
        if (mod.type === "add" && (!mod.content || !mod.position)) {
          throw new Error(
            `Invalid add modification at index ${index} - missing content or position`
          );
        }

        if (mod.type === "update" && !mod.content) {
          throw new Error(
            `Invalid update modification at index ${index} - missing content`
          );
        }

        if (mod.type === "style" && !mod.attributes && !mod.content) {
          throw new Error(
            `Invalid style modification at index ${index} - missing attributes or content`
          );
        }
      });

      return {
        explanation,
        modifications,
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  extractUpdatedContent(responseText) {
    const explanationMatch = responseText.match(
      /<explanation>([\s\S]*?)<\/explanation>/
    );
    const modificationsMatch = responseText.match(
      /<modifications>([\s\S]*?)<\/modifications>/
    );

    if (!explanationMatch || !modificationsMatch) {
      throw new Error("Invalid response format - missing required XML blocks");
    }

    let modifications;
    try {
      modifications = JSON.parse(modificationsMatch[1]);
    } catch (error) {
      throw new Error("Failed to parse modifications JSON: " + error.message);
    }

    return {
      explanation: explanationMatch[1].trim(),
      modifications: modifications,
    };
  }

  getSystemPrompt(assets, assetInfo, aiReferenceFiles) {
    const aiReferenceFilesCount = aiReferenceFiles?.length || 0;

    let prompt = `
    Current date: ${getCurrentDate()}

    You are an AI assistant specialized in HTML refinement. Your task is to analyze user requests and provide structured modifications for HTML documents.

    RESPONSE FORMAT:
    Your response must contain exactly two XML blocks with valid, minified JSON:

    1. <explanation>
       Brief, non-technical explanation of changes
    </explanation>

    2. <modifications>
       [
         {
           "type": "add" | "update" | "remove" | "style",
           "selector": "CSS selector or section identifier",
           "content": "HTML content or styles to apply",
           "position": "before" | "after" | "replace" | "append" | "prepend" (optional),
           "attributes": { // optional but required for style modifications
             "class": "classes to add/remove",
             "id": "new id",
             ...other attributes
           }
         }
       ]
    </modifications>

    JSON FORMATTING RULES:
    1. Use double quotes for all JSON properties and string values
    2. No backticks, formatting, or line breaks in JSON content
    3. HTML content should be in a single line with proper escaping
    4. No trailing commas
    5. No comments within JSON

    EXAMPLE RESPONSES:

    Example 1 - Adding a new section:
    <explanation>
    Added a new team section with 4 team member cards below the about section
    </explanation>

    <modifications>
    [{"type":"add","selector":"section#about","position":"after","content":"<section id='team' class='py-12 bg-gray-50'><div class='container mx-auto'><h2>Our Team</h2></div></section>"}]
    </modifications>

    Example 2 - Updating styles:
    <explanation>
    Updated the header with new styling classes
    </explanation>

    <modifications>
    [{"type":"style","selector":"header","attributes":{"class":{"add":["sticky","top-0","bg-blue-600","z-50"],"remove":["bg-white"]}}}]
    </modifications>

    MODIFICATION TYPES:
    1. "add": Insert new HTML content
    2. "update": Modify existing content
    3. "remove": Delete elements
    4. "style": Modify element styling and attributes

    STYLE MODIFICATION RULES:
    1. Always use the "attributes" field for style modifications
    2. For styling changes, use Tailwind classes through the "class" object
    3. The "class" object must contain:
       - "add": array of classes to add
       - "remove": array of classes to remove
    4. Example structure:
       {
         "type": "style",
         "selector": "CSS selector",
         "attributes": {
           "class": {
             "add": ["class-to-add-1", "class-to-add-2"],
             "remove": ["class-to-remove"]
           }
         }
       }
    5. Use Tailwind classes for all styling changes
    6. Ensure selectors are specific and exist in the document

    RULES:
    1. Use precise CSS selectors or IDs
    2. Provide complete HTML snippets for new content
    3. Maintain existing functionality unless specifically asked to change
    4. Ensure responsive design using Tailwind classes
    5. Keep modifications atomic and targeted`;

    // Add asset handling
    if (assets?.length > 0) {
      prompt += `\n\nAVAILABLE ASSETS:
        ${assetInfo}

        ${assets
          .map(
            (asset) =>
              `- ${asset.fileName}: ${
                asset.comment || "No description provided"
              } (URL: ${asset.url})`
          )
          .join("\n        ")}

        Asset Usage Rules:
        1. Use provided URLs directly in img src attributes
        2. Place assets in contextually appropriate sections
        3. Ensure responsive image handling with Tailwind classes
        `;
    }

    // Add reference image
    if (aiReferenceFilesCount > 0) {
      prompt += `\n\nREFERENCE IMAGES:
        ${aiReferenceFilesCount} reference image(s) provided. Consider:
        1. Design style and elements
        2. Color schemes and layouts
        3. Specific features highlighted
        4. Relationship to requested changes`;
    }

    return prompt;
  }
}

module.exports = AIService;
