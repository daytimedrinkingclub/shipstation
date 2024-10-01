const { getCurrentDate } = require("../../utils/date");
const { getDesignPresetPrompt } = require("../dbService");

const createUserBuildSitePrompt = async (
  shipType,
  analysis,
  portfolioType,
  websiteAssets,
  sections,
  socials,
  designLanguage
) => {
  let designPresetPrompt = "";
  try {
    const designPresetData = await getDesignPresetPrompt(
      shipType,
      designLanguage?.design_name
    );
    designPresetPrompt = designPresetData.additive_prompt;
  } catch (error) {
    console.error("Error fetching design preset prompt:", error);
    designPresetPrompt = "Default design guidelines";
  }

  const formatSections = (sections) => {
    return sections
      .map(
        (section, index) =>
          `Section ${index + 1}:\nTitle: ${section.title}\nContent: ${
            section.content
          }\n`
      )
      .join("\n");
  };

  const formatWebsiteAssets = (assets) => {
    return assets
      .map((asset) => `URL: ${asset.url}\nComment: ${asset.comment}\n`)
      .join("\n");
  };

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
  
  User-Specific Requirements:
  ${shipType === "portfolio" ? `Portfolio Type: ${portfolioType}` : ""}
  
  Sections:
  ${formatSections(sections)}
  
  IMPORTANT: Create the sections in the exact order provided above. Do not add any new sections or remove any sections. The content and order of these sections are final and must be strictly followed.
  
  Social Media Links:
  ${socials.join("\n")}
  
  Design:
  Name: ${designLanguage.design_name}
  Description: ${designLanguage.design_description}
  
  Design Guidelines:
  ${designPresetPrompt}
  
  Color Palette:
  ${formatColorPalette(designLanguage.color_palette)}
  
  Fonts:
  ${formatFonts(designLanguage.fonts)}
  IMPORTANT: Use Google Fonts for all specified fonts. Prioritize the use of the user-selected primary font in the design.
  
  Website Assets:
  ${formatWebsiteAssets(websiteAssets)}
  IMPORTANT: Incorporate these assets into the website as per their respective comments. Each asset should be used according to the specific instructions provided in its comment.
  
  General Guidelines:
  - Implement the exact design language specified (${
    designLanguage.design_name
  }).
  - Use the provided color palette strictly.
  - Prioritize the use of the user-selected primary font, complementing it with the additional fonts as needed.
  - Create only the sections specified by the user, in the exact order provided.
  - Incorporate the provided website assets as described in their comments.
  - Include the specified social media links in appropriate locations (e.g., footer, contact section).
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
  
  Output:
  Provide only the full HTML code for the website, including:
  - All necessary CDN links (Tailwind CSS, Google Fonts, Font Awesome)
  - Inline JavaScript for functionality and interactions
  - Inline Tailwind CSS classes, making extensive use of responsive utility classes
  
  Remember to strictly follow the user's requirements, including only the specified sections in the exact order provided and adhering to the chosen design language.
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
