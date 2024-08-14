const { AIService, Providers } = require("./AIService");
const { insertConversation } = require("./dbService");
require("dotenv").config();

class AnthropicService extends AIService {
  constructor({
    userId,
    apiKey,
    tokensUsed = 0,
    model = process.env.DEFAULT_MODEL,
    temperature = 0,
    maxTokens = 4000,
  }) {
    super({
      provider: Providers.ANTHROPIC,
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      userId,
      tokensUsed,
      model,
      temperature,
      maxTokens,
    });
    this.isCustomKey = !!apiKey;
    this.conversationId = null;
    this.startTimestamp = Date.now();
    this.abortController = new AbortController();
  }

  async sendMessage(params) {
    const response = await super.sendMessage(params);

    if (!this.conversationId) {
      const conversation = await insertConversation({
        user_id: this.userId,
        tokens_used: this.tokensUsed,
      });
      this.conversationId = conversation.id;
      console.log("inserted conversation: ", this.conversationId);
    }

    return response;
  }

  abortRequest() {
    this.abortController.abort();
    console.log("Request aborted");
  }

  static validateKey(key) {
    return AIService.validateKey(Providers.ANTHROPIC, key);
  }
}

module.exports = { AnthropicService };
