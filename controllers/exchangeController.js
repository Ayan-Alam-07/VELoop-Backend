const User = require("../models/User");
const Transaction = require("../models/Transaction");

// RANDOM GENERATOR

const generateReward = (coinMin, coinMax, gemMin, gemMax) => {
  const coins = Math.floor(Math.random() * (coinMax - coinMin + 1)) + coinMin;

  const gems = Math.floor(Math.random() * (gemMax - gemMin + 1)) + gemMin;

  return { coins, gems };
};

// GET TREASURE CARDS

exports.getExchangeCards = async (req, res) => {
  const cards = [
    {
      id: 1,
      coinMin: 125,
      coinMax: 241,
      gemMin: 26,
      gemMax: 38,
    },
    {
      id: 2,
      coinMin: 155,
      coinMax: 280,
      gemMin: 29,
      gemMax: 42,
    },
    {
      id: 3,
      coinMin: 160,
      coinMax: 300,
      gemMin: 30,
      gemMax: 38,
    },
  ];

  const result = cards.map((card) => {
    const reward = generateReward(
      card.coinMin,
      card.coinMax,
      card.gemMin,
      card.gemMax,
    );

    return {
      id: card.id,
      coins: reward.coins,
      gems: reward.gems,
    };
  });

  res.json(result);
};

// CLAIM EXCHANGE

exports.claimExchange = async (req, res) => {
  try {
    const { cardId } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json("User not found");

    const cards = {
      1: { coinMin: 125, coinMax: 241, gemMin: 26, gemMax: 38 },
      2: { coinMin: 155, coinMax: 280, gemMin: 29, gemMax: 42 },
      3: { coinMin: 160, coinMax: 300, gemMin: 30, gemMax: 38 },
    };

    const card = cards[cardId];

    if (!card) return res.status(400).json("Invalid card");

    const reward = generateReward(
      card.coinMin,
      card.coinMax,
      card.gemMin,
      card.gemMax,
    );

    if (user.gems < reward.gems) {
      return res.status(400).json("Not enough gems");
    }

    user.gems -= reward.gems;
    user.coins += reward.coins;
    user.lifetimeEarning += reward.coins;

    await user.save();

    await Transaction.create({
      userId: user.userId,
      type: "exchange",
      coins: reward.coins,
      note: `Exchange Center reward using ${reward.gems} gems`,
    });

    res.json({
      coinsEarned: reward.coins,
      gemsUsed: reward.gems,
      newCoinBalance: user.coins,
      newGemBalance: user.gems,
    });
  } catch (error) {
    res.status(500).json("Exchange failed");
  }
};
