const axios = require("axios");
require("dotenv").config();

const BASE_URL = "https://api.tavily.com/";

async function performSearch(query, options = {}) {
  const {
    searchDepth = "advanced",
    includeImages = true,
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
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error performing search:", error);
    return { answer: "No search relevant data found" };
  }
}

async function imageSearch(query) {
  const options = {
    method: "GET",
    headers: {
      "x-freepik-api-key": process.env.FREEPIK_API_KEY,
    },
  };
  try {
    const response = await axios.get(
      `https://api.freepik.com/v1/resources?query=${encodeURIComponent(
        query
      )}&limit=5`,
      options
    );
    console.log("Image search response:", response.data);

    const formattedResponse = response.data.data.map((item) => ({
      title: item.title,
      imageUrl: item.image.source.url,
    }));

    return formattedResponse;
  } catch (error) {
    console.error("Error performing image search:", error);
    return [];
  }
}

module.exports = {
  performSearch,
  imageSearch,
};
