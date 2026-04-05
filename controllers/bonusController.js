// backend/controllers/bonusController.js

const BonusReward = require("../models/BonusReward");
const User = require("../models/User");

const getBonusRewards = async (req, res) => {
  try {
    const rewards = await BonusReward.find({
      isActive: true,
    }).sort({ reqWatch: 1 });

    const user = await User.findById(req.user.id);

    res.status(200).json({
      todayAdsWatched: user.todayAdsWatched || 0,
      rewards,
    });
  } catch (error) {
    console.error("Get Bonus Rewards Error:", error);

    res.status(500).json({
      message: "Failed to fetch bonus rewards",
    });
  }
};

const claimBonusReward = async (req, res) => {
  try {
    const { rewardId } = req.body;

    const reward = await BonusReward.findById(rewardId);

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found",
      });
    }

    const user = await User.findById(req.user.id);

    const todayAdsWatched = user.todayAdsWatched || 0;

    if (todayAdsWatched < reward.reqWatch) {
      return res.status(400).json({
        message: `You need to watch at least ${reward.reqWatch} ads`,
      });
    }

    const alreadyClaimed = user.claimedBonuses?.includes(reward._id.toString());

    if (alreadyClaimed) {
      return res.status(400).json({
        message: "Bonus already claimed",
      });
    }

    user.coins += reward.bonusCoin;

    if (!user.claimedBonuses) {
      user.claimedBonuses = [];
    }

    user.claimedBonuses.push(reward._id);

    await user.save();

    res.status(200).json({
      message: `You received ${reward.bonusCoin} VEs`,
      coins: user.coins,
    });
  } catch (error) {
    console.error("Claim Bonus Reward Error:", error);

    res.status(500).json({
      message: "Failed to claim bonus reward",
    });
  }
};

module.exports = {
  getBonusRewards,
  claimBonusReward,
};
