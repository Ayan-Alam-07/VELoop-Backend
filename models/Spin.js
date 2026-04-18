// models/Spin.js

const mongoose = require("mongoose");

const spinRewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    rewardType: {
      type: String,
      enum: ["VE", "FREE_SPIN", "GIFT_VOUCHER", "XP", "LOSE"],
      required: true,
    },

    value: {
      type: String,
      required: true,
    },

    probability: {
      type: Number,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    icon: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

const spinHistorySchema = new mongoose.Schema(
  {
    rewardTitle: {
      type: String,
      required: true,
    },

    rewardType: {
      type: String,
      required: true,
    },

    rewardValue: {
      type: String,
      required: true,
    },

    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    spinDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const spinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    totalSpins: {
      type: Number,
      default: 1,
    },

    freeSpinCount: {
      type: Number,
      default: 0,
    },

    todayAdWatchCount: {
      type: Number,
      default: 0,
    },

    lastAdWatchDate: {
      type: Date,
      default: null,
    },

    totalLifetimeSpins: {
      type: Number,
      default: 0,
    },

    totalRewardsWon: {
      type: Number,
      default: 0,
    },

    lastSpinDate: {
      type: Date,
      default: null,
    },

    isSpinning: {
      type: Boolean,
      default: false,
    },

    rewards: {
      type: [spinRewardSchema],
      default: [
        {
          title: "8 VEs",
          rewardType: "VE",
          value: "8",
          probability: 18,
          color: "#7C3AED",
          icon: "💠",
        },
        {
          title: "5 VEs",
          rewardType: "VE",
          value: "5",
          probability: 22,
          color: "#e955ee",
          // color: "#4F46E5",
          icon: "💎",
        },
        {
          title: "12 VEs",
          rewardType: "VE",
          value: "12",
          probability: 10,
          color: "#9333EA",
          icon: "👑",
        },
        {
          title: "Free Spin Again",
          rewardType: "FREE_SPIN",
          value: "1",
          probability: 8,
          color: "#2563EB",
          icon: "🔄",
        },
        {
          title: "Amazon Voucher ₹2",
          rewardType: "GIFT_VOUCHER",
          value: "2",
          probability: 7,
          color: "#059669",
          icon: "🎁",
        },
        {
          title: "Amazon Voucher ₹5",
          rewardType: "GIFT_VOUCHER",
          value: "5",
          probability: 3,
          color: "#10B981",
          icon: "🛍️",
        },
        {
          title: "30 XP",
          rewardType: "XP",
          value: "30",
          probability: 15,
          color: "#F59E0B",
          icon: "⚡",
        },
        {
          title: "51 XP",
          rewardType: "XP",
          value: "51",
          probability: 7,
          color: "#F97316",
          icon: "🔥",
        },
        {
          title: "Better Luck Next Time",
          rewardType: "LOSE",
          value: "0",
          probability: 10,
          color: "#EF4444",
          icon: "😢",
        },
      ],
    },

    spinHistory: {
      type: [spinHistorySchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Spin", spinSchema);
