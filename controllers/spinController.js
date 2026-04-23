const User = require("../models/User");
const SpinReward = require("../models/SpinReward");
const weightedRandom = require("../utils/weightedRandom");

const getSpinDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "availableSpins totalSpinsPlayed rewardHistory coins xp",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const rewards = await SpinReward.find({
      isActive: true,
    }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      data: {
        availableSpins: user.availableSpins,
        totalSpinsPlayed: user.totalSpinsPlayed,
        coins: user.coins,
        xp: user.xp,
        rewardHistory: user.rewardHistory.slice(0, 10),
        rewards,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const playSpin = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.availableSpins <= 0) {
      return res.status(400).json({
        success: false,
        message: "No spins left",
      });
    }

    const activeRewards = await SpinReward.find({
      isActive: true,
    }).sort({ order: 1 });

    if (!activeRewards.length) {
      return res.status(400).json({
        success: false,
        message: "No rewards found",
      });
    }

    const selectedReward = weightedRandom(activeRewards);

    user.availableSpins -= 1;
    user.totalSpinsPlayed += 1;

    if (selectedReward.type === "coins") {
      user.coins += selectedReward.amount;
    }

    if (selectedReward.type === "xp") {
      user.xp += selectedReward.amount;
    }

    if (selectedReward.type === "free_spin") {
      user.availableSpins += selectedReward.amount;
    }

    if (selectedReward.type === "gems") {
      user.gems += selectedReward.amount;
    }

    user.rewardHistory.unshift({
      rewardId: selectedReward._id,
      title: selectedReward.title,
      type: selectedReward.type,
      amount: selectedReward.amount,
      icon: selectedReward.icon,
      color: selectedReward.color,
      rewardedAt: new Date(),
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Spin completed successfully",
      data: {
        reward: selectedReward,
        availableSpins: user.availableSpins,
        totalSpinsPlayed: user.totalSpinsPlayed,
        coins: user.coins,
        xp: user.xp,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSpinDetails,
  playSpin,
};
