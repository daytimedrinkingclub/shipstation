const {
  fileCreatorTool,
  taskAssignerTool,
  deployProjectTool,
  searchTool,
} = require("../config/tools");
const { handleToolUse } = require("../controllers/ctoToolController");
const { insertConversation } = require("./dbService");
const { getAnthropicClient } = require("./anthropicService");
require("dotenv").config();

const systemPrompt = `As a cto your goal is to structure the given project into web components and get it developed using provided tools.
   Always use only tailwind css which is imported in index.html via cdn 
   These are the development guidelines to be always followed strictly.
   After all the guidelines, please refer examples of your component
   0. Create an index.html file which uses all the custom components as per the requirements.
   Ensure that you add the components and their expected file names as the components are created only after creating the index.html file.
   1. Only use web components, not lit components etc. We are going to use vanilla js only. 
   2. Then get code written for the index.html file use code_writer_tool.
   3. Then create a <component-name>.html file with the detailed comments. Create the components in the components folder and not at the root level.
   4. Get the code for components/<component-name>.html file using code_writer_tool.
   5. Repeat step 3 and 4 until all the component-names that we defined in index.html are created.
   6. Create component.js file at root for the above components using the format:
  <StartOfExample>:
  // Here is the example format for defining the components in the components.js file

// Always use this function for loading the components
async function loadHTML(url) {
    const response = await fetch(url);
    return await response.text();
}

// you need to define all the components like the following example format:
class <ComponentName> extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/<component-name>.html');
        this.innerHTML = content;
    }
}
customElements.define('<component-name>',<ComponentName>); 
// replace <ComponentName> with the name of the component


// Based on the above format here as some example components

// Features component definition example
class FeaturesSection extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/features-section.html');
        this.innerHTML = content;
    }
}
// VideoSection component definition example
class VideoSection extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/video-section.html');
        this.innerHTML = content;
    }
}
// HeroSection component definition example
class HeroSection extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/hero-section.html');
        this.innerHTML = content;
    }
}

// Example on how to declare above component examples
customElements.define('features-section',FeaturesSection); 
customElements.define('video-section',VideoSection); 
customElements.define('hero-section',HeroSection); 
</StartOfExample>

Never:
1. Never Use react or any other frontend framework
2. Never use shadow dom 
`;

async function ctoService(
  query,
  projectFolderName,
  sendEvent,
  mainConversation
) {
  console.log("aiAssistance called with query:", query);

  const conversation = [
    { role: "user", content: [{ type: "text", text: query }] },
  ];

  try {
    let msg = await getAnthropicClient().messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4000,
      temperature: 0,
      system: systemPrompt,
      tools: [fileCreatorTool, taskAssignerTool, deployProjectTool, searchTool],
      messages: conversation,
    });
    console.log("Received response from Anthropic API:", msg);
    while (msg.stop_reason === "tool_use") {
      const tool = msg.content.find((content) => content.type === "tool_use");
      if (tool) {
        conversation.push({
          role: msg.role,
          content: msg.content,
        });
        console.log("Found tool use in response:", tool);
        const toolResult = await handleToolUse(
          tool,
          projectFolderName,
          sendEvent
        );
        console.log("Received tool result:", toolResult);
        conversation.push({ role: "user", content: toolResult });

        console.log(
          "Sending request to Anthropic API with updated conversation:",
          JSON.stringify(conversation)
        );

        msg = await getAnthropicClient().messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 4000,
          temperature: 0,
          system: systemPrompt,
          tools: [fileCreatorTool, taskAssignerTool, deployProjectTool],
          messages: conversation,
        });

        console.log("Received response from Anthropic API:", msg);
      } else {
        console.log("No tool use found in response, breaking loop");
        break;
      }
    }
    const slug = projectFolderName;
    sendEvent("websiteDeployed", {
      slug,
    });
    return {
      message: `Website successfully built with  slug: ${slug}`,
      slug,
    };
  } catch (error) {
    console.error("Error in aiAssistance:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}

module.exports = {
  ctoService,
};
