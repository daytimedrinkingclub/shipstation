const { chromium } = require("playwright-core");
const { AnthropicService } = require("./anthropicService");
const FileService = require("./fileService");
const {
  analysisPrompt,
  prepareRepairPrompt,
} = require("./prompts/analyzeAndRepairPrompt");
const {
  placeholderImageTool,
  searchTool,
  headshotTool,
} = require("../config/tools");
const {
  handleCodeRefinementToolUse,
} = require("../controllers/codeRefinementToolController");
const sharp = require("sharp");

class AnalyzeAndRepairService {
  constructor() {
    this.fileService = new FileService();
    this.anthropicService = new AnthropicService({});
  }

  async analyzeAndRepairSite(shipId) {
    const startTime = Date.now();
    const url = `${process.env.MAIN_URL}/site/${shipId}`;
    console.log(`Analyzing website: ${url}`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      console.log("Navigating to the page...");
      const navigationStart = Date.now();
      await page.goto(url, { waitUntil: "networkidle" });
      console.log(
        `Navigation completed in ${(Date.now() - navigationStart) / 1000}s`
      );

      // Take desktop and mobile screenshots
      const { desktopScreenshot, mobileScreenshot } =
        await this.takeScreenshots(page);

      // Send screenshots to Anthropic for analysis
      console.log("Sending screenshots to Anthropic for analysis...");
      const analysisStart = Date.now();

      const images = this.prepareImages(desktopScreenshot, mobileScreenshot);
      const analysisResult = await this.performAnalysis(images);

      const analysisResultParsed = JSON.parse(analysisResult.content[0].text);
      console.log("Analysis result:", analysisResultParsed);

      let repairResult = null;
      if (analysisResultParsed.repairRequired) {
        console.log("Repairs required. Initiating repair process...");
        repairResult = await this.repairWebsite(
          shipId,
          analysisResultParsed,
          images
        );
      } else {
        console.log("No repairs required.");
      }

      const totalTime = (Date.now() - startTime) / 1000;
      console.log(`Total analyze and repair time: ${totalTime.toFixed(2)}s`);

      return {
        analysisResult: analysisResultParsed,
        repairResult,
        totalTime,
      };
    } catch (error) {
      console.error("Error during website analysis and repair:", error);
      throw error;
    } finally {
      await browser.close();
      console.log("Browser closed.");
    }
  }

  async takeScreenshots(page) {
    // Take desktop screenshot
    console.log("Taking desktop screenshot...");
    const desktopStart = Date.now();
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopScreenshot = await page.screenshot({
      fullPage: true,
      type: "png",
    });
    console.log(
      `Desktop screenshot taken in ${(Date.now() - desktopStart) / 1000}s`
    );

    // Take mobile screenshot
    console.log("Taking mobile screenshot...");
    const mobileStart = Date.now();
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileScreenshot = await page.screenshot({
      fullPage: true,
      type: "png",
    });
    console.log(
      `Mobile screenshot taken in ${(Date.now() - mobileStart) / 1000}s`
    );

    // Compress screenshots, anthropic has a limit of 5mb per image
    const compressedDesktopScreenshot = await this.compressImage(
      desktopScreenshot
    );
    const compressedMobileScreenshot = await this.compressImage(
      mobileScreenshot
    );

    return {
      desktopScreenshot: compressedDesktopScreenshot,
      mobileScreenshot: compressedMobileScreenshot,
    };
  }

  async compressImage(imageBuffer) {
    try {
      const compressedImage = await sharp(imageBuffer)
        .resize(1280, null, { withoutEnlargement: true }) // Resize to max width of 1280px
        .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
        .toBuffer();

      console.log(
        `Image compressed from ${imageBuffer.length} to ${compressedImage.length} bytes`
      );
      return compressedImage;
    } catch (error) {
      console.error("Error compressing image:", error);
      return imageBuffer; // Return original image if compression fails
    }
  }

  prepareImages(desktopScreenshot, mobileScreenshot) {
    return [
      {
        caption: "Desktop view",
        base64: desktopScreenshot.toString("base64"),
        mediaType: "image/jpeg",
      },
      {
        caption: "Mobile view",
        base64: mobileScreenshot.toString("base64"),
        mediaType: "image/jpeg",
      },
    ];
  }

