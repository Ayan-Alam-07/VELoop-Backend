const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const adminController = require("../controllers/adminController");
const adminWithdrawalController = require("../controllers/adminWithdrawalController");

router.get(
  "/users-summary",
  authMiddleware,
  adminMiddleware,
  adminController.getUsersSummary,
);

router.get(
  "/dashboard-stats",
  authMiddleware,
  adminMiddleware,
  adminController.getDashboardStats,
);

router.get(
  "/withdrawals",
  authMiddleware,
  adminMiddleware,
  adminWithdrawalController.getAllWithdrawals,
);

router.put(
  "/withdrawals/:id/paid",
  authMiddleware,
  adminMiddleware,
  adminWithdrawalController.markWithdrawalPaid,
);

router.put(
  "/withdrawals/:id/reject",
  authMiddleware,
  adminMiddleware,
  adminWithdrawalController.rejectWithdrawal,
);

module.exports = router;
