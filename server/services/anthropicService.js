const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

let currentClient = null;
let currentKey = process.env.ANTHROPIC_API_KEY;

function getAnthropicClient() {
  if (!currentClient) {
    console.log("Creating Anthropic client with env key");
    currentClient = new Anthropic({ apiKey: currentKey });
  }
  return currentClient;
}

function updateAnthropicKey(newKey) {
  if (newKey !== currentKey) {
    currentKey = newKey;
    currentClient = new Anthropic({ apiKey: currentKey });
    console.log("Updated Anthropic client with new key:");
  }
}

async function validateAnthropicKey(key) {
  const testClient = new Anthropic({ apiKey: key });
  try {
    // Attempt to create a simple message to validate the key
    await testClient.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 10,
      temperature: 0,
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("Anthropic API key validated successfully");
    return true; // Key is valid
  } catch (error) {
    console.error("Error validating Anthropic API key:", error);
    return false; // Key is invalid
  }
}

module.exports = {
  getAnthropicClient,
  updateAnthropicKey,
  validateAnthropicKey,
};
