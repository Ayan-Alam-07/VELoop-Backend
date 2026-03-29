const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referralCode: {
      type: String,
    },
    payoutType: {
      type: String,
      required: true,
    },
    payoutAmount: {
      type: Number,
      required: true,
    },
    deductedCoins: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
    accountDetails: {
      type: String,
      default: "",
    },
    paidAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
