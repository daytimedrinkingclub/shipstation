const Razorpay = require("razorpay");
const crypto = require("crypto");

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
        callback_url: "https://shipstation.ai/payment-success",
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
}

module.exports = {
  PaymentService,
  validateRazorpayWebhook: PaymentService.validateWebhook,
};
