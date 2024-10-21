const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

router.post("/update-file", fileController.updateFile);
router.get("/download/:slug", fileController.downloadFolder);
router.use("/site/:siteId", fileController.serveFile);

module.exports = router;
