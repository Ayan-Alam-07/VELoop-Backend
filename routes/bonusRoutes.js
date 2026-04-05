// backend/routes/bonusRoutes.js

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getBonusRewards,
  claimBonusReward,
} = require("../controllers/bonusController");

router.get("/", authMiddleware, getBonusRewards);
router.post("/claim", authMiddleware, claimBonusReward);

module.exports = router;
