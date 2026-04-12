// import DailyCheckinReward from "../models/DailyCheckinReward.js";
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const claimDailyCheckin = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const streakDay = getCurrentStreakDay(
//       user.lastDailyCheckin,
//       user.dailyCheckinStreak || 0
//     );

//     const reward = await DailyCheckinReward.findOne({ day: streakDay });

//     const today = new Date();
//     const lastClaimDate = user.lastDailyCheckin
//       ? new Date(user.lastDailyCheckin)
//       : null;

//     if (lastClaimDate) {
//       lastClaimDate.setHours(0, 0, 0, 0);
//       today.setHours(0, 0, 0, 0);

//       if (lastClaimDate.getTime() === today.getTime()) {
//         return res.status(400).json({
//           success: false,
//           message: "Already claimed today",
//         });
//       }
//     }

//     if (reward.type === "coin") {
//       const coinAmount = Number(reward.value.replace("+", ""));
//       user.coins += coinAmount;
//     }

//     if (reward.type === "giftcard") {
//       user.pendingGiftCards.push({
//         amount: reward.value,
//         reward: reward.reward,
//         status: "pending",
//       });
//     }

//     user.dailyCheckinStreak = streakDay;
//     user.lastDailyCheckin = new Date();

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Reward claimed successfully",
//       streakDay,
//       reward,
//       coins: user.coins,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// import DailyCheckinReward from "../models/DailyCheckinReward.js";
// import User from "../models/User.js";
// import { getCurrentStreakDay } from "../utils/streakUtils.js";

// export const getDailyCheckinRewards = async (req, res) => {
//   try {
//     const rewards = await DailyCheckinReward.find().sort({ day: 1 });

//     return res.status(200).json({
//       success: true,
//       rewards,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const claimDailyCheckin = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     let streakDay = 1;

//     if (user.lastDailyCheckin) {
//       const lastDate = new Date(user.lastDailyCheckin);
//       lastDate.setHours(0, 0, 0, 0);

//       const diffDays =
//         (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

//       if (diffDays === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Already claimed today",
//         });
//       }

//       if (diffDays === 1) {
//         streakDay =
//           user.dailyCheckinStreak >= 7 ? 1 : user.dailyCheckinStreak + 1;
//       } else {
//         streakDay = 1;
//       }
//     }

//     const reward = await DailyCheckinReward.findOne({ day: streakDay });

//     if (!reward) {
//       return res.status(404).json({
//         success: false,
//         message: "Reward not found",
//       });
//     }

//     if (reward.type === "coin") {
//       const coinAmount = Number(reward.value.replace("+", ""));
//       user.coins += coinAmount;
//     }

//     if (reward.type === "giftcard") {
//       user.pendingGiftCards.push({
//         amount: reward.value,
//         reward: reward.reward,
//         status: "pending",
//       });
//     }

//     user.dailyCheckinStreak = streakDay;
//     user.lastDailyCheckin = new Date();

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Reward claimed successfully",
//       streakDay,
//       reward,
//       coins: user.coins,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const DailyCheckinReward = require("../models/DailyCheckinReward");
const User = require("../models/User");
const { getCurrentStreakDay } = require("../utils/streakUtils");

const getDailyCheckinRewards = async (req, res) => {
  try {
    const rewards = await DailyCheckinReward.find().sort({ day: 1 });

    return res.status(200).json({
      success: true,
      rewards,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// const claimDailyCheckin = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     let streakDay = 1;

//     if (user.lastDailyCheckin) {
//       const lastDate = new Date(user.lastDailyCheckin);
//       lastDate.setHours(0, 0, 0, 0);

//       const diffDays =
//         (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

//       if (diffDays === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Already claimed today",
//         });
//       }

//       if (diffDays === 1) {
//         streakDay =
//           user.dailyCheckinStreak >= 7 ? 1 : user.dailyCheckinStreak + 1;
//       }
//     }

//     const reward = await DailyCheckinReward.findOne({ day: streakDay });

//     if (!reward) {
//       return res.status(404).json({
//         success: false,
//         message: "Reward not found",
//       });
//     }

//     if (reward.type === "coin") {
//       const coinAmount = Number(reward.value.replace("+", ""));
//       user.coins += coinAmount;
//     }

//     if (reward.type === "giftcard") {
//       user.pendingGiftCards.push({
//         amount: reward.value,
//         reward: reward.reward,
//         status: "pending",
//       });
//     }

//     user.dailyCheckinStreak = streakDay;
//     user.lastDailyCheckin = new Date();

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Reward claimed successfully",
//       streakDay,
//       reward,
//       coins: user.coins,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const claimDailyCheckin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();

    if (user.nextDailyCheckinAt && new Date(user.nextDailyCheckinAt) > now) {
      return res.status(400).json({
        success: false,
        message: "Already claimed today",
        nextClaimAt: user.nextDailyCheckinAt,
      });
    }

    let streakDay = 1;

    if (user.lastDailyCheckin) {
      const lastDate = new Date(user.lastDailyCheckin);
      const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streakDay =
          user.dailyCheckinStreak >= 7 ? 1 : user.dailyCheckinStreak + 1;
      } else if (diffDays > 1) {
        streakDay = 1;
        user.claimedCheckinDays = [];
      } else {
        return res.status(400).json({
          success: false,
          message: "Already claimed today",
        });
      }
    }

    if (user.claimedCheckinDays.includes(streakDay)) {
      return res.status(400).json({
        success: false,
        message: "Reward already claimed",
      });
    }

    const reward = await DailyCheckinReward.findOne({ day: streakDay });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    if (reward.type === "coin") {
      const coinAmount = Number(reward.value.replace("+", ""));
      user.coins += coinAmount;
    }

    if (reward.type === "giftcard") {
      user.pendingGiftCards.push({
        amount: reward.value,
        reward: reward.reward,
        status: "pending",
      });
    }

    user.dailyCheckinStreak = streakDay;
    user.lastDailyCheckin = now;
    user.nextDailyCheckinAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (!user.claimedCheckinDays.includes(streakDay)) {
      user.claimedCheckinDays.push(streakDay);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Reward claimed successfully",
      streakDay,
      reward,
      claimedDays: user.claimedCheckinDays,
      nextClaimAt: user.nextDailyCheckinAt,
      coins: user.coins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDailyCheckinRewards,
  claimDailyCheckin,
};
