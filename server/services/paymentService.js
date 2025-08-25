const Razorpay = require("razorpay");
const crypto = require("crypto");
const axios = require("axios");

const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

const PAYPAL_OAUTH_TOKEN_URL = "https://api-m.paypal.com/v1/oauth2/token";
const PAYPAL_VERIFY_WEBHOOK_URL =
  "https://api-m.paypal.com/v1/notifications/verify-webhook-signature";

class PaymentService {
  constructor() {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }

  async createPaymentLink({ amountInInr, description, customer, notes }) {
    try {
      const paymentLink = await this.instance.paymentLink.create({
        amount: amountInInr * 100,
        currency: "INR",
        description,
        customer,
        notify: {
          sms: true,
          email: true,
        },
        notes,
        callback_url: `${process.env.MAIN_URL}/payment-success`,
        callback_method: "get",
      });
      return paymentLink;
    } catch (error) {
      console.error("Error creating payment link:", error);
      throw error;
    }
  }

  async fetchOrderDetails(orderId) {
    try {
      const order = await this.instance.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  }

  static validateWebhook(body, signature, secret) {
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(body));
    const digest = shasum.digest("hex");

    return digest === signature;
  }

  static async getPaypalAccessToken() {
    const auth = Buffer.from(
      `${paypalClientId}:${paypalClientSecret}`
    ).toString("base64");
    try {
      const response = await axios.post(
        PAYPAL_OAUTH_TOKEN_URL,
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw error;
    }
  }

  static async validatePaypalWebhook(headers, webhookEvent) {
    const verifyWebhookSignature = {
      transmission_id: headers["paypal-transmission-id"],
      transmission_time: headers["paypal-transmission-time"],
      cert_url: headers["paypal-cert-url"],
      auth_algo: headers["paypal-auth-algo"],
      transmission_sig: headers["paypal-transmission-sig"],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: webhookEvent,
    };

    try {
      const paypalAccessToken = await PaymentService.getPaypalAccessToken();
      const response = await axios.post(
        PAYPAL_VERIFY_WEBHOOK_URL,
        verifyWebhookSignature,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${paypalAccessToken}`,
          },
        }
      );

      return response.data.verification_status === "SUCCESS";
    } catch (error) {
      console.error("Error verifying PayPal webhook:", error);
      return false;
    }
  }
}

module.exports = {
  PaymentService,
  validateRazorpayWebhook: PaymentService.validateWebhook,
  validatePaypalWebhook: PaymentService.validatePaypalWebhook,
};
