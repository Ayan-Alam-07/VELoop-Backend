const { LEVELS } = require("../config/levelConfig");

const calculateLevel = (xp) => {
  let currentLevel = 0;
  let nextXP = 0;

  for (let lvl of LEVELS) {
    if (xp >= lvl.minXP && xp <= lvl.maxXP) {
      currentLevel = lvl.level;
      nextXP = lvl.maxXP;
    }
  }

  return { currentLevel, nextXP };
};

const applyDailyBoost = (user, xp) => {
  const today = new Date().toDateString();

  if (!user.lastXPUpdate || user.lastXPUpdate.toDateString() !== today) {
    user.dailyXP = 0;
  }

  user.lastXPUpdate = new Date();

  if (user.dailyXP < 500) {
    xp *= 1.5;
  }

  user.dailyXP += xp;

  return xp;
};

module.exports = { calculateLevel, applyDailyBoost };
