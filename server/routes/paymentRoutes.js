const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/payment-webhook", paymentController.handleRazorpayWebhook);
router.post("/paypal-webhook", paymentController.handlePaypalWebhook);
router.post("/paddle-webhook", paymentController.handlePaddleWebhook);

module.exports = router;
