const User = require("../models/User");
const { calculateLevel } = require("../utils/levelUtils");
const { badges } = require("../config/badgeConfig");

const getMyLevel = async (req, res) => {
  const user = await User.findById(req.user.id);

  const { nextXP } = calculateLevel(user.xp);

  res.json({
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    nextXP,
    badge: badges[user.level],
    progress: (user.xp / nextXP) * 100,
  });
};

module.exports = { getMyLevel };
