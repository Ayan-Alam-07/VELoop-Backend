const { LEVELS } = require("../config/levelConfig");
const Transaction = require("../models/Transaction");

const applyLevelReward = async (user, level) => {
  const lvl = LEVELS.find((l) => l.level === level);
  if (!lvl) return;

  user.coins += lvl.reward;

  await Transaction.create({
    userId: user._id.toString(),
    type: "bonus",
    coins: lvl.reward,
    note: `Level ${level} reward`,
  });
};

module.exports = { applyLevelReward };
