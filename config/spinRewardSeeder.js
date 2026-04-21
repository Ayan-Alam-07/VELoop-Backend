const SpinReward = require("../models/SpinReward");

const seedSpinRewards = async () => {
  try {
    const existingRewards = await SpinReward.countDocuments();

    if (existingRewards > 0) {
      console.log("Spin rewards already seeded");
      return;
    }

    const rewards = [
      {
        title: "10 VEs",
        type: "coins",
        amount: 10,
        color: "#453de9",
        icon: "💎",
        probability: 29,
        order: 1,
      },
      {
        title: "2 Gems",
        type: "gems",
        amount: 2,
        color: "#8c50f3",
        icon: "💠",
        probability: 9,
        order: 2,
      },
      {
        title: "30 VEs",
        type: "coins",
        amount: 30,
        color: "#8b28e7",
        icon: "👑",
        probability: 5,
        order: 3,
      },
      {
        title: "Free Spin Again",
        type: "free_spin",
        amount: 1,
        color: "#2563EB",
        icon: "🎯",
        probability: 12,
        order: 4,
      },
      {
        title: "Amazon Voucher ₹2",
        type: "voucher",
        amount: 2,
        color: "#059669",
        icon: "🎁",
        probability: 0.001,
        order: 5,
      },
      {
        title: "Amazon Voucher ₹5",
        type: "voucher",
        amount: 5,
        color: "#10B981",
        icon: "🛍️",
        probability: 0.0001,
        order: 6,
      },
      {
        title: "10 XP",
        type: "xp",
        amount: 10,
        color: "#F59E0B",
        icon: "⚡",
        probability: 22,
        order: 7,
      },
      {
        title: "30 XP",
        type: "xp",
        amount: 30,
        color: "#F97316",
        icon: "🔥",
        probability: 10,
        order: 8,
      },
      {
        title: "Better Luck Next Time",
        type: "empty",
        amount: 0,
        color: "#EF4444",
        icon: "😢",
        probability: 12.9989,
        order: 9,
      },
    ];

    await SpinReward.insertMany(rewards);

    console.log("Spin rewards seeded successfully");
  } catch (error) {
    console.log("Spin Seeder Error:", error);
  }
};

module.exports = seedSpinRewards;
