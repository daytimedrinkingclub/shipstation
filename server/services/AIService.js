const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");

const Providers = {
  ANTHROPIC: "anthropic",
  OPEN_AI: "openai",
};

class AIService {
  constructor({
    provider,
    apiKey,
    userId,
    tokensUsed = 0,
    model,
    temperature = 0,
    maxTokens = 4000,
  }) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.userId = userId;
    this.tokensUsed = tokensUsed;
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
    this.client = this.initializeClient();
  }

  initializeClient() {
    switch (this.provider) {
      case Providers.ANTHROPIC:
        return new Anthropic({ apiKey: this.apiKey });
      case Providers.OPEN_AI:
        return new OpenAI({ apiKey: this.apiKey });
      default:
        throw new Error("Unsupported AI provider");
    }
  }

  async sendMessage({ system, tools = [], tool_choice, messages = [] }) {
    if (messages.length < 1) {
      throw new Error("No messages provided");
    }

    const clientParams = this.getClientParams(
      system,
      tools,
      tool_choice,
      messages
    );

    try {
      let response;
      switch (this.provider) {
        case Providers.ANTHROPIC:
          response = await this.client.messages.create(clientParams, {
            headers: { "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15" },
          });
          break;
        case Providers.OPEN_AI:
          response = await this.client.chat.completions.create(clientParams);
          break;
      }

      this.updateTokensUsed(response);
      return this.formatResponse(response);
    } catch (error) {
      console.error("Error in AIService:", error);
      throw error;
    }
  }

  getClientParams(system, tools, tool_choice, messages) {
    const baseParams = {
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      messages,
    };

    if (this.provider === Providers.ANTHROPIC) {
      if (system) baseParams.system = system;
      if (tools.length > 0) baseParams.tools = tools;
      if (tool_choice) baseParams.tool_choice = tool_choice;
    } else if (this.provider === Providers.OPEN_AI) {
      if (system) {
        baseParams.messages.unshift({ role: "system", content: system });
      }
      if (tools.length > 0) baseParams.functions = tools;
      if (tool_choice) baseParams.function_call = tool_choice;
    }

    return baseParams;
  }

  updateTokensUsed(response) {
    if (this.provider === Providers.ANTHROPIC) {
      this.tokensUsed += response.usage.output_tokens;
    } else if (this.provider === Providers.OPEN_AI) {
      this.tokensUsed += response.usage.total_tokens;
    }
  }

  formatResponse(response) {
    if (this.provider === Providers.ANTHROPIC) {
      return response;
    } else if (this.provider === Providers.OPEN_AI) {
      return {
        content: response.choices[0].message.content,
        role: response.choices[0].message.role,
        stop_reason: response.choices[0].finish_reason,
        usage: response.usage,
      };
    }
  }

  static async validateKey(provider, key) {
    const testService = new AIService({
      provider,
      apiKey: key,
      model:
        provider === Providers.ANTHROPIC ? "claude-3-opus-20240229" : "gpt-4",
    });

    try {
      await testService.sendMessage({
        messages: [{ role: "user", content: "Hello" }],
      });
      console.log(`${provider} API key validated successfully`);
      return true;
    } catch (error) {
      console.error(`Error validating ${provider} API key:`, error);
      return false;
    }
  }
}

module.exports = { AIService, Providers };
