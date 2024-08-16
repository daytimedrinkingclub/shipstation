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
    imageQuery = "",
  } = options;

  // Tavily API has a max query length of 400 characters
  // Error: "Query is too long. Max query length is 400 characters."

  // Use imageQuery as the main query if the primary query is empty
  const effectiveQuery = query || imageQuery;

  // Truncate the query to 400 characters
  const truncatedQuery = effectiveQuery.slice(0, 400);

  const requestData = {
    api_key: process.env.TAVILY_API_KEY,
    query: truncatedQuery,
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

    // If there's a separate imageQuery, perform another search for images
    if (imageQuery && imageQuery !== query) {
      const truncatedImageQuery = imageQuery.slice(0, 400);
      const imageRequestData = {
        ...requestData,
        query: truncatedImageQuery,
        include_images: true,
        include_answer: false,
        max_results: 5,
      };
      const imageResponse = await axios.post(
        `${BASE_URL}search`,
        imageRequestData
      );
      response.data.image_results = imageResponse.data.images || [];
    } else {
      response.data.image_results = response.data.images || [];
    }

    return response.data;
  } catch (error) {
    console.error("Error performing search:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
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
