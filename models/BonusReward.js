// backend/models/BonusReward.js

const mongoose = require("mongoose");

const bonusRewardSchema = new mongoose.Schema(
  {
    reqWatch: {
      type: Number,
      required: true,
    },
    bonusCoin: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("BonusReward", bonusRewardSchema);
