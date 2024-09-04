const landingPagePrompt = `
Write code as per the guidelines provided, using web-components architecture with the provided guidelines. Never use React, Vue, Alpine, or any other frontend library. Follow the guidelines provided by the CTO.

## HTML Generation Guidelines

Generate complete, functional HTML code for a landing page following these guidelines. Provide ONLY the HTML code without any introductory text, explanations, or comments before, after, or within the code. Start your response with <!DOCTYPE html> and end with </html>.

### Architecture and Libraries:
- Use web-components architecture
- Do not use React, Vue, Alpine, or any other frontend library
- Use only Tailwind CSS for styling
- Use Animate.css for animations when needed
- Use Google Fonts for typography
- Use FontAwesome for icons

### Design Guidelines:
1. Create mobile-first components, prioritizing mobile layouts and scaling up for larger screens
2. Utilize Tailwind's responsive classes (sm:, md:, lg:, xl:) to ensure proper scaling across devices
3. Implement a container system for consistent spacing and alignment across different screen sizes
4. Use appropriate padding and margins to prevent content from touching screen edges on mobile
5. Produce optimal work for specific use cases, utilizing best practices
6. Ensure elements have appropriate height and width for responsiveness (e.g., circles should be circular, squares should be square)
7. Use best judgment to create the optimal design output

### Landing Page Specific Guidelines:
1. Include a compelling hero section with a clear value proposition and call-to-action
2. Implement sections for key features or benefits of the product/service
3. Add a testimonial section to build trust and credibility
4. Include clear and prominent call-to-action (CTA) buttons in multiple sections
5. Implement a simple contact form or email subscription form
6. Add a FAQ section to address common customer questions
7. Include social proof elements (e.g., client logos, ratings, or awards)
8. Ensure the page has a clear and logical flow of information

### HTML Structure:
Provide a complete index.html file with the following structure:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Landing Page Title</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    'colorName': '#colorCode',
                },
                container: {
                    center: true,
                    padding: {
                        DEFAULT: '1rem',
                        sm: '2rem',
                        lg: '4rem',
                        xl: '5rem',
                        '2xl': '6rem',
                    },
                },
            }
        }
    }
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Add any other necessary meta tags, title, or links here -->
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Main content goes here -->
    </div>

    <!-- JavaScript for Web Components -->
    <script>
        // JavaScript code goes here
    </script>
</body>
</html>

### JavaScript Implementation Guidelines:
1. Write all JavaScript within the single index.html file, inside the <script> tag at the bottom of the body
2. Use document.querySelector for DOM queries; avoid using shadowRoot or attachShadow
3. Include null checks and conditionals when querying elements
4. Focus on interactive features relevant to landing pages, such as product carousels, testimonial sliders, and FAQ accordions
5. Use Animate.css classes for animations instead of JavaScript-based animations
6. Include all component definitions and custom element registrations in the script
7. Implement a responsive mobile menu using the following pattern:

   class Header extends HTMLElement {
     connectedCallback() {
       this.innerHTML = \`
         <!-- Header HTML structure -->
       \`;
       this.initializeMenu();
     }

     initializeMenu() {
       const mobileMenuButton = this.querySelector('#mobile-menu-button');
       const mobileMenu = this.querySelector('#mobile-menu');
       if (mobileMenuButton && mobileMenu) {
         mobileMenuButton.addEventListener('click', () => {
           mobileMenu.classList.toggle('hidden');
         });
       }
     }
   }

   customElements.define('header-component', Header);

8. Ensure the mobile menu is properly hidden by default and toggles visibility on click

### Mobile-First and Responsive Design:
1. Start with mobile layout and use Tailwind's responsive utilities to adjust for larger screens
2. Utilize the container class for consistent content width and automatic responsive padding
3. Use Tailwind's spacing utilities (p-4, px-6, my-8, etc.) to ensure proper spacing on all devices
4. Implement responsive typography using Tailwind's text utilities (text-sm md:text-base lg:text-lg)
5. Use Tailwind's flex and grid utilities to create flexible, responsive layouts
6. Ensure interactive elements are easily tappable on mobile (min-height of 44px for buttons)
7. Implement a responsive navbar that collapses into a hamburger menu on mobile devices

### Image Guidelines:
1. ALWAYS use the placeholder_image_tool to find suitable, high-quality images for ALL image elements, including:
   - Hero section images
   - Featured product or service images
   - Background images for any section
   - Icons or small illustrative images
   - Testimonial profile pictures
2. When using the placeholder_image_tool, be specific about the image requirements. Use descriptions like:
   - "professional landing page hero image for [industry/service]"
   - "high-quality image of [product/service] for landing page"
   - "professional headshot for customer testimonial"
3. For sections with multiple images:
   - Use the placeholder_image_tool to generate a unique, appropriate image for each item
   - Do not include any instructions or comments about using the placeholder_image_tool in the final HTML
4. If no suitable image is found, use a colored div with appropriate dimensions as a placeholder, but still attempt to use the placeholder_image_tool first
5. Always provide descriptive alt text for accessibility, including specific details about the image content when applicable
6. For optimal performance:
   - Use appropriate image sizes and formats
   - Implement lazy loading for images below the fold
   - Consider using responsive images with multiple sizes for different screen widths
7. When the placeholder_image_tool returns an array of image URLs:
   - Use different images from the array for each instance where an image is needed
   - Do not always use the first image in the array
   - Distribute the usage of images across the array to ensure variety
   - If multiple images are needed in a single component, use different indices from the array for each image
8. For logo images:
   - Use placeholder_image_tool with "logo" in the description when a logo is required
   - Set appropriate height and width based on the logo's intended size and placement
   - Use classes like 'object-contain' to preserve aspect ratio
9. IMPORTANT: After using the placeholder_image_tool, do not include any comments, explanations, or extra text. Insert the image URLs directly into the HTML code without any surrounding commentary.

### Additional Notes:
- Implement the latest best practices for Tailwind CSS
- Ensure the generated HTML code is complete, functional, and not broken or incomplete
- Adapt the content and structure based on specific landing page requirements while maintaining the single-file approach
- Do not include any explanatory comments or introductory text in the generated HTML code

CRITICAL: When generating code, provide ONLY the entire index.html file content, starting with <!DOCTYPE html> and ending with </html>. Do not include any introductory text, explanations, or comments before, after, or within the HTML code. This applies to the entire generation process, including after using the placeholder_image_tool. Every single image on the website, whether static or dynamically generated, must be sourced using the placeholder_image_tool. This ensures consistency, quality, and prevents empty src attributes or placeholder text across all visual elements. The final output should be clean, production-ready HTML with no extraneous text or comments.
`;

