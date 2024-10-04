const { getCurrentDate } = require("../../utils/date");
const { getDesignPresetPrompt } = require("../dbService");

const createUserBuildSitePrompt = async (
  shipType,
  analysis,
  name,
  portfolioType,
  designChoice,
  selectedDesign,
  customDesignPrompt
) => {
  let designPresetPrompt = "";
  let designLanguage = {};

  if (designChoice === "preset" && selectedDesign) {
    try {
      const designPresetData = await getDesignPresetPrompt(
        shipType,
        selectedDesign.design_name
      );
      designPresetPrompt = designPresetData.additive_prompt;
      designLanguage = selectedDesign;
    } catch (error) {
      console.error("Error fetching design preset prompt:", error);
      designPresetPrompt = "Default design guidelines";
    }
  } else if (designChoice === "custom" && customDesignPrompt) {
    designPresetPrompt = customDesignPrompt;
    designLanguage = {
      design_name: "Custom Design",
      design_description: "Custom design based on user input",
      color_palette: {},
      fonts: [],
    };
  } else {
    throw new Error("Invalid design choice or missing required data");
  }

  const formatColorPalette = (palette) => {
    return Object.entries(palette)
      .map(([key, value]) => `${key}: ${value.value} (${value.label})`)
      .join("\n");
  };

  const formatFonts = (fonts) => {
    const selectedFont = fonts.find((font) => font.selected);
    const otherFonts = fonts.filter((font) => !font.selected);

    let fontString = "";
    if (selectedFont) {
      fontString += `Primary Font (User Selected): ${
        selectedFont.name
      }\nWeights: ${selectedFont.weights.join(", ")}\n\n`;
    }
    fontString += "Additional Fonts:\n";
    fontString += otherFonts
      .map((font) => `Name: ${font.name}\nWeights: ${font.weights.join(", ")}`)
      .join("\n\n");
    return fontString;
  };

  const basePrompt = `
  Current Date: ${getCurrentDate()}
  
  You are a web developer tasked with creating a modern, visually appealing, and fully responsive website based on specific user requirements. Your primary goal is to create a website that accurately reflects the user's needs while incorporating the specified design language and elements.
  
  Important: The implementation should strictly adhere to the user's requirements and the specified design language. Use the provided information to guide your implementation, ensuring that all requested sections and features are included.

  User Name: ${name}
  IMPORTANT: Prominently display the user's name (${name}) in the website, such as in the header or hero section.
  
  User-Specific Requirements:
  ${shipType === "portfolio" ? `Portfolio Type: ${portfolioType}` : ""}
  ${shipType === "landing_page" ? "Website Type: Landing Page" : ""}
  
  Design:
  Name: ${designLanguage.design_name}
  Description: ${designLanguage.design_description}
  
  Design Guidelines:
  ${designPresetPrompt}
  
  ${
    designChoice === "preset"
      ? `
  Color Palette:
  ${formatColorPalette(designLanguage.color_palette)}
  
  Fonts:
  ${formatFonts(designLanguage.fonts)}
  IMPORTANT: Use Google Fonts for all specified fonts. Prioritize the use of the user-selected primary font in the design.
  `
      : ""
  }

  General Guidelines:
  - Implement the exact design language specified (${
    designLanguage.design_name
  }).
  ${
    designChoice === "preset"
      ? `
  - Use the provided color palette strictly.
  - Prioritize the use of the user-selected primary font, complementing it with the additional fonts as needed.
  `
      : `
      Custom Design Instructions:
        1. Carefully analyze the user's custom design requirements provided below.
        2. Extract key design elements, color schemes, typography preferences, and layout ideas from the user's description.
        3. Create a cohesive design that accurately reflects the user's vision while maintaining professional web design standards.
        4. If specific colors are mentioned, use them as the primary color palette. If not, choose a suitable color scheme that matches the described style.
        5. Select appropriate Google Fonts that align with the described typography style.
        6. Implement a layout and structure that best represents the user's described design, while ensuring responsiveness and usability.
      `
  }
  - Generate appropriate sections and content based on the ${portfolioType}.
  - Create relevant social media links and include them in appropriate locations (e.g., footer, contact section).
  - Ensure the generated sections and content align with industry standards for the specified portfolioType.
  - Ensure the design is fully responsive and looks great on mobile, tablet, and desktop devices.
  - Optimize for performance and accessibility.
  
  Technical Requirements:
  - Use semantic HTML5 for structure.
  - Use JavaScript for functionality and interactions.
  - Use Tailwind CSS via CDN for styling, adhering to the specified design language.
  - Implement a mobile-first approach using Tailwind's responsive prefixes (sm:, md:, lg:, xl:).
  - Include meta viewport tag for proper responsive behavior.
  - Use Font Awesome CDN for icons throughout the website.
  - Use Google Fonts for all specified fonts, including the necessary links in the HTML.
  - IMPORTANT: Do not include a contact form section under any circumstances, irrelevant of the type of the website.
  
  Output:
  Provide only the full HTML code for the website, including:
  - All necessary CDN links (Tailwind CSS, Google Fonts, Font Awesome)
  - Inline JavaScript for functionality and interactions
  - Inline Tailwind CSS classes, making extensive use of responsive utility classes
  
  Remember to strictly follow the user's design requirements, going above and beyond to fulfill them. Pay meticulous attention to the smallest details, ensuring every aspect of the design aligns perfectly with the user's vision. Leave no stone unturned in creating a website that exceeds expectations and truly embodies the specified design language and requirements.
  `;

  // Include analysis if provided
  let analysisPrompt = "";
  if (analysis && analysis.trim() !== "") {
    analysisPrompt = `
  Additional Design Inspiration:
  The user has chosen design images for inspiration. Please take inspiration from the following analysis while implementing the website:
  
  ${analysis}
  
  Important: The design inspiration contains placeholder content. Do not use this content in the final implementation. Instead, strictly adhere to the sections and content specified by the user in the "Sections to include" above. The user-specified sections and content are final and must be used exclusively. Only take visual and structural inspiration from the analysis, ensuring the final design incorporates these elements while still adhering to the user's specific requirements and chosen design language.`;
  }

  return basePrompt + analysisPrompt;
};

module.exports = {
  createUserBuildSitePrompt,
};
