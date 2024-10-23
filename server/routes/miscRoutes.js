const express = require("express");
const router = express.Router();
const miscController = require("../controllers/miscController");
const slugController = require('../controllers/slugController');

router.get("/taaft.txt", miscController.getTaaftTxt);
router.post("/add-custom-domain", miscController.addCustomDomain);
router.post('/change-slug', slugController.changeSlug);

module.exports = router;
