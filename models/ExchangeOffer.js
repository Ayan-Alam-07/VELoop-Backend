const mongoose = require("mongoose");

const exchangeOfferSchema = new mongoose.Schema({

  userId: String,

  cardId: Number,

  coins: Number,

  gemsRequired: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("ExchangeOffer", exchangeOfferSchema);