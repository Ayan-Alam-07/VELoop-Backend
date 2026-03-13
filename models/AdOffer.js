const mongoose = require("mongoose");

const adOfferSchema = new mongoose.Schema({
  userId: String,

  slot: Number,

  coins: Number,

  cooldownUntil: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AdOffer", adOfferSchema);
