const { getCurrentDate } = require("../../utils/date");

const currentDate = getCurrentDate();

const landingPagePrompt = `
Current Date: ${currentDate}

Create a Modern, Responsive Landing Page

You are a web developer tasked with creating a modern, visually appealing, and fully responsive landing page based on a detailed design analysis. Your primary goal is to accurately recreate the webpage described in the analysis while incorporating the specific design language, trends, and elements identified.

Important: The implementation should be a faithful recreation of the analyzed design. Use the detailed analysis provided to guide your implementation, matching the style, layout, and design language as closely as possible across all device sizes.

General Guidelines:
- Implement the exact design language described in the analysis (e.g., flat design, material design, glassmorphism, neumorphism).
- Utilize the specified layout techniques, ensuring they adapt well to different screen sizes.
- Incorporate the typography and color scheme exactly as detailed, including any color psychology principles applied.
- Structure the layout to match the analysis precisely, paying close attention to overall page structure, content area constraints, and section relationships.
- Implement visual elements, interactions, and subtle design features as described.
- Add micro-animations and interactive elements where specified.
- Ensure the design is fully responsive and looks great on mobile, tablet, and desktop devices.

Technical Requirements:
- Use semantic HTML5 for structure.
- Use JavaScript for functionality, interactions, and enhancing responsiveness.
- Use Tailwind CSS via CDN for styling, matching the described styles as closely as possible.
- Import the specific fonts mentioned, preferably from Google Fonts.
- Use GSAP CDN or another animation library if complex animations are described.
- Implement a mobile-first approach using Tailwind's responsive prefixes (sm:, md:, lg:, xl:).
- Optimize for performance and accessibility.
- Include meta viewport tag for proper responsive behavior.
- Use Font Awesome CDN for icons throughout the website.

Output:
Provide only the full HTML code for the landing page, including:
- All necessary CDN links (Tailwind CSS, fonts, animation libraries)
- Inline JavaScript for functionality, animations, and responsive behavior
- Inline Tailwind CSS classes, making extensive use of responsive utility classes

The code should be neatly commented, explaining different sections, how they correspond to the analyzed design, and any specific responsive considerations.

Responsive Design Focus:
- Implement a mobile-first design approach.
- Use Tailwind's responsive utility classes to adjust layout, spacing, and typography for different screen sizes.
- Ensure all interactive elements are touch-friendly for mobile devices.
- Implement appropriate navigation patterns for mobile if specified.
- Use flexible layouts (e.g., Flexbox or CSS Grid) to ensure proper content reflow.
- Optimize images for different screen sizes and resolutions.

JavaScript Enhancements:
- Implement smooth scrolling for anchor links.
- Add interactive elements like dropdowns, accordions, or carousels if specified.
- Implement lazy loading for images to improve performance.
- Add subtle scroll animations or reveal effects if mentioned.
- Ensure all JavaScript interactions are accessible and work well across devices.

Specific Design Language Implementation:
- For glassmorphism, implement the frosted glass effect with appropriate opacity and blur values.
- For neumorphic elements, carefully recreate the soft UI effect with precise shadow details.
- Implement any gradient effects, micro-interactions, or parallax scrolling as described.
- If dark mode elements are mentioned, ensure proper implementation and color contrast.

Inspiration Image Analysis:
\${inspiration_image_analysis}

Guidelines:
\${guidelines}

Output Instructions:

Based on the above guidelines and the inspiration image analysis, create the HTML code for the responsive landing page. Follow these specific instructions:

1. Use the inspiration image analysis as a guide for the overall visual design, layout, color scheme, and aesthetic elements.

2. The content, functionality, and purpose of the website should strictly adhere to the user requirement guidelines provided (company name, description, required sections, etc.).

3. Combine the visual design inspiration with the specified content requirements to create a cohesive and effective landing page.

4. Include all necessary HTML elements, inline Tailwind CSS classes, and JavaScript functionality to fully implement the design across all device sizes.

5. Ensure that the final output is a complete, functioning HTML file that accurately represents both the inspirational design and the required content/functionality.

Remember, while the visual design is inspired by the analysis, the actual content and purpose of the website must align with the specified user requirements.
`;

