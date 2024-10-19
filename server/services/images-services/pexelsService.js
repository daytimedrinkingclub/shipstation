const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_URL = "https://api.pexels.com/v1";

const pexelsService = {
  searchFlexiblePhotos: async (options) => {
    try {
      const {
        query,
        orientation,
        size = "medium",
        count = 10,
        page = 1,
      } = options;

      const response = await axios.get(`${PEXELS_API_URL}/search`, {
        params: {
          query,
          page,
          per_page: count,
          orientation,
          size,
        },
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error in pexelsService.searchFlexiblePhotos:",
        error.message
      );
      throw error;
    }
  },

  getRandomPhoto: async (query, options = {}) => {
    try {
      const response = await axios.get(`${PEXELS_API_URL}/search`, {
        params: {
          query,
          ...options,
          per_page: 1,
          page: Math.floor(Math.random() * 10) + 1, // Random page between 1 and 10
        },
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });

      return response.data.photos[0];
    } catch (error) {
      console.error("Error in pexelsService.getRandomPhoto:", error.message);
      throw error;
    }
  },
};

async function testSearchFlexiblePhotos() {
  try {
    const options = {
      query: "nature",
      orientation: "landscape",
      size: "medium",
      count: 5,
      page: 1,
    };

    const result = await pexelsService.searchFlexiblePhotos(options);
    console.log("Raw response from searchFlexiblePhotos:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error in testSearchFlexiblePhotos:", error.message);
  }
}

// Uncomment the following line to run the test
// testSearchFlexiblePhotos();

module.exports = pexelsService;
