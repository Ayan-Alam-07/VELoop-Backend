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

  referralCode: { type: String, unique: true },
  referredBy: String,
  referrals: [referralSchema],
});

module.exports = mongoose.model("User", userSchema);
