const dotenv = require("dotenv");
dotenv.config();

const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/shipstation-websites/ai-headshots`;

const getRandomHeadshots = (profession, gender, count = 1) => {
  const validProfessions = ["developer", "designer", "other"];
  const validGenders = ["male", "female"];

  // Convert profession to lowercase and use 'other' as fallback if invalid
  profession = profession ? profession.toLowerCase() : "";
  if (!validProfessions.includes(profession)) {
    profession = "other";
  }

  // If gender is 'random' or invalid, choose a random gender
  if (gender === "random" || !validGenders.includes(gender)) {
    gender = validGenders[Math.floor(Math.random() * validGenders.length)];
  }

  // Determine the maximum number based on profession
  const maxNumber = profession === "other" ? 20 : 10;

  // Ensure count is within valid range
  count = Math.max(1, Math.min(10, count));

  // Generate an array of unique random numbers
  const randomNumbers = [];
  while (randomNumbers.length < count) {
    const num = Math.floor(Math.random() * maxNumber) + 1;
    if (!randomNumbers.includes(num)) {
      randomNumbers.push(num);
    }
  }

  // Construct the URLs
  const imageUrls = randomNumbers.map(
    (num) =>
      `${baseUrl}/${profession}/${gender}/${profession}-${gender}-${num}.jpeg`
  );

  return imageUrls;
};

module.exports = {
  getRandomHeadshots,
};
