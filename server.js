const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const { JSDOM } = require("jsdom");
const { GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const {
  listFoldersInS3,
  createZipFromS3Directory,
  getProjectDirectoryStructure,
  saveFileToS3,
} = require("./server/services/s3Service");
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
const { postToDiscordWebhook } = require("./server/services/webhookService");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.static("websites"));
app.use(express.static("public"));
app.use(cors());

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

app.get("/all", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "all.html"));
});

app.get("/ship", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/taaft.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=taaft.txt");
  res.send("taaft-verification-code-8e81f753e37549d83c99e93fc5339c3093359943ba88ba5db9c5822e373366f4");
});

app.post("/payment-webhook", async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!validateRazorpayWebhook(req.body, signature, secret)) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const { event, payload } = req.body;

    if (event === "order.paid") {
      const email = payload.payment?.entity?.email;
      const amountInRs = payload.payment?.entity?.amount / 100;
      const orderId = payload.order?.entity?.id;
      const paymentId = payload.payment?.entity?.id;
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
      const profilePayload = { available_ships: profile.available_ships + 1 };

      await updateUserProfile(user_id, profilePayload);

      const webhookPayload = {
        content: "New payment received!",
        embeds: [
          {
            title: "Payment Details",
            fields: [
              { name: "Amount", value: `Rs ${amountInRs}` },
              { name: "Email", value: email },
              { name: "Order ID", value: orderId },
              { name: "Payment ID", value: paymentId },
            ],
          },
        ],
      };

      await postToDiscordWebhook(webhookPayload);
      res.status(200).json({ status: "Ships added!" });
    } else {
      res.status(400).json({ error: "Event not handled" });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/all-websites", async (req, res, next) => {
  try {
    const s3Websites = JSON.parse(await listFoldersInS3("websites/")) || [];
    const localWebsites = await fs.readdir("websites").catch(err => {
      if (err.code === "ENOENT") return [];
      throw err;
    });
    
    res.json({
      s3: s3Websites.filter(website => !website.startsWith(".")),
      local: localWebsites,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/project-structure/:slug", async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const structure = await getProjectDirectoryStructure(slug);
    res.json(structure);
  } catch (error) {
    next(error);
  }
});

app.post("/update-file", async (req, res, next) => {
  const { filePath, content } = req.body;
  try {
    await saveFileToS3(filePath, content);
    res.status(200).json({ message: "File updated successfully" });
  } catch (error) {
    next(error);
  }
});

async function serializeDom(filePath, baseUrl) {
  try {
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
  } catch (error) {
    console.error(`Error serializing DOM: ${error}`);
    throw new Error("Failed to serialize DOM");
  }
}

app.get("/:websiteId", async (req, res, next) => {
  const websiteId = req.params.websiteId;
  const websitePath = path.join(__dirname, "websites", websiteId);

  try {
    // Check if the directory exists
    await fs.access(websitePath, fs.constants.F_OK);

    const serializedHtml = await serializeDom(
      path.join(websitePath, "index.html"),
      `http://localhost:${PORT}/${websiteId}`
    );

    res.send(serializedHtml);
  } catch (error) {
    next(error);
  }
});

app.get("/download/:slug", async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const zipStream = await createZipFromS3Directory(slug);

    if (!zipStream) {
      return res.status(404).send("Folder not found");
    }

    res.setHeader("Content-Disposition", `attachment; filename=${slug}.zip`);
    res.setHeader("Content-Type", "application/zip");

    zipStream.pipe(res);
  } catch (error) {
    next(error);
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
    const fileExtension = path.extname(filePath).substring(1);
    const mimeTypes = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      svg: "image/svg+xml",
      gif: "image/gif",
    };
    const contentType = mimeTypes[fileExtension] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    const data = await s3Handler.send(new GetObjectCommand(params));
    data.Body.pipe(res);
  } catch (error) {
    if (error.name === "NoSuchKey") {
      res.status(404).send("File not found");
    } else {
      next(error);
    }
  }
});

io.on("connection", (socket) => {
  handleOnboardingSocketEvents(socket);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
