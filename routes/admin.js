const router = require("express").Router();
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");

// ======================
// GET ALL USERS (ADMIN TABLE)
// ======================

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select(
      "userId email referralCode coins gems lifetimeEarning totalAdsWatched todayAdsWatched totalWithdrawCount totalWithdrawAmount referrals totalReferralEarning",
    );

    const formattedUsers = users.map((user) => ({
      userId: user.userId,
      email: user.email,
      referralCode: user.referralCode,

      coins: user.coins,
      gems: user.gems,

      lifetimeEarning: user.lifetimeEarning,

      totalAdsWatched: user.totalAdsWatched,
      todayAdsWatched: user.todayAdsWatched,

      totalWithdrawCount: user.totalWithdrawCount,
      totalWithdrawAmount: user.totalWithdrawAmount,

      totalReferrals: user.referrals.length,
      totalReferralEarning: user.totalReferralEarning,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch users");
  }
});

// ======================
// GET SINGLE USER DETAILS
// ======================

router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findOne({
      userId: req.params.userId,
    });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const withdrawals = await Withdrawal.find({
      userId: user.userId,
    }).sort({ createdAt: -1 });

    res.json({
      userId: user.userId,
      email: user.email,
      referralCode: user.referralCode,

      coins: user.coins,
      gems: user.gems,

      lifetimeEarning: user.lifetimeEarning,

      totalAdsWatched: user.totalAdsWatched,
      todayAdsWatched: user.todayAdsWatched,

      totalReferrals: user.referrals.length,
      totalReferralEarning: user.totalReferralEarning,

      totalWithdrawCount: user.totalWithdrawCount,
      totalWithdrawAmount: user.totalWithdrawAmount,

      withdrawals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch user details");
  }
});

// ======================
// ADMIN DASHBOARD STATS
// ======================

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalAds = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAdsWatched" } } },
    ]);

    const totalCoins = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$coins" } } },
    ]);

    const totalWithdrawals = await Withdrawal.countDocuments();

    const pendingWithdrawals = await Withdrawal.countDocuments({
      status: "pending",
    });

    const totalWithdrawAmount = await Withdrawal.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      totalUsers,

      totalAdsWatched: totalAds[0]?.total || 0,

      totalCoinsInSystem: totalCoins[0]?.total || 0,

      totalWithdrawals,

      pendingWithdrawals,

      totalWithdrawAmount: totalWithdrawAmount[0]?.total || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Stats fetch failed");
  }
});

// ======================
// GET ALL WITHDRAWALS
// ======================

router.get("/withdrawals", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json("Failed to fetch withdrawals");
  }
});

// ======================
// APPROVE WITHDRAWAL
// ======================

router.post("/withdrawal/approve/:id", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json("Withdrawal not found");
    }

    withdrawal.status = "success";
    await withdrawal.save();

    res.json("Withdrawal approved");
  } catch (error) {
    console.error(error);
    res.status(500).json("Approval failed");
  }
});

// ======================
// REJECT WITHDRAWAL
// ======================

router.post("/withdrawal/reject/:id", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json("Withdrawal not found");
    }

    withdrawal.status = "rejected";
    await withdrawal.save();

    res.json("Withdrawal rejected");
  } catch (error) {
    console.error(error);
    res.status(500).json("Reject failed");
  }
});

module.exports = router;
