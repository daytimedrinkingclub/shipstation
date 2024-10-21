const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const {
  handleOnboardingSocketEvents,
} = require("./server/services/onboadingService");

const websiteRoutes = require("./server/routes/websiteRoutes");
const paymentRoutes = require("./server/routes/paymentRoutes");
const fileRoutes = require("./server/routes/fileRoutes");
const assetRoutes = require("./server/routes/assetRoutes");
const miscRoutes = require("./server/routes/miscRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 5e6, // 5MB
});

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.static("websites"));
app.use(express.static("public"));
app.use(cors());

// Use the routes
app.use(websiteRoutes);
app.use(paymentRoutes);
app.use(fileRoutes);
app.use(assetRoutes);
app.use(miscRoutes);

// Serve React app for all other routes (including 404)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

handleOnboardingSocketEvents(io);

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
