const SHIP_LANDING_PAGE = "landing_page";
const SHIP_PORTFOLIO = "portfolio";
const SHIP_AI_AGENT = "ai_agent";

const SHIP_TYPES = {
  [SHIP_LANDING_PAGE]: "landing page",
  [SHIP_PORTFOLIO]: "portfolio",
};

const PROMPT_PLACEHOLDERS = {
  [SHIP_LANDING_PAGE]: `Describe key sections, design preferences, target audience, and purpose. We'll use AI to find additional company info.\n\nExample: "Create a modern landing page for a tech startup called BlaBlaBla. Include a hero section with a catchy headline, features section, and testimonials. Use a blue and white color scheme. Target audience is young professionals. Reference image: [URL]"`,
  [SHIP_PORTFOLIO]: `Describe key sections, design style, target audience, and highlights. Include relevant links. We'll use AI to gather more information about you.\n\nExample: "Create a vibrant portfolio for a UX/UI designer. Include an about section, a project gallery with case studies, a skills section, and a contact form. Use a bold color scheme with contrasting elements. Target audience is tech companies and startups. Highlight my award-winning mobile app design. LinkedIn profile: [URL]. Behance profile: [URL]. Reference image: [URL]"`,
};

export {
  SHIP_TYPES,
  SHIP_LANDING_PAGE,
  SHIP_PORTFOLIO,
  SHIP_AI_AGENT,
  PROMPT_PLACEHOLDERS,
};
