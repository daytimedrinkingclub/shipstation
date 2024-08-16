const Anthropic = require("@anthropic-ai/sdk");
const { insertConversation, updateConversation } = require("./dbService");
require("dotenv").config();

async function validateKey(key) {
  const testClient = new Anthropic({ apiKey: key });
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
    maxTokens = 4000,
  }) {
    this.isCustomKey = !!apiKey;
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.apiKey = apiKey;
    this.tokensUsed = tokensUsed;
    this.userId = userId;
    this.conversationId;
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
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
    console.log("Calling anthropic with payload:");
    try {
      const response = await this.client.messages.create(clientParams, {
        headers: { "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15" },
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
      if (error.name === "AbortError") {
        console.log("Request aborted");
        throw new DOMException("Aborted", "AbortError");
      }
      throw error;
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
