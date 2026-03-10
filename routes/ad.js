const router = require("express").Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

// ======================
// SERVER SIDE REWARD GENERATOR
// ======================

const generateReward = () => {
  const chance = Math.random();

  // rare reward
  if (chance < 0.02) {
    return Math.floor(Math.random() * (61 - 50 + 1)) + 50;
  }

  // normal reward
  return Math.floor(Math.random() * (49 - 15 + 1)) + 15;
};

// ======================
// AD WATCH SUCCESS
// ======================

router.post("/watched", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const today = new Date().toDateString();
    const lastReset = new Date(user.lastAdWatchReset).toDateString();

    // reset daily ads count
    if (today !== lastReset) {
      user.todayAdsWatched = 0;
      user.lastAdWatchReset = new Date();
    }

    // daily limit protection
    // if (user.todayAdsWatched >= 200) {
    //   return res.status(400).json("Daily ad limit reached");
    // }

    const rewardCoins = generateReward();

    // update stats
    user.totalAdsWatched += 1;
    user.todayAdsWatched += 1;

    // add coins
    user.coins += rewardCoins;
    user.lifetimeEarning += rewardCoins;

    await user.save();

    // record transaction
    await Transaction.create({
      userId: user.userId,
      type: "watchAd",
      coins: rewardCoins,
      note: "Watch ad reward",
    });

    res.json({
      rewardCoins,
      newBalance: user.coins,
      todayAdsWatched: user.todayAdsWatched,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Ad tracking failed");
  }
});

module.exports = router;
