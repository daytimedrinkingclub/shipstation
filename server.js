const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs").promises;
const path = require("path");
const { JSDOM } = require("jsdom");
const { GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { listFoldersInS3, createZipFromS3Directory } = require("./server/services/s3Service");
const { s3Handler } = require("./server/config/awsConfig");
const { validateRazorpayWebhook } = require("./server/services/paymentService");
const { getUserIdFromEmail } = require("./server/services/supabaseService");
const {
  insertPayment,
  getUserProfile,
  updateUserProfile,
} = require("./server/services/dbService");
const {
  handleOnboardingSocketEvents,
} = require("./server/services/onboadingService");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(express.static("websites"));
app.use(express.static("public"));

app.get("/all", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "all.html"));
});

app.post("/payment-webhook", express.json(), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (validateRazorpayWebhook(req.body, signature, secret)) {
    const event = req.body.event;
    const { payload } = req.body;

    if (event === "order.paid") {
      // Handle the payment_link.paid event
      const email = payload.payment?.entity?.email;
      const user_id = await getUserIdFromEmail(email);
      const paymentPayload = {
        payload,
        user_id,
        transaction_id: payload.payment?.entity.acquirer_data?.rrn,
        status: "successful",
        provider: "razorpay",
      };

      await insertPayment(paymentPayload);

      const profile = await getUserProfile(user_id);
      const { available_ships } = profile; // current
      const profilePayload = { available_ships: available_ships + 1 }; // updated

      await updateUserProfile(user_id, profilePayload);

      res.status(200).json({ status: "Ships added!" });
    } else {
      res.status(400).json({ error: "Event not handled" });
    }
  } else {
    res.status(400).json({ error: "Invalid signature" });
  }
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const s3Websites = await listFoldersInS3("websites/");
    const websites = JSON.parse(s3Websites).filter((website) => !website.startsWith("."));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${websites.map(website => `
  <url>
    <loc>${req.protocol}://${req.get('host')}/${website}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

app.get("/all-websites", async (req, res) => {
  const s3Websites = await listFoldersInS3("websites/");
  let localWebsites = [];
  try {
    localWebsites = await fs.readdir("websites");
  } catch (err) {
    if (err.code === "ENOENT") {
      localWebsites = [];
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  res.json({
    s3: JSON.parse(s3Websites).filter((website) => !website.startsWith(".")),
    local: localWebsites,
  });
});

async function serializeDom(filePath, baseUrl) {
  const indexHtml = await fs.readFile(filePath, "utf-8");
  const dom = new JSDOM(indexHtml, {
    url: baseUrl,
    runScripts: "dangerously",
    resources: "usable",
  });

  const document = dom.window.document;

  // Load and execute all scripts
  const scripts = document.getElementsByTagName("script");
  for (let script of scripts) {
    if (script.src) {
      const scriptContent = await fs.readFile(
        path.join(path.dirname(filePath), new URL(script.src).pathname),
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

  return dom.serialize();
}

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

    const serializedHtml = await serializeDom(
      path.join(websitePath, "index.html"),
      `http://localhost:${PORT}/${websiteId}`
    );

    res.send(serializedHtml);
  } catch (error) {
    console.error(error);
    res.status(404).send("Website not found");
  }
});

app.get('/download/:slug', async (req, res) => {
  const slug = req.params.slug;
  const folderPath = `websites/${slug}`;

  try {
    const zipStream = await createZipFromS3Directory(slug);

    if (!zipStream) {
      return res.status(404).send('Folder not found');
    }

    res.setHeader('Content-Disposition', `attachment; filename=${slug}.zip`);
    res.setHeader('Content-Type', 'application/zip');

    zipStream.pipe(res);
  } catch (error) {
    console.error(`Error downloading folder ${folderPath}:`, error);
    res.status(500).send('An error occurred');
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

    // Set the Content-Type based on the file extension
    const fileExtension = path.extname(filePath).toLowerCase();
    if (fileExtension === ".html") {
      res.set("Content-Type", "text/html");
    } else {
      res.set("Content-Type", headObjectResponse.ContentType);
    }

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

handleOnboardingSocketEvents(io);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
