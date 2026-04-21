const mongoose = require("mongoose");

const spinRewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["coins", "xp", "gems", "voucher", "free_spin", "empty"],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    probability: {
      type: Number,
      required: true,
    },
    order: {
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

module.exports = mongoose.model("SpinReward", spinRewardSchema);
