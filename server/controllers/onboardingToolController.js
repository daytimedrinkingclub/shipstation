const fileService = require("../services/fileService");
const ctoService = require("../services/ctoService");
const { toKebabCase } = require("../utils/file");
const {
  insertShip,
  insertConversation,
  getUserProfile,
  updateUserProfile,
} = require("../services/dbService");
const { TOOLS } = require("../config/tools");

const generateProjectFolderName = (projectName, roomId) => {
  return toKebabCase(projectName) + "-" + roomId;
};

async function handleOnboardingToolUse({
  tool,
  sendEvent,
  roomId,
  messages,
  userId,
  client,
}) {
  if (tool.name === TOOLS.GET_DATA_FOR_PORTFOLIO) {
    console.log("inside get_data_for_portfolio_tool", tool.input);

    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: "Will get the data shortly" }],
      },
    ];
  } else if (tool.name === TOOLS.GET_DATA_FOR_LANDING_PAGE) {
    console.log("inside get_data_for_landing_page_tool", tool.input);
    // const {
    //   question_format: questionType,
    //   question_text: question,
    //   question_meta: rawMeta,
    // } = tool.input;

    // const meta = typeof rawMeta === "string" ? JSON.parse(rawMeta) : rawMeta;
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: "Will get the data shortly" }],
      },
    ];
  } else if (tool.name === TOOLS.START_SHIPPING_PORTFOLIO) {
    const { person_name, portfolio_description, sections, design_style } =
      tool.input;
    console.log("starting portfolio shipping tool", tool.input);
    const generatedFolderName = generateProjectFolderName(person_name, roomId);
    await fileService.saveFile(
      `${generatedFolderName}/readme.md`,
      `Portfolio description : ${portfolio_description}
      Sections : ${sections}
      Design style : ${design_style}`
    );
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `Portfolio requirements created successfully at ${generatedFolderName}/readme.md`,
          },
        ],
      },
    ];
  } else if (tool.name === TOOLS.START_SHIPPING_LANDING_PAGE) {
    const { project_name, project_description, sections, design_style } =
      tool.input;
    console.log("starting landing page shipping tool", tool.input);
    const generatedFolderName = generateProjectFolderName(project_name, roomId);
    await fileService.saveFile(
      `${generatedFolderName}/readme.md`,
      `Project name : ${project_name}
      Project description : ${project_description}
      Sections : ${sections}
      Design style : ${design_style}`
    );
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `Landing page requirements created successfully at ${generatedFolderName}/readme.md`,
          },
        ],
      },
    ];
  } else if (tool.name === TOOLS.PRODUCT_MANAGER) {
    console.log("inside product manager tool", tool.input);
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
  } else if (tool.name === TOOLS.CTO) {
    const { prd_file_path } = tool.input;
    const generatedFolderName = prd_file_path.split("/")[0];
    const fileContent = await fileService.readFile(prd_file_path);
    const { message, slug } = await ctoService.ctoService({
      query: fileContent,
      projectFolderName: generatedFolderName,
      sendEvent,
      client,
    });

    const mode = client.isCustomKey ? "self-key" : "paid";
    const endTimestamp = Date.now();
    const duration = (endTimestamp - client.startTimestamp) / 1000; // Convert to seconds
    console.log("Time taken for CTO tool (in seconds):", duration);
    const ship = {
      user_id: userId,
      status: "completed",
      prompt: messages[0].content,
      mode,
      slug,
      execution_time: duration,
      tokens_used: client.tokensUsed,
    };
    const { id } = await insertShip(ship);
    const profile = await getUserProfile(userId);
    const { available_ships } = profile; // current
    const profilePayload = { available_ships: available_ships - 1 }; // updated
    await updateUserProfile(userId, profilePayload);
    const convPayload = {
      chat_json: messages,
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
  handleOnboardingToolUse,
};
