const axios = require("axios");

async function postToDiscordWebhook(body) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error(
      "Discord webhook URL is not set in the environment variables."
    );
    return;
  }

  try {
    const response = await axios.post(webhookUrl, body);
    console.log("Message sent to Discord successfully:", response.status);
    return response.data;
  } catch (error) {
    console.error("Error sending message to Discord:", error.message);
    throw error;
  }
}

module.exports = {
  postToDiscordWebhook,
};
