const User = require("../models/User");
const { processXPAction } = require("../utils/antiCheat");
const { calculateLevel, applyDailyBoost } = require("../utils/levelUtils");
const { applyLevelReward } = require("../utils/rewardUtils");

const addXP = async (req, res) => {
  try {
    const { action } = req.body;

    const user = await User.findById(req.user.id);

    let xp = processXPAction(user, action);
    xp = applyDailyBoost(user, xp);

    user.xp += xp;

    const { currentLevel } = calculateLevel(user.xp);

    if (currentLevel > user.level) {
      for (let lvl = user.level + 1; lvl <= currentLevel; lvl++) {
        await applyLevelReward(user, lvl);
      }
      user.level = currentLevel;
    }

    await user.save();

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { addXP };
