require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5001,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  BUCKETEER_BUCKET_NAME: process.env.BUCKETEER_BUCKET_NAME,
};