const express = require("express");
const router = express.Router();
const websiteController = require("../controllers/websiteController");
const authMiddleware = require("../middleware/auth");

router.get("/all", websiteController.getAllWebsites);
router.get("/all-websites", websiteController.listWebsites);
router.get("/project-structure/:slug", websiteController.getProjectStructure);
router.get("/:websiteId", websiteController.getWebsite);
router.post("/like/:slug", authMiddleware, websiteController.likeWebsite);
router.delete("/like/:slug", authMiddleware, websiteController.unlikeWebsite);
router.get("/analyze-repair/:shipId", websiteController.analyzeWebsite);

module.exports = router;
