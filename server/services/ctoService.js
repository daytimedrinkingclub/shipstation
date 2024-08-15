const {
  fileCreatorTool,
  taskAssignerTool,
  deployProjectTool,
  searchTool,
} = require("../config/tools");
const { handleCTOToolUse } = require("../controllers/ctoToolController");
require("dotenv").config();

const SYSTEM_PROMPT = `
  These are the development guidelines to be always followed strictly.
  Always use vanilla JavaScript only! and avoid any module syntax or bundlers.
  Use Tailwind CSS via CDN and Font Awesome for icons, google fonts and use ONLY and only Tailwind components.

  *** Here are the exact steps and the order of development to be followed ***

  0. Plan the overall structure of the application, identifying necessary components.
  1. Create an index.html file that includes all necessary script tags for components.
  2. For each component, follow similar formats as per the example given below:
     a. Create a <component-name>.js file in the components folder.
     b. create a <component-name>.html file in the components folder.
     c. Ensure each component file defines a global class by loading the component from html file. Separate the javascript needed and the markup in js and html files.
  3. Ensure all files are properly linked in the index.html as per the following format of script tags:
      <script src="components/header-component.js"></script>
      <script src="components/testimonials-section.js"></script>
      <script src="components/booking-section.js"></script>
      <script src="components/footer-component.js"></script>

  *** Example format of file structure ***     
  < Start of file structure example, This is an example format only you are not restricted by component names or types >
  1. project-root/
     1.1. index.html
     1.2. components/
          1.2.1. header-component.html
          1.2.2. header-component.js
          1.2.3. hero-section.html
          1.2.4. hero-section.js
          1.2.5. ... (other component files)

  < End of file structure example, this was an example only you are not restricted by component names or types>

  < Never do the following things >
  Never:
  0. All js is to be written in individual component's js file only. DO NOT make script.js, js/main.js etc.
  1. Never use React or any other frontend framework.
  2. Never use shadow DOM
  3. Never create separate CSS files or tailwind.config.js file
  4. Never deviate from the format, rest judgements depend on you as the CTO.
  < End of limitations >

  *** Note ***
  When creating HTML, always use actual image URLs provided by the search tool instead of placeholder images.
`;

async function ctoService({ query, projectFolderName, sendEvent, client }) {
  console.log("aiAssistance called with query:", query);

  const messages = [{ role: "user", content: [{ type: "text", text: query }] }];

  try {
    let msg = await sendMessageAndHandleResponse(client, messages, projectFolderName, sendEvent);

    const slug = projectFolderName;
    sendEvent("websiteDeployed", { slug });
    client.abortRequest();
    
    return {
      message: `Website successfully built with slug: ${slug}`,
      slug,
    };
  } catch (error) {
    console.error("Error in aiAssistance:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}

async function sendMessageAndHandleResponse(client, messages, projectFolderName, sendEvent) {
  let msg = await client.sendMessage({
    messages,
    system: SYSTEM_PROMPT,
    tools: [fileCreatorTool, taskAssignerTool, deployProjectTool, searchTool],
  });

  while (msg.stop_reason === "tool_use") {
    const tool = msg.content.find((content) => content.type === "tool_use");
    if (!tool) {
      console.log("No tool use found in response, breaking loop");
      break;
    }

    console.log("Found cto tool use in response:", tool);
    messages.push({ role: msg.role, content: msg.content });

    const toolResult = await handleCTOToolUse({
      tool,
      projectFolderName,
      sendEvent,
      client,
    });

    // Process the tool result to extract image URLs if available
    const processedToolResult = processToolResult(toolResult);

    messages.push({ role: "user", content: processedToolResult });

    console.log(
      "Sending request to Anthropic API with updated messages:",
      JSON.stringify(messages)
    );

    msg = await client.sendMessage({
      system: SYSTEM_PROMPT,
      tools: [fileCreatorTool, taskAssignerTool, deployProjectTool, searchTool],
      messages,
    });

    console.log("Received response from Anthropic API:", msg);
  }

  return msg;
}

function processToolResult(toolResult) {
  if (toolResult && toolResult[0] && toolResult[0].content) {
    const content = toolResult[0].content[0];
    if (content.type === "text") {
      try {
        const parsedContent = JSON.parse(content.text);
        if (parsedContent.images && parsedContent.images.length > 0) {
          // Add a note about available image URLs
          const imageNote = `Available image URLs: ${parsedContent.images.join(", ")}`;
          content.text = `${content.text}\n\n${imageNote}`;
        }
      } catch (error) {
        console.error("Error parsing tool result content:", error);
      }
    }
  }
  return toolResult;
}

module.exports = {
  ctoService,
};