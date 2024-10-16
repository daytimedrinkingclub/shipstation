const axios = require("axios");
const FileService = require("./fileService");

class ScreenshotService {
  constructor() {
    this.fileService = new FileService();
  }

  async generateScreenshot(url) {
    try {
      const response = await axios.post(
        `${process.env.BROWSERLESS_API_URL}/screenshot?token=${process.env.BROWSERLESS_API_TOKEN}`,
        {
          url: url,
          options: {
            type: "png",
          },
          waitForTimeout: 6000, // Wait for 6000 milliseconds (6 seconds)
        },
        {
          responseType: "arraybuffer",
          headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error generating screenshot:", error);
      throw error;
    }
  }

  async saveScreenshot(shipId) {
    try {
      const url = `https://shipstation.ai/site/${shipId}`;
      const screenshotBuffer = await this.generateScreenshot(url);

      const fileName = `screenshot.png`;
      const filePath = `${shipId}/${fileName}`;

      await this.fileService.saveFile(filePath, screenshotBuffer);

      return filePath;
    } catch (error) {
      console.error("Error saving screenshot:", error);
      throw error;
    }
  }
}

module.exports = ScreenshotService;
