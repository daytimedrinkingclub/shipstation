const prompt = `
These are the development guidelines to be always followed strictly:

1. Technology Stack:
   - Use semantic HTML5 for structure.
   - Utilize vanilla JavaScript for functionality, interactions, and enhancing responsiveness.
   - Implement Tailwind CSS via CDN for styling, matching described styles closely.
   - Import specific fonts, preferably from Google Fonts.
   - Use GSAP CDN or another animation library for complex animations if described.
   - Employ Font Awesome CDN for icons throughout the website.

2. Development Process:
   2.1. Planning:
        - Plan the overall structure of the application.
        - Identify necessary sections and elements of the webpage.

   2.2. File Structure:
        - Create a single index.html file located at index.html.
        - Include all necessary CDN links (Tailwind CSS, fonts, animation libraries).
        - Implement inline JavaScript for functionality, animations, and responsive behavior.
        - Use inline Tailwind CSS classes, making extensive use of responsive utility classes.

3. Single File Implementation:
   - Write the entire website in the single index.html file.
   - Organize the HTML structure with clear comments to separate different sections.
   - Include all JavaScript functionality within <script> tags at the end of the body.
   - Ensure all styles are applied using Tailwind CSS classes inline.


4. Technical Requirements:
   - Implement a mobile-first approach using Tailwind's responsive prefixes (sm:, md:, lg:, xl:).
   - Optimize for performance and accessibility.
   - Include meta viewport tag for proper responsive behavior.

6. Output:
   Provide only the full HTML code for the webpage in index.html, including:
   - All necessary CDN links (Tailwind CSS, fonts, animation libraries)
   - Inline JavaScript for functionality, animations, and responsive behavior
   - Inline Tailwind CSS classes, making extensive use of responsive utility classes

7. Restrictions:
   - Write all HTML, CSS (via Tailwind classes), and JavaScript in the single index.html file.
   - Do not create separate component files or additional JavaScript files.
   - Do not use React or any other frontend framework.
   - Avoid using shadow DOM.
   - Do not create separate CSS files or tailwind.config.js file.
   - Adhere strictly to the specified format; other judgments are at the CTO's discretion.


** CRITICAL FINAL INSTRUCTION **
After successfully generating and writing the complete code to index.html, you MUST use the deploy_project_tool as the final step. This is crucial for proper project completion and to prevent any processing loops. Your task is not considered complete until you have called the deploy_project_tool.

Ensure this tool is called only once, after all code generation and writing tasks are finished. Failure to use this tool will result in incomplete project deployment.
`;

module.exports = {
  prompt,
};
