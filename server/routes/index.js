const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/all", async (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "all.html"));
});

router.get("/ship", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "index.html"));
});

router.get("/taaft.txt", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=taaft.txt");
  res.send(
    "taaft-verification-code-8e81f753e37549d83c99e93fc5339c3093359943ba88ba5db9c5822e373366f4"
  );
});

module.exports = router;