const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Wasabi
if (process.env.WASABI_ENDPOINT) {
  s3Config.endpoint = process.env.WASABI_ENDPOINT;
  s3Config.forcePathStyle = true; // Needed for Wasabi
}

const s3Handler = new S3Client(s3Config);

module.exports = { s3Handler };
