const { getCurrentDate } = require("../../utils/date");

const currentDate = getCurrentDate();

const analysisPrompt = `Current Date: ${currentDate}

You are tasked with analyzing two screenshots of a website—one for mobile and one for desktop view—based solely on visual cues. Your goal is to identify and report issues that require repair, including both major and minor problems, and provide possible fixes for each issue. Ensure equal attention is given to both mobile and desktop views.

Key Areas to Analyze:

Broken Images:
- Perform a general check for broken images across the entire layout in both views.
- Specific areas to check (for both mobile and desktop):
  - Hero Image
  - Logo
  - Gallery or Portfolio Sections
  - Project Cards
  - Other Visual Sections (e.g., "About Me," "Team," "Testimonials")

Important: Consider an image broken if:
- It displays only alt text or a generic placeholder icon.
- There is an empty space where the image should appear.

Alt Text Clarification: Alt text visible in place of an image indicates a broken image and should be flagged as such.

Layout Problems:
Identify inconsistencies or malfunctions in layout for both views, such as:
- Misaligned, overlapping, or improperly spaced elements.
- Sections that do not align properly between mobile and desktop views.
- Content extending beyond screen boundaries or causing horizontal scrolling.

Responsiveness Issues:
Highlight areas where the design fails to adapt smoothly between different screen sizes:
- Elements that do not resize, reposition, or reflow correctly.
- Distorted or overlapping content in either mobile or desktop views.
- Pay equal attention to both mobile and desktop responsiveness.

Color Contrast Problems:
Flag areas with insufficient color contrast in both views:
- Buttons, links, or interactive elements with low contrast.
- Text against backgrounds that make it difficult to read.

Content Visibility:
Ensure all content is fully visible in both mobile and desktop views:
- Flag instances where content is cut off, cropped, or hidden behind other elements.
- Identify key sections or elements not fully accessible in either view.

Text Legibility:
Identify text that is difficult to read in both views due to:
- Inadequate font size, line height, or spacing.

Output Format:
Provide a JSON object with the following structure:
{
  "repairRequired": true/false,
  "issues": [
    {
      "description": "Issue description 1",
      "possibleFix": "Suggested fix for issue 1",
      "affectedView": "mobile/desktop/both"
    },
    {
      "description": "Issue description 2",
      "possibleFix": "Suggested fix for issue 2",
      "affectedView": "mobile/desktop/both"
    },
    ...
  ]
}

repairRequired: Set to true if any issues are found that require repair; otherwise, set it to false.
issues: An array of objects, each containing:
- description: A string describing the identified issue.
- possibleFix: A string suggesting a potential solution to the issue.
- affectedView: Specify whether the issue affects "mobile", "desktop", or "both" views.

Additional Instructions:
- Be specific in your descriptions, referencing exact locations or elements in the screenshots.
- Provide concise yet detailed explanations for each issue and its possible fix.
- If no issues are found, set repairRequired to false and leave the issues array empty.
- Focus on objective problems rather than subjective design preferences.
- If you're unsure about an element, err on the side of caution and include it in the issues list.
- Consider the user experience when identifying issues for both mobile and desktop users.
- Pay attention to consistency between mobile and desktop views, noting any significant discrepancies.
- When suggesting fixes, provide practical and implementable solutions that address the specific issue identified.

Remember, your analysis should be based solely on the visual information provided in the screenshots. Do not make assumptions about functionality or features that are not visible in the images. Ensure that you give equal consideration to both mobile and desktop views in your analysis.`;

const prepareRepairPrompt = (analysisResult, currentHtml) => {
  const issuesDescription = analysisResult.issues
    .map((issue, index) => {
      const viewInfo =
        issue.affectedView === "both"
          ? "both mobile and desktop views"
          : `${issue.affectedView} view`;

      return `${index + 1}. ${issue.description} (Affects ${viewInfo})
 Possible fix: ${issue.possibleFix}`;
    })
    .join("\n\n");

  return `
  Current Date: ${currentDate}

  The website analysis has identified the following issues that need to be addressed:

  ${issuesDescription}

  Please repair the HTML code below to fix these issues. Ensure that you maintain the overall structure and style of the website while addressing the problems identified. Pay special attention to replacing broken images, improving color contrast, and adjusting layout issues. Make sure to consider the affected views (mobile, desktop, or both) when implementing fixes.

  Current HTML:
  ${currentHtml}

  For your reference, screenshots of the site highlighting these issues are attached.

  Please provide the repaired HTML code enclosed in <repaired_code> tags. Include comments explaining the changes you've made to address each issue, specifying whether the change affects mobile view, desktop view, or both.

`;
};

module.exports = { analysisPrompt, prepareRepairPrompt };
