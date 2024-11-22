require("./instrument");

const Sentry = require("@sentry/node");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

const authMiddleware = require("./server/middleware/auth");

const websiteRoutes = require("./server/routes/websiteRoutes");
const fileRoutes = require("./server/routes/fileRoutes");
const assetRoutes = require("./server/routes/assetRoutes");
const paymentRoutes = require("./server/routes/paymentRoutes");
const miscRoutes = require("./server/routes/miscRoutes");
const reactRoutes = require("./server/routes/reactRoutes");

const {
  handleOnboardingSocketEvents,
} = require("./server/services/onboadingService");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 5e6,
});

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "websites")));

// API routes with specific prefixes
app.use("/api", websiteRoutes);
app.use("/api", fileRoutes);
app.use("/api", assetRoutes);
app.use("/api", paymentRoutes);
app.use("/api", miscRoutes);

// React routes for all other requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

Sentry.setupExpressErrorHandler(app);
handleOnboardingSocketEvents(io);

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
