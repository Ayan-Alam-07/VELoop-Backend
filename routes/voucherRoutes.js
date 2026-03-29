const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const voucherController = require("../controllers/voucherController");

router.get("/:payoutType", authMiddleware, voucherController.getVoucherOptions);

module.exports = router;
