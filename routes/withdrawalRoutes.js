const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const withdrawalController = require("../controllers/withdrawalController");

router.post("/create", authMiddleware, withdrawalController.createWithdrawal);

router.get(
  "/my-history",
  authMiddleware,
  withdrawalController.getMyWithdrawals,
);

module.exports = router;
