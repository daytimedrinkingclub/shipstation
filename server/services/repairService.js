const fs = require("fs").promises;
const path = require("path");
const { codeAssitant } = require("./codeService");

{
  /* 

This implementation does the following:
1. The """repairWebsite""" function takes the project folder name, analysis results, and the AI client as input.

2. it iterates through the detected issues and attempts to repair each one.

3. The """repairIssue""" function handles different types of issues, calling specific repair functions for each.

4. Each repair function (e.g., addHeader, addNavigation) uses the """codeAssitant""" to generate the necessary code changes.

5 . If changes are made, the updated content is written back to the file.

    */
}

async function repairWebsite(projectFolderName, analysis, client) {
  const issues = analysis.issues;
  const repairs = [];

  for (const issue of issues) {
    const repair = await repairIssue(projectFolderName, issue, client);
    if (repair) {
      repairs.push(repair);
    }
  }

  return repairs;
}

async function repairIssue(projectFolderName, issue, client) {
  const filePath = path.join(projectFolderName, "index.html");
  const content = await fs.readFile(filePath, "utf-8");

  let updatedContent;
  let description;

  switch (issue) {
    case "Missing header":
      updatedContent = await addHeader(content, client);
      description = "Added missing header";
      break;
    case "Missing navigation":
      updatedContent = await addNavigation(content, client);
      description = "Added missing navigation";
      break;
    case "Missing button":
      updatedContent = await addButton(content, client);
      description = "Added missing button";
      break;
    case "Potential layout issues - few elements detected":
      updatedContent = await improveLayout(content, client);
      description = "Improved overall layout";
      break;
    case "No text detected - potential content loading issue":
      updatedContent = await addContent(content, client);
      description = "Added missing content";
      break;
    default:
      return null;
  }

  if (updatedContent !== content) {
    await fs.writeFile(filePath, updatedContent);
    return { issue, description };
  }

  return null;
}

async function addHeader(content, client) {
  const prompt = `
    The following HTML is missing a header. Please add a simple header with a logo and navigation menu:
    ${content}
  `;
  const response = await codeAssitant({ query: prompt, client });
  return response.code;
}

async function addNavigation(content, client) {
  const prompt = `
    The following HTML is missing a navigation menu. Please add a simple navigation menu with Home, About, and Contact links:
    ${content}
  `;
  const response = await codeAssitant({ query: prompt, client });
  return response.code;
}

async function addButton(content, client) {
  const prompt = `
    The following HTML is missing a call-to-action button. Please add a prominent "Get Started" button in an appropriate location:
    ${content}
  `;
  const response = await codeAssitant({ query: prompt, client });
  return response.code;
}

async function improveLayout(content, client) {
  const prompt = `
    The following HTML has potential layout issues. Please improve the overall layout to make it more visually appealing and structured:
    ${content}
  `;
  const response = await codeAssitant({ query: prompt, client });
  return response.code;
}

async function addContent(content, client) {
  const prompt = `
    The following HTML lacks sufficient content. Please add some placeholder text and images to make the page more complete:
    ${content}
  `;
  const response = await codeAssitant({ query: prompt, client });
  return response.code;
}

module.exports = { repairWebsite };
