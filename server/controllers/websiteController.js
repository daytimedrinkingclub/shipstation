const path = require("path");
const { JSDOM } = require("jsdom");
const FileService = require("../services/fileService");
const { getShipPrompt, likeWebsite, unlikeWebsite } = require("../services/dbService");
const AnalyzeAndRepairService = require("../services/analyzeAndRepairService");

const fileService = new FileService();
const analyzeAndRepairService = new AnalyzeAndRepairService();

exports.getAllWebsites = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.sendFile(path.join(__dirname, "../../public", "all.html"));
};

exports.listWebsites = async (req, res) => {
  try {
    const websites = await fileService.listFolders("");
    const websitesWithPrompts = await Promise.all(
      websites.map(async (website) => {
        const prompt = await getShipPrompt(website);
        return { website, prompt };
      })
    );
    res.json({ websites: websitesWithPrompts });
  } catch (err) {
    console.error("Error listing websites:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getProjectStructure = async (req, res) => {
  const slug = req.params.slug;
  try {
    const structure = await fileService.getProjectDirectoryStructure(slug);
    res.json(structure);
  } catch (error) {
    console.error(`Error fetching project structure for ${slug}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getWebsite = async (req, res) => {
  const websiteId = req.params.websiteId;
  try {
    const indexHtmlContent = await fileService.getFile(`${websiteId}/index.html`);
    if (!indexHtmlContent) {
      return res.status(404).send("Website not found");
    }
    const serializedHtml = await serializeDom(
      indexHtmlContent,
      `http://localhost:${process.env.PORT || 5001}/${websiteId}`
    );
    res.send(serializedHtml);
  } catch (error) {
    console.error(error);
    res.status(404).send("Website not found");
  }
};

exports.likeWebsite = async (req, res) => {
  const { slug } = req.params;
  const { user } = req;
  try {
    const result = await likeWebsite(user.id, slug);
    res.json(result);
  } catch (error) {
    if (error.message === "Already liked") {
      return res.status(400).json({ error: "Already liked" });
    }
    console.error("Error liking website:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.unlikeWebsite = async (req, res) => {
  const { slug } = req.params;
  const { user } = req;
  try {
    const result = await unlikeWebsite(user.id, slug);
    res.json(result);
  } catch (error) {
    console.error("Error unliking website:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.analyzeWebsite = async (req, res) => {
  const { shipId } = req.params;
  if (!shipId) {
    return res.status(400).json({ error: "Missing shipId" });
  }
  try {
    console.log(`Starting analysis for shipId: ${shipId}`);
    const result = await analyzeAndRepairService.analyzeAndRepairSite(shipId);
    console.log(`Analysis completed for shipId: ${shipId}`);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error analyzing shipId ${shipId}:`, error);
    res.status(500).json({
      error: "Failed to analyze and repair site",
      details: error.message,
    });
  }
};

async function serializeDom(htmlContent, baseUrl) {
  const dom = new JSDOM(htmlContent, {
    url: baseUrl,
    runScripts: "dangerously",
    resources: "usable",
  });

  const document = dom.window.document;

  // Load and execute all scripts
  const scripts = document.getElementsByTagName("script");
  for (let script of scripts) {
    if (script.src) {
      const scriptUrl = new URL(script.src, baseUrl);
      if (scriptUrl.origin === baseUrl) {
        const scriptPath = scriptUrl.pathname;
        try {
          const scriptContent = await fileService.getFile(scriptPath);
          dom.window.eval(scriptContent);
        } catch (error) {
          console.error(`Error loading script ${scriptPath}:`, error);
        }
      } else {
        console.log(`Skipping external script: ${script.src}`);
      }
    } else {
      dom.window.eval(script.textContent);
    }
  }

  // Wait for custom elements to be defined and their content to be loaded
  await Promise.all(
    Array.from(document.body.getElementsByTagName("*"))
      .filter((el) => el.tagName.includes("-"))
      .map(async (el) => {
        await customElements.whenDefined(el.tagName.toLowerCase());
        const component = dom.window.document.createElement(el.tagName);
        await new Promise((resolve) => {
          component.addEventListener("load", resolve, { once: true });
          setTimeout(resolve, 1000); // Timeout in case the load event doesn't fire
        });
      })
  );

  return dom.serialize();
}
