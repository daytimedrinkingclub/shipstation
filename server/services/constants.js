const SHIP_TYPES = {
  PORTFOLIO: "portfolio",
  LANDING_PAGE: "landing_page",
};

const DEFAULT_MESSAGES = {
  [SHIP_TYPES.PORTFOLIO]: [
    { role: "user", content: "I want to create a portfolio" },
  ],
  [SHIP_TYPES.LANDING_PAGE]: [
    { role: "user", content: "I want to create a landing page" },
  ],
};

module.exports = {
  SHIP_TYPES,
  DEFAULT_MESSAGES,
};
