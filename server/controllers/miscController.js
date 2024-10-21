const { addDomainMapping } = require("../services/domainService");
const { postToDiscordWebhook } = require("../services/webhookService");

exports.getTaaftTxt = (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=taaft.txt");
  res.send(
    "taaft-verification-code-8e81f753e37549d83c99e93fc5339c3093359943ba88ba5db9c5822e373366f4"
  );
};

exports.addCustomDomain = async (req, res) => {
  const { domain, shipSlug } = req.body;
  if (!domain || !shipSlug) {
    return res
      .status(400)
      .json({ error: "Missing domain, shipId or shipSlug" });
  }

  try {
    await addDomainMapping(domain, shipSlug);
    const webhookPayload = {
      content: "Custom domain request!",
      embeds: [
        {
          title: "Domain Details",
          fields: [
            { name: "Domain", value: domain },
            { name: "Ship Slug", value: shipSlug },
          ],
        },
      ],
    };
    postToDiscordWebhook(webhookPayload);
    res.status(200).json({ message: "Custom domain submitted for verification" });
  } catch (error) {
    console.error("Error adding custom domain:", error);
    res.status(500).json({ error: "Failed to add custom domain" });
  }
};
