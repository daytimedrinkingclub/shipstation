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

module.exports = router;
