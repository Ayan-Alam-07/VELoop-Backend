const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  userId: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,

    provider: {
      type: String,
      default: "email",
    },

    // =====================
    // WALLET
    // =====================

    coins: {
      type: Number,
      default: 0,
    },

    gems: {
      type: Number,
      default: 0,
    },

    lifetimeEarning: {
      type: Number,
      default: 0,
    },

    // =====================
    // REFERRAL SYSTEM
    // =====================

    referralCode: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{8}$/, "Referral code must be exactly 8 digits"],
    },

    referredBy: {
      type: String,
      default: null,
    },

    referrals: [
      {
        userId: String,
        email: String,
        referredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    totalReferralEarning: {
      type: Number,
      default: 0,
    },

    // =====================
    // ADS TRACKING
    // =====================

    totalAdsWatched: {
      type: Number,
      default: 0,
    },

    todayAdsWatched: {
      type: Number,
      default: 0,
    },

    lastAdWatchReset: {
      type: Date,
      default: Date.now,
    },

    lastCaptchaTime: {
      type: Date,
      default: null,
    },

    // =====================
    // Recently added
    // =====================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // =====================
    // WITHDRAWAL STATS
    // =====================

    totalWithdrawCount: {
      type: Number,
      default: 0,
    },

    totalWithdrawAmount: {
      type: Number,
      default: 0,
    },

    // =====================
    // SECURITY
    // =====================

    failedOtpAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    otpRequestCount: {
      type: Number,
      default: 0,
    },

    otpRequestWindow: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