  async performAnalysis(images) {
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
            data: img.base64,
          },
        }
      );
    });

    content.push({
      type: "text",
      text: "Please analyze these screenshots based on the given instructions.",
    });

    const messages = [
      {
        role: "user",
        content: content,
      },
    ];

    return await this.anthropicService.sendMessage({
      system: analysisPrompt,
      messages: messages,
    });
  }

  async repairWebsite(shipId, analysisResult, images) {
    console.log("Repairing website for shipId:", shipId);
    const repairStartTime = Date.now();

    try {
      const filePath = `${shipId}/index.html`;
      const currentHtml = await this.fileService.getFile(filePath);

      // Use the prepareRepairPrompt function from analyzeAndRepairPrompt.js
      const repairPromptContent = prepareRepairPrompt(
        analysisResult,
        currentHtml
      );

      let content = [
        {
          type: "text",
          text: repairPromptContent,
        },
      ];

      // Add images to the repair prompt
      images.forEach((img) => {
        content.push(
          {
            type: "text",
            text: `Image: ${img.caption}`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: img.mediaType,
              data: img.base64,
            },
          }
        );
      });

      let messages = [
        {
          role: "user",
          content: content,
        },
      ];

      const anthropicStartTime = Date.now();
      let finalResponse;

      console.log("Sending initial request to Anthropic API...");
      const initialResponse = await this.anthropicService.sendMessage({
        messages: messages,
        tools: [searchTool, placeholderImageTool, headshotTool],
        tool_choice: { type: "auto" },
      });
      console.log(
        "Received initial response from Anthropic API",
        initialResponse
      );

      let currentMessage = initialResponse;
      messages.push({
        role: currentMessage.role,
        content: currentMessage.content,
      });

      while (true) {
        console.log(
          "codeRefinement: API call Stop Reason:",
          currentMessage.stop_reason
        );

        if (currentMessage.stop_reason === "end_turn") {
          const textContent = currentMessage.content.find(
            (content) => content.type === "text"
          );
          if (textContent && textContent.text) {
            finalResponse = textContent.text;
            break;
          }
        } else if (currentMessage.stop_reason === "tool_use") {
          const toolUses = currentMessage.content.filter(
            (content) => content.type === "tool_use"
          );
          if (toolUses.length > 0) {
            const toolResults = [];
            for (const toolUse of toolUses) {
              const toolResult = await handleCodeRefinementToolUse({
                tool: toolUse,
                client: this.anthropicService,
              });
              console.log("Tool result received");
              toolResults.push(...toolResult);
            }
            messages.push({ role: "user", content: toolResults });
            console.log("Messages updated with tool results");
          }
          console.log("Sending request to Anthropic API...");
          currentMessage = await this.anthropicService.sendMessage({
            messages: messages,
            tools: [searchTool, placeholderImageTool, headshotTool],
            tool_choice: { type: "auto" },
          });
          console.log("Received response from Anthropic API", currentMessage);

          messages.push({
            role: currentMessage.role,
            content: currentMessage.content,
          });
          console.log("Messages updated with assistant response");
        }
      }

      const anthropicTime = (Date.now() - anthropicStartTime) / 1000;
      console.log(
        `Anthropic repair generation time: ${anthropicTime.toFixed(2)}s`
      );

      // Extract the repaired HTML from the response
      const repairedHtmlMatch = finalResponse.match(
        /<repaired_code>([\s\S]*?)<\/repaired_code>/
      );
      const repairedHtml = repairedHtmlMatch
        ? repairedHtmlMatch[1].trim()
        : null;

      if (!repairedHtml) {
        throw new Error("Failed to extract repaired HTML from the response");
      }

      // Save the repaired HTML using saveFile function
      await this.fileService.saveFile(filePath, repairedHtml);

      const totalRepairTime = (Date.now() - repairStartTime) / 1000;
      console.log(`Total repair time: ${totalRepairTime.toFixed(2)}s`);

      return {
        repaired: true,
        message: "Website repaired successfully",
        anthropicTime,
        totalRepairTime,
        issuesSummary: analysisResult.issues.map((issue) => ({
          description: issue.description,
          affectedView: issue.affectedView,
        })),
      };
    } catch (error) {
      console.error("Error repairing website:", error);
      return {
        repaired: false,
        message: "Failed to repair website",
        error: error.message,
      };
    }
  }
}

module.exports = AnalyzeAndRepairService;
