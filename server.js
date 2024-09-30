const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const { JSDOM } = require("jsdom");
const { OAuth2Client } = require('google-auth-library');
const multer = require("multer");
const helmet = require("helmet");

const { createOrLoginUser } = require('./server/services/supabaseService');

const {
  validateRazorpayWebhook,
  validatePaypalWebhook,
} = require("./server/services/paymentService");
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

const FileService = require("./server/services/fileService");
const { addDomainMapping } = require("./server/services/domainService");
const fileService = new FileService();

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 5e6, // 5MB
});

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.static("websites"));
app.use(express.static("public"));
app.use(cors({
  origin: 'http://localhost:5173, http://localhost:3000', // or whatever your client's origin is
  credentials: true
}));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com/gsi/client", "'unsafe-inline'", "http://localhost:5173", "http://localhost:3000"],
      frameSrc: ["'self'", "https://accounts.google.com/gsi/"],
      connectSrc: ["'self'", "https://accounts.google.com/gsi/", "http://localhost:5173", "http://localhost:3000"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:3000", "http://localhost:5173"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  })
);

app.get("/all", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "all.html"));
});

app.get("/all-websites", async (req, res) => {
  try {
    const { websites } = await fileService.listFolders("");
    console.log(websites);
    res.json({ websites });
  } catch (err) {
    console.error("Error listing websites:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Serve React app for all other routes (including 404)
app.get("/ship", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/taaft.txt", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=taaft.txt");
  res.send(
    "taaft-verification-code-8e81f753e37549d83c99e93fc5339c3093359943ba88ba5db9c5822e373366f4"
  );
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

app.post("/paypal-webhook", async (req, res) => {
  try {
    const webhookEvent = req.body;
    const { headers } = req;

    const isValid = await validatePaypalWebhook(headers, webhookEvent);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    if (webhookEvent.event_type === "CHECKOUT.ORDER.COMPLETED") {
      const email = webhookEvent.resource.payer?.email_address;
      const user_id = await getUserIdFromEmail(email);
      if (!user_id) {
        console.error(`User not found for email: ${email}`);
        return res.status(404).json({ error: "User not found" });
      }

      // Determine which product the payment is for based on the webhookEvent.resource.purchase_units
      const productId = webhookEvent.resource.purchase_units[0]?.reference_id;
      const PRODUCT_TYPES = {
        "3ZRLN4LJVSRVY": "Landing Page",
        M3CSSZ43CE75J: "Portfolio Page",
      };
      const productType = PRODUCT_TYPES[productId] || "unknown product";

      // Define the payment payload, ensuring ships_count is set
      const paymentPayload = {
        payload: webhookEvent,
        user_id,
        transaction_id: webhookEvent.resource.id,
        status: "successful",
        provider: "paypal",
        ships_count: 1,
      };

      await insertPayment(paymentPayload);

      // Retrieve the user's profile to determine the current ships count
      const profile = await getUserProfile(user_id);

      // Update the user's profile to reflect the new ships count
      const profilePayload = { available_ships: profile.available_ships + 1 };
      await updateUserProfile(user_id, profilePayload);

      // Post a notification to the Discord webhook
      const discordWebhookPayload = {
        content: `New PayPal payment received for ${productType}!`,
        embeds: [
          {
            title: "Payment Details",
            fields: [
              { name: "Email", value: email },
              { name: "Payment ID", value: webhookEvent.resource.id },
              { name: "Product", value: productType },
            ],
          },
        ],
      };

      await postToDiscordWebhook(discordWebhookPayload);
      res.status(200).json({ status: "Ships added!" });
    } else {
      res.status(400).json({ error: "Event not handled" });
    }
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/project-structure/:slug", async (req, res) => {
  const slug = req.params.slug;
  console.log(slug);
  try {
    const structure = await fileService.getProjectDirectoryStructure(slug);
    res.json(structure);
  } catch (error) {
    console.error(`Error fetching project structure for ${slug}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/update-file", async (req, res) => {
  const { filePath, content } = req.body;
  try {
    await fileService.saveFile(filePath, content);
    res.status(200).json({ message: "File updated successfully" });
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
        // This is an external script, we can't load it directly
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

app.get("/:websiteId", async (req, res) => {
  const websiteId = req.params.websiteId;

  try {
    const indexHtmlContent = await fileService.getFile(
      `${websiteId}/index.html`
    );
    if (!indexHtmlContent) {
      return res.status(404).send("Website not found");
    }

    const serializedHtml = await serializeDom(
      indexHtmlContent,
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
    const zipStream = await fileService.createZipFromDirectory(slug);

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
  let filePath = req.path.slice(1); // Get the path without the leading slash

  // Ensure filePath doesn't start with the siteName
  filePath = filePath.replace(new RegExp(`^${siteName}/`), "");

  // Default to index.html if filePath is empty or ends with a slash
  if (filePath === "" || filePath.endsWith("/")) {
    filePath += "index.html";
  }

  const key = `${siteName}/${filePath}`;

  try {
    const fileInfo = await fileService.getFileStream(key);

    if (fileInfo.exists) {
      // Set the Content-Type based on the file extension
      res.set("Content-Type", fileInfo.contentType);

      // Pipe the file stream to the response
      fileInfo.stream.pipe(res);
    } else {
      // File doesn't exist yet, send a 404 response
      res.status(404).send("File not found");
    }
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    res.status(500).send("An error occurred");
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload-assets", upload.array("assets"), async (req, res) => {
  const { shipId } = req.body;
  const files = req.files;
  const comments = req.body.comments || [];

  if (!shipId || !files || files.length === 0) {
    return res.status(400).json({ error: "Missing shipId or assets" });
  }

  try {
    const assets = files.map((file, index) => ({
      file: file,
      comment: comments[index] || "",
    }));

    const uploadedAssets = await fileService.uploadAssets(shipId, assets);

    res.status(200).json({
      message: "Assets uploaded successfully",
      assets: uploadedAssets,
    });
  } catch (error) {
    console.error("Error uploading assets:", error);
    res.status(500).json({ error: "Failed to upload assets" });
  }
});

app.post("/add-custom-domain", async (req, res) => {
  const { domain, shipId, shipSlug } = req.body;
  if (!domain || !shipId || !shipSlug) {
    return res
      .status(400)
      .json({ error: "Missing domain, shipId or shipSlug" });
  }

  try {
    await addDomainMapping(domain, shipId, shipSlug);
    res.status(200).json({ message: "Custom domain added successfully" });
  } catch (error) {
    console.error("Error adding custom domain:", error);
    res.status(500).json({ error: "Failed to add custom domain" });
  }
});


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/auth/google-one-tap', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const { user, session, error } = await createOrLoginUser(email, name, picture);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user, session });
  } catch (error) {
    console.error('Error verifying Google One Tap token:', error);
    res.status(400).json({ error: 'Invalid token' });
  }
});

handleOnboardingSocketEvents(io);

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
