const { insertConversation } = require('./server/services/dbService');

async function testInsertConversation() {
  const sampleConversation = {
    user: "testUser",
    message: "This is a test message",
    timestamp: new Date().toISOString()
  };
  const sampleShipstationUrl = "http://example.com/shipstation";

  try {
    const result = await insertConversation(sampleConversation, sampleShipstationUrl);
    console.log("Insert successful, result:", result);
  } catch (error) {
    console.error("Error during insert:", error);
  }
}

testInsertConversation();