const portfolioPrompt = `
Current Date: ${currentDate}

You are a web developer tasked with creating a modern, visually appealing, and fully responsive portfolio website based on a detailed design analysis. Your primary goal is to accurately recreate the webpage described in the analysis while incorporating the specific design language, trends, and elements identified.

Important: The implementation should be a faithful recreation of the analyzed design. Use the detailed analysis provided to guide your implementation, matching the style, layout, and design language as closely as possible across all device sizes.

General Guidelines:
- Implement the exact design language described in the analysis (e.g., flat design, material design, glassmorphism, neumorphism).
- Utilize the specified layout techniques, ensuring they adapt well to different screen sizes.
- Incorporate the typography and color scheme exactly as detailed, including any color psychology principles applied.
- Structure the layout to match the analysis precisely, paying close attention to overall page structure, content area constraints, and section relationships.
- Implement visual elements, interactions, and subtle design features as described.
- Add micro-animations and interactive elements where specified, particularly for project showcases.
- Ensure the design is fully responsive and looks great on mobile, tablet, and desktop devices.

Technical Requirements:
- Use semantic HTML5 for structure.
- Use JavaScript for functionality, interactions, and enhancing responsiveness.
- Use Tailwind CSS via CDN for styling, matching the described styles as closely as possible.
- Import the specific fonts mentioned, preferably from Google Fonts.
- Use GSAP CDN or another animation library if complex animations are described.
- Implement a mobile-first approach using Tailwind's responsive prefixes (sm:, md:, lg:, xl:).
- Optimize for performance and accessibility.
- Include meta viewport tag for proper responsive behavior.
- Use Font Awesome CDN for icons throughout the website.

Output:
Provide only the full HTML code for the portfolio website, including:
- All necessary CDN links (Tailwind CSS, fonts, animation libraries)
- Inline JavaScript for functionality, animations, and responsive behavior
- Inline Tailwind CSS classes, making extensive use of responsive utility classes

The code should be neatly commented, explaining different sections, how they correspond to the analyzed design, and any specific responsive considerations.

Responsive Design Focus:
- Implement a mobile-first design approach.
- Use Tailwind's responsive utility classes to adjust layout, spacing, and typography for different screen sizes.
- Ensure all interactive elements are touch-friendly for mobile devices.
- Implement appropriate navigation patterns for mobile if specified.
- Use flexible layouts (e.g., Flexbox or CSS Grid) to ensure proper content reflow, especially for project showcases.
- Optimize images for different screen sizes and resolutions, particularly for project thumbnails and gallery views.

JavaScript Enhancements:
- Implement smooth scrolling for anchor links.
- Add interactive elements like project filters, modals for project details, or skill progress bars if specified.
- Implement lazy loading for project images to improve performance.
- Add subtle scroll animations or reveal effects for projects and skills sections if mentioned.
- Ensure all JavaScript interactions are accessible and work well across devices.

Specific Portfolio Features:
- Implement a dynamic project showcase with filtering capabilities if specified.
- Create interactive project cards or modals that display detailed project information.
- Add a contact form with basic validation if included in the design.
- Implement a downloadable resume feature if mentioned.
- Create an interactive skills or expertise section, possibly with animated progress bars or charts.
- Add social media links and integration as specified in the design.

Specific Design Language Implementation:
- For glassmorphism, implement the frosted glass effect with appropriate opacity and blur values.
- For neumorphic elements, carefully recreate the soft UI effect with precise shadow details.
- Implement any gradient effects, micro-interactions, or parallax scrolling as described.
- If dark mode elements are mentioned, ensure proper implementation and color contrast.

Inspiration Image Analysis:
\${inspiration_image_analysis}

Guidelines:
\${guidelines}

Output Instructions:

Based on the above guidelines and the inspiration image analysis, create the HTML code for the responsive landing page. Follow these specific instructions:

1. Use the inspiration image analysis as a guide for the overall visual design, layout, color scheme, and aesthetic elements.

2. The content, functionality, and purpose of the website should strictly adhere to the user requirement guidelines provided (company name, description, required sections, etc.).

3. Combine the visual design inspiration with the specified content requirements to create a cohesive and effective landing page.

4. Include all necessary HTML elements, inline Tailwind CSS classes, and JavaScript functionality to fully implement the design across all device sizes.

5. Ensure that the final output is a complete, functioning HTML file that accurately represents both the inspirational design and the required content/functionality.

Remember, while the visual design is inspired by the analysis, the actual content and purpose of the website must align with the specified user requirements.
`;

