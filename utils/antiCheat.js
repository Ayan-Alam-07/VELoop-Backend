const XP_MAP = {
  watchAd: 10,
  captcha: 5,
  referral: 100,
  task: 50,
  bonus: 20,
};

const ACTION_LIMITS = {
  watchAd: 20,
  captcha: 30,
  referral: 5,
  task: 10,
};

const processXPAction = (user, action) => {
  if (!XP_MAP[action]) {
    throw new Error("Invalid action");
  }

  const xp = XP_MAP[action];
  const now = Date.now();

  if (!user._actionLogs) user._actionLogs = [];

  user._actionLogs = user._actionLogs.filter((log) => now - log.time < 60000);

  const count = user._actionLogs.filter((log) => log.action === action).length;

  if (count >= (ACTION_LIMITS[action] || 10)) {
    throw new Error("Rate limit exceeded");
  }

  user._actionLogs.push({ action, time: now });

  if (user.dailyXP > 2000) {
    throw new Error("Daily XP limit exceeded");
  }

  return xp;
};

module.exports = { processXPAction };
