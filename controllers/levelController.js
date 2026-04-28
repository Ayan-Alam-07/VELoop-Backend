// const User = require("../models/User");
// const { calculateLevel } = require("../utils/levelUtils");
// const { badges } = require("../config/badgeConfig");
// const { LEVELS } = require("../config/levelConfig");

// const getMyLevel = async (req, res) => {
//   const user = await User.findById(req.user.id);
//   const lvl = LEVELS.find((l) => l.level === user.level);

//   const { nextXP } = calculateLevel(user.xp);

//   res.json({
//     lvlReward: lvl.reward,
//     level: user.level,
//     xp: user.xp,
//     coins: user.coins,
//     nextXP,
//     badge: badges[user.level],
//     progress: (user.xp / nextXP) * 100,
//   });
// };

// module.exports = { getMyLevel };

const User = require("../models/User");
const { calculateLevel } = require("../utils/levelUtils");
const { badges } = require("../config/badgeConfig");
const { LEVELS } = require("../config/levelConfig");

const getMyLevel = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const lvl = LEVELS.find((l) => l.level === user.level);

    const { nextXP } = calculateLevel(user.xp);

    res.json({
      lvlReward: lvl?.reward || 0,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      nextXP,
      badge: badges[user.level],
      progress: (user.xp / nextXP) * 100,
    });
  } catch (error) {
    console.error("LEVEL ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getMyLevel };