const mailTemplatePrompt = `
Current Date: ${currentDate}

You are an email developer tasked with creating a visually appealing and widely compatible email template based on a detailed design analysis. Your primary goal is to accurately recreate the email template described in the analysis while ensuring compatibility across various email clients.

Important: The implementation should be a faithful recreation of the analyzed design. Use the detailed analysis provided to guide your implementation, matching the style, layout, and design elements as closely as possible while adhering to email development best practices.

General Guidelines:
- Implement the exact design language described in the analysis, adapting it for email compatibility.
- Utilize table-based layouts to ensure consistent rendering across email clients.
- Incorporate the typography and color scheme exactly as detailed, using web-safe fonts or appropriate fallbacks.
- Structure the layout to match the analysis precisely, paying close attention to overall email structure, content areas, and section relationships.
- Implement visual elements and design features as described, using email-safe techniques.
- Ensure the design is responsive and looks great on mobile devices and desktop email clients.

Technical Requirements:
- Use HTML tables for layout structure to ensure maximum compatibility.
- Use inline CSS for styling, avoiding external stylesheets or <style> tags when possible.
- Implement a hybrid approach using media queries (wrapped in <style> tags) for responsive design, understanding that not all email clients will support this.
- Use web-safe fonts or provide appropriate fallbacks for custom fonts.
- Optimize images for email, including specifying dimensions and using alt text.
- Ensure all links are absolute and include the "https://" prefix.
- Include a plain-text version of the email content.

Output:
Provide the full HTML code for the email template, including:
- Doctype and appropriate meta tags
- Inline CSS styles for all elements
- Table-based layout structure
- Media queries for responsive design (if applicable)
- Preheader text
- All content sections as described in the analysis

The code should be neatly commented, explaining different sections and how they correspond to the analyzed design.

Responsive Design Focus:
- Implement a mobile-first design approach where possible.
- Use media queries to adjust layout, font sizes, and spacing for mobile devices.
- Ensure images are responsive and scale appropriately on different devices.
- Implement appropriate button sizes and spacing for touch interfaces on mobile.
- Use fluid tables and percentage-based widths where appropriate.

Email Client Compatibility:
- Avoid using CSS properties that are not widely supported in email clients (e.g., flexbox, grid).
- Use VML for background images to ensure compatibility with Outlook.
- Provide fallback options for elements or styles that may not be supported in all email clients.
- Test the template across various email clients and devices to ensure consistent rendering.

Specific Email Template Features:
- Implement a clear and prominent call-to-action (CTA) button as specified in the design.
- Create a header area with logo and any navigation elements mentioned.
- Structure the main content area according to the analyzed design, possibly including product showcases, article teasers, or promotional content.
- Add a footer section with unsubscribe link, social media icons, and any legal text as described.
- Implement any dynamic content areas or personalization tokens if mentioned in the analysis.

Inspiration Image Analysis:
\${inspiration_image_analysis}

Guidelines:
\${guidelines}

Output Instructions:

Based on the above guidelines and the inspiration image analysis, create the HTML code for the responsive landing page. Follow these specific instructions:

1. Use the inspiration image analysis as a guide for the overall visual design, layout, color scheme, and aesthetic elements.

2. The content, functionality, and purpose of the website should strictly adhere to the user requirement guidelines provided (company name, description, required sections, etc.).

3. Combine the visual design inspiration with the specified content requirements to create a cohesive and effective landing page.

4. Include all necessary HTML elements, inline Tailwind CSS classes, and JavaScript functionality to fully implement the design across all device sizes.

5. Ensure that the final output is a complete, functioning HTML file that accurately represents both the inspirational design and the required content/functionality.

Remember, while the visual design is inspired by the analysis, the actual content and purpose of the website must align with the specified user requirements.
`;

module.exports = {
  landingPagePrompt: (inspirationImageAnalysis, guidelines) =>
    landingPagePrompt
      .replace("${inspiration_image_analysis}", inspirationImageAnalysis)
      .replace("${guidelines}", guidelines),

  portfolioPrompt: (inspirationImageAnalysis, guidelines) =>
    portfolioPrompt
      .replace("${inspiration_image_analysis}", inspirationImageAnalysis)
      .replace("${guidelines}", guidelines),

  mailTemplatePrompt: (inspirationImageAnalysis, guidelines) =>
    mailTemplatePrompt
      .replace("${inspiration_image_analysis}", inspirationImageAnalysis)
      .replace("${guidelines}", guidelines),
};
