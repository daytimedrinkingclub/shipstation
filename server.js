const express = require("express");
const http = require("http");
const cors = require("cors");

const { PORT } = require("./server/config/app");
const setupSocket = require("./server/socket");
const errorHandler = require("./server/middleware/errorHandler");

const indexRoutes = require("./server/routes/index");
const websiteRoutes = require("./server/routes/websites");
const paymentRoutes = require("./server/routes/payments");
const fileRoutes = require("./server/routes/files");

const app = express();
const server = http.createServer(app);

// Set up socket.io
setupSocket(server);

// Middleware
app.use(express.json());
app.use(express.static("websites"));
app.use(express.static("public"));
app.use(cors());

// Routes
app.use("/", indexRoutes);
app.use("/", websiteRoutes);
app.use("/", paymentRoutes);
app.use("/", fileRoutes);

// Error handling
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
