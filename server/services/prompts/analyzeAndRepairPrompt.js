const { getCurrentDate } = require("../../utils/date");

const currentDate = getCurrentDate();

const analysisPrompt = `Current Date: ${currentDate}

You are tasked with analyzing two screenshots of a website—one for mobile and one for desktop view—based solely on visual cues. Your primary focus is to identify and report issues related to mobile responsiveness, layout problems, broken images, and overall user experience. Pay particular attention to how the layout adapts between desktop and mobile views, with special emphasis on the main content sections.

Key Areas to Analyze:

1. Main Content Section (High Priority):
   - Analyze the main content area thoroughly for both desktop and mobile views.
   - Ensure content is properly displayed, easily readable, and well-structured in both views.
   - Check for any inconsistencies or issues that may affect the primary message or purpose of the site.

2. Mobile Responsiveness:
   - Ensure all elements adapt properly from desktop to mobile view.
   - Check if any content is cut off, overlapping, or extending beyond the screen boundaries in mobile view.
   - Verify that text, images, and interactive elements are appropriately sized for mobile screens.
   - Look for any horizontal scrolling on mobile, which is generally undesirable.

3. Layout Problems:
   - Identify inconsistencies in layout between mobile and desktop views.
   - Check for misaligned, overlapping, or improperly spaced elements, especially in mobile view.
   - Look for empty spaces or uneven distribution of content that could be optimized.
   - Ensure that the visual hierarchy is maintained across both views.

4. Broken Images:
   - Perform a general check for broken images across the entire layout in both views.
   - Specific areas to check (for both mobile and desktop):
     - Hero Image
     - Logo
     - Gallery or Portfolio Sections
     - Project Cards
     - Other Visual Sections (e.g., "About Me," "Team," "Testimonials")
   - Consider an image broken if:
     - It displays only alt text or a generic placeholder icon.
     - There is an empty space where the image should appear.
   - Note: Alt text visible in place of an image indicates a broken image and should be flagged as such.

5. Responsive Design Patterns:
   - Verify that appropriate responsive design patterns are used (e.g., stack on mobile, side-by-side on desktop).
   - Check if navigation menus are properly adapted for mobile (e.g., hamburger menu).
   - Ensure that forms and input fields are usable on mobile devices.

6. Typography and Readability:
   - Ensure text is legible on both mobile and desktop views.
   - Check if font sizes adapt appropriately between views.
   - Verify line lengths are comfortable for reading, especially on mobile.

7. Interactive Elements:
   - Ensure buttons, links, and other interactive elements are easily tappable on mobile (minimum touch target size).
   - Check if hover states are properly handled or if they cause issues on touch devices.

8. Performance Indicators:
   - Look for any signs of slow-loading elements or potential performance issues, especially on mobile.

9. Consistency:
   - Ensure brand consistency is maintained across both views.
   - Check if color schemes, fonts, and overall design language remain consistent.

Output Format:
Provide your analysis output enclosed in <analysis_result> XML tags. Within these tags, include a JSON object with the following structure:
<analysis_result>
{
  "repairRequired": true/false,
  "issues": [
    {
      "description": "Detailed issue description",
      "possibleFix": "Suggested fix for the issue",
      "affectedView": "mobile/desktop/both",
      "severity": "high/medium/low"
    },
    ...
  ]
}
</analysis_result>

repairRequired: Set to true if any issues are found that require repair. Only set this to false after a thorough and detailed analysis of all aspects of the website. Even minor issues should be reported.
issues: An array of objects, each containing:
- description: A string describing the identified issue in detail.
- possibleFix: A string suggesting a potential solution to the issue.
- affectedView: Specify whether the issue affects "mobile", "desktop", or "both" views.
- severity: Indicate the severity of the issue as "high", "medium", or "low".

Additional Instructions:
- Be specific in your descriptions, referencing exact locations or elements in the screenshots.
- Provide concise yet detailed explanations for each issue and its possible fix.
- If no issues are found after a thorough analysis, set repairRequired to false and leave the issues array empty. However, be extremely cautious about concluding that no repairs are required. Even minor imperfections should be noted.
- Focus on objective problems rather than subjective design preferences.
- Prioritize mobile responsiveness, layout issues, and broken images in your analysis.
- Consider the overall user experience when identifying and prioritizing issues.
- When suggesting fixes, provide practical and implementable solutions that address the specific issue identified.
- Pay extra attention to the main content sections in both desktop and mobile views.
- Ensure that your analysis covers both views comprehensively, noting any discrepancies between them.
- When suggesting fixes, consider how they will affect both mobile and desktop layouts simultaneously.

Remember, your analysis should be based solely on the visual information provided in the screenshots. Do not make assumptions about functionality or features that are not visible in the images. Ensure that you give thorough consideration to mobile responsiveness, layout issues, and broken images in your analysis, with special emphasis on the main content areas. Be meticulous in your examination and err on the side of reporting issues rather than dismissing them. Always enclose your output in the <analysis_result> tags.`;

