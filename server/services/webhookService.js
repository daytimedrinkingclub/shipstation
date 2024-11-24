const axios = require('axios');

async function postToDiscordWebhook(body, webhook) {
  const webhookUrl = webhook || process.env.DISCORD_WEBHOOK_URL;

  try {
    const response = await axios.post(webhookUrl, body);
    console.log('Message sent to Discord successfully:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error sending message to Discord:', error.message);
    throw error;
  }
}

module.exports = {
  postToDiscordWebhook
};
