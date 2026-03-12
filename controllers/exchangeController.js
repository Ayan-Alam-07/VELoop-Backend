
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const ExchangeOffer = require("../models/ExchangeOffer");


// -------------------------
// GENERATE RANDOM OFFER
// -------------------------

const generateOffer = (cardId) => {

  const configs = {

    1: { coinMin:135, coinMax:185, gemMin:28, gemMax:36 },
    2: { coinMin:160, coinMax:250, gemMin:32, gemMax:41 },
    3: { coinMin:145, coinMax:200, gemMin:30, gemMax:37 }

  };

  const config = configs[cardId];

  const coins =
    Math.floor(Math.random() * (config.coinMax - config.coinMin + 1)) +
    config.coinMin;

  const gems =
    Math.floor(Math.random() * (config.gemMax - config.gemMin + 1)) +
    config.gemMin;

  return { coins, gems };

};


// -------------------------
// GET EXCHANGE OFFERS
// -------------------------

exports.getOffers = async (req, res) => {

  try {

    const userId = req.user.id;

    let offers = await ExchangeOffer.find({ userId });

    if (offers.length === 0) {

      const cards = [1,2,3];

      const newOffers = [];

      for (let cardId of cards) {

        const reward = generateOffer(cardId);

        const offer = await ExchangeOffer.create({

          userId,
          cardId,
          coins: reward.coins,
          gemsRequired: reward.gems

        });

        newOffers.push(offer);

      }

      offers = newOffers;

    }

    res.json(offers);

  } catch (error) {

    res.status(500).json("Failed to fetch offers");

  }

};


// -------------------------
// CLAIM EXCHANGE
// -------------------------

exports.claimExchange = async (req, res) => {

  try {

    const { cardId } = req.body;

    const user = await User.findById(req.user.id);

    const offer = await ExchangeOffer.findOne({

      userId: req.user.id,
      cardId

    });

    if (!offer) return res.status(404).json("Offer not found");



    if (user.gems < offer.gemsRequired) {

      return res.status(400).json("Not enough gems");

    }


    // APPLY REWARD

    user.gems -= offer.gemsRequired;

    user.coins += offer.coins;

    user.lifetimeEarning += offer.coins;

    await user.save();



    // CREATE TRANSACTION

    await Transaction.create({

      userId: user.userId,

      type: "exchange",

      coins: offer.coins,

      note: `Exchange center reward`

    });



    // GENERATE NEW OFFER

    const reward = generateOffer(cardId);

    offer.coins = reward.coins;

    offer.gemsRequired = reward.gems;

    await offer.save();



    res.json({

      coinsEarned: offer.coins,

      newCoins: user.coins,

      newGems: user.gems

    });

  } catch (error) {

    res.status(500).json("Exchange failed");

  }

};