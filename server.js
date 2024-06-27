const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs").promises;
const path = require("path");
const { JSDOM } = require("jsdom");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const chatController = require("./server/controllers/chatController");
const { listFoldersInS3 } = require("./server/services/s3Service");
const { s3Handler } = require("./server/config/awsConfig");
const { GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

app.use(express.json());
app.use(express.static("websites"));
app.use(express.static("public"));

app.get("/all", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "all.html"));
});

app.get("/all-websites", async (req, res) => {
  const folders = await listFoldersInS3("websites/");
  res.json({ sites: JSON.parse(folders) });
});

app.get("/:websiteId", async (req, res) => {
  const websiteId = req.params.websiteId;
  const websitePath = path.join(__dirname, "websites", websiteId);

  try {
    // Check if the directory exists
    const websiteExists = await fs
      .access(websitePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!websiteExists) {
      return res.status(404).send("Website not found");
    }

    const indexHtml = await fs.readFile(
      path.join(websitePath, "index.html"),
      "utf-8"
    );
    const dom = new JSDOM(indexHtml, {
      url: `http://localhost:${port}/${websiteId}`,
      runScripts: "dangerously",
      resources: "usable",
    });

    const document = dom.window.document;

    // Load and execute all scripts
    const scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
      if (script.src) {
        const scriptContent = await fs.readFile(
          path.join(websitePath, new URL(script.src).pathname),
          "utf-8"
        );
        dom.window.eval(scriptContent);
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

    res.send(dom.serialize());
  } catch (error) {
    console.error(error);
    res.status(404).send("Website not found");
  }
});

app.use("/site/:siteId", async (req, res, next) => {
  const siteName = req.params.siteId;
  let filePath = req.path.slice(1); // Get the path without the leading slash

  // Ensure filePath doesn't start with the siteName
  filePath = filePath.replace(new RegExp(`^${siteName}/`), "");

  // Default to index.html if filePath is empty or ends with a slash
  if (filePath === "" || filePath.endsWith("/")) {
    filePath += "index.html";
  }

  const key = `websites/${siteName}/${filePath}`;

  try {
    const params = {
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Key: key,
    };

    const headCommand = new HeadObjectCommand(params);
    const headObjectResponse = await s3Handler.send(headCommand);
    res.set("Content-Type", headObjectResponse.ContentType);

    const getCommand = new GetObjectCommand(params);
    const { Body } = await s3Handler.send(getCommand);
    Body.pipe(res);
  } catch (error) {
    console.error(`Error fetching ${key}: ${error}`);
    if (error.name === "NoSuchKey") {
      console.log(`File not found: ${key}`);
      return next();
    }
    res.status(500).send("An error occurred");
  }
});

chatController.handleChat(io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
