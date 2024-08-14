const SHIP_TYPES = {
  PORTFOLIO: "portfolio",
  LANDING_PAGE: "landing_page",
  PROMPT: "prompt",
};

const DEFAULT_MESSAGES = {
  [SHIP_TYPES.PORTFOLIO]: [
    {
      role: "user",
      content: "Hi, can you help me with a portfolio website task I have?",
    },
    {
      role: "assistant",
      content: "Yes, I am well equipped to help you create a portfolio",
    },
    { role: "user", content: "I want to create a portfolio" },
  ],
  [SHIP_TYPES.LANDING_PAGE]: [
    {
      role: "user",
      content: "Hi, can you help me with a landing page task I have?",
    },
    {
      role: "assistant",
      content: "Yes, I am well equipped to help you create a landing page",
    },
    { role: "user", content: "I want to create a landing page" },
  ],
};

module.exports = {
  SHIP_TYPES,
  DEFAULT_MESSAGES,
};
