// controllers/spinController.js

const Spin = require("../models/Spin");
const { weightedRandom } = require("../utils/weightedRandom");

const isSameDay = (date1, date2) => {
  return new Date(date1).toDateString() === new Date(date2).toDateString();
};

const getSpinDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    let userSpin = await Spin.findOne({ userId });

    if (!userSpin) {
      userSpin = await Spin.create({
        userId,
      });
    }

    const today = new Date();

    if (!userSpin.lastSpinDate || !isSameDay(userSpin.lastSpinDate, today)) {
      userSpin.totalSpins = 1 + userSpin.freeSpinCount;
      userSpin.isSpinning = false;
      await userSpin.save();
    }

    if (
      userSpin.lastAdWatchDate &&
      !isSameDay(userSpin.lastAdWatchDate, today)
    ) {
      userSpin.todayAdWatchCount = 0;
      await userSpin.save();
    }

    const activeRewards = userSpin.rewards.filter((reward) => reward.isActive);

    return res.status(200).json({
      success: true,
      data: {
        totalSpins: userSpin.totalSpins,
        freeSpinCount: userSpin.freeSpinCount,
        todayAdWatchCount: userSpin.todayAdWatchCount,
        totalLifetimeSpins: userSpin.totalLifetimeSpins,
        totalRewardsWon: userSpin.totalRewardsWon,
        spinHistory: userSpin.spinHistory.slice(-10).reverse(),
        rewards: activeRewards,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const watchSpinAd = async (req, res) => {
  try {
    const userId = req.user.id;

    let userSpin = await Spin.findOne({ userId });

    if (!userSpin) {
      userSpin = await Spin.create({
        userId,
      });
    }

    const today = new Date();

    if (
      userSpin.lastAdWatchDate &&
      !isSameDay(userSpin.lastAdWatchDate, today)
    ) {
      userSpin.todayAdWatchCount = 0;
    }

    userSpin.todayAdWatchCount += 1;
    userSpin.lastAdWatchDate = today;

    let extraSpinUnlocked = false;

    if (userSpin.todayAdWatchCount >= 6) {
      userSpin.totalSpins += 1;
      userSpin.todayAdWatchCount = 0;
      extraSpinUnlocked = true;
    }

    await userSpin.save();

    return res.status(200).json({
      success: true,
      message: extraSpinUnlocked
        ? "You unlocked 1 extra spin"
        : "Ad watch counted successfully",
      data: {
        totalSpins: userSpin.totalSpins,
        todayAdWatchCount: userSpin.todayAdWatchCount,
        extraSpinUnlocked,
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

    let userSpin = await Spin.findOne({ userId });

    if (!userSpin) {
      userSpin = await Spin.create({
        userId,
      });
    }

    if (userSpin.isSpinning) {
      return res.status(400).json({
        success: false,
        message: "Spin already in progress",
      });
    }

    if (userSpin.totalSpins <= 0) {
      return res.status(400).json({
        success: false,
        message: "No spins left",
      });
    }

    userSpin.isSpinning = true;
    await userSpin.save();

    const activeRewards = userSpin.rewards.filter((reward) => reward.isActive);

    const selectedReward = weightedRandom(activeRewards);

    userSpin.totalSpins -= 1;
    userSpin.totalLifetimeSpins += 1;
    userSpin.totalRewardsWon += 1;
    userSpin.lastSpinDate = new Date();

    if (selectedReward.rewardType === "FREE_SPIN") {
      userSpin.totalSpins += 1;
      userSpin.freeSpinCount += 1;
    }

    userSpin.spinHistory.push({
      rewardTitle: selectedReward.title,
      rewardType: selectedReward.rewardType,
      rewardValue: selectedReward.value,
      rewardId: selectedReward._id,
      spinDate: new Date(),
    });

    userSpin.isSpinning = false;

    await userSpin.save();

    return res.status(200).json({
      success: true,
      message: "Spin completed successfully",
      data: {
        reward: selectedReward,
        remainingSpins: userSpin.totalSpins,
        totalLifetimeSpins: userSpin.totalLifetimeSpins,
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
  watchSpinAd,
  playSpin,
};
