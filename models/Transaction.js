const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["watchAd", "referral", "captcha", "withdrawal", "bonus"],
    required: true,
  },

  coins: {
    type: Number,
    default: 0,
  },

  gems: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    default: "completed",
  },

  note: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