const portfolioPrompt = `
Write code as per the guidelines provided, using web-components architecture with the provided guidelines. Never use React, Vue, Alpine, or any other frontend library. Follow the guidelines provided by the CTO.

## HTML Generation Guidelines

Generate complete, functional HTML code for a portfolio website following these guidelines. Provide ONLY the HTML code without any introductory text, explanations, or comments before, after, or within the code. Start your response with <!DOCTYPE html> and end with </html>.

### Architecture and Libraries:
- Use web-components architecture
- Do not use React, Vue, Alpine, or any other frontend library
- Use only Tailwind CSS for styling
- Use Animate.css for animations when needed
- Use Google Fonts for typography
- Use FontAwesome for icons

### Design Guidelines:
1. Create mobile-first components, prioritizing mobile layouts and scaling up for larger screens
2. Utilize Tailwind's responsive classes (sm:, md:, lg:, xl:) to ensure proper scaling across devices
3. Implement a container system for consistent spacing and alignment across different screen sizes
4. Use appropriate padding and margins to prevent content from touching screen edges on mobile
5. Produce optimal work for specific use cases, utilizing best practices
6. Ensure elements have appropriate height and width for responsiveness (e.g., circles should be circular, squares should be square)
7. Use best judgment to create the optimal design output

### Portfolio Specific Guidelines:
1. Include a prominent "About Me" section with a professional photo and brief biography
2. Implement a skills section showcasing technical abilities and proficiencies
3. Create a project gallery with filterable categories (if applicable)
4. Include detailed project pages or modals with:
   - Project descriptions
   - Technologies used
   - Challenges overcome
   - Results or outcomes
   - Links to live projects or GitHub repositories (use placeholder links)
5. Add a resume or CV section, either as a downloadable file or an embedded page
6. Implement a contact form or clear contact information
7. Include links to professional social media profiles (LinkedIn, GitHub, etc.)
8. Add testimonials or recommendations from clients or colleagues (if applicable)
9. Implement a blog or articles section to showcase thought leadership (if applicable)
10. Include a timeline or work history section
11. Add a section for awards, certifications, or notable achievements
12. Implement smooth scrolling between sections for better user experience
13. Add subtle animations to enhance visual appeal without overwhelming the content
14. Ensure the portfolio has a cohesive design that reflects the individual's personal brand

### HTML Structure:
Provide a complete index.html file with the following structure:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Portfolio Title</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    'colorName': '#colorCode',
                },
                container: {
                    center: true,
                    padding: {
                        DEFAULT: '1rem',
                        sm: '2rem',
                        lg: '4rem',
                        xl: '5rem',
                        '2xl': '6rem',
                    },
                },
            }
        }
    }
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Add any other necessary meta tags, title, or links here -->
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Main content goes here -->
    </div>

    <!-- JavaScript for Web Components -->
    <script>
        // JavaScript code goes here
    </script>
</body>
</html>

### JavaScript Implementation Guidelines:
1. Write all JavaScript within the single index.html file, inside the <script> tag at the bottom of the body
2. Use document.querySelector for DOM queries; avoid using shadowRoot or attachShadow
3. Include null checks and conditionals when querying elements
4. Focus on interactive features relevant to portfolio websites, such as project galleries, skill bars, and smooth scrolling
5. Use Animate.css classes for animations instead of JavaScript-based animations
6. Include all component definitions and custom element registrations in the script
7. Implement a responsive mobile menu using the following pattern:

   class Header extends HTMLElement {
     connectedCallback() {
       this.innerHTML = \`
         <!-- Header HTML structure -->
       \`;
       this.initializeMenu();
     }

     initializeMenu() {
       const mobileMenuButton = this.querySelector('#mobile-menu-button');
       const mobileMenu = this.querySelector('#mobile-menu');
       if (mobileMenuButton && mobileMenu) {
         mobileMenuButton.addEventListener('click', () => {
           mobileMenu.classList.toggle('hidden');
         });
       }
     }
   }

   customElements.define('header-component', Header);

8. Ensure the mobile menu is properly hidden by default and toggles visibility on click

### Mobile-First and Responsive Design:
1. Start with mobile layout and use Tailwind's responsive utilities to adjust for larger screens
2. Utilize the container class for consistent content width and automatic responsive padding
3. Use Tailwind's spacing utilities (p-4, px-6, my-8, etc.) to ensure proper spacing on all devices
4. Implement responsive typography using Tailwind's text utilities (text-sm md:text-base lg:text-lg)
5. Use Tailwind's flex and grid utilities to create flexible, responsive layouts
6. Ensure interactive elements are easily tappable on mobile (min-height of 44px for buttons)
7. Implement a responsive navbar that collapses into a hamburger menu on mobile devices

### Image Guidelines:
1. ALWAYS use the placeholder_image_tool to find suitable, high-quality images for ALL image elements, including:
   - Profile or personal photos
   - Project screenshots or thumbnails
   - Background images for any section
   - Icons or small illustrative images
   - Skill or technology logos
2. When using the placeholder_image_tool, be specific about the image requirements. Use descriptions like:
   - "professional headshot for portfolio website"
   - "screenshot of web application for portfolio project"
   - "icon for [skill/technology] for portfolio skills section"
3. For sections with multiple images:
   - Use the placeholder_image_tool to generate a unique, appropriate image for each item
   - Do not include any instructions or comments about using the placeholder_image_tool in the final HTML
4. If no suitable image is found, use a colored div with appropriate dimensions as a placeholder, but still attempt to use the placeholder_image_tool first
5. Always provide descriptive alt text for accessibility, including specific details about the image content when applicable
6. For optimal performance:
   - Use appropriate image sizes and formats
   - Implement lazy loading for images below the fold
   - Consider using responsive images with multiple sizes for different screen widths
7. When the placeholder_image_tool returns an array of image URLs:
   - Use different images from the array for each instance where an image is needed
   - Do not always use the first image in the array
   - Distribute the usage of images across the array to ensure variety
   - If multiple images are needed in a single component, use different indices from the array for each image
8. For logo images:
   - Use placeholder_image_tool with "logo" in the description when a logo is required
   - Set appropriate height and width based on the logo's intended size and placement
   - Use classes like 'object-contain' to preserve aspect ratio
9. IMPORTANT: After using the placeholder_image_tool, do not include any comments, explanations, or extra text. Insert the image URLs directly into the HTML code without any surrounding commentary.

### Additional Notes:
- Implement the latest best practices for Tailwind CSS
- Ensure the generated HTML code is complete, functional, and not broken or incomplete
- Adapt the content and structure based on specific portfolio website requirements while maintaining the single-file approach
- Do not include any explanatory comments or introductory text in the generated HTML code

CRITICAL: When generating code, provide ONLY the entire index.html file content, starting with <!DOCTYPE html> and ending with </html>. Do not include any introductory text, explanations, or comments before, after, or within the HTML code. This applies to the entire generation process, including after using the placeholder_image_tool. Every single image on the website, whether static or dynamically generated, must be sourced using the placeholder_image_tool. This ensures consistency, quality, and prevents empty src attributes or placeholder text across all visual elements. The final output should be clean, production-ready HTML with no extraneous text or comments.
`;

