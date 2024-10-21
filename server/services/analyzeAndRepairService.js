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
} = require("../tool-controllers/codeRefinementToolController");
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

// You can set this to true to save the screenshots locally for debugging/testing.
const SAVE_LOCAL_SCREENSHOTS = false;

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

      const screenshots = await this.takeScreenshots(page, shipId);

      // Send screenshots to Anthropic for analysis
      console.log("Sending screenshots to Anthropic for analysis...");
      const analysisStart = Date.now();

      const analysisResult = await this.performAnalysis(screenshots);
      console.log("Analysis result:", analysisResult);

      let repairResult = null;
      if (analysisResult.repairRequired) {
        console.log("Repairs required. Initiating repair process...");
        repairResult = await this.repairWebsite(
          shipId,
          analysisResult,
          screenshots
        );
      } else {
        console.log("No repairs required.");
      }

      const totalTime = (Date.now() - startTime) / 1000;
      console.log(`Total analyze and repair time: ${totalTime.toFixed(2)}s`);

      return {
        analysisResult: analysisResult,
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

  async takeScreenshots(page, shipId) {
    const screenshots = {};
    const screenshotDir = path.join(
      __dirname,
      "..",
      "..",
      "screenshots",
      shipId
    );

    // Ensure the screenshot directory exists
    await fs.mkdir(screenshotDir, { recursive: true });

    // Take full page screenshots
    console.log("Taking full page screenshots...");
    screenshots.desktop = await this.takeFullPageScreenshot(
      page,
      1920,
      1080,
      "Desktop",
      screenshotDir
    );
    screenshots.mobile = await this.takeFullPageScreenshot(
      page,
      390,
      844,
      "Mobile",
      screenshotDir
    );

    // Take screenshots of semantic sections for both desktop and mobile
    const semanticTags = [
      "header",
      "main",
      "footer",
      "section",
      "nav",
      "article",
    ];

    // Desktop element screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });
    await this.takeElementScreenshots(
      page,
      semanticTags,
      screenshots,
      "desktop",
      screenshotDir
    );

    // Prioritize main content section screenshots for desktop
    const desktopMain = await page.$("main");
    if (desktopMain) {
      screenshots.desktop_main_priority = await this.takeElementScreenshot(
        page,
        desktopMain,
        "desktop_main_priority",
        screenshotDir
      );
    }

    // Mobile element screenshots
    await page.setViewportSize({ width: 390, height: 844 });
    await this.takeElementScreenshots(
      page,
      semanticTags,
      screenshots,
      "mobile",
      screenshotDir
    );

    // Prioritize main content section screenshots for mobile
    const mobileMain = await page.$("main");
    if (mobileMain) {
      screenshots.mobile_main_priority = await this.takeElementScreenshot(
        page,
        mobileMain,
        "mobile_main_priority",
        screenshotDir
      );
    }

    return screenshots;
  }

  async takeElementScreenshots(
    page,
    semanticTags,
    screenshots,
    viewportType,
    screenshotDir
  ) {
    for (const tag of semanticTags) {
      const elements = await page.$$(tag);
      for (let i = 0; i < elements.length; i++) {
        const elementScreenshot = await this.takeElementScreenshot(
          page,
          elements[i],
          `${viewportType}_${tag}_${i + 1}`,
          screenshotDir
        );
        if (elementScreenshot) {
          screenshots[`${viewportType}_${tag}_${i + 1}`] = elementScreenshot;
        }
      }
    }
  }

  async takeFullPageScreenshot(page, width, height, label, screenshotDir) {
    console.log(`Taking ${label} screenshot...`);
    const start = Date.now();
    await page.setViewportSize({ width, height });
    const screenshot = await page.screenshot({ fullPage: true, type: "png" });
    console.log(`${label} screenshot taken in ${(Date.now() - start) / 1000}s`);

    const compressedScreenshot = await this.compressImage(screenshot);

    // Save the screenshot locally only if SAVE_LOCAL_SCREENSHOTS is true
    if (SAVE_LOCAL_SCREENSHOTS) {
      const filename = `${label.toLowerCase()}_full.jpg`;
      await this.saveScreenshotLocally(
        compressedScreenshot,
        screenshotDir,
        filename
      );
    }

    return compressedScreenshot;
  }

  async takeElementScreenshot(page, element, label, screenshotDir) {
    try {
      console.log(`Taking screenshot of ${label}...`);
      const start = Date.now();

      await element.scrollIntoViewIfNeeded();

      const screenshot = await element.screenshot({ type: "png" });
      console.log(
        `${label} screenshot taken in ${(Date.now() - start) / 1000}s`
      );

      const compressedScreenshot = await this.compressImage(screenshot);

      // Save the screenshot locally only if SAVE_LOCAL_SCREENSHOTS is true
      if (SAVE_LOCAL_SCREENSHOTS) {
        const filename = `${label}.jpg`;
        await this.saveScreenshotLocally(
          compressedScreenshot,
          screenshotDir,
          filename
        );
      }

      return compressedScreenshot;
    } catch (error) {
      console.error(`Error taking screenshot of ${label}:`, error);
      return null;
    }
  }

  async compressImage(imageBuffer) {
    try {
      const compressedImage = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: "inside", withoutEnlargement: true }) // Resize to max 2000x2000
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

  async performAnalysis(screenshots) {
    let content = [];

    // Prioritize main content screenshots
    const priorityScreenshots = [
      "desktop_main_priority",
      "mobile_main_priority",
      "desktop",
      "mobile",
    ];

    // Add priority screenshots first
    for (const key of priorityScreenshots) {
      if (screenshots[key]) {
        content.push(
          {
            type: "text",
            text: `Priority Screenshot: ${key}`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: screenshots[key].toString("base64"),
            },
          }
        );
      }
    }

    // Add remaining screenshots
    for (const [key, screenshot] of Object.entries(screenshots)) {
      if (!priorityScreenshots.includes(key) && screenshot) {
        content.push(
          {
            type: "text",
            text: `Screenshot: ${key}`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: screenshot.toString("base64"),
            },
          }
        );
      }
    }

    content.push({
      type: "text",
      text: "Please analyze these screenshots based on the given instructions, paying special attention to the main content sections in both desktop and mobile views.",
    });

    const messages = [
      {
        role: "user",
        content: content,
      },
    ];

    const response = await this.anthropicService.sendMessage({
      system: analysisPrompt,
      messages: messages,
    });

    // Extract the JSON from the XML tags
    const analysisResultMatch = response.content[0].text.match(
      /<analysis_result>([\s\S]*?)<\/analysis_result>/
    );

    if (!analysisResultMatch) {
      throw new Error("Failed to extract analysis result from the response");
    }

    const analysisResultJson = analysisResultMatch[1].trim();

    try {
      return JSON.parse(analysisResultJson);
    } catch (error) {
      console.error("Error parsing analysis result JSON:", error);
      throw new Error("Invalid JSON in analysis result");
    }
  }

  async repairWebsite(shipId, analysisResult, screenshots) {
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

      // Add all screenshots to the repair prompt
      for (const [key, screenshot] of Object.entries(screenshots)) {
        if (screenshot) {
          content.push(
            {
              type: "text",
              text: `Screenshot: ${key}`,
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: screenshot.toString("base64"),
              },
            }
          );
        }
      }

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
      console.log("Received initial response from Anthropic API");

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
          severity: issue.severity,
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

  async testAnalyzeAndRepairSite(testShipId) {
    console.log(
      `Starting test for analyzeAndRepairSite with shipId: ${testShipId}`
    );

    try {
      const result = await this.analyzeAndRepairSite(testShipId);

      console.log("Test Result:");
      console.log(
        "Analysis Result:",
        JSON.stringify(result.analysisResult, null, 2)
      );
      console.log(
        "Repair Result:",
        JSON.stringify(result.repairResult, null, 2)
      );
      console.log(`Total Time: ${result.totalTime.toFixed(2)}s`);

      return result;
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  }

  async saveScreenshotLocally(screenshot, dir, filename) {
    if (SAVE_LOCAL_SCREENSHOTS) {
      const filePath = path.join(dir, filename);
      await fs.writeFile(filePath, screenshot);
      console.log(`Screenshot saved: ${filePath}`);
    }
  }
}

// Uncomment to run self-test, change the testShipId to the one you want to test
// if (require.main === module) {
//   const runTest = async () => {
//     const service = new AnalyzeAndRepairService();
//     const testShipId = "savya-tUUb2yUE";

//     try {
//       console.log("Starting self-test...");
//       const testResult = await service.testAnalyzeAndRepairSite(testShipId);
//       console.log("Self-test completed successfully:", testResult);
//     } catch (error) {
//       console.error("Self-test failed:", error);
//     }
//   };

//   runTest();
// }

module.exports = AnalyzeAndRepairService;
