const cron = require("node-cron");
const { LEADERBOARD } = require("../utils/constants");
const { processWeeklyRewardsAndReset } = require("./leaderboard.service");

const startLeaderboardScheduler = () => {
  cron.schedule(
    "59 23 * * 0",
    async () => {
      try {
        await processWeeklyRewardsAndReset();
        console.log("Weekly leaderboard rewards distributed and reset done.");
      } catch (error) {
        console.error("Weekly leaderboard cron failed:", error.message);
      }
    },
    {
      timezone: LEADERBOARD.RESET_TIMEZONE,
    },
  );
};

module.exports = { startLeaderboardScheduler };
