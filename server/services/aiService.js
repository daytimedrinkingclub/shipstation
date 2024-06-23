const Anthropic = require("@anthropic-ai/sdk");
const { getPrompt } = require("../config/prompts");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function aiAssistance(input, promptType) {
  console.log(
    "aiAssistance called with input & promptType:",
    input,
    promptType
  );
  const userData = {
    input,
  };

  try {
    const promptConfig = getPrompt(promptType);
    if (!promptConfig) {
      throw new Error(`Invalid prompt type: ${promptType}`);
    }

    const msg = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4000,
      temperature: 0,
      system: promptConfig,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: JSON.stringify(userData.input) }],
        },
      ],
    });
    console.log("Received response from Anthropic API:", msg);
    return msg.content[0].text;
  } catch (error) {
    console.error("Error in aiAssistance:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}

module.exports = {
  aiAssistance,
};
