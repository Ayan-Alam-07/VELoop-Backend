const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  userId: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  provider: {
    type: String,
    default: "email", // email or google
  },

  coins: {
    type: Number,
    default: 0,
  },

  referralCode: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{8}$/, "Referral code must be exactly 8 digits"],
  },
  referredBy: String,
  referrals: [referralSchema],

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
});

module.exports = mongoose.model("User", userSchema);
