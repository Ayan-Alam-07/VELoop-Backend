// backend/config/seedBonusRewards.js

const BonusReward = require("../models/BonusReward");

const bonusRewards = [
  { reqWatch: 1, bonusCoin: 10 },
  { reqWatch: 5, bonusCoin: 35 },
  { reqWatch: 10, bonusCoin: 75 },
  { reqWatch: 18, bonusCoin: 100 },
  { reqWatch: 25, bonusCoin: 160 },
  { reqWatch: 30, bonusCoin: 220 },
  { reqWatch: 50, bonusCoin: 400 },
];

const seedBonusRewards = async () => {
  try {
    const existing = await BonusReward.countDocuments();

    if (existing > 0) {
      console.log("Bonus rewards already seeded");
      return;
    }

    await BonusReward.insertMany(bonusRewards);

    console.log("Bonus rewards seeded successfully");
  } catch (error) {
    console.error("Bonus reward seed failed:", error);
  }
};

module.exports = seedBonusRewards;
