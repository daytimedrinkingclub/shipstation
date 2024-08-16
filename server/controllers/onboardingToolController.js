const fileService = require("../services/fileService");
const ctoService = require("../services/ctoService");
const searchService = require("../services/searchService");
const { toKebabCase } = require("../utils/file");
const {
  insertShip,
  getUserProfile,
  updateUserProfile,
  updateConversation,
} = require("../services/dbService");
const { TOOLS } = require("../config/tools");

const { nanoid } = require("nanoid");

const generateProjectFolderName = (projectName) => {
  return toKebabCase(projectName) + "-" + nanoid(8);
};

async function handleOnboardingToolUse({
  tool,
  sendEvent,
  messages,
  userId,
  client,
}) {
  if (tool.name === TOOLS.GET_DATA_FOR_PORTFOLIO) {
    sendEvent("question", tool.input);
    // return [
    //   {
    //     type: "tool_result",
    //     tool_use_id: tool.id,
    //     content: [{ type: "text", text: "Will get the data shortly" }],
    //   },
    // ];
  } else if (tool.name === TOOLS.GET_DATA_FOR_LANDING_PAGE) {
    sendEvent("question", tool.input);
    // return [
    //   {
    //     type: "tool_result",
    //     tool_use_id: tool.id,
    //     content: [{ type: "text", text: "Will get the data shortly" }],
    //   },
    // ];
  } else if (tool.name === TOOLS.START_SHIPPING_PORTFOLIO) {
    const { person_name, portfolio_description, sections, design_style } =
      tool.input;
    console.log("starting portfolio shipping tool", tool.input);
    const generatedFolderName = generateProjectFolderName(person_name);
    await fileService.saveFile(
      `${generatedFolderName}/readme.md`,
      `Portfolio description : ${portfolio_description}
      Sections : ${sections}
      Design style : ${design_style}`
    );
    // return [
    //   {
    //     type: "tool_result",
    //     tool_use_id: tool.id,
    //     content: [
    //       {
    //         type: "text",
    //         text: `Portfolio requirements created successfully at ${generatedFolderName}/readme.md`,
    //       },
    //     ],
    //   },
    // ];
  } else if (tool.name === TOOLS.START_SHIPPING_LANDING_PAGE) {
    const { project_name, project_description, sections, design_style } =
      tool.input;
    console.log("starting landing page shipping tool", tool.input);
    const generatedFolderName = generateProjectFolderName(project_name);
    await fileService.saveFile(
      `${generatedFolderName}/readme.md`,
      `Project name : ${project_name}
      Project description : ${project_description}
      Sections : ${sections}
      Design style : ${design_style}`
    );
    // return [
    //   {
    //     type: "tool_result",
    //     tool_use_id: tool.id,
    //     content: [
    //       {
    //         type: "text",
    //         text: `Landing page requirements created successfully at ${generatedFolderName}/readme.md`,
    //       },
    //     ],
    //   },
    // ];
  } else if (tool.name === TOOLS.PRODUCT_MANAGER) {
    console.log("inside product manager tool", tool.input);
    const {
      project_name,
      project_description,
      project_goal,
      project_branding_style,
      image_description,
    } = tool.input;
    const generatedFolderName = generateProjectFolderName(project_name);

    // Perform search using Tavily with image description as both query and imageQuery
    const searchResults = await searchService.performSearch(image_description, {
      imageQuery: image_description,
    });

    // Extract and format image results
    const formattedImageResults = searchResults.image_results
      ? searchResults.image_results.map((url, index) => ({
          title: `Image ${index + 1}`,
          url: url.replace(/\/$/, ""),
        }))
      : [];

    // Save placeholder images to a separate JSON file
    await fileService.saveFile(
      `${generatedFolderName}/placeholder_images.json`,
      JSON.stringify(formattedImageResults, null, 2)
    );

    await fileService.saveFile(
      `${generatedFolderName}/readme.md`,
      `Project name : ${project_name}
      Project description : ${project_description}
      Project goal : ${project_goal}
      Project branding style : ${project_branding_style}
      Image description : ${image_description}
      `
    );
    sendEvent("project_started", {
      slug: generatedFolderName,
    });
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [
          {
            type: "text",
            text: `PRD file and placeholder images JSON created successfully in ${generatedFolderName}/`,
          },
        ],
      },
    ];
  } else if (tool.name === TOOLS.CTO) {
    const { prd_file_path } = tool.input;
    const generatedFolderName = prd_file_path.split("/")[0];
    const fileContent = await fileService.readFile(
      `${generatedFolderName}/readme.md`
    );
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
    console.log("Inserted ship", id);
    if (mode === "paid") {
      const profile = await getUserProfile(userId);
      const { available_ships } = profile; // current
      const profilePayload = { available_ships: available_ships - 1 }; // updated
      await updateUserProfile(userId, profilePayload);
    }
    const convPayload = {
      ship_id: id,
      tokens_used: client.tokensUsed,
    };

    await updateConversation(client.conversationId, convPayload);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: message }],
      },
    ];
  } else if (tool.name === TOOLS.SEARCH) {
    const searchQuery = tool.input.query;
    const searchResults = await searchService.performSearch(searchQuery);
    return [
      {
        type: "tool_result",
        tool_use_id: tool.id,
        content: [{ type: "text", text: JSON.stringify(searchResults) }],
      },
    ];
  }

  return [];
}

module.exports = {
  handleOnboardingToolUse,
};
