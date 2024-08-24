const axios = require("axios");
const fs = require("fs");
const { AnthropicService } = require("./anthropicService");
require("dotenv").config();

async function analyzeImages(imageUrls, analysisPrompt) {
  try {
    let imageDataArray = [];

    for (const imageUrl of imageUrls) {
      let imageData;
      // if Image URL is an URL
      if (imageUrl.startsWith("http")) {
        // Fetch image data from the web
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        imageData = Buffer.from(response.data, "binary").toString("base64");
      }
      // if Image URL is a local file path
      else {
        // Read image data from local file
        imageData = fs.readFileSync(imageUrl, { encoding: "base64" });
      }
      imageDataArray.push(imageData);
    }

    const anthropicService = new AnthropicService();

    const response = await anthropicService.sendMessage([
      {
        role: "user",
        content: `Analyze the given images and provide a structured response as per the instructions given below: ${analysisPrompt}`,
      },
      {
        role: "user",
        content: imageDataArray.map((imageData) => ({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: imageData,
          },
        })),
      },
    ]);

    console.log("Analysis response:", response);

    return {
      analysis: response.content[0].text,
    };
  } catch (error) {
    console.error("Error analyzing images:", error);
    throw error;
  }
}

module.exports = {
  analyzeImages,
};
