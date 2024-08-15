const axios = require("axios");
const fs = require("fs");
const { AnthropicService } = require("./anthropicService");
require("dotenv").config();

async function analyzeImage(imageUrl, analysisPrompt) {
  try {
    let imageData;
    if (imageUrl.startsWith("http")) {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      imageData = Buffer.from(response.data, "binary").toString("base64");
    } else {
      imageData = fs.readFileSync(imageUrl, { encoding: "base64" });
    }

    const anthropicService = new AnthropicService();

    const response = await anthropicService.sendMessage([
      {
        role: "user",
        content: `Analyze this image and provide a structured response. ${analysisPrompt}`,
      },
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageData,
            },
          },
        ],
      },
    ]);

    console.log("Analysis response:", response);

    return {
      analysis: response.content[0].text,
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}

module.exports = {
  analyzeImage,
};
