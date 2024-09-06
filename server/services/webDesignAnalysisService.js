const {
  landingAnalysisPrompt,
  portfolioAnalysisPrompt,
  emailTemplateAnalysisPrompt,
} = require("./prompts/analyzeWebDesignPrompt");

const { SHIP_TYPES } = require("./constants");

require("dotenv").config();

class WebDesignAnalysisService {
  constructor(client) {
    this.client = client;
  }

  async analyzeWebDesign(images, shipType) {
    try {
      console.log(`Processing ${images.length} images for analysis`);

      let analysisSystemPrompt;
      switch (shipType) {
        case SHIP_TYPES.LANDING_PAGE:
          analysisSystemPrompt = landingAnalysisPrompt;
          break;
        case SHIP_TYPES.PORTFOLIO:
          analysisSystemPrompt = portfolioAnalysisPrompt;
          break;
        case SHIP_TYPES.EMAIL_TEMPLATE:
          analysisSystemPrompt = emailTemplateAnalysisPrompt;
          break;
        default:
          throw new Error(`Unsupported ship type: ${shipType}`);
      }

      let content = [];

      images.forEach((img, index) => {
        content.push(
          {
            type: "text",
            text: `Image ${index + 1}: ${img.caption}`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: img.mediaType,
              data: img.file,
            },
          }
        );
      });

      content.push({
        type: "text",
        text: "Please analyze these images based on the given instructions.",
      });

      const messages = [
        {
          role: "user",
          content: content,
        },
      ];

      const response = await this.client.sendMessage({
        system: analysisSystemPrompt,
        messages: messages,
      });

      console.log("Analysis response:", response);

      return {
        analysis: response.content[0].text,
      };
    } catch (error) {
      console.error("Error analyzing web design:", error);
      throw error;
    }
  }
}

module.exports = {
  WebDesignAnalysisService,
};
