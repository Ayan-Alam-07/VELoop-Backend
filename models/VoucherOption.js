const mongoose = require("mongoose");

const voucherOptionSchema = new mongoose.Schema(
  {
    payoutType: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: ["upi", "google-play", "amazon", "paypal", "usdt", "btc"],
    },
    amount: {
      type: Number,
      required: true,
    },
    requiredCoins: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

voucherOptionSchema.index({ payoutType: 1, amount: 1 }, { unique: true });

module.exports = mongoose.model("VoucherOption", voucherOptionSchema);
