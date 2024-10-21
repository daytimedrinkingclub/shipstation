const express = require("express");
const router = express.Router();
const miscController = require("../controllers/miscController");

router.get("/taaft.txt", miscController.getTaaftTxt);
router.post("/add-custom-domain", miscController.addCustomDomain);

module.exports = router;
