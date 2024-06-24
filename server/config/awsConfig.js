const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: process.env.BUCKETEER_AWS_REGION,
  s3BucketEndpoint: false,
  endpoint: `https://${process.env.BUCKETEER_BUCKET_NAME}.s3.amazonaws.com`,
});

const s3 = new AWS.S3();

module.exports = s3;
