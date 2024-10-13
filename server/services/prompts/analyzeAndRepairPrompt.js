const { getCurrentDate } = require("../../utils/date");

const currentDate = getCurrentDate();

const analysisPrompt = `Current Date: ${currentDate}

You are tasked with analyzing two screenshots of a website—one for mobile and one for desktop view—based solely on visual cues. Your goal is to identify and report only the issues that require repair, including both major and minor problems. Pay special attention to the following areas:

1. Broken Images:
   - General Check: First, perform a general check for any broken images across the entire layout.
   - Specific Areas:
     - Hero Image: Verify if the main banner or featured image (usually at the top of the page) loads correctly.
     - Logo: Ensure the logo is present and not broken.
     - Gallery or Portfolio Sections: Check for missing or broken images in sections displaying collections of images, such as portfolios or galleries.
     - Project Cards: Look closely at any cards that represent projects (e.g., in a grid or list format). Check if each project image displays correctly.
     - Other Visual Sections: Inspect additional sections like "About Me," "Team," "Testimonials," or any place where images are used.

   Important:
   - Consider any image broken if:
     - It displays only alt text or a generic placeholder icon (such as a missing or broken image symbol).
     - There is an empty space where the image should appear.
   - Alt Text Clarification: Alt text is not part of the website's visible content and should be flagged as a broken image if it appears in place of an image. Do not confuse alt text with actual text that is part of the content.

2. Layout Problems:
   - Identify any inconsistencies or malfunctions in layout, such as:
     - Misaligned, overlapping, or improperly spaced elements.
     - Sections that do not align properly between mobile and desktop views.
     - Content that extends beyond screen boundaries or causes horizontal scrolling.

3. Responsiveness Issues:
   - Highlight areas where the design fails to adapt smoothly between different screen sizes, including:
     - Elements that do not resize, reposition, or reflow correctly.
     - Distorted or overlapping content in either mobile or desktop views.

4. Color Contrast Problems:
   - Flag areas where color contrast is insufficient, particularly where text blends into the background. Focus on:
     - Buttons, links, or interactive elements with low contrast.
     - Text against backgrounds that make it difficult to read.

5. Content Visibility:
   - Ensure that all content, including text, images, and buttons, is fully visible. Flag instances where:
     - Content is cut off, cropped, or hidden behind other elements.
     - Key sections or elements are not fully accessible in either view.

6. Text Legibility:
   - Identify text that is difficult to read due to:
     - Inadequate font size, line height, or spacing, especially on mobile devices.

Output Format:
- Provide a JSON object with the following structure:
{
  "repairRequired": true/false,
  "issues": [
    "Issue description 1",
    "Issue description 2",
    ...
  ]
}
- repairRequired: Set to true if any issues are found that require repair; otherwise, set it to false.
- issues: An array of strings describing each identified issue. Focus on areas that require repair, with clear examples from the screenshots. Prioritize the identification of broken images and layout issues, ensuring that alt text used in place of images is flagged correctly as a broken image.

Additional Instructions:
1. Be specific in your descriptions, referencing exact locations or elements in the screenshots.
2. Provide concise yet detailed explanations for each issue.
3. If no issues are found, set repairRequired to false and leave the issues array empty.
4. Focus on objective problems rather than subjective design preferences.
5. If you're unsure about an element, err on the side of caution and include it in the issues list.
6. Consider the user experience when identifying issues, particularly for mobile users.
7. Pay attention to consistency between mobile and desktop views, noting any significant discrepancies.

Remember, your analysis should be based solely on the visual information provided in the screenshots. Do not make assumptions about functionality or features that are not visible in the images.`;

const repairPrompt = (analysisReport, currentHtml) => `
Current Date: ${currentDate}

You are a highly skilled web developer tasked with repairing and improving a website based on an analysis of its current issues. Your goal is to address all identified problems while maintaining the site's original design intent and improving its overall functionality and user experience.

Analysis Results:

${analysisReport}

Current HTML Code:

${currentHtml}

Repair Guidelines
1. Carefully review each issue in the provided analysis results.
2. For each issue, determine the appropriate fix based on web development best practices and the original website guidelines.
3. Prioritize fixes that impact core functionality and user experience.
4. Ensure all repairs maintain or improve the website's accessibility, performance, and responsiveness.
General Repair Strategies
Image Issues
* Replace broken images with appropriate, high-quality images that match the intended content.
* Use the placeholder_image_tool to generate suitable images when necessary.
* Ensure all images have proper alt text for accessibility.
Layout and Responsiveness Issues
* Adjust layouts to ensure proper display across all device sizes.
* Utilize Tailwind CSS responsive classes (sm:, md:, lg:, xl:) to create fluid layouts.
* Ensure interactive elements are easily tappable on mobile devices (minimum 44x44 pixels).
* Implement a responsive navigation menu that works well on both desktop and mobile.
Functionality Issues
* Address any broken links or non-functioning interactive elements.
* Ensure all forms are working correctly and include proper validation.
* Implement smooth scrolling and subtle animations to enhance user experience.
Performance Issues
* Optimize asset loading and rendering.
* Minify CSS and JavaScript where possible.
* Ensure efficient use of web fonts and icon libraries.
Accessibility Issues
* Maintain sufficient color contrast for text and interactive elements.
* Ensure proper heading structure and use of ARIA attributes where necessary.
Technical Requirements
* Use web-components architecture as per the original guidelines.
* Do not use React, Vue, Alpine, or any other frontend library.
* Use Tailwind CSS for styling, including responsive design.
* Utilize Animate.css for animations when needed.
* Use Google Fonts for typography.
* Use FontAwesome for icons.
Code Structure
Maintain the existing single-file structure. Your final repaired code must be enclosed within <repaired_code> tags. Do not include any comments, explanations, or extra text within these tags - only the actual HTML code:
<repaired_code>
<!DOCTYPE html> <html lang="en"> <head> <!-- Meta tags, title, and necessary CSS/JS imports --> </head> <body> <!-- Main content --> <script> // JavaScript for Web Components and interactivity </script> </body> </html> 
</repaired_code>
Delivery
Provide the complete, updated index.html file with all repairs and improvements implemented. The repaired code must be enclosed within <repaired_code> tags as shown above. Include only the HTML code, starting with <!DOCTYPE html> and ending with </html>. Do not include any additional comments, explanations, or text within these tags.
`;

module.exports = { analysisPrompt, repairPrompt };
