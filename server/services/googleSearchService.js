const axios = require("axios");
const { API_KEY, SEARCH_ENGINE_ID } = process.env;

async function performSearch(query) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await axios.get(url);
    const searchResults = response.data.items.map((item) => item.snippet);
    return searchResults;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

module.exports = {
  performSearch,
};
