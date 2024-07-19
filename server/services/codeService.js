const { codeWriterTool } = require("../config/tools");
const { saveFile } = require("./fileService");
const { saveFileToS3 } = require("../services/s3Service");
require("dotenv").config();

async function codeAssitant({ query, filePath, client }) {
  console.log("filePath in codeAssitant:", filePath);
  try {
    const msg = await client.sendMessage({
      system: `
      Write code as per the guidelines provided, use web-components architecture with the provided guidelines. Never use react or any other frontend library. Do not use keywords like export and import as that is not possible. 
      Always use only tailwind css which is imported in index.html

      // This is how to use tailwind always in index.html file
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

      < End of tailwind usage example >

      // How to use fonts and images

      < How to use fonts and images >

      Always use fontawesome which is imported in head tag <script src="https://kit.fontawesome.com/3fee4706ff.js" crossorigin="anonymous"></script>

      Always use images from https://picsum.photos/200/300 as src. 200 height and 300 is the width. You can also use any other height and width.

      < End of how to use fonts and images >


      // Example Formats of using html code
      < Start of HTML Code Example Formats >
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
      < End of HTML Code Example Formats >

      // you need to define all the components like the following example format:
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
              // Add any necessary JavaScript for interactivity here
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
      
          initializeMenu() {
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
      
      // FAQComponent example usage
      async function loadHTML(url) {
        const response = await fetch(url);
        return await response.text();
    }
      class FAQComponent extends HTMLElement {
          async connectedCallback() {
              const content = await loadHTML('components/faq-component.html');
              this.innerHTML = content;
              this.initializeFAQToggles();
          }
      
          initializeFAQToggles() {
              const faqButtons = document.querySelectorAll('button[aria-controls]');
              faqButtons.forEach(button => {
                  button.addEventListener('click', () => {
                      const targetId = button.getAttribute('aria-controls');
                      const targetElement = document.querySelector(#.......)
                      if (targetElement) {
                          targetElement.classList.toggle('hidden');
                          button.setAttribute('aria-expanded', targetElement.classList.contains('hidden') ? 'false' : 'true');
                      }
                  });
              });
          }
      }
      customElements.define('faq-component', FAQComponent);

    // you need to define all the components like the following example format:
    async function loadHTML(url) {
        const response = await fetch(url);
        return await response.text();
    }
    class <ComponentName> extends HTMLElement {
        async connectedCallback() {
            const content = await loadHTML('components/<component-name>.html');
            this.innerHTML = content;
        }
    }
    customElements.define('<component-name>',<ComponentName>); 
    // replace <ComponentName> with the name of the component


    // Based on the above format here as some example components

    // HeaderComponent example usage
    async function loadHTML(url) {
        const response = await fetch(url);
        return await response.text();
    }
    class HeaderComponent extends HTMLElement {
        async connectedCallback() {
            const content = await loadHTML('components/header-component.html');
            this.innerHTML = content;
        }
    }
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
    1. Always include necessary event listeners within the component's class methods.
    2. Implement interactive features (like toggles, form submissions, menubar, etc.) within the component's js file.
    3. Ensure all interactive elements have proper aria attributes for accessibility.
    4. Use event delegation where appropriate to handle events on multiple child elements.
    5. Always use document.querySelector to query for the elements. Do Not use this.shadowRoot.querySelector or this.querySelector 
    While writing component's js, always add if conditions and null checks to check if the elements are present or not before proceeding with the code.
    6. Ensure all files are properly linked in the index.html as per the following way:
  <script src="components/header-component.js"></script>
  <script src="components/testimonials-section.js"></script>
  <script src="components/booking-section.js"></script>
  <script src="components/footer-component.js"></script>

  
  < Start of file structure example >
  1. project-root/
     1.1. index.html
     1.2. components/
          1.2.1. header-component.html
          1.2.2. header-component.js
          1.2.3. hero-section.html
          1.2.4. hero-section.js
          1.2.5. ... (other component files)
  < End of file structure example >
      `,
      tools: [codeWriterTool],
      tool_choice: { type: "tool", name: "code_writer_tool" },
      messages: [{ role: "user", content: [{ type: "text", text: query }] }],
    });
    const resp = msg.content.find((content) => content.type === "tool_use");
    console.log("Received response from Anthropic API:", resp);

    const { code, description } = resp.input;

    console.log("recieved code", code);

    // Check if code is not a string, convert it to a string
    const codeString = typeof code === "string" ? code : JSON.stringify(code);

    await saveFile(filePath, codeString);
    await saveFileToS3(filePath, codeString);
    console.log(`Code successfully written to file: ${filePath}`);
    return {
      description,
      status: `Code written successfuly to ${filePath}, You can now proceed to next file`,
    };
  } catch (error) {
    console.error("Error in aiAssistance:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}

module.exports = {
  codeAssitant,
};
