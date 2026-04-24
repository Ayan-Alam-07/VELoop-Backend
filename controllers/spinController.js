// const User = require("../models/User");
// const SpinReward = require("../models/SpinReward");
// const weightedRandom = require("../utils/weightedRandom");

// const getSpinDetails = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId).select(
//       "availableSpins totalSpinsPlayed rewardHistory coins xp",
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const rewards = await SpinReward.find({
//       isActive: true,
//     }).sort({ order: 1 });

//     return res.status(200).json({
//       success: true,
//       data: {
//         availableSpins: user.availableSpins,
//         totalSpinsPlayed: user.totalSpinsPlayed,
//         coins: user.coins,
//         xp: user.xp,
//         gems: user.gems,
//         rewardHistory: user.rewardHistory.slice(0, 10),
//         rewards,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // const playSpin = async (req, res) => {
// //   try {
// //     const userId = req.user.id;

// //     const user = await User.findById(userId);

// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "User not found",
// //       });
// //     }

// //     if (user.availableSpins <= 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "No spins left",
// //       });
// //     }

// //     const activeRewards = await SpinReward.find({
// //       isActive: true,
// //     }).sort({ order: 1 });

// //     if (!activeRewards.length) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "No rewards found",
// //       });
// //     }

// //     console.log("Active Rewards:", activeRewards);

// //     const selectedReward = weightedRandom(activeRewards);

// //     if (!selectedReward) {
// //       console.log("❌ No reward selected");
// //       return res.status(500).json({
// //         success: false,
// //         message: "Failed to select reward",
// //       });
// //     }
// //     console.log("Selected Reward:", selectedReward);

// //     user.availableSpins -= 1;
// //     user.totalSpinsPlayed += 1;

// //     if (selectedReward.type === "coins") {
// //       // user.coins += selectedReward.amount;
// //       user.coins = (user.coins || 0) + selectedReward.amount;
// //     }

// //     if (selectedReward.type === "xp") {
// //       // user.xp += selectedReward.amount;
// //       user.xp = (user.xp || 0) + selectedReward.amount;
// //     }

// //     if (selectedReward.type === "free_spin") {
// //       user.availableSpins += selectedReward.amount;
// //     }

// //     if (selectedReward.type === "gems") {
// //       user.gems = (user.gems || 0) + selectedReward.amount;
// //     }

// //     user.rewardHistory.unshift({
// //       rewardId: selectedReward._id,
// //       title: selectedReward.title,
// //       type: selectedReward.type,
// //       amount: selectedReward.amount,
// //       icon: selectedReward.icon,
// //       color: selectedReward.color,
// //       rewardedAt: new Date(),
// //     });

// //     await user.save();

// //     return res.status(200).json({
// //       success: true,
// //       message: "Spin completed successfully",
// //       data: {
// //         reward: selectedReward,
// //         availableSpins: user.availableSpins,
// //         totalSpinsPlayed: user.totalSpinsPlayed,
// //         coins: user.coins,
// //         xp: user.xp,
// //         gems: user.gems,
// //       },
// //     });
// //   } catch (error) {
// //     console.log("playSpin error:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };

// const playSpin = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     user.availableSpins = Number(user.availableSpins ?? 0);
//     user.totalSpinsPlayed = Number(user.totalSpinsPlayed ?? 0);
//     user.coins = Number(user.coins ?? 0);
//     user.xp = Number(user.xp ?? 0);
//     user.gems = Number(user.gems ?? 0);
//     user.rewardHistory = Array.isArray(user.rewardHistory)
//       ? user.rewardHistory
//       : [];

//     if (user.availableSpins <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No spins left",
//       });
//     }

//     const activeRewards = await SpinReward.find({ isActive: true }).sort({
//       order: 1,
//     });

//     if (!activeRewards.length) {
//       return res.status(400).json({
//         success: false,
//         message: "No rewards found",
//       });
//     }

//     const selectedReward = weightedRandom(activeRewards);

//     if (!selectedReward) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to select reward",
//       });
//     }

//     user.availableSpins -= 1;
//     user.totalSpinsPlayed += 1;

//     if (selectedReward.type === "coins") {
//       user.coins += Number(selectedReward.amount || 0);
//     }

//     if (selectedReward.type === "xp") {
//       user.xp += Number(selectedReward.amount || 0);
//     }

//     if (selectedReward.type === "free_spin") {
//       user.availableSpins += Number(selectedReward.amount || 0);
//     }

//     if (selectedReward.type === "gems") {
//       user.gems += Number(selectedReward.amount || 0);
//     }

//     // user.rewardHistory.unshift({
//     //   rewardId: selectedReward._id,
//     //   title: selectedReward.title,
//     //   type: selectedReward.type,
//     //   amount: selectedReward.amount,
//     //   icon: selectedReward.icon,
//     //   color: selectedReward.color,
//     //   rewardedAt: new Date(),
//     // });

//     user.rewardHistory = Array.isArray(user.rewardHistory)
//       ? user.rewardHistory
//       : [];

//     user.rewardHistory.unshift({
//       rewardId: selectedReward._id,
//       title: selectedReward.title,
//       type: selectedReward.type,
//       amount: selectedReward.amount,
//       icon: selectedReward.icon,
//       color: selectedReward.color,
//       rewardedAt: new Date(),
//     });

//     await user.save();

//     console.log(
//       "rewardHistory schema path =",
//       User.schema.path("rewardHistory"),
//     );
//     console.log("rewardHistory value =", user.rewardHistory);

//     return res.status(200).json({
//       success: true,
//       message: "Spin completed successfully",
//       data: {
//         reward: selectedReward,
//         availableSpins: user.availableSpins,
//         totalSpinsPlayed: user.totalSpinsPlayed,
//         coins: user.coins,
//         xp: user.xp,
//         gems: user.gems,
//       },
//     });
//   } catch (error) {
//     console.log("playSpin error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = {
//   getSpinDetails,
//   playSpin,
// };

// module.exports = {
//   getSpinDetails,
//   playSpin,
// };

const User = require("../models/User");
const SpinReward = require("../models/SpinReward");
const weightedRandom = require("../utils/weightedRandom");

const getSpinDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "availableSpins totalSpinsPlayed rewardHistory coins xp gems currentSpinReward",
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
        gems: user.gems,
        currentSpinReward: user.currentSpinReward,
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

    user.availableSpins = Number(user.availableSpins ?? 0);
    user.totalSpinsPlayed = Number(user.totalSpinsPlayed ?? 0);

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

    if (!selectedReward) {
      return res.status(500).json({
        success: false,
        message: "Failed to select reward",
      });
    }

    user.availableSpins -= 1;
    user.totalSpinsPlayed += 1;

    user.currentSpinReward = {
      rewardId: selectedReward._id,
      title: selectedReward.title,
      rewardType: selectedReward.type,
      amount: selectedReward.amount,
      icon: selectedReward.icon,
      color: selectedReward.color,
      wonAt: new Date(),
    };

    await user.save();

    // return res.status(200).json({
    //   success: true,
    //   message: "Spin completed successfully",
    //   data: {
    //     reward: user.currentSpinReward,
    //     availableSpins: user.availableSpins,
    //     totalSpinsPlayed: user.totalSpinsPlayed,
    //     coins: user.coins,
    //     xp: user.xp,
    //     gems: user.gems,
    //   },
    // });

    return res.status(200).json({
      success: true,
      message: "Spin completed successfully",
      data: {
        reward: user.currentSpinReward,
        rewardOrder: selectedReward.order,
        availableSpins: user.availableSpins,
        totalSpinsPlayed: user.totalSpinsPlayed,
        coins: user.coins,
        xp: user.xp,
        gems: user.gems,
      },
    });
  } catch (error) {
    console.log("playSpin error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const claimSpinReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.coins = Number(user.coins ?? 0);
    user.xp = Number(user.xp ?? 0);
    user.gems = Number(user.gems ?? 0);
    user.availableSpins = Number(user.availableSpins ?? 0);
    user.rewardHistory = Array.isArray(user.rewardHistory)
      ? user.rewardHistory
      : [];

    const reward = user.currentSpinReward;

    if (!reward || !reward.rewardId) {
      return res.status(400).json({
        success: false,
        message: "No reward available to claim",
      });
    }

    if (reward.rewardType === "coins") {
      user.coins += Number(reward.amount || 0);
    }

    if (reward.rewardType === "xp") {
      user.xp += Number(reward.amount || 0);
    }

    if (reward.rewardType === "free_spin") {
      user.availableSpins += Number(reward.amount || 0);
    }

    if (reward.rewardType === "gems") {
      user.gems += Number(reward.amount || 0);
    }

    user.rewardHistory.unshift({
      rewardId: reward.rewardId,
      title: reward.title,
      rewardType: reward.rewardType,
      amount: reward.amount,
      icon: reward.icon,
      color: reward.color,
      rewardedAt: new Date(),
    });

    user.currentSpinReward = {
      rewardId: null,
      title: null,
      rewardType: null,
      amount: 0,
      icon: null,
      color: null,
      wonAt: null,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Reward claimed successfully",
      data: {
        availableSpins: user.availableSpins,
        totalSpinsPlayed: user.totalSpinsPlayed,
        coins: user.coins,
        xp: user.xp,
        gems: user.gems,
      },
    });
  } catch (error) {
    console.log("claimSpinReward error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const discardSpinReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.currentSpinReward = {
      rewardId: null,
      title: null,
      rewardType: null,
      amount: 0,
      icon: null,
      color: null,
      wonAt: null,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Reward discarded successfully",
      data: {
        availableSpins: user.availableSpins,
      },
    });
  } catch (error) {
    console.log("discardSpinReward error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSpinDetails,
  playSpin,
  claimSpinReward,
  discardSpinReward,
};
