const pdf = require("pdf-parse");
const axios = require("axios");

class PDFParserService {
  async parsePDF(url) {
    try {
      // Fetch the PDF file from the URL
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const pdfBuffer = Buffer.from(response.data);

      // Parse the PDF
      const data = await pdf(pdfBuffer);

      // Return the text content
      return data.text;
    } catch (error) {
      console.error("Error parsing PDF:", error);
      throw new Error("Failed to parse PDF");
    }
  }

  async testParsePDF(url) {
    try {
      console.log(`Testing PDF parsing for URL: ${url}`);
      const parsedText = await this.parsePDF(url);
      console.log(
        "PDF parsing successful. First 200 characters of parsed text:"
      );
      console.log(parsedText);
      return true;
    } catch (error) {
      console.error("PDF parsing test failed:", error);
      return false;
    }
  }
}

module.exports = PDFParserService;
