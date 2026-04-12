// config/seedDailyCheckinRewards.js

const DailyCheckinReward = require("../models/DailyCheckinReward");

const seedDailyCheckinRewards = async () => {
  try {
    const existingRewards = await DailyCheckinReward.countDocuments();

    if (existingRewards > 0) {
      console.log("Daily check-in rewards already seeded");
      return;
    }

    const rewards = [
      {
        day: 1,
        reward: "5 Coins",
        type: "coin",
        value: "+5",
      },
      {
        day: 2,
        reward: "10 Coins",
        type: "coin",
        value: "+10",
      },
      {
        day: 3,
        reward: "20 Coins",
        type: "coin",
        value: "+20",
      },
      {
        day: 4,
        reward: "₹2 Amazon Gift Card",
        type: "giftcard",
        value: "₹2",
      },
      {
        day: 5,
        reward: "₹3 Amazon Gift Card",
        type: "giftcard",
        value: "₹3",
      },
      {
        day: 6,
        reward: "40 Coins",
        type: "coin",
        value: "+40",
      },
      {
        day: 7,
        reward: "₹5 Amazon Gift Card",
        type: "giftcard",
        value: "₹5",
      },
    ];

    await DailyCheckinReward.insertMany(rewards);

    console.log("Daily check-in rewards seeded");
  } catch (error) {
    console.log("Daily check-in seed error:", error);
  }
};

module.exports = seedDailyCheckinRewards;
