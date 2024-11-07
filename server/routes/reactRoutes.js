const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/ship", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "index.html"));
});

router.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "index.html"));
});

router.get("/editor", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "index.html"));
});

router.get("/project/:projectId", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "index.html"));
});

// Catch-all route to handle client-side routing - serves the main React app for all unmatched routes
router.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "index.html"));
});

module.exports = router;
