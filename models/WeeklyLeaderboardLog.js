const mongoose = require("mongoose");

const weeklyLeaderboardLogSchema = new mongoose.Schema(
  {
    weekKey: {
      type: String,
      required: true,
      unique: true,
    },
    winners: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        userId: String,
        rank: Number,
        weeklyCoinsEarned: Number,
        xp: Number,
        rewardCoins: Number,
      },
    ],
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "WeeklyLeaderboardLog",
  weeklyLeaderboardLogSchema,
);
