const puppeteer = require("puppeteer");
const fileService = require("./fileService");
const s3Service = require("./s3Service");

async function captureScreenshots(url, projectFolder) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  const screenshots = [];

  // Capture full page screenshot
  const fullPageBuffer = await page.screenshot({
    fullPage: true,
    encoding: "binary",
  });
  screenshots.push({
    name: "full_page",
    buffer: fullPageBuffer,
  });

  // Get project structure
  const fileTree = await s3Service.getProjectDirectoryStructure(projectFolder);

  // Semantic tags to check
  const semanticTags = [
    "header",
    "footer",
    "main",
    "nav",
    "section",
    "article",
    "aside",
  ];

  async function captureSectionScreenshots(tree, basePath = "") {
    for (const [key, value] of Object.entries(tree)) {
      if (typeof value === "object") {
        await captureSectionScreenshots(value, path.join(basePath, key));
      } else if (
        value === "file" &&
        key.endsWith(".html") &&
        key !== "index.html"
      ) {
        const idOrClass = key.split(".")[0]; // 'about-section' from 'about-section.html'
        const selector = `#${idOrClass}, .${idOrClass}, ${idOrClass}`; // Look for ID, class, or tag name

        let element = await page.$(selector);
        if (!element) {
          // Check for semantic tags if specific selector isn't found
          for (const tag of semanticTags) {
            element = await page.$(tag);
            if (element) {
              break;
            }
          }
        }

        if (element) {
          const buffer = await element.screenshot({ encoding: "binary" });
          screenshots.push({
            name: idOrClass,
            buffer: buffer,
          });
        }
      }
    }
  }

  // Start capturing sections based on the file tree
  await captureSectionScreenshots(fileTree);

  await browser.close();
  return screenshots;
}

async function analyzeScreenshots(screenshots, client) {
  const analysisResults = [];

  for (const screenshot of screenshots) {
    const imageData = screenshot.buffer.toString("base64");

    const query = `Analyze this screenshot of the ${screenshot.name} component.
      Identify any visual issues, layout problems, or inconsistencies. 
      Focus on:
      1. Alignment and spacing
      2. Color contrast and readability
      3. Responsiveness issues
      4. Missing or broken elements
      
      Provide your analysis in the following JSON format:
      {
        "componentName": "${screenshot.name}",
        "needsRepair": boolean,
        "issues": [
          {
            "category": "string (one of: alignment, contrast, responsiveness, missing_elements, other)",
            "description": "string",
            "severity": "string (one of: low, medium, high)",
            "suggestedFix": "string"
          }
        ],
        "overallAssessment": "string"
      }
      
      Ensure that the "needsRepair" field is true only if there are significant issues that require code changes.
      If there are no issues, return an empty array for "issues".`;

    const response = await client.sendMessage({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: query,
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png", // Adjust this if your screenshots are not PNG
                data: imageData,
              },
            },
          ],
        },
      ],
    });

    try {
      const analysisJson = JSON.parse(response.content[0].text);
      analysisResults.push(analysisJson);
      console.log(`Analysis for ${screenshot.name}:`, analysisJson);
    } catch (error) {
      console.error(`Error parsing analysis for ${screenshot.name}:`, error);
    }
  }

  return analysisResults;
}

async function repairComponents(projectFolder, analysisResults, client) {
  const projectStructure = await getProjectStructure(projectFolder);

  for (const result of analysisResults) {
    if (result.needsRepair) {
      const componentFile = findComponentFile(
        projectStructure,
        result.componentName
      );
      if (componentFile) {
        const componentCode = await fileService.readFile(
          `${projectFolder}/${componentFile}`
        );
        const repairQuery = `
            Given the following component code and identified issues, implement the suggested fixes:
  
            Component Code:
            ${componentCode}
  
            Identified Issues:
            ${JSON.stringify(result.issues, null, 2)}
  
            Overall Assessment:
            ${result.overallAssessment}
  
            Please provide the complete updated code for the component, incorporating all the suggested fixes.
            Follow these strict guidelines:
            1. Use only vanilla JavaScript. Avoid any module syntax or bundlers.
            2. Use Tailwind CSS via CDN for styling.
            3. Use Font Awesome for icons and Google Fonts for typography.
            4. Ensure the component is defined as a global class that loads its HTML content from a separate file.
            5. Keep JavaScript and HTML separate in .js and .html files respectively.
            6. Do not use React or any other frontend framework.
            7. Do not use shadow DOM.
            8. Do not create separate CSS files or a tailwind.config.js file.
            9. Maintain existing functionality while improving visual appearance and usability.
  
            Provide your response in the following JSON structure:
            {
              "js_file": {
                "name": "ComponentName.js",
                "content": "// JavaScript code here"
              },
              "html_file": {
                "name": "ComponentName.html",
                "content": "<!-- HTML code here -->"
              },
              "explanation": "Explanation of changes made"
            }
          `;

        const response = await client.sendMessage({
          messages: [
            { role: "user", content: [{ type: "text", text: repairQuery }] },
          ],
        });

        try {
          const repairedFiles = JSON.parse(response.content[0].text);

          // Save the repaired JS code
          await fileService.saveFile(
            `${projectFolder}/${repairedFiles.js_file.name}`,
            repairedFiles.js_file.content
          );

          // Save the repaired HTML code
          await fileService.saveFile(
            `${projectFolder}/${repairedFiles.html_file.name}`,
            repairedFiles.html_file.content
          );

          console.log(`Repaired ${result.componentName} component`);
          console.log(`Explanation: ${repairedFiles.explanation}`);
        } catch (error) {
          console.error(
            `Error parsing or saving repaired files for ${result.componentName}:`,
            error
          );
        }
      } else {
        console.warn(
          `Could not find file for ${result.componentName} component`
        );
      }
    } else {
      console.log(`No repairs needed for ${result.componentName} component`);
    }
  }
}

function findComponentFile(projectStructure, componentName) {
  return projectStructure.find((file) =>
    file.toLowerCase().includes(componentName.toLowerCase())
  );
}

async function analyzeAndRepairWebsite(slug, client) {
  try {
    const url = `https://shipstation.ai/site/${slug}/`;
    const screenshots = await captureScreenshots(url, slug);
    const analysisResults = await analyzeScreenshots(screenshots, client);
    await repairComponents(slug, analysisResults, client);
    console.log("Website analysis and repair completed successfully");
  } catch (error) {
    console.error("Error during website analysis and repair:", error);
  }
}

module.exports = {
  analyzeAndRepairWebsite,
};
