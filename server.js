require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const { JSDOM } = require("jsdom");
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

const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === "true";

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

// Storage Service
const storageService = USE_LOCAL_STORAGE
  ? require("./server/services/localStorageService")
  : require("./server/services/s3Service");

// Routes
app.get("/all", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "all.html"));
});

app.get("/ship", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/taaft.txt", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=taaft.txt");
  res.send("taaft-verification-code-8e81f753e37549d83c99e93fc5339c3093359943ba88ba5db9c5822e373366f4");
});

app.post("/payment-webhook", express.json(), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (validateRazorpayWebhook(req.body, signature, secret)) {
    const event = req.body.event;
    const { payload } = req.body;

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
      const { available_ships } = profile;
      const profilePayload = { available_ships: available_ships + 1 };

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
      postToDiscordWebhook(webhookPayload);

      res.status(200).json({ status: "Ships added!" });
    } else {
      res.status(400).json({ error: "Event not handled" });
    }
  } else {
    res.status(400).json({ error: "Invalid signature" });
  }
});

app.get("/all-websites", async (req, res) => {
  try {
    const websites = await storageService.listWebsites();
    res.json(websites);
  } catch (error) {
    console.error("Error fetching websites:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/project-structure/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const structure = await storageService.getProjectDirectoryStructure(slug);
    res.json(structure);
  } catch (error) {
    console.error(`Error fetching project structure for ${slug}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/update-file", async (req, res) => {
  const { filePath, content } = req.body;
  try {
    await storageService.saveFile(filePath, content);
    res.status(200).json({ message: "File updated successfully" });
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function serializeDom(filePath, baseUrl) {
  const indexHtml = await storageService.getFileContent(filePath);
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
      const scriptContent = await storageService.getFileContent(
        path.join(path.dirname(filePath), new URL(script.src).pathname)
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
          setTimeout(resolve, 1000);
        });
      })
  );

  return dom.serialize();
}

app.get("/:websiteId", async (req, res) => {
  const websiteId = req.params.websiteId;
  const websitePath = `${websiteId}/index.html`;

  try {
    const websiteExists = await storageService.fileExists(websitePath);

    if (!websiteExists) {
      return res.status(404).send("Website not found");
    }

    const serializedHtml = await serializeDom(
      websitePath,
      `http://localhost:${PORT}/${websiteId}`
    );

    res.send(serializedHtml);
  } catch (error) {
    console.error(error);
    res.status(404).send("Website not found");
  }
});

app.get("/download/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const zipStream = await storageService.createZipFromDirectory(slug);

    if (!zipStream) {
      return res.status(404).send("Folder not found");
    }

    res.setHeader("Content-Disposition", `attachment; filename=${slug}.zip`);
    res.setHeader("Content-Type", "application/zip");

    zipStream.pipe(res);
  } catch (error) {
    console.error(`Error downloading folder ${slug}:`, error);
    res.status(500).send("An error occurred");
  }
});

app.use("/site/:siteId", async (req, res, next) => {
  const siteName = req.params.siteId;
  let filePath = req.path.slice(1);

  filePath = filePath.replace(new RegExp(`^${siteName}/`), "");

  if (filePath === "" || filePath.endsWith("/")) {
    filePath += "index.html";
  }

  const key = `${siteName}/${filePath}`;

  try {
    const metadata = await storageService.getFileMetadata(key);
    res.set("Content-Type", metadata.ContentType);

    const fileContent = await storageService.getFileContent(key);
    res.send(fileContent);
  } catch (error) {
    console.error(`Error fetching ${key}: ${error}`);
    if (error.code === 'ENOENT' || error.name === "NoSuchKey") {
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