const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  referralCode: {
    type: String,
  },

  voucherType: {
    type: String,
    enum: ["UPI", "Amazon", "GooglePlay"],
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  coinsUsed: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "success", "rejected"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
