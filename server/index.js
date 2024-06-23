const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs").promises;
const path = require("path");
const { JSDOM } = require("jsdom");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const chatController = require("./controllers/chatController");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log(process.env.ANTHROPIC_API_KEY);

const port = 3000;

app.use(express.json());
app.use(express.static("websites"));

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/:websiteId", async (req, res) => {
  const websiteId = req.params.websiteId;
  const websitePath = path.join(__dirname, "websites", websiteId);

  try {
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

chatController.handleChat(io);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
