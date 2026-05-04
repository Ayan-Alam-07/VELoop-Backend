const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const leaderboardController = require("../controllers/leaderboard.controller");

const router = express.Router();

router.get("/", authMiddleware, leaderboardController.getLeaderboard);
router.post("/join", authMiddleware, leaderboardController.joinLeaderboard);

module.exports = router;
