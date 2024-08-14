const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient();

/*
This implementation does the following:

1. It uses Google Cloud Vision API to analyze the screenshots.
The """analyzeScreenshot""" function detects labels, text, and objects in each image.

2. The """detectIssues""" function checks for common problems like missing key elements, potential layout issues, or lack of text content.

3.The """analyzeWebsite""" function processes all screenshots and compiles the results. 
*/

async function analyzeScreenshot(imagePath) {
  try {
    const [result] = await client.labelDetection(imagePath);
    const labels = result.labelAnnotations;

    const [textResult] = await client.textDetection(imagePath);
    const detectedText = textResult.fullTextAnnotation;

    const [objectResult] = await client.objectLocalization(imagePath);
    const objects = objectResult.localizedObjectAnnotations;

    return {
      labels: labels.map((label) => label.description),
      text: detectedText ? detectedText.text : "",
      objects: objects.map((object) => object.name),
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}

async function detectIssues(analysisResults) {
  const issues = [];

  // Check for missing key elements
  const expectedElements = ["header", "navigation", "button", "text", "image"];
  expectedElements.forEach((element) => {
    if (!analysisResults.objects.includes(element.toLowerCase())) {
      issues.push(`Missing ${element}`);
    }
  });

  // Check for potential layout issues
  if (analysisResults.objects.length < 5) {
    issues.push("Potential layout issues - few elements detected");
  }

  // Check for text content
  if (!analysisResults.text) {
    issues.push("No text detected - potential content loading issue");
  }

  return issues;
}

async function analyzeWebsite(screenshots) {
  const analysisResults = {};
  for (const [key, path] of Object.entries(screenshots)) {
    analysisResults[key] = await analyzeScreenshot(path);
  }

  const issues = await detectIssues(analysisResults.fullPage);

  return {
    analysisResults,
    issues,
  };
}

module.exports = { analyzeWebsite };
