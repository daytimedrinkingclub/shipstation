const {
  fileCreatorTool,
  taskAssignerTool,
  deployProjectTool,
  searchTool,
  placeholderImageTool,
} = require("../config/tools");
const { handleCTOToolUse } = require("../controllers/ctoToolController");
const { TOOLS } = require("../config/tools");

require("dotenv").config();

async function ctoService({ query, projectFolderName, sendEvent, client }) {
  const systemPrompt = [
    {
      type: "text",
      text: `
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
          a. Consider using the placeholderImageTool to find suitable images for each section.
          b. Pay special attention to key sections where high-quality images can significantly enhance the user experience:
            - Hero section: Aim for a high-quality, eye-catching image that represents the main offering.
            - Feature cards: Consider using relevant images for each feature to make them visually appealing and informative.
            - Testimonials: Where appropriate, include profile pictures of testimonial givers.
            - Facilities/Equipment: If relevant, showcase images of facilities, equipment, or areas.
          c. For cards and grid layouts, strive for consistency in image size and aspect ratio to maintain a polished look.
          d. When using images in the hero section or as full-width backgrounds, prioritize high-resolution images that are optimized for web performance.
          e. If specific images are not readily available, you can use the placeholderImageTool to find relevant stock photos or create colored placeholders that match the website's color scheme.
          f. Remember to add appropriate alt text to all images for accessibility.
          g. Use your judgment to determine when and where images are necessary, always keeping in mind the overall design and performance of the website.
  
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
        `,
      cache_control: { type: "ephemeral" },
    },
  ];

  const messages = [{ role: "user", content: [{ type: "text", text: query }] }];

  try {
    let msg = await client.sendMessage({
      system: systemPrompt,
      messages,
      tools: [
        fileCreatorTool,
        taskAssignerTool,
        deployProjectTool,
        searchTool,
        placeholderImageTool,
      ],
    });
    while (msg.stop_reason === "tool_use") {
      const tool = msg.content.find((content) => content.type === "tool_use");
      if (tool) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
        console.log("Found cto tool use in response");
        const toolResult = await handleCTOToolUse({
          tool,
          projectFolderName,
          sendEvent,
          client,
        });
        messages.push({ role: "user", content: toolResult });

        // Check if the deploy project tool was used, indicating website completion
        if (tool.name === TOOLS.DEPLOY_PROJECT) {
          console.log(
            "Website deployment tool used. Completing website creation."
          );
          break;
        }

        console.log("Sending request to Anthropic API with updated messages");

        msg = await client.sendMessage({
          system: systemPrompt,
          tools: [
            fileCreatorTool,
            taskAssignerTool,
            deployProjectTool,
            placeholderImageTool,
          ],
          messages,
        });

        console.log("Received response from Anthropic API");
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
      message: `Website successfully built, deployed, slug: ${slug}`,
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
