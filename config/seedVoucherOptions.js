const VoucherOption = require("../models/VoucherOption");

const voucherData = [
  // UPI
  { payoutType: "upi", amount: 10, requiredCoins: 2400 },
  { payoutType: "upi", amount: 25, requiredCoins: 5800 },
  { payoutType: "upi", amount: 50, requiredCoins: 10000 },
  { payoutType: "upi", amount: 100, requiredCoins: 19500 },
  { payoutType: "upi", amount: 150, requiredCoins: 28500 },
  { payoutType: "upi", amount: 300, requiredCoins: 52500 },
  { payoutType: "upi", amount: 500, requiredCoins: 80500 },
  { payoutType: "upi", amount: 1000, requiredCoins: 150000 },

  // Google Play
  { payoutType: "google-play", amount: 10, requiredCoins: 2600 },
  { payoutType: "google-play", amount: 25, requiredCoins: 6000 },
  { payoutType: "google-play", amount: 50, requiredCoins: 11000 },
  { payoutType: "google-play", amount: 100, requiredCoins: 20500 },
  { payoutType: "google-play", amount: 150, requiredCoins: 30000 },

  // Amazon
  { payoutType: "amazon", amount: 10, requiredCoins: 2500 },
  { payoutType: "amazon", amount: 25, requiredCoins: 5900 },
  { payoutType: "amazon", amount: 50, requiredCoins: 10500 },
  { payoutType: "amazon", amount: 100, requiredCoins: 19800 },
  { payoutType: "amazon", amount: 250, requiredCoins: 47000 },

  // PayPal
  { payoutType: "paypal", amount: 5, requiredCoins: 1800 },
  { payoutType: "paypal", amount: 10, requiredCoins: 3400 },
  { payoutType: "paypal", amount: 25, requiredCoins: 7800 },
  { payoutType: "paypal", amount: 50, requiredCoins: 14500 },

  // USDT
  { payoutType: "usdt", amount: 5, requiredCoins: 1700 },
  { payoutType: "usdt", amount: 10, requiredCoins: 3300 },
  { payoutType: "usdt", amount: 25, requiredCoins: 7600 },
  { payoutType: "usdt", amount: 50, requiredCoins: 14000 },

  // BTC
  { payoutType: "btc", amount: 5, requiredCoins: 2000 },
  { payoutType: "btc", amount: 10, requiredCoins: 3900 },
  { payoutType: "btc", amount: 25, requiredCoins: 9000 },
  { payoutType: "btc", amount: 50, requiredCoins: 16500 },
];

const seedVoucherOptions = async () => {
  try {
    const existing = await VoucherOption.countDocuments();

    if (existing > 0) {
      console.log("Voucher options already seeded");
      return;
    }

    await VoucherOption.insertMany(voucherData);

    console.log("Voucher options seeded successfully");
  } catch (error) {
    console.error("Voucher seed failed:", error);
  }
};

module.exports = seedVoucherOptions;
