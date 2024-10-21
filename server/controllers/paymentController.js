const {
  validateRazorpayWebhook,
  validatePaypalWebhook,
} = require("../services/paymentService");
const { getUserIdFromEmail } = require("../services/supabaseService");
const {
  insertPayment,
  getUserProfile,
  updateUserProfile,
} = require("../services/dbService");
const { postToDiscordWebhook } = require("../services/webhookService");

exports.handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (validateRazorpayWebhook(req.body, signature, secret)) {
    const event = req.body.event;
    const { payload } = req.body;

    if (event === "order.paid") {
      const email = payload.payment?.entity?.email;
      const amountInRs = payload.payment?.entity?.amount / 100;
      const orderId = payload.order?.entity?.id;
      const paymentId = payload.payment?.entity?.id;
      const user_id = await getUserIdFromEmail(email);
      const paymentPayload = {
        payload,
        user_id,
        transaction_id: payload.payment?.entity.acquirer_data?.rrn,
        status: "successful",
        provider: "razorpay",
      };

      await insertPayment(paymentPayload);

      const profile = await getUserProfile(user_id);
      const { available_ships } = profile;
      const profilePayload = { available_ships: available_ships + 1 };

      await updateUserProfile(user_id, profilePayload);

      const webhookPayload = {
        content: "New payment received!",
        embeds: [
          {
            title: "Payment Details",
            fields: [
              { name: "Amount", value: `Rs ${amountInRs}` },
              { name: "Email", value: email },
              { name: "Order ID", value: orderId },
              { name: "Payment ID", value: paymentId },
            ],
          },
        ],
      };
      postToDiscordWebhook(webhookPayload);

      res.status(200).json({ status: "Ships added!" });
    } else {
      res.status(400).json({ error: "Event not handled" });
    }
  } else {
    res.status(400).json({ error: "Invalid signature" });
  }
};

exports.handlePaypalWebhook = async (req, res) => {
  try {
    const webhookEvent = req.body;
    const { headers } = req;

    const isValid = await validatePaypalWebhook(headers, webhookEvent);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    if (webhookEvent.event_type === "CHECKOUT.ORDER.COMPLETED") {
      const email = webhookEvent.resource.payer?.email_address;
      const user_id = await getUserIdFromEmail(email);
      if (!user_id) {
        console.error(`User not found for email: ${email}`);
        return res.status(404).json({ error: "User not found" });
      }

      const productId = webhookEvent.resource.purchase_units[0]?.reference_id;
      const PRODUCT_TYPES = {
        "3ZRLN4LJVSRVY": "Landing Page",
        M3CSSZ43CE75J: "Portfolio Page",
      };
      const productType = PRODUCT_TYPES[productId] || "unknown product";

      const paymentPayload = {
        payload: webhookEvent,
        user_id,
        transaction_id: webhookEvent.resource.id,
        status: "successful",
        provider: "paypal",
        ships_count: 1,
      };

      await insertPayment(paymentPayload);

      const profile = await getUserProfile(user_id);

      const profilePayload = { available_ships: profile.available_ships + 1 };
      await updateUserProfile(user_id, profilePayload);

      const discordWebhookPayload = {
        content: `New PayPal payment received for ${productType}!`,
        embeds: [
          {
            title: "Payment Details",
            fields: [
              { name: "Email", value: email },
              { name: "Payment ID", value: webhookEvent.resource.id },
              { name: "Product", value: productType },
            ],
          },
        ],
      };

      await postToDiscordWebhook(discordWebhookPayload);
      res.status(200).json({ status: "Ships added!" });
    } else {
      res.status(400).json({ error: "Event not handled" });
    }
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
