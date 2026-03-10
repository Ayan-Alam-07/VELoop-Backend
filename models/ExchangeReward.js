const mongoose = require("mongoose");

const exchangeRewardSchema = new mongoose.Schema({

  rewardId: Number,

  coinMin: Number,
  coinMax: Number,

  gemMin: Number,
  gemMax: Number,

});

module.exports = mongoose.model("ExchangeReward", exchangeRewardSchema);