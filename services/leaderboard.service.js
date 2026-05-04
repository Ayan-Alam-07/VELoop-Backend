const mongoose = require("mongoose");
const User = require("../models/User");
const LeaderboardParticipation = require("../models/LeaderboardParticipation");
const WeeklyLeaderboardLog = require("../models/WeeklyLeaderboardLog");
const { LEADERBOARD } = require("../utils/constants");
const { getWeekKey, getRewardByRank } = require("../utils/weekHelpers");
const AppError = require("../utils/appError");

const joinWeeklyLeaderboard = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    console.log("🔍 Found user:", user);

    if (!user) {
      console.log("❌ joinWeeklyLeaderboard: User not found for ID:", userId);
      throw new AppError("Invalid session. Please login again.", 401);
    }

    if (user.coins < LEADERBOARD.PARTICIPATION_FEE_COINS) {
      throw new AppError("Not enough coins to join leaderboard", 400);
    }

    if (user.xp < LEADERBOARD.PARTICIPATION_FEE_XP) {
      throw new AppError("Not enough XP to join leaderboard", 400);
    }

    const weekKey = getWeekKey();

    const existingParticipation = await LeaderboardParticipation.findOne({
      user: user._id,
      weekKey,
    }).session(session);

    if (existingParticipation) {
      throw new AppError("You already joined this week's leaderboard", 400);
    }

    user.coins -= LEADERBOARD.PARTICIPATION_FEE_COINS;
    user.xp -= LEADERBOARD.PARTICIPATION_FEE_XP;
    user.isWeeklyLeaderboardParticipant = true;
    user.lastWeeklyParticipationAt = new Date();

    await user.save({ session });

    await LeaderboardParticipation.create(
      [
        {
          user: user._id,
          weekKey,
          feeCoinsCharged: LEADERBOARD.PARTICIPATION_FEE_COINS,
          feeXpCharged: LEADERBOARD.PARTICIPATION_FEE_XP,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getWeeklyLeaderboard = async (page, limit, currentUserId) => {
  const skip = (page - 1) * limit;

  const query = {
    isWeeklyLeaderboardParticipant: true,
  };

  const [users, total, currentUser] = await Promise.all([
    User.find(query)
      .select("userId coins xp weeklyCoinsEarned")
      .sort({ weeklyCoinsEarned: -1, xp: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
    currentUserId
      ? User.findById(currentUserId)
          .select(
            "userId weeklyCoinsEarned xp coins isWeeklyLeaderboardParticipant",
          )
          .lean()
      : null,
  ]);

  const rankedUsers = users.map((user, index) => ({
    rank: skip + index + 1,
    userId: user.userId,
    coins: user.coins,
    xp: user.xp,
    weeklyCoinsEarned: user.weeklyCoinsEarned,
    participated: user.isWeeklyLeaderboardParticipant,
  }));

  let currentUserRank = null;

  if (currentUser && currentUser.isWeeklyLeaderboardParticipant) {
    const higherCount = await User.countDocuments({
      isWeeklyLeaderboardParticipant: true,
      $or: [
        { weeklyCoinsEarned: { $gt: currentUser.weeklyCoinsEarned } },
        {
          weeklyCoinsEarned: currentUser.weeklyCoinsEarned,
          xp: { $gt: currentUser.xp },
        },
      ],
    });

    currentUserRank = {
      rank: higherCount + 1,
      userId: currentUser.userId,
      weeklyCoinsEarned: currentUser.weeklyCoinsEarned,
      xp: currentUser.xp,
      coins: currentUser.coins,
    };
  }

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    currentUserRank,
    data: rankedUsers,
  };
};

const addWeeklyCoinsEarned = async (userId, earnedCoins) => {
  if (!earnedCoins || earnedCoins <= 0) {
    return null;
  }

  return User.findByIdAndUpdate(
    userId,
    { $inc: { weeklyCoinsEarned: earnedCoins } },
    { new: true },
  );
};

const processWeeklyRewardsAndReset = async () => {
  const weekKey = getWeekKey();

  const alreadyProcessed = await WeeklyLeaderboardLog.findOne({ weekKey });
  if (alreadyProcessed) {
    return alreadyProcessed;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const participants = await User.find({
      isWeeklyLeaderboardParticipant: true,
    })
      .sort({ weeklyCoinsEarned: -1, xp: -1, createdAt: 1 })
      .session(session);

    const winners = [];

    for (let i = 0; i < participants.length; i++) {
      const user = participants[i];
      const rank = i + 1;
      const rewardCoins = getRewardByRank(rank, LEADERBOARD.REWARD_RANGES);

      user.coins += rewardCoins;

      winners.push({
        user: user._id,
        userId: user.userId,
        rank,
        weeklyCoinsEarned: user.weeklyCoinsEarned,
        xp: user.xp,
        rewardCoins,
      });

      user.weeklyCoinsEarned = 0;
      user.isWeeklyLeaderboardParticipant = false;
      await user.save({ session });
    }

    const savedLog = await WeeklyLeaderboardLog.create(
      [
        {
          weekKey,
          winners,
          processedAt: new Date(),
        },
      ],
      { session },
    );

    await LeaderboardParticipation.deleteMany({ weekKey }).session(session);

    await session.commitTransaction();
    session.endSession();

    return savedLog[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  joinWeeklyLeaderboard,
  getWeeklyLeaderboard,
  addWeeklyCoinsEarned,
  processWeeklyRewardsAndReset,
};
