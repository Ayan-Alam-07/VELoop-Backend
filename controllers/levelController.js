const User = require("../models/User");
const { calculateLevel } = require("../utils/levelUtils");
const { badges } = require("../config/badgeConfig");
const { LEVELS } = require("../config/levelConfig");

const getMyLevel = async (req, res) => {
  const user = await User.findById(req.user.id);
  const lvl = LEVELS.find((l) => l.level === level);

  const { nextXP } = calculateLevel(user.xp);

  res.json({
    lvlReward: lvl.reward,
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    nextXP,
    badge: badges[user.level],
    progress: (user.xp / nextXP) * 100,
  });
};

module.exports = { getMyLevel };
