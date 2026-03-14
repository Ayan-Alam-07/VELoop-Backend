const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/dailyBonusController");

router.post("/start", auth, controller.startDailyBonus);
router.post("/verify", controller.verifyDailyBonus);

module.exports = router;
