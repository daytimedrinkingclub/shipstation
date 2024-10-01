// Function to get the current date in the format "Thursday, September 26, 2024"
function getCurrentDate() {
  const options = {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  };
  const now = new Date();
  return now.toLocaleDateString("en-US", options);
}

// Export the functions to use them elsewhere
module.exports = {
  getCurrentDate,
};
