// // backend/controllers/bonusController.js

// const BonusReward = require("../models/BonusReward");
// const User = require("../models/User");

// const getBonusRewards = async (req, res) => {
//   try {
//     const rewards = await BonusReward.find({
//       isActive: true,
//     }).sort({ reqWatch: 1 });

//     const user = await User.findById(req.user.id);

//     res.status(200).json({
//       todayAdsWatched: user.todayAdsWatched || 0,
//       rewards,
//     });
//   } catch (error) {
//     console.error("Get Bonus Rewards Error:", error);

//     res.status(500).json({
//       message: "Failed to fetch bonus rewards",
//     });
//   }
// };

// const claimBonusReward = async (req, res) => {
//   try {
//     const { rewardId } = req.body;

//     const reward = await BonusReward.findById(rewardId);

//     if (!reward) {
//       return res.status(404).json({
//         message: "Reward not found",
//       });
//     }

//     const user = await User.findById(req.user.id);

//     const todayAdsWatched = user.todayAdsWatched || 0;

//     if (todayAdsWatched < reward.reqWatch) {
//       return res.status(400).json({
//         message: `You need to watch at least ${reward.reqWatch} ads`,
//       });
//     }

//     const alreadyClaimed = user.claimedBonuses?.includes(reward._id.toString());

//     if (alreadyClaimed) {
//       return res.status(400).json({
//         message: "Bonus already claimed",
//       });
//     }

//     user.coins += reward.bonusCoin;

//     if (!user.claimedBonuses) {
//       user.claimedBonuses = [];
//     }

//     user.claimedBonuses.push(reward._id);

//     await user.save();

//     res.status(200).json({
//       message: `You received ${reward.bonusCoin} VEs`,
//       coins: user.coins,
//     });
//   } catch (error) {
//     console.error("Claim Bonus Reward Error:", error);

//     res.status(500).json({
//       message: "Failed to claim bonus reward",
//     });
//   }
// };

// module.exports = {
//   getBonusRewards,
//   claimBonusReward,
// };

// controllers/bonusController.js

const BonusReward = require("../models/BonusReward");
const User = require("../models/User");

const resetDailyBonusDataIfNeeded = async (user) => {
  const now = new Date();

  const indiaTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  );

  const lastReset = user.lastAdWatchReset
    ? new Date(
        new Date(user.lastAdWatchReset).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      )
    : null;

  const isNewDay =
    !lastReset ||
    indiaTime.getDate() !== lastReset.getDate() ||
    indiaTime.getMonth() !== lastReset.getMonth() ||
    indiaTime.getFullYear() !== lastReset.getFullYear();

  if (isNewDay) {
    user.todayAdsWatched = 0;
    user.claimedBonuses = [];
    user.lastAdWatchReset = now;

    await user.save();
  }
};

const getBonusRewards = async (req, res) => {
  try {
    const rewards = await BonusReward.find({
      isActive: true,
    }).sort({ reqWatch: 1 });

    const user = await User.findById(req.user.id);

    await resetDailyBonusDataIfNeeded(user);

    const claimedRewardIds = user.claimedBonuses.map((item) =>
      item.rewardId.toString(),
    );

    const updatedRewards = rewards.map((reward) => ({
      _id: reward._id,
      reqWatch: reward.reqWatch,
      bonusCoin: reward.bonusCoin,
      isActive: reward.isActive,
      claimed: claimedRewardIds.includes(reward._id.toString()),
    }));

    res.status(200).json({
      todayAdsWatched: user.todayAdsWatched || 0,
      rewards: updatedRewards,
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

    await resetDailyBonusDataIfNeeded(user);

    const todayAdsWatched = user.todayAdsWatched || 0;

    if (todayAdsWatched < reward.reqWatch) {
      return res.status(400).json({
        message: `You need to watch at least ${reward.reqWatch} ads`,
      });
    }

    const alreadyClaimed = user.claimedBonuses.some(
      (item) => item.rewardId.toString() === reward._id.toString(),
    );

    if (alreadyClaimed) {
      return res.status(400).json({
        message: "Bonus already claimed",
      });
    }

    user.coins += reward.bonusCoin;

    user.claimedBonuses.push({
      rewardId: reward._id,
      claimedAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      message: `You received ${reward.bonusCoin} VEs`,
      coins: user.coins,
      claimedRewardId: reward._id,
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
