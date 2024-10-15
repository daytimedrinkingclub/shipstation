const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
console.log("Unsplash Access Key:", UNSPLASH_ACCESS_KEY);
const UNSPLASH_API_URL = "https://api.unsplash.com";

const unsplashService = {
  searchPhotos: async (query, page = 1, perPage = 3) => {
    try {
      const response = await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
        params: {
          query,
          page,
          per_page: perPage,
          orientation: "squarish", // This parameter requests square images
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error in unsplashService.searchPhotos:", error.message);
      throw error;
    }
  },

  getRandomPhoto: async (query, options = {}) => {
    try {
      const response = await axios.get(`${UNSPLASH_API_URL}/photos/random`, {
        params: {
          query,
          ...options,
          orientation: "squarish", // This parameter requests square images
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error in unsplashService.getRandomPhoto:", error.message);
      throw error;
    }
  },

  // Test function for searchPhotos
  testSearchPhotos: async () => {
    try {
      const query = "professional headshot portrait of a man";
      console.log(`Searching for: "${query}" (square images)`);
      const results = await unsplashService.searchPhotos(query);
      console.log("Search results:");
      results.results.forEach((photo, index) => {
        console.log(
          `${index + 1}. ${photo.description || photo.alt_description}`
        );
        console.log(`   URL: ${photo.urls.full}`);
        console.log(`   Photographer: ${photo.user.name}`);
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

  // test function for getRandomPhoto
  testGetRandomPhoto: async () => {
    try {
      const query = "professional headshot portrait of a man";
      console.log(`Getting a random photo for: "${query}"`);
      const photo = await unsplashService.getRandomPhoto(query, {
        orientation: "squarish",
      });
      console.log("Random photo result:");
      console.log(`Description: ${photo.description || photo.alt_description}`);
      console.log(`URL: ${photo.urls.full}`);
      console.log(`Photographer: ${photo.user.name}`);
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
// unsplashService.testSearchPhotos();
// unsplashService.testGetRandomPhoto();

module.exports = unsplashService;
