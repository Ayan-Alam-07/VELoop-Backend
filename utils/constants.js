const LEADERBOARD = {
  PARTICIPATION_FEE_COINS: 250,
  PARTICIPATION_FEE_XP: 70,
  RESET_TIMEZONE: process.env.CRON_TIMEZONE || "Asia/Kolkata",
  REWARD_RANGES: [
    { start: 1, end: 1, coins: 1000 },
    { start: 2, end: 2, coins: 500 },
    { start: 3, end: 3, coins: 250 },
    { start: 4, end: 50, coins: 100 },
    { start: 51, end: 100, coins: 50 },
    { start: 101, end: Infinity, coins: 25 },
  ],
};

module.exports = { LEADERBOARD };
