const Anthropic = require("@anthropic-ai/sdk");
const { codeWriterTool } = require("../config/tools");
const { saveFile } = require("./fileService");
const { saveFileToS3 } = require("../services/s3Service");
require("dotenv").config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function codeAssitant(query, filePath) {
  console.log("filePath in codeAssitant:", filePath);
  try {
    const msg = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4000,
      temperature: 0,
      system: `Write code as per the guidelines provided, use web-components architecture with the guidelines provided by user. Never use react. If you need to implement any functionality, use plain JS only. We are limited by web-components, tailwind and fontawsome only so never use any 3rd party library other than the ones mentioned previously.
      Use fontawesome cdn for icons and use icons from fontawesome only. Never use inline svgs.
      Always use images from https://picsum.photos/200/300 as src. 200 height and 300 is the width. You can also use any other height and width.
     <HTMLCodeExample>:
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
5. Another usage example of non-standard section like pricing: (components/pricing-section.html)
<section id="pricing-section" class="bg-gray-100 py-16">
<!-- component code goes here -->
</section>
6. Hero section example usage: (components/hero-section.html)
<section id="hero-section" class="bg-gray-100 py-16">
<!-- component code goes here -->
</section>
    <EndOfHTMLCodeExamples>:

     Components.js example
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

// HeaderComponent example usage

class HeaderComponent extends HTMLElement {
    async connectedCallback() {
        const content = await loadHTML('components/header-component.html');
        this.innerHTML = content;
    }
}
// FooterComponent example usage

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

</StartOfExample>
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
