const axios = require("axios");
require("dotenv").config();

const BASE_URL = "https://api.tavily.com/";

async function performSearch(query, options = {}) {
  const {
    searchDepth = "advanced",
    includeImages = false,
    includeAnswer = true,
    includeRawContent = false,
    maxResults = 3,
    includeDomains = [],
    excludeDomains = [],
  } = options;

  const requestData = {
    api_key: process.env.TAVILY_API_KEY,
    query,
    search_depth: searchDepth,
    include_images: includeImages,
    include_answer: includeAnswer,
    include_raw_content: includeRawContent,
    max_results: maxResults,
    include_domains: includeDomains,
    exclude_domains: excludeDomains,
  };

  try {
    const response = await axios.post(`${BASE_URL}search`, requestData);
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.error("Error performing search:", error);
    return { answer: "No search relevant data found" };
  }
}

module.exports = {
  performSearch,
};