const prepareRepairPrompt = (analysisResult, currentHtml) => {
  const issuesDescription = analysisResult.issues
    .map((issue, index) => {
      const viewInfo =
        issue.affectedView === "both"
          ? "both mobile and desktop views"
          : `${issue.affectedView} view`;

      return `${index + 1}. [${issue.severity.toUpperCase()}] ${
        issue.description
      } (Affects ${viewInfo})
 Possible fix: ${issue.possibleFix}`;
    })
    .join("\n\n");

  return `
  Current Date: ${currentDate}

  The website analysis has identified the following issues that need to be addressed:

  ${issuesDescription}

  Please repair the HTML code below to fix these issues. Focus on improving mobile responsiveness and resolving layout problems using Tailwind CSS responsive classes. Ensure that you maintain the overall structure and style of the website while addressing the problems identified. It is crucial that your repairs consider both mobile and desktop views simultaneously, with special attention to the main content sections.

  Important: If you notice a specific theme or style (e.g., retro, minimalist, corporate) in the current design, make sure to preserve and enhance this theme while making repairs. The goal is to fix issues without losing the original aesthetic intent of the website.

  Key points to consider when fixing layout issues with Tailwind:

  1. Use responsive prefixes (sm:, md:, lg:, xl:) to apply different styles at various breakpoints.
     Example: class="w-full md:w-1/2 lg:w-1/3" for responsive column widths.

  2. Implement flexbox or grid layouts for better responsiveness:
     - Use 'flex flex-col md:flex-row' to stack elements vertically on mobile and horizontally on larger screens.
     - Consider 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' for responsive grid layouts.

  3. Adjust spacing and padding responsively:
     Example: class="p-4 md:p-6 lg:p-8" for increasing padding on larger screens.

  4. Use 'hidden' and 'block' classes with responsive prefixes to show/hide elements based on screen size:
     Example: class="hidden md:block" to hide an element on mobile but show it on medium screens and up.

  5. Implement a responsive navigation menu:
     - Use 'md:hidden' for mobile menu toggle and 'hidden md:block' for desktop menu items.

  6. Ensure text readability across devices:
     - Adjust font sizes responsively: class="text-sm md:text-base lg:text-lg"
     - Control line length with max-width classes: class="max-w-prose mx-auto"
     - Ensure good contrast between text and background: Use Tailwind's text and background color classes (e.g., "text-gray-900 bg-white" or "text-white bg-gray-800") to maintain readability
     - Handle text over image backgrounds: Apply a semi-transparent overlay (e.g., "bg-black bg-opacity-50") or use backdrop-filter classes (e.g., "backdrop-blur-sm") to improve text legibility on varied backgrounds

  7. Handle images responsively:
     - Use 'object-cover' and 'object-position' for better image cropping.
     - Implement 'w-full' for full-width images that scale with their container.

  8. Improve touch targets for mobile:
     - Increase padding or size of interactive elements on small screens.
     Example: class="p-2 md:p-3 lg:p-4" for buttons or links.

   9. Maintain consistency between mobile and desktop views:
     - Ensure that content hierarchy and importance are preserved across both views.
     - Use responsive classes to adjust layouts while maintaining visual coherence.

  10. Optimize main content sections:
      - Pay special attention to the main content areas, ensuring they are well-structured and easily readable on both mobile and desktop views.
      - Use responsive typography and layout classes to optimize the presentation of key information.

  11. Preserve and enhance the existing theme:
      - Identify the current design theme (e.g., retro, modern, minimalist).
      - Use Tailwind classes that align with the identified theme when making repairs.
      - Maintain consistent color schemes, typography, and design elements that contribute to the theme.
      - If adding new elements or styles, ensure they complement and reinforce the existing aesthetic.

  Current HTML:
  ${currentHtml}

  For your reference, screenshots of the site highlighting these issues are attached.

  Please provide the repaired HTML code enclosed in <repaired_code> tags. And do not include any comments or other text which might be interpreted as part of the code. For example:

  <repaired_code>
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Repaired Website</title>
      <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
      <!-- Your repaired HTML code here -->
  </body>
  </html>
  </repaired_code>

  Prioritize fixes for issues marked as HIGH severity and those affecting the main content sections.

  Remember to leverage Tailwind's utility classes and responsive prefixes to create a fully responsive design that addresses the identified layout and responsiveness issues across both mobile and desktop views.
`;
};

module.exports = { analysisPrompt, prepareRepairPrompt };
