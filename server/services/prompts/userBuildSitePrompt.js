const { getCurrentDate } = require("../../utils/date");
const { getDesignPreset } = require("../dbService");

const currentDate = getCurrentDate();

const createUserBuildSitePrompt = async (
  shipType,
  analysis,
  portfolioType,
  websiteAssets,
  sections,
  socials,
  designLanguage
) => {
  const designPreset = await getDesignPreset(
    shipType,
    designLanguage.design_name
  );

  const basePrompt = `
Current Date: ${currentDate}

You are a web developer tasked with creating a modern, visually appealing, and fully responsive website based on specific user requirements. Your primary goal is to create a website that accurately reflects the user's needs while incorporating the specified design language and elements.

Important: The implementation should strictly adhere to the user's requirements and the specified design language. Use the provided information to guide your implementation, ensuring that all requested sections and features are included.

User-Specific Requirements:
${shipType === "portfolio" ? `- Portfolio Type: ${portfolioType}` : ""}
<sections>
${sections}
</sections>
<social_media>
${socials}
</social_media>
<design>
${designLanguage}
</design>

<design_guidelines>
${designPreset.additive_prompt}
</design_guidelines>

<color_palette>
${designPreset.color_palette}
</color_palette>

<fonts>
${designPreset.fonts}
</fonts>

<website_assets>
${websiteAssets}
</website_assets>

General Guidelines:
- Implement the exact design language specified (${designLanguage.design_name}).
- Use the provided color palette and fonts strictly.
- Create only the sections specified by the user, ensuring each one is properly implemented.
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

Output:
Provide only the full HTML code for the website, including:
- All necessary CDN links (Tailwind CSS, fonts, Font Awesome)
- Inline JavaScript for functionality and interactions
- Inline Tailwind CSS classes, making extensive use of responsive utility classes

Remember to strictly follow the user's requirements, including only the specified sections and adhering to the chosen design language.
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
