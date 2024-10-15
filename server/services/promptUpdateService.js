const { AnthropicService } = require("./anthropicService");
const { updateShipPrompt, getShipPrompt } = require("./dbService");

async function summarizeDesignChanges(messages, currentPrompt, userId) {
  const client = new AnthropicService({ userId });

  const prompt = `Given the current design prompt:

${currentPrompt || "No existing prompt"}

Summarize the new design changes requested in the following conversation. Focus only on design elements and ignore any other requests. Provide a concise summary that can be used to recreate the design changes. Include specific details about colors, layouts, fonts, or any other visual elements that were modified. Integrate these new changes with the existing design prompt.

Your response should ONLY contain the updated design summary enclosed in <design_summary> XML tags. Do not include any additional explanations or text outside of these tags.

Here's the conversation:

${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

  const response = await client.sendMessage({
    messages: [{ role: "user", content: prompt }],
  });

  // Extract the content between the XML tags
  const summaryMatch = response.content[0].text.match(
    /<design_summary>([\s\S]*?)<\/design_summary>/
  );
  return summaryMatch ? summaryMatch[1].trim() : response.content[0].text;
}

async function updatePrompt(shipId, userId, chatMessages) {
  try {
    const currentPrompt = await getShipPrompt(shipId);

    const updatedPrompt = await summarizeDesignChanges(
      chatMessages,
      currentPrompt,
      userId
    );

    await updateShipPrompt(shipId, updatedPrompt);

    console.log(`Updated prompt for ship ${shipId}`);
  } catch (error) {
    console.error("Error updating prompt:", error);
  }
}

module.exports = {
  updatePrompt,
};
