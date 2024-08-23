const { codeWriterTool, placeholderImageTool } = require("../config/tools");
const { saveFile } = require("./fileService");
const { saveFileToS3 } = require("../services/s3Service");
const { handleCodeToolUse } = require("../controllers/codeToolController");
require("dotenv").config();

async function codeAssitant({ query, filePath, client }) {
  try {
    const systemPrompt = [
      {
        type: "text",
        text: `
          Write code as per the guidelines provided, use web-components architecture with the provided guidelines. Never use react, vue, alpine or any other frontend library. Follow the guildines provided by the CTO.

          ** design guideline **
          1. Make sure that the components are mobile first as per best design trends and guidelines in 2024.
          If needed for the project, search for the best design guidelines and practices followed.
          2. Try to produce the best work for the users specific use cases, search the web, follow your knowledge.
          3. Use google fonts as per the requirement.
          4. Use Animate css if needed for the components, and animations are to be added.
          5. make sure the elements are of appropriate height and width, if required. Do not assume it will render correctly, make sure it is responsive. Circles should be circular, squares should be square, etc.
          6. Since desing is always subjective, the final decision to make the perfect output is your call.
          You can make changes to the design as per the requirements, but the final output should be the best possible output.
          ** End of design guideline **

          ** VERY IMPORTANT NOTE FOR ALL IMAGES **
          When creating any HTML that includes images, ALWAYS use the placeholder_image_tool to find suitable, high-quality images. This applies to ALL image elements, without exception, including:

          1. Hero section images
          2. Blog post thumbnails or featured images
          3. Product images in featured products sections and product listings
          4. Team member photos and testimonial profile pictures
          5. Background images for any section
          6. Icons or small illustrative images
          7. Gallery images
          8. About us section images
          9. Any images in dynamically generated content or templates

          Key points to remember:

          1. Always use the placeholder_image_tool before writing any HTML that includes an image. Never use generic placeholder URLs, "placeholder" text, or leave src attributes empty.

          2. When using the placeholder_image_tool, be specific about the image requirements:
            - For product images: "premium car for featured service", "luxury sedan for service listing"
            - For people: "professional headshot for mechanic testimonial", "diverse team of auto technicians for about us section"
            - For design elements: "minimalist icon for car service feature"

          3. For sections with multiple images (e.g., testimonials, service listings):
            - Use the placeholder_image_tool to generate a unique, appropriate image for each item.
            - Include clear instructions or comments on how to use the placeholder_image_tool when populating image src attributes.

          4. If no suitable image is found, use a colored div with appropriate dimensions as a placeholder, but still attempt to use the placeholder_image_tool first.

          5. Always provide descriptive alt text for accessibility, including specific details about the image content when applicable.

          6. For optimal performance:
            - Use appropriate image sizes and formats.
            - Implement lazy loading for images below the fold.
            - Consider using responsive images with multiple sizes for different screen widths.

          7. Use your judgment to determine where images are necessary and where they might distract from the content, but always use the placeholder_image_tool when an image is needed.

          8. When the placeholder_image_tool returns an array of image URLs:
            - Use different images from the array for each instance where an image is needed.
            - Do not always use the first image in the array.
            - Distribute the usage of images across the array to ensure variety.
            - If multiple images are needed in a single component, use different indices from the array for each image.

          Remember, every single image on the website, whether static or dynamically generated, must be sourced using the placeholder_image_tool. This ensures consistency, quality, and prevents empty src attributes or placeholder text across all visual elements.
          ** END OF VERY IMPORTANT NOTE FOR ALL IMAGES **

          ** Important Notes! **

          1. Always use only tailwind css which is imported in index.html

            < Start of tailwind how to use in index.html file >
            <script src="https://cdn.tailwindcss.com"></script>

            <script>
            tailwind.config = {
                theme: {
                extend: {
                    colors: {
                    'colorName': '#colorCode',
                    }
                }
                }
            }
            </script>


          2. import animate css in index.html with the following tag
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />

          3- How to use fonts:
              Use google fonts.

        ** VERY IMPORTANT NOTE **
            Below are the formats / and examples are provided to maintain a common format for project, this does not imply that the components are limited to the examples, its only for you to follow a common structure.
            Each Project will be uniqe and will have unique ddesign / ux / ui requirements, we need to make each of them the best possible project we have delivered.

          ** Example Formats of using html code **
          1. Sample component example usage: (components/<component-name>.html)
          <section id="<relevant-id>" class="<relevant-class>">
          <!-- component code goes here -->
          </section>
          2. header component example usage: (components/header-component.html)
          <header id="<relevant-id>" class="<relevant-class>">
          <!-- component code goes here -->
          </header>
          3. footer component example usage: (components/footer-component.html)
          <footer id="<relevant-id>" class="<relevant-class>">
          <!-- component code goes here -->
          </footer>
          4. Another usage example of non-standard section: (components/health-monitoring-section.html)
          <section id="health-monitoring" class="bg-gray-100 py-16">
          <!-- component code goes here -->
          </section>
          5. Another usage example of non-standard section like pre-booking: (components/pre-booking-section.html)
          <section id="pre-booking" class="bg-gray-100 py-16">
          <!-- component code goes here -->
          </section>
          6. Another usage example of non-standard section like pricing: (components/pricing-section.html)
          <section id="pricing-section" class="bg-gray-100 py-16">
          <!-- component code goes here -->
          </section>
          7. Hero section example usage: (components/hero-section.html)
          <section id="hero-section" class="bg-gray-100 py-16">
          <!-- component code goes here -->
          </section>
        
          ** END OF HTML FORMAT EXAMPLES **


          ** START OF COMPONENTS JS EXAMPLES **

            // ALWAYS DEFINE THE LOAD HTML AT THE TOP OF EACH COMPONENT YOU ADD / CREATE
          async function loadHTML(url) {
            const response = await fetch(url);
            return await response.text();
        }
          class <ComponentName> extends HTMLElement {
              async connectedCallback() {
                  const content = await loadHTML('components/<component-name>.html');
                  this.innerHTML = content;
                  this.initializeComponent(); // Call a method to set up any necessary interactivity
              }

              initializeComponent() {
                  // Add any necessary JavaScript for interactivity here if needed.
                  // For example:
                  // const button = document.querySelector('#someButton');
                  // if (button) {
                  //     button.addEventListener('click', () => {
                  //         // Handle click event
                  //     });
                  // }
              }
          }
          customElements.define('<component-name>', <ComponentName>);
          // replace <ComponentName> with the name of the component


          // Based on the above format, here are some example components:

          // HeaderComponent example usage
          async function loadHTML(url) {
            const response = await fetch(url);
            return await response.text();
        }
            class HeaderComponent extends HTMLElement {
              async connectedCallback() {
                  const content = await loadHTML('components/header-component.html');
                  this.innerHTML = content;
                  this.initializeMenu();
              }
          
              initializeMenu() { // only added as header component needs to have a mobile menu.
                  const mobileMenuButton = document.querySelector('#mobile-menu-button');
                  const mobileMenu = document.querySelector('#mobile-menu');
                  if (mobileMenuButton && mobileMenu) {
                      mobileMenuButton.addEventListener('click', () => {
                          mobileMenu.classList.toggle('hidden');
                      });
                  }
              }
          }
          customElements.define('header-component', HeaderComponent);
        

        // Based on the above format here as some example components

        // FooterComponent example usage
        async function loadHTML(url) {
            const response = await fetch(url);
            return await response.text();
        }
        class FooterComponent extends HTMLElement {
            async connectedCallback() {
                const content = await loadHTML('components/footer-component.html');
                this.innerHTML = content;
            }
        }

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

        customElements.define('header-component',HeaderComponent); 
        customElements.define('footer-component',FooterComponent); 
        customElements.define('features-section',FeaturesSection); 
        customElements.define('video-section',VideoSection); 
        customElements.define('hero-section',HeroSection); 

        < End of examples on how to use formats >

        Important notes for JavaScript implementation:
        0. All js is to be written in individual component's js file only. DO NOT make script.js, js/main.js etc.
        1. Always use document.querySelector to query for the elements. Do Not use this.shadowRoot.querySelector or this.querySelector or shadowRoot or      this.attachShadow({ mode: 'open' }); Do not make intersection observers etc for animations. Animations will be added in html files already.
        While writing component's js, always add if conditions and null checks to check if the elements are present or not before proceeding with the code.
        Only write javascript methods for interactive features like toggles, carousel, menubar, etc. Do not add animations using js, use animate css classes to animate things.
        2. In JS files, Do not write code for 3rd party libraries, Use js only for basic dom operations.
        3. Content and animations are to be added in html files only. the JS file is mainly to initialise the web component and very important usecases like mobile menu as that cant be done with html.
        4. Ensure all files are properly linked in the index.html as per the following way:
            <script src="components/header-component.js"></script>
            <script src="components/testimonials-section.js"></script>
            <script src="components/booking-section.js"></script>
            <script src="components/footer-component.js"></script>
          
          
          IMPORTANT NOTES for HTML:
          1. Always use only tailwind css components, do not use any other css frameworks.
          2. Make sure the component colors are consistent with the design.
            `,
        cache_control: { type: "ephemeral" },
      },
    ];

    let messages = [{ role: "user", content: [{ type: "text", text: query }] }];

    while (true) {
      const msg = await client.sendMessage({
        system: systemPrompt,
        messages,
        tools: [codeWriterTool, placeholderImageTool],
        tool_choice: { type: "any" },
      });

      if (msg.stop_reason !== "tool_use") {
        throw new Error("No code generated after tool use: ", msg.stop_reason);
      }

      const tool = msg.content.find((content) => content.type === "tool_use");
      if (!tool) {
        throw new Error("No tool use found in response");
      }

      messages.push({
        role: msg.role,
        content: msg.content,
      });

      if (tool.name === "code_writer_tool") {
        const { code, description } = tool.input;
        await saveCode(filePath, code);
        return {
          description,
          status: `Code written successfully to ${filePath}`,
        };
      } else {
        const toolResult = await handleCodeToolUse({ tool, client });
        messages.push({ role: "user", content: toolResult });
      }
    }
  } catch (error) {
    console.error("Error in codeAssitant:", error);
    throw error;
  }
}

async function saveCode(filePath, code) {
  const uploadToS3 = process.env.UPLOAD_TO_S3 === "true";
  if (uploadToS3) {
    await saveFileToS3(filePath, code);
    console.log(`Code successfully written to S3: ${filePath}`);
  } else {
    await saveFile(filePath, code);
    console.log(`Code successfully written to local file: ${filePath}`);
  }
}

module.exports = {
  codeAssitant,
};
