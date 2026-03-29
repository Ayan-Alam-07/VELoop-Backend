const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");

exports.getUsersSummary = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "userId referralCode createdAt coins gems totalAdsWatched todayAdsWatched",
      )
      .sort({ createdAt: -1 });

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      userId: user.userId,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
      coins: user.coins,
      gems: user.gems,
      totalAdsWatched: user.totalAdsWatched,
      todayAdsWatched: user.todayAdsWatched,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch users summary");
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalWithdrawals = await Withdrawal.countDocuments();

    const pendingWithdrawals = await Withdrawal.countDocuments({
      status: "pending",
    });

    const paidWithdrawals = await Withdrawal.countDocuments({
      status: "paid",
    });

    const rejectedWithdrawals = await Withdrawal.countDocuments({
      status: "rejected",
    });

    const totalCoinsInSystem = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$coins" },
        },
      },
    ]);

    res.json({
      totalUsers,
      totalWithdrawals,
      pendingWithdrawals,
      paidWithdrawals,
      rejectedWithdrawals,
      totalCoinsInSystem: totalCoinsInSystem[0]?.total || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch dashboard stats");
  }
};
