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
app.use(express.static("websites"));
app.use(express.static("public"));
app.use(cors());

// Use routes
app.use(websiteRoutes);
app.use(fileRoutes);
app.use(assetRoutes);
app.use(paymentRoutes);
app.use(miscRoutes);
app.use(reactRoutes);

handleOnboardingSocketEvents(io);

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
