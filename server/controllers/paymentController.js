const {
  validateRazorpayWebhook,
  validatePaypalWebhook,
} = require("../services/paymentService");
const { getUserIdFromEmail } = require("../services/supabaseService");
const {
  insertPayment,
  getUserProfile,
  updateUserProfile,
  createUser,
  getUserProfileByPaddleCustomerId
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
      let user_id = await getUserIdFromEmail(email);
      if (!user_id) {
        const { id } = await createUser(email);
        user_id = id;
      }
      const paymentPayload = {
        payload,
        user_id,
        transaction_id: payload.payment?.entity.acquirer_data?.rrn,
        status: "successful",
        provider: "razorpay",
      };

      await insertPayment(paymentPayload);

      const profilePayload = {
        subscription_status: "active",
        subscription_start_date: new Date().toISOString(),
        available_ships: process.env.NUMBER_OF_SHIPS || 1000,
      };

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

exports.handlePaddleWebhook = async (req, res) => {
  try {
    const { event_type, data } = req.body;

    console.log("Received Paddle webhook:", req.body);

    switch (event_type) {
      case "subscription.created": {
        const subscription = data;
        const customerId = subscription.customer_id;

        // Find user by paddle_customer_id
        const userProfile = await getUserProfileByPaddleCustomerId(customerId);
        if (!userProfile) {
          return res.status(404).json({ error: "User not found" });
        }

        const webhookPayload = {
          content: "New Paddle subscription created!",
          embeds: [
            {
              title: "Subscription Details",
              fields: [
                { name: "Customer ID", value: customerId },
                { name: "Subscription ID", value: subscription.id },
                { name: "Status", value: subscription.status },
                { name: "Next Billing", value: subscription.next_billed_at },
              ],
            },
          ],
        };
        await postToDiscordWebhook(webhookPayload);

        res.status(200).json({ status: "Subscription created" });
        break;
      }

      case "customer.created": {
        const { id: customerId, email } = data;

        let user_id = await getUserIdFromEmail(email);
        if (!user_id) {
          const { id } = await createUser(email);
          user_id = id;
        }

        // Update user profile with Paddle customer ID
        await updateUserProfile(user_id, {
          paddle_customer_id: customerId,
        });

        const webhookPayload = {
          content: "New Paddle customer created!",
          embeds: [
            {
              title: "Customer Details",
              fields: [
                { name: "Email", value: email },
                { name: "Customer ID", value: customerId },
              ],
            },
          ],
        };
        await postToDiscordWebhook(webhookPayload);

        res.status(200).json({ status: "Customer created" });
        break;
      }

      case "subscription.activated": {
        const subscription = data;
        const mainItem = subscription.items[0];
        const product = mainItem.product;
        const price = mainItem.price;
        const customerId = subscription.customer_id;

        // Find user by paddle_customer_id
        const userProfile = await getUserProfileByPaddleCustomerId(customerId);
        if (!userProfile) {
          return res.status(404).json({ error: "User not found" });
        }

        const paymentPayload = {
          payload: subscription,
          user_id: userProfile.user_id,
          transaction_id: subscription.id,
          status: "successful",
          provider: "paddle",
        };

        await insertPayment(paymentPayload);

        const profilePayload = {
          subscription_status: "active",
          subscription_start_date: subscription.started_at,
          available_ships: process.env.NUMBER_OF_SHIPS || 1000,
        };

        await updateUserProfile(userProfile.user_id, profilePayload);

        const webhookPayload = {
          content: "New Paddle subscription activated!",
          embeds: [
            {
              title: "Subscription Details",
              fields: [
                { name: "Product", value: product.name },
                {
                  name: "Amount",
                  value: `$${parseInt(price.unit_price.amount) / 100} ${
                    price.unit_price.currency_code
                  }`,
                },
                { name: "Customer ID", value: customerId },
                { name: "Subscription ID", value: subscription.id },
                { name: "Quantity", value: mainItem.quantity.toString() },
                { name: "Next Billing", value: subscription.next_billed_at },
              ],
            },
          ],
        };
        await postToDiscordWebhook(webhookPayload);

        res.status(200).json({ status: "Subscription activated!" });
        break;
      }

      case "subscription.canceled": {
        const subscription = data;
        const customerId = subscription.customer_id;

        const userProfile = await getUserProfileByPaddleCustomerId(customerId);
        if (!userProfile) {
          return res.status(404).json({ error: "User not found" });
        }

        const profilePayload = {
          subscription_status: "cancelled",
          available_ships: 0,
        };

        await updateUserProfile(userProfile.user_id, profilePayload);

        const webhookPayload = {
          content: "Paddle subscription cancelled",
          embeds: [
            {
              title: "Cancellation Details",
              fields: [
                { name: "Customer ID", value: customerId },
                { name: "Subscription ID", value: subscription.id },
                { name: "Cancelled At", value: subscription.canceled_at },
              ],
            },
          ],
        };
        await postToDiscordWebhook(webhookPayload);

        res.status(200).json({ status: "Subscription cancelled" });
        break;
      }

      default:
        console.log(`Unhandled Paddle event type: ${event_type}`);
        res.status(200).json({ status: "Event ignored" });
    }
  } catch (error) {
    console.error("Error handling Paddle webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
