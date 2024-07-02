const searchService = require("../services/aiSearchService");
const fileService = require("../services/fileService");
const ctoService = require("../services/ctoService");
const { toKebabCase } = require("../utils/file");
const {
  insertShip,
  insertConversation,
  getUserProfile,
} = require("../services/dbService");
const { isUsingCustomKey } = require("../services/anthropicService");

const generateProjectFolderName = (projectName, roomId) => {
  return toKebabCase(projectName) + "-" + roomId;
};

async function handleToolUse(tool, sendEvent, roomId, conversation, userId) {
  if (tool.name === "ai_research_assistant") {
    const searchQuery = tool.input.query;
    console.log("Performing search with query:", searchQuery);
    const searchResults = await searchService.performSearch(searchQuery);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: JSON.stringify(searchResults) }],
      },
    ];
  } else if (tool.name === "product_manager_tool") {
    const {
      project_name,
      project_description,
      project_goal,
      project_branding_style,
    } = tool.input;
    const generatedFolderName = generateProjectFolderName(project_name, roomId);
    await fileService.saveFile(
      `${generatedFolderName}/readme.md`,
      `Project name : ${project_name}
      Project description : ${project_description}
      Project goal : ${project_goal}
      Project branding style : ${project_branding_style}`
    );
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `PRD file created successfully at ${generatedFolderName}/readme.md`,
          },
        ],
      },
    ];
  } else if (tool.name === "cto_tool") {
    const { prd_file_path } = tool.input;
    const generatedFolderName = prd_file_path.split("/")[0];
    const fileContent = await fileService.readFile(prd_file_path);
    const { message, slug } = await ctoService.ctoService(
      fileContent,
      generatedFolderName,
      sendEvent,
      conversation
    );

    const mode = isUsingCustomKey() ? "self-key" : "paid";

    const ship = {
      user_id: userId,
      status: "completed",
      prompt: conversation[0].content,
      mode,
      slug,
    };
    const { id } = await insertShip(ship);
    const profile = await getUserProfile(userId);
    const { available_ships } = profile; // current
    const profilePayload = { available_ships: available_ships - 1 }; // updated
    await updateUserProfile(userId, profilePayload);
    const convPayload = {
      chat_json: conversation,
      ship_id: id,
    };
    await insertConversation(convPayload);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: message }],
      },
    ];
  }

  return [];
}

module.exports = {
  handleToolUse,
};
