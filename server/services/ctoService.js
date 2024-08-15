const {
  fileCreatorTool,
  taskAssignerTool,
  deployProjectTool,
  searchTool,
  imageAnalysisTool,
} = require("../config/tools");
const { handleCTOToolUse } = require("../controllers/ctoToolController");

require("dotenv").config();

const systemPrompt = `
  These are the development guidelines to be always followed strictly.
  Always use vanilla JavaScript only! and avoid any module syntax or bundlers.
  Use Tailwind CSS via CDN and Font Awesome for icons, google fonts and use ONLY and only Tailwind components.

  *** Here are the exact steps and the order of development to be followed ***

  0. Plan the overall structure of the application, identifying necessary components.
  1. Create an index.html file that includes all necessary script tags for components.
  2. For each component, follow similar formats as per the example given below:
     a. Create a <component-name>.js file in the components folder.
     b. create a <component-name>.html file in the components folder.
     c. Ensure each component file defines a global class bby loading the component from html file. Seperate the javascript needed and the markup in js and html files.
  4. Ensure all files are properly linked in the index.html as per the following format of script tags:
      <script src="components/header-component.js"></script>
      <script src="components/testimonials-section.js"></script>
      <script src="components/booking-section.js"></script>
      <script src="components/footer-component.js"></script>
   5. When creating components that require images:
      a. Check the PRD file (readme.md) for placeholder images.
      b. Always use the placeholder images provided in the PRD file when available, especially for key sections:
         - Hero section: Use a high-quality, eye-catching image that represents the main offering (e.g., a cricket coaching session).
         - Feature cards: Utilize relevant images for each feature to make them visually appealing and informative.
         - Testimonials: Include profile pictures of testimonial givers when available.
         - Facilities/Equipment: Showcase images of cricket facilities, training equipment, or practice areas.
      c. For cards and grid layouts, ensure images are of consistent size and aspect ratio for a polished look.
      d. When using images in the hero section or as full-width backgrounds, ensure they are high-resolution and optimized for web.
      e. If specific placeholder images are not available for certain sections, use relevant stock photos or colored placeholders that match the website's color scheme.
      f. Always add appropriate alt text to images for accessibility.

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
  `;

async function ctoService({ query, projectFolderName, sendEvent, client }) {
  console.log("aiAssistance called with query:", query);

  const messages = [{ role: "user", content: [{ type: "text", text: query }] }];

  try {
    let msg = await client.sendMessage({
      messages,
      system: systemPrompt,
      tools: [
        fileCreatorTool,
        taskAssignerTool,
        deployProjectTool,
        searchTool,
        imageAnalysisTool,
      ],
    });
    while (msg.stop_reason === "tool_use") {
      const tool = msg.content.find((content) => content.type === "tool_use");
      if (tool) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
        console.log("Found cto tool use in response:", tool);
        const toolResult = await handleCTOToolUse({
          tool,
          projectFolderName,
          sendEvent,
          client,
        });
        messages.push({ role: "user", content: toolResult });
        console.log(
          "Sending request to Anthropic API with updated messages:",
          JSON.stringify(messages)
        );

        msg = await client.sendMessage({
          system: systemPrompt,
          tools: [
            fileCreatorTool,
            taskAssignerTool,
            deployProjectTool,
            imageAnalysisTool,
          ],
          messages,
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

    // client.abortRequest();
    return {
      message: `Website successfully built, deployed, analyzed, and repaired with slug: ${slug}`,
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
