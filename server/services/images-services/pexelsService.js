const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
console.log("Pexels API Key:", PEXELS_API_KEY);
const PEXELS_API_URL = "https://api.pexels.com/v1";

const pexelsService = {
  searchPhotos: async (query, page = 1, perPage = 3) => {
    try {
      const response = await axios.get(`${PEXELS_API_URL}/search`, {
        params: {
          query,
          page,
          per_page: perPage,
          orientation: "square", // This parameter requests square images
        },
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error in pexelsService.searchPhotos:", error.message);
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

  // Test function
  testSearchPhotos: async () => {
    try {
      const query = "professional headshot portrait of a man";
      console.log(`Searching for: "${query}" (square images)`);
      const results = await pexelsService.searchPhotos(query);
      console.log("Search results:");
      results.photos.forEach((photo, index) => {
        console.log(`${index + 1}. ${photo.alt}`);
        console.log(`   URL: ${photo.src.large2x}`);
        console.log(`   Photographer: ${photo.photographer}`);
        console.log(`   Dimensions: ${photo.width}x${photo.height}`);
        console.log("---");
      });
    } catch (error) {
      console.error("Error in test function:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
    }
  },

  // New test function for getRandomPhoto
  testGetRandomPhoto: async () => {
    try {
      const query = "professional headshot portrait of a man";
      console.log(`Getting a random photo for: "${query}"`);
      const photo = await pexelsService.getRandomPhoto(query, {
        orientation: "square",
      });
      console.log("Random photo result:");
      console.log(`Alt: ${photo.alt}`);
      console.log(`URL: ${photo.src.large2x}`);
      console.log(`Photographer: ${photo.photographer}`);
      console.log(`Dimensions: ${photo.width}x${photo.height}`);
    } catch (error) {
      console.error("Error in test function:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
    }
  },
};

// Run both test functions
// pexelsService.testSearchPhotos();
// pexelsService.testGetRandomPhoto();

module.exports = pexelsService;
