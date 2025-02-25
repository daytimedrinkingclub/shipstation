const Anthropic = require("@anthropic-ai/sdk");
const { insertConversation } = require("./dbService");
require("dotenv").config();

async function validateKey(key) {
  const testClient = new Anthropic({
    apiKey: key,
  });
  try {
    await testClient.messages.create({
      model: process.env.DEFAULT_MODEL,
      max_tokens: 10,
      temperature: 0,
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("Anthropic API key validated successfully");
    return true;
  } catch (error) {
    console.error("Error validating Anthropic API key:", error);
    return false;
  }
}

class AnthropicService {
  constructor({
    userId,
    apiKey,
    tokensUsed = 0,
    model = process.env.DEFAULT_MODEL,
    temperature = 0,
    maxTokens = 8192,
  }) {
    this.isCustomKey = !!apiKey;
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      baseURL: "https://anthropic.helicone.ai",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        "Helicone-Cache-Enabled": "true",
      },
    });
    this.apiKey = apiKey;
    this.tokensUsed = tokensUsed;
    this.userId = userId;
    this.conversationId;
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : maxTokens;
    this.startTimestamp = Date.now();
    this.abortController = new AbortController();
  }

  async sendMessage({ system, tools = [], tool_choice, messages = [] }) {
    if (messages.length < 1) {
      throw new Error("No messages provided");
    }
    const clientParams = {
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      messages,
      tools,
    };
    if (tool_choice) {
      clientParams.tool_choice = tool_choice;
    }
    if (system) {
      clientParams.system = system;
    }
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await this.client.messages.create(clientParams, {
          headers: {
            "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
          },
        });
        this.tokensUsed += response.usage.output_tokens;

        if (!this.conversationId) {
          const conversation = await insertConversation({
            user_id: this.userId,
            tokens_used: this.tokensUsed,
          });
          this.conversationId = conversation.id;
        }

        return response;
      } catch (error) {
        console.log(
          `Error in anthropicService.sendMessage (attempt ${retries + 1}):`,
          error
        );
        if (error.name === "AbortError") {
          console.log("Request aborted");
          throw new DOMException("Aborted", "AbortError");
        }
        if (error.status === 500 && retries < maxRetries - 1) {
          retries++;
          console.log(`Retrying request (attempt ${retries + 1})...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        } else {
          throw error;
        }
      }
    }
  }

  abortRequest() {
    this.abortController.abort();
    console.log("Request aborted");
  }

  static validateKey(key) {
    return validateKey(key);
  }
}

module.exports = { AnthropicService };
