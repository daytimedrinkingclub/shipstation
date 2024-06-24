const s3 = require("../config/awsConfig");

function getContentType(bucketPath) {
  switch (bucketPath.split(".").pop()) {
    case "js":
      return "application/javascript";
    case "css":
      return "text/css";
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "md":
      return "text/markdown";
    default:
      return "text/html";
  }
}

async function saveFileToS3(bucketPath, content) {
  const params = {
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Key: bucketPath,
    Body: content,
    ContentType: getContentType(bucketPath), // Adjust based on the type of file you're saving
    ACL: "public-read", // Ensures the file is publicly readable
  };

  return s3.upload(params).promise();
}
module.exports = { saveFileToS3 };
