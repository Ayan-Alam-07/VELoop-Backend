const leaderboardService = require("../services/leaderboard.service");
const { successResponse } = require("../utils/apiResponse");

const joinLeaderboard = async (req, res, next) => {
  try {
    // const user = await leaderboardService.joinWeeklyLeaderboard(req.user._id);
    const user = await leaderboardService.joinWeeklyLeaderboard(req.user.id);

    return successResponse(res, 200, "Joined weekly leaderboard successfully", {
      userId: user.userId,
      coins: user.coins,
      xp: user.xp,
      weeklyCoinsEarned: user.weeklyCoinsEarned,
      isWeeklyLeaderboardParticipant: user.isWeeklyLeaderboardParticipant,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await leaderboardService.getWeeklyLeaderboard(
      page,
      limit,
      // req.user._id,
      req.user.id,
    );

    return successResponse(
      res,
      200,
      "Weekly leaderboard fetched successfully",
      data,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinLeaderboard,
  getLeaderboard,
};
