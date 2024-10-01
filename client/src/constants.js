const SHIP_LANDING_PAGE = "landing_page";
const SHIP_PORTFOLIO = "portfolio";
const SHIP_AI_AGENT = "ai_agent";
const SHIP_EMAIL_TEMPLATE = "email_template";

const SHIP_TYPES = {
  [SHIP_LANDING_PAGE]: "landing page",
  [SHIP_PORTFOLIO]: "portfolio",
  [SHIP_EMAIL_TEMPLATE]: "email template",
};

const PROMPT_PLACEHOLDERS = {
  [SHIP_LANDING_PAGE]: `Describe key sections, design preferences, target audience, and purpose. We'll use AI to find additional company info.\n\nExample: "Create a modern landing page for a tech startup called BlaBlaBla. Include a hero section with a catchy headline, features section, and testimonials. Use a blue and white color scheme. Target audience is young professionals."`,
  [SHIP_PORTFOLIO]: `Describe key sections, design style, target audience, and highlights. Include relevant links. We'll use AI to gather more information about you.\n\nExample: "Create a vibrant portfolio for a UX/UI designer. Include an about section, a project gallery with case studies, a skills section, and a contact form. Use a bold color scheme with contrasting elements. Target audience is tech companies and startups. Highlight my award-winning mobile app design."`,
  [SHIP_EMAIL_TEMPLATE]: `Describe the purpose of the email, target audience, key sections, and desired tone. Include any specific design preferences or branding guidelines.\n\nExample: "Create a professional email template for a B2B SaaS company's monthly newsletter. Include sections for product updates, industry news, and customer success stories. Use a clean, modern design with the company's blue and gray color scheme. Target audience is existing customers and potential leads in the tech industry."`,
};

export {
  SHIP_TYPES,
  SHIP_LANDING_PAGE,
  SHIP_PORTFOLIO,
  SHIP_AI_AGENT,
  SHIP_EMAIL_TEMPLATE,
  PROMPT_PLACEHOLDERS,
};
