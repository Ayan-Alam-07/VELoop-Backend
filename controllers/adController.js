const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AdOffer = require("../models/AdOffer");

// ------------------------
// RANDOM COIN GENERATOR
// ------------------------

const generateCoins = () => {
  const chance = Math.random();

  if (chance < 0.02) {
    return Math.floor(Math.random() * (61 - 50 + 1)) + 50;
  }

  return Math.floor(Math.random() * (49 - 15 + 1)) + 15;
};

// ------------------------
// GET OFFERS
// ------------------------

exports.getAdOffers = async (req, res) => {
  try {
    const userId = req.user.id;

    let offers = await AdOffer.find({ userId });

    // if user has no offers generate them
    if (offers.length === 0) {
      const created = [];

      for (let i = 0; i < 6; i++) {
        const offer = await AdOffer.create({
          userId,
          slot: i,
          coins: generateCoins(),
          cooldownUntil: null,
        });

        created.push(offer);
      }

      offers = created;
    }

    const response = offers.map((o) => {
      let cooldown = 0;

      if (o.cooldownUntil && o.cooldownUntil > Date.now()) {
        cooldown = Math.floor((o.cooldownUntil - Date.now()) / 1000);
      }

      return {
        slot: o.slot,
        coins: o.coins,
        cooldown,
      };
    });

    res.json(response);
  } catch (err) {
    res.status(500).json("Failed to load ad offers");
  }
};

// ------------------------
// WATCH AD SUCCESS
// ------------------------

exports.watchAd = async (req, res) => {
  try {
    const { slot, adCompleted } = req.body;

    if (!adCompleted) {
      return res.status(400).json("Ad not completed");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const offer = await AdOffer.findOne({
      userId: req.user.id,
      slot,
    });

    if (!offer) {
      return res.status(404).json("Offer not found");
    }

    // cooldown protection
    if (offer.cooldownUntil && offer.cooldownUntil > Date.now()) {
      return res.status(400).json("Ad cooldown active");
    }

    const reward = offer.coins;

    // apply reward
    user.coins += reward;
    user.totalAdsWatched += 1;

    await user.save();

    await Transaction.create({
      userId: user.userId,
      type: "watch_ad",
      coins: reward,
      note: "Watch Ad reward",
    });

    // generate new reward
    offer.coins = generateCoins();
    offer.cooldownUntil = new Date(Date.now() + 45000);

    await offer.save();

    res.json({
      coinsEarned: reward,
      nextCoins: offer.coins,
      cooldown: 45,
      newBalance: user.coins,
    });
  } catch (error) {
    console.error("WATCH AD ERROR:", error);
    res.status(500).json("Ad reward failed");
  }
};
