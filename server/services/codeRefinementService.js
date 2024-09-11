const { AnthropicService } = require("./anthropicService");
const FileService = require("./fileService");
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

  const systemPrompt = `You are an AI assistant specialized in refining HTML code. Analyze the current HTML code and the user's request, then make precise changes to fulfill the request. Maintain the overall structure and style unless specifically asked to change it. Ensure your modifications don't break existing functionality or layout. If the request is unclear or could cause issues, ask for clarification.

Your response should be structured using XML tags as follows:
<explanation>
A brief explanation of the changes made.
</explanation>

<updated_code>
The complete updated HTML code.
</updated_code>

Ensure that the HTML code within the <updated_code> tags is properly formatted and indented.`;

  const userMessage = `Current HTML code:\n${currentCode}\n\nUser request: ${message}`;

  console.log(`Sending request to Anthropic API for code refinement`);
  const response = await client.sendMessage({
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  console.log(`Received response from Anthropic API`);

  const responseText = response.content[0].text;
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

  console.log(`Explanation length: ${updatedMessage.length} characters`);
  console.log(`Updated code length: ${updatedCode.length} characters`);

  if (updatedCode) {
    console.log(`Saving updated code to ${filePath}`);
    await fileService.saveFile(filePath, updatedCode);
    console.log(`Updated code saved successfully`);
  } else {
    console.log(`No code updates to save`);
  }

  console.log(`Code refinement process completed for shipId: ${shipId}`);

  return {
    updatedMessage,
    updatedCode,
  };
}

module.exports = {
  refineCode,
};
