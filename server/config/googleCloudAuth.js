const fs = require("fs");
const os = require("os");
const path = require("path");

function setupGoogleCloudCredentials() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    console.error(
      "GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set"
    );
    return;
  }

  const tempFilePath = path.join(os.tmpdir(), "google-cloud-credentials.json");
  fs.writeFileSync(tempFilePath, credentialsJson);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;
  console.log("Google Cloud credentials set up successfully");
}



module.exports = { setupGoogleCloudCredentials };