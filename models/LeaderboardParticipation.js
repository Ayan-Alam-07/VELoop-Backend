const mongoose = require("mongoose");

const leaderboardParticipationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekKey: {
      type: String,
      required: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    feeCoinsCharged: {
      type: Number,
      required: true,
      default: 250,
    },
    feeXpCharged: {
      type: Number,
      required: true,
      default: 70,
    },
  },
  { timestamps: true },
);

leaderboardParticipationSchema.index({ user: 1, weekKey: 1 }, { unique: true });

module.exports = mongoose.model(
  "LeaderboardParticipation",
  leaderboardParticipationSchema,
);
