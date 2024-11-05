const { AnthropicService } = require("../anthropicService");
const HTMLRefiner = require("./HTMLRefiner");
const AIService = require("./AIService");
const dbService = require("../../services/dbService");
const FileService = require("../../services/fileService");
const { getCurrentDate } = require("../../utils/date");

const fileService = new FileService();

async function refineCode(
  shipId,
  shipSlug,
  message,
  userId,
  assets = [],
  assetInfo = "",
  aiReferenceFiles = []
) {
  const startTime = Date.now();
  console.log(`[${getCurrentDate()}] Starting code refinement process`);
  console.log(`├── Ship ID: ${shipId}`);
  console.log(`├── Ship Slug: ${shipSlug}`);
  console.log(`├── User Message: ${message}`);
  console.log(`├── Assets Count: ${assets.length}`);
  console.log(`└── AI Reference Files Count: ${aiReferenceFiles.length}`);

  const client = new AnthropicService({ userId });
  const aiService = new AIService(client);
  const filePath = `${shipSlug}/index.html`;

  try {
    console.log(`\n[${getCurrentDate()}] Reading current code...`);
    const currentCode = await fileService.getFile(filePath);
    console.log(`├── Current code length: ${currentCode.length} characters`);

    // Initialize HTML refiner
    console.log(`\n[${getCurrentDate()}] Initializing HTML refiner...`);
    const refiner = new HTMLRefiner(currentCode);

    // Get AI's understanding of the changes needed
    console.log(`\n[${getCurrentDate()}] Analyzing request with AI...`);
    const changes = await aiService.analyzeRequest(message, currentCode, {
      assets,
      assetInfo,
      aiReferenceFiles,
    });
    console.log(`├── Number of changes to apply: ${changes.length}`);

    // Apply changes using the refiner
    console.log(`\n[${getCurrentDate()}] Applying changes...`);
    for (const change of changes) {
      console.log(`├── Applying change: ${change.type}`);
      await refiner.applyChange(change);
    }

    // Save the updated code
    const updatedCode = refiner.getHTML();
    console.log(`\n[${getCurrentDate()}] Saving updated code...`);
    console.log(`├── Updated code length: ${updatedCode.length} characters`);
    await fileService.saveFile(filePath, updatedCode);
    // await updateShipVersion(shipId);

    const endTime = Date.now();
    const processingTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`\n[${getCurrentDate()}] Code refinement completed`);
    console.log(`└── Total processing time: ${processingTimeSeconds} seconds`);

    return {
      success: true,
      updatedMessage: `Code updated successfully in ${processingTimeSeconds} seconds`,
      updatedCode: updatedCode,
      processingTime: processingTimeSeconds,
    };
  } catch (error) {
    const endTime = Date.now();
    const processingTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
    console.error(`\n[${getCurrentDate()}] Error refining code after ${processingTimeSeconds} seconds:`);
    console.error(`└── ${error.message}`);
    throw error;
  }
}

module.exports = {
  refineCode,
};
