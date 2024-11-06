const OpenAI = require("openai");
const FileService = require("../fileService");
const dbService = require("../dbService");
const { getSystemPrompt } = require("./utils/prompts");
const { extractUpdatedContent, saveUpdatedCode } = require("./utils/codeUtils");
const { saveNewVersion } = require("./utils/versionControl");

const fileService = new FileService();

async function refineCode(
  shipId,
  shipSlug,
  message,
  userId,
  assets,
  assetInfo,
  aiReferenceFiles
) {
  console.log(`Starting code refinement for shipSlug: ${shipSlug}`);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const filePath = `${shipSlug}/index.html`;
  const currentCode = await readCurrentCode(filePath);
  const newVersion = await saveNewVersion(shipId, shipSlug, currentCode);
  await dbService.updateCurrentCodeVersion(shipId, newVersion);

  const conversation = await dbService.getCodeRefiningConversation(shipId);
  let messages = prepareMessages(
    conversation,
    message,
    currentCode,
    assetInfo,
    aiReferenceFiles,
    assets
  );

  console.log("assets received", assets.length);
  console.log("aiReferenceFiles received", aiReferenceFiles.length);

  const systemPrompt = getSystemPrompt(assets, assetInfo, aiReferenceFiles);

  try {
    const startTime = Date.now();
    console.log("Starting OpenAI API call");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      prediction: {
        type: "content",
        content: currentCode,
      },
      temperature: 0.7,
    });

    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000;
    console.log(
      `\n${'='.repeat(80)}\n` +
      `★ OpenAI API response time with predicted outputs: ${responseTime} seconds ★\n` + 
      `${'='.repeat(80)}\n`
    );

    const response = completion.choices[0].message.content;
    const { updatedMessage, updatedCode } = extractUpdatedContent(response);

    await saveUpdatedCode(filePath, updatedCode);
    await updateShipVersion(shipId);

    const messagesToSaveInDB = [
      ...(conversation?.messages || []),
      { role: "user", content: message, assetInfo },
      { role: "assistant", content: [{ type: "text", text: updatedMessage }] },
    ];

    await dbService.upsertCodeRefiningConversation(
      shipId,
      userId,
      messagesToSaveInDB
    );

    console.log(`Code refinement process completed for shipId: ${shipId}`);
    return { updatedMessage, updatedCode };
  } catch (error) {
    console.error("Error in code refinement:", error);
    throw error;
  }
}

async function readCurrentCode(filePath) {
  console.log(`Reading current code from ${filePath}`);
  const currentCode = await fileService.getFile(filePath);
  console.log(
    `Current code read successfully. Length: ${currentCode.length} characters`
  );
  return currentCode;
}

function prepareMessages(
  conversation,
  message,
  currentCode,
  assetInfo,
  aiReferenceFiles,
  assets
) {
  let messages = Array.isArray(conversation?.messages)
    ? conversation.messages.map((msg) =>
        msg.role === "user" ? { role: msg.role, content: msg.content } : msg
      )
    : [];

  let currentMessageContent = [
    {
      type: "text",
      text: `User request: ${message}`,
    },
    {
      type: "text",
      text: `Current HTML code:\n${currentCode}`,
    },
  ];

  // Add assets information if available
  if (assets.length > 0) {
    currentMessageContent.push({
      type: "text",
      text: `\nUser Assets:\nThe following assets have been provided and must be incorporated into the website:\n${assetInfo}\n\n${assets
        .map(
          (asset) =>
            `- ${asset.fileName}: ${
              asset.comment || "No description provided"
            } (URL: ${asset.url})`
        )
        .join(
          "\n"
        )}\n\nWhen incorporating these assets:\n1. Use the provided URLs directly in the HTML code\n2. Place the assets in appropriate sections based on their descriptions\n3. Ensure all assets are properly used in the HTML code`,
    });
  }

  // Add reference images if they exist
  if (aiReferenceFiles.length > 0) {
    aiReferenceFiles.forEach((file, index) => {
      currentMessageContent.push({
        type: "text",
        text: `Reference Image ${index + 1}: ${
          file.description || "No description provided"
        }`,
      });

      currentMessageContent.push({
        type: "image_url",
        image_url: {
          url: `data:${file.type};base64,${file.base64}`,
        },
      });
    });

    currentMessageContent.push({
      type: "text",
      text: "Please consider these reference images when making the requested changes.",
    });
  }

  // Add the current message with all content
  messages.push({
    role: "user",
    content: currentMessageContent,
  });

  return messages;
}

async function updateShipVersion(shipId) {
  const currentVersion = await dbService.getCurrentCodeVersion(shipId);
  if (currentVersion) {
    const newVersion = currentVersion + 1;
    await dbService.updateCurrentCodeVersion(shipId, newVersion);
    console.log(`Updated current version for ship ${shipId} to ${newVersion}`);
  } else {
    console.error(`Failed to get latest version for ship ${shipId}`);
  }
}

module.exports = {
  refineCode,
};
