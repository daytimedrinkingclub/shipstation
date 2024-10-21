const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-assets", upload.array("assets"), assetController.uploadAssets);
router.post("/upload-temporary-assets", upload.array("assets"), assetController.uploadTemporaryAssets);

module.exports = router;
