const router = require("express").Router();
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// ======================
// CREATE WITHDRAWAL
// ======================

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { voucherType, amount, coinsRequired } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json("User not found");
    }

    if (user.coins < coinsRequired) {
      return res.status(400).json("Not enough coins");
    }

    // deduct coins
    user.coins -= coinsRequired;

    await Transaction.create({
      userId: user.userId,
      type: "withdrawal",
      coins: -coinsRequired,
      note: `Withdrawal for ${voucherType}`,
    });

    // update withdrawal stats
    user.totalWithdrawCount += 1;
    user.totalWithdrawAmount += amount;
    const withdrawal = new Withdrawal({
      userId: user.userId,
      email: user.email,
      referralCode: user.referralCode,
      voucherType,
      amount,
      coinsUsed: coinsRequired,
    });
    await withdrawal.save();
    await user.save();
    res.json({
      message: "Withdrawal request submitted",
      withdrawal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Withdrawal failed");
  }
});

module.exports = router;

// ======================
// USER WITHDRAWAL HISTORY
// ======================

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const withdrawals = await Withdrawal.find({
      userId: user.userId,
    }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json("Failed to fetch withdrawal history");
  }
});
