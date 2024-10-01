const { searchTool } = require("../config/tools");
const { AnthropicService } = require("../services/anthropicService");
const {
  handleSiteContentToolUse,
} = require("../controllers/siteContentToolController");
const { getCurrentDate } = require("../utils/date");

async function generateSiteContent(userId, prompt, type, portfolioType = null) {
  console.log(`Starting content generation, type: ${type}`);

  const client = new AnthropicService({ userId });

  const systemPrompt = getSystemPrompt(type, portfolioType);
  const userMessage = `Generate website content based on the following prompt: ${prompt}`;

  const messages = [{ role: "user", content: userMessage }];

  console.log(`Sending request to Anthropic API for content generation`);
  const initialResponse = await client.sendMessage({
    system: systemPrompt,
    messages: messages,
    tools: [searchTool],
  });
  console.log(`Received response from Anthropic API`);

  let currentMessage = initialResponse;
  messages.push({ role: currentMessage.role, content: currentMessage.content });

  let finalResponse = "";

  while (true) {
    console.log(
      "siteContent: API call Stop Reason:",
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
          const toolResult = await handleSiteContentToolUse({
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
        tools: [searchTool],
        tool_choice: { type: "auto" },
      });
      console.log("Received response from Anthropic API", currentMessage);

      messages.push({ role: "assistant", content: currentMessage.content });
      console.log("Messages updated with assistant response");
    }
  }

  const sections = extractSections(finalResponse);
  const socials = extractSocials(finalResponse);

  // Add isOpen property to each section
  const sectionsWithIsOpen = sections.map((section, index) => ({
    id: (index + 1).toString(),
    title: section.title || "",
    content: section.content || "",
    isOpen: true,
  }));

  console.log(`Content generation completed for user: ${userId}`);

  return { sections: sectionsWithIsOpen, socials: socials };
}

function getSystemPrompt(type, portfolioType) {
  let prompt = `
    Current Date: ${getCurrentDate()}

    You are an AI assistant specialized in generating website content. Based on the user's prompt and the specified type of website, create appropriate content sections.

     Important rules:
    1. Generate content in sections, each with a title and content.
    2. Each section should be substantial and relevant to the website type.
    3. Use a tone and style appropriate for the website type.
    4. Ensure the content is engaging, informative, and well-structured.
    5. Do not include any placeholder text or comments.
    6. Enclose your JSON output within <sections></sections> XML tags.

    Website Type: ${type}
  `;

  if (type === "portfolio" && portfolioType) {
    prompt += `\nPortfolio Type: ${portfolioType}
    Tailor the content specifically for a ${portfolioType} portfolio.`;
  }

  prompt += `
    Your response must be a JSON array of objects enclosed in <sections></sections> tags, like this:

    <sections>
    [
      {
        "title": "Section Title",
        "content": "Section content goes here. This can be multiple paragraphs or lines."
      },
      // More sections as needed
    ]
    </sections>

    Generate at least 3-5 sections, or more if appropriate for the website type and user prompt.
    Ensure the JSON within the tags is valid and can be parsed directly.
    You may include brief comments before and after the <sections> tags if necessary, but the content within the tags must be valid JSON.

    Additionally, provide an array of social media links under <socials> tags. You can either fetch these links using the search_tool or generate placeholder links. The format should be:

    <socials>
    [
      "https://facebook.com/yourprofile",
      "https://twitter.com/yourprofile",
      "https://instagram.com/yourprofile"
    ]
    </socials>
  `;

  return prompt;
}

function extractSections(text) {
  try {
    const regex = /<sections>([\s\S]*?)<\/sections>/g;
    const match = regex.exec(text);
    if (match && match[1]) {
      const jsonContent = match[1].trim();
      return JSON.parse(jsonContent);
    }
    return null;
  } catch (e) {
    console.error(`Failed to parse JSON for sections:`, e);
    return null;
  }
}

function extractSocials(text) {
  try {
    const regex = /<socials>([\s\S]*?)<\/socials>/g;
    const match = regex.exec(text);
    if (match && match[1]) {
      const jsonContent = match[1].trim();
      return JSON.parse(jsonContent);
    }
    return null;
  } catch (e) {
    console.error(`Failed to parse JSON for socials:`, e);
    return null;
  }
}

module.exports = {
  generateSiteContent,
};