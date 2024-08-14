const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

async function captureScreenshots(url, projectFolderName) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: 'networkidle0' });

  const screenshotPath = path.join(__dirname, '..', '..', 'screenshots', projectFolderName);
  await fs.mkdir(screenshotPath, { recursive: true });

  // Capture full page screenshot
  await page.screenshot({ 
    path: path.join(screenshotPath, 'fullpage.png'),
    fullPage: true 
  });

  // Capture screenshots of specific elements
  const elements = ['header', 'main', 'footer'];
  for (const element of elements) {
    const elementHandle = await page.$(element);
    if (elementHandle) {
      await elementHandle.screenshot({ 
        path: path.join(screenshotPath, `${element}.png`) 
      });
    }
  }

  await browser.close();

  return {
    fullPage: path.join(screenshotPath, 'fullpage.png'),
    elements: elements.map(element => path.join(screenshotPath, `${element}.png`))
  };
}

module.exports = { captureScreenshots };