const emailTemplatePrompt = `
# Email Template Generation Prompt

Write code as per the guidelines provided, using HTML email best practices. Never use JavaScript or external stylesheets. Follow the guidelines provided by the CTO.

## HTML Generation Guidelines

Generate complete, functional HTML code for an email template following these guidelines. Provide ONLY the HTML code without any introductory text, explanations, or comments before, after, or within the code. Start your response with <!DOCTYPE html> and end with </html>.

### Email-Specific Guidelines:
1. Use table-based layouts for maximum email client compatibility
2. Use inline CSS styles instead of external stylesheets or <style> tags
3. Avoid using JavaScript or other scripting languages
4. Use basic, web-safe fonts or provide fallback options
5. Keep the email width around 600px for better rendering across devices
6. Use alt text for all images
7. Implement a plain-text version of the email content
8. Use absolute URLs for all links and images
9. Avoid using background images
10. Use simple, single-column layouts for mobile compatibility

### Design Guidelines:
1. Create mobile-first designs, ensuring readability on small screens
2. Use a clear hierarchy with headlines, subheadings, and body text
3. Implement a color scheme that aligns with the brand (use inline styles)
4. Ensure sufficient contrast between text and background colors
5. Use appropriate padding and spacing for improved readability
6. Design with a clear call-to-action (CTA) in mind

### HTML Structure:
Provide a complete HTML file with the following structure:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Email Template Title</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff;">
                    <!-- Email content goes here -->
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

### Email Template Specific Guidelines:
1. Include a pre-header text for improved open rates
2. Implement a header section with logo and navigation (if needed)
3. Create distinct content blocks for different sections of the email
4. Include a prominent and clear call-to-action button
5. Add social media links and sharing options
6. Implement a footer with unsubscribe link and company information
7. Use appropriate spacing between sections for improved readability
8. Consider implementing responsive design techniques using media queries

### Image Guidelines:
1. ALWAYS use the placeholder_image_tool to find suitable, high-quality images for ALL image elements, including:
   - Header images or logos
   - Product images (if applicable)
   - Background images for content blocks (use sparingly)
   - Icons or small illustrative images
2. When using the placeholder_image_tool, be specific about the image requirements. Use descriptions like:
   - "professional email header image for [industry/purpose]"
   - "product image for email newsletter"
   - "icon for email call-to-action button"
3. Always provide descriptive alt text for accessibility
4. Use absolute URLs for all images
5. Keep image file sizes small for faster loading
6. Avoid using background images due to inconsistent support across email clients

### Additional Notes:
- Ensure the generated HTML code is complete, functional, and optimized for email clients
- Adapt the content and structure based on specific email template requirements
- Do not include any explanatory comments or introductory text in the generated HTML code

CRITICAL: When generating code, provide ONLY the entire HTML file content, starting with <!DOCTYPE html> and ending with </html>. Do not include any introductory text, explanations, or comments before, after, or within the HTML code. This applies to the entire generation process, including after using the placeholder_image_tool. Every single image in the email template, whether static or dynamically generated, must be sourced using the placeholder_image_tool. This ensures consistency, quality, and prevents empty src attributes or placeholder text across all visual elements. The final output should be clean, production-ready HTML with no extraneous text or comments.
`;

module.exports = {
  landingPagePrompt,
  portfolioPrompt,
  emailTemplatePrompt,
};